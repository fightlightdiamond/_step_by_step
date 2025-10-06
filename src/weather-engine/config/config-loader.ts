/**
 * Configuration loader for weather effects and system settings
 */

import { WeatherType, ElementType, WeatherEffect } from "../types";
import {
  WEATHER_TYPES,
  ELEMENT_TYPES,
  WEATHER_EFFECT_LIMITS,
} from "../constants";
import {
  JSONSchemaValidator,
  WEATHER_CONFIG_SCHEMA,
  SchemaValidationError,
} from "./schema-validator";
import * as fs from "fs";
import * as path from "path";

/**
 * Raw configuration data structure from JSON
 */
export interface RawWeatherConfig {
  weatherEffects: Record<string, Record<string, number>>;
  compatibilityMatrix: Record<string, string[]>;
  oppositeWeatherPairs: [string, string][];
  effectLimits: {
    min: number;
    max: number;
  };
}

/**
 * Processed weather configuration with proper types
 */
export interface ProcessedWeatherConfig {
  weatherEffects: Map<WeatherType, WeatherEffect>;
  compatibilityMatrix: Map<WeatherType, WeatherType[]>;
  oppositeWeatherPairs: [WeatherType, WeatherType][];
  effectLimits: {
    min: number;
    max: number;
  };
}

/**
 * Configuration validation error
 */
export class ConfigValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(`Configuration validation error: ${message}`);
    this.name = "ConfigValidationError";
  }
}

/**
 * Configuration change listener
 */
export type ConfigChangeListener = (config: ProcessedWeatherConfig) => void;

/**
 * Weather effects configuration loader
 */
export class WeatherConfigLoader {
  private static instance: WeatherConfigLoader;
  private cachedConfig: ProcessedWeatherConfig | null = null;
  private configFilePath: string | null = null;
  private fileWatcher: fs.FSWatcher | null = null;
  private changeListeners: Set<ConfigChangeListener> = new Set();
  private lastModified: number = 0;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): WeatherConfigLoader {
    if (!WeatherConfigLoader.instance) {
      WeatherConfigLoader.instance = new WeatherConfigLoader();
    }
    return WeatherConfigLoader.instance;
  }

  /**
   * Load configuration from JSON data
   */
  public loadFromData(rawConfig: RawWeatherConfig): ProcessedWeatherConfig {
    // Validate against JSON schema first
    try {
      JSONSchemaValidator.validate(rawConfig, WEATHER_CONFIG_SCHEMA);
    } catch (error) {
      if (error instanceof SchemaValidationError) {
        throw new ConfigValidationError(
          `Schema validation failed: ${error.message}`,
          error.path
        );
      }
      throw error;
    }

    this.validateRawConfig(rawConfig);

    const processedConfig: ProcessedWeatherConfig = {
      weatherEffects: this.processWeatherEffects(rawConfig.weatherEffects),
      compatibilityMatrix: this.processCompatibilityMatrix(
        rawConfig.compatibilityMatrix
      ),
      oppositeWeatherPairs: this.processOppositeWeatherPairs(
        rawConfig.oppositeWeatherPairs
      ),
      effectLimits: rawConfig.effectLimits,
    };

    this.validateProcessedConfig(processedConfig);
    this.cachedConfig = processedConfig;

    // Notify listeners of configuration change
    this.notifyConfigChange(processedConfig);

    return processedConfig;
  }

  /**
   * Load configuration from JSON string
   */
  public loadFromJSON(jsonString: string): ProcessedWeatherConfig {
    try {
      const rawConfig: RawWeatherConfig = JSON.parse(jsonString);
      return this.loadFromData(rawConfig);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new ConfigValidationError(
          `Invalid JSON format: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get cached configuration
   */
  public getCachedConfig(): ProcessedWeatherConfig | null {
    return this.cachedConfig;
  }

  /**
   * Clear cached configuration
   */
  public clearCache(): void {
    this.cachedConfig = null;
  }

  /**
   * Load configuration from file
   */
  public loadFromFile(filePath: string): ProcessedWeatherConfig {
    try {
      const absolutePath = path.resolve(filePath);
      const fileContent = fs.readFileSync(absolutePath, "utf-8");
      const stats = fs.statSync(absolutePath);

      this.configFilePath = absolutePath;
      this.lastModified = stats.mtimeMs;

      return this.loadFromJSON(fileContent);
    } catch (error) {
      if (error instanceof Error) {
        throw new ConfigValidationError(
          `Failed to load configuration from file: ${error.message}`,
          filePath
        );
      }
      throw error;
    }
  }

  /**
   * Enable automatic configuration reloading when file changes
   */
  public enableAutoReload(): void {
    if (!this.configFilePath) {
      throw new ConfigValidationError(
        "Cannot enable auto-reload: no configuration file loaded"
      );
    }

    if (this.fileWatcher) {
      this.disableAutoReload();
    }

    try {
      this.fileWatcher = fs.watchFile(
        this.configFilePath,
        { interval: 1000 },
        (curr, prev) => {
          if (curr.mtimeMs > this.lastModified) {
            this.reloadConfiguration();
          }
        }
      );
    } catch (error) {
      throw new ConfigValidationError(
        `Failed to enable auto-reload: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Disable automatic configuration reloading
   */
  public disableAutoReload(): void {
    if (this.fileWatcher) {
      if (this.configFilePath) {
        fs.unwatchFile(this.configFilePath);
      }
      this.fileWatcher = null;
    }
  }

  /**
   * Manually reload configuration from file
   */
  public reloadConfiguration(): ProcessedWeatherConfig {
    if (!this.configFilePath) {
      throw new ConfigValidationError(
        "Cannot reload configuration: no configuration file loaded"
      );
    }

    try {
      return this.loadFromFile(this.configFilePath);
    } catch (error) {
      // If reload fails, keep the existing configuration
      console.error("Failed to reload configuration:", error);
      if (this.cachedConfig) {
        return this.cachedConfig;
      }
      throw error;
    }
  }

  /**
   * Add a listener for configuration changes
   */
  public addConfigChangeListener(listener: ConfigChangeListener): void {
    this.changeListeners.add(listener);
  }

  /**
   * Remove a configuration change listener
   */
  public removeConfigChangeListener(listener: ConfigChangeListener): void {
    this.changeListeners.delete(listener);
  }

  /**
   * Get the current configuration file path
   */
  public getConfigFilePath(): string | null {
    return this.configFilePath;
  }

  /**
   * Check if auto-reload is enabled
   */
  public isAutoReloadEnabled(): boolean {
    return this.fileWatcher !== null;
  }

  /**
   * Validate configuration file exists and is readable
   */
  public validateConfigFile(filePath: string): boolean {
    try {
      const absolutePath = path.resolve(filePath);
      const stats = fs.statSync(absolutePath);
      return stats.isFile() && !!(stats.mode & fs.constants.R_OK);
    } catch {
      return false;
    }
  }

  /**
   * Get configuration file metadata
   */
  public getConfigFileInfo(): {
    path: string | null;
    lastModified: number;
    size?: number;
  } | null {
    if (!this.configFilePath) {
      return null;
    }

    try {
      const stats = fs.statSync(this.configFilePath);
      return {
        path: this.configFilePath,
        lastModified: stats.mtimeMs,
        size: stats.size,
      };
    } catch {
      return {
        path: this.configFilePath,
        lastModified: this.lastModified,
      };
    }
  }

  /**
   * Notify all listeners of configuration change
   */
  private notifyConfigChange(config: ProcessedWeatherConfig): void {
    for (const listener of this.changeListeners) {
      try {
        listener(config);
      } catch (error) {
        console.error("Error in configuration change listener:", error);
      }
    }
  }

  /**
   * Validate raw configuration structure
   */
  private validateRawConfig(config: RawWeatherConfig): void {
    if (!config.weatherEffects) {
      throw new ConfigValidationError(
        "Missing weatherEffects",
        "weatherEffects"
      );
    }

    if (!config.compatibilityMatrix) {
      throw new ConfigValidationError(
        "Missing compatibilityMatrix",
        "compatibilityMatrix"
      );
    }

    if (!config.oppositeWeatherPairs) {
      throw new ConfigValidationError(
        "Missing oppositeWeatherPairs",
        "oppositeWeatherPairs"
      );
    }

    if (!config.effectLimits) {
      throw new ConfigValidationError("Missing effectLimits", "effectLimits");
    }

    // Validate effect limits
    if (
      typeof config.effectLimits.min !== "number" ||
      typeof config.effectLimits.max !== "number"
    ) {
      throw new ConfigValidationError(
        "Effect limits must be numbers",
        "effectLimits"
      );
    }

    if (config.effectLimits.min >= config.effectLimits.max) {
      throw new ConfigValidationError(
        "Effect limit min must be less than max",
        "effectLimits"
      );
    }
  }

  /**
   * Process weather effects from raw config
   */
  private processWeatherEffects(
    rawEffects: Record<string, Record<string, number>>
  ): Map<WeatherType, WeatherEffect> {
    const weatherEffects = new Map<WeatherType, WeatherEffect>();

    // Validate all weather types are present
    for (const weatherType of WEATHER_TYPES) {
      if (!rawEffects[weatherType]) {
        throw new ConfigValidationError(
          `Missing weather effect for ${weatherType}`,
          "weatherEffects"
        );
      }

      const rawEffect = rawEffects[weatherType];
      const weatherEffect: WeatherEffect = {
        Fire: 0,
        Ice: 0,
        Lightning: 0,
      };

      // Validate and process each element effect
      for (const elementType of ELEMENT_TYPES) {
        if (typeof rawEffect[elementType] !== "number") {
          throw new ConfigValidationError(
            `Invalid effect value for ${weatherType}.${elementType}`,
            "weatherEffects"
          );
        }

        const effectValue = rawEffect[elementType];
        if (
          effectValue < WEATHER_EFFECT_LIMITS.MIN ||
          effectValue > WEATHER_EFFECT_LIMITS.MAX
        ) {
          throw new ConfigValidationError(
            `Effect value ${effectValue} for ${weatherType}.${elementType} is outside limits [${WEATHER_EFFECT_LIMITS.MIN}, ${WEATHER_EFFECT_LIMITS.MAX}]`,
            "weatherEffects"
          );
        }

        weatherEffect[elementType] = effectValue;
      }

      weatherEffects.set(weatherType, weatherEffect);
    }

    return weatherEffects;
  }

  /**
   * Process compatibility matrix from raw config
   */
  private processCompatibilityMatrix(
    rawMatrix: Record<string, string[]>
  ): Map<WeatherType, WeatherType[]> {
    const compatibilityMatrix = new Map<WeatherType, WeatherType[]>();

    for (const weatherType of WEATHER_TYPES) {
      if (!rawMatrix[weatherType]) {
        throw new ConfigValidationError(
          `Missing compatibility entry for ${weatherType}`,
          "compatibilityMatrix"
        );
      }

      const compatibleWeather: WeatherType[] = [];
      for (const compatibleType of rawMatrix[weatherType]) {
        if (!WEATHER_TYPES.includes(compatibleType as WeatherType)) {
          throw new ConfigValidationError(
            `Invalid weather type ${compatibleType} in compatibility matrix for ${weatherType}`,
            "compatibilityMatrix"
          );
        }
        compatibleWeather.push(compatibleType as WeatherType);
      }

      compatibilityMatrix.set(weatherType, compatibleWeather);
    }

    return compatibilityMatrix;
  }

  /**
   * Process opposite weather pairs from raw config
   */
  private processOppositeWeatherPairs(
    rawPairs: [string, string][]
  ): [WeatherType, WeatherType][] {
    const oppositeWeatherPairs: [WeatherType, WeatherType][] = [];

    for (const [weather1, weather2] of rawPairs) {
      if (!WEATHER_TYPES.includes(weather1 as WeatherType)) {
        throw new ConfigValidationError(
          `Invalid weather type ${weather1} in opposite pairs`,
          "oppositeWeatherPairs"
        );
      }
      if (!WEATHER_TYPES.includes(weather2 as WeatherType)) {
        throw new ConfigValidationError(
          `Invalid weather type ${weather2} in opposite pairs`,
          "oppositeWeatherPairs"
        );
      }

      oppositeWeatherPairs.push([
        weather1 as WeatherType,
        weather2 as WeatherType,
      ]);
    }

    return oppositeWeatherPairs;
  }

  /**
   * Validate processed configuration
   */
  private validateProcessedConfig(config: ProcessedWeatherConfig): void {
    // Ensure all weather types have effects
    for (const weatherType of WEATHER_TYPES) {
      if (!config.weatherEffects.has(weatherType)) {
        throw new ConfigValidationError(
          `Missing processed weather effect for ${weatherType}`
        );
      }
    }

    // Ensure all weather types have compatibility entries
    for (const weatherType of WEATHER_TYPES) {
      if (!config.compatibilityMatrix.has(weatherType)) {
        throw new ConfigValidationError(
          `Missing processed compatibility entry for ${weatherType}`
        );
      }
    }

    // Validate opposite pairs don't appear in compatibility matrix
    for (const [weather1, weather2] of config.oppositeWeatherPairs) {
      const compatible1 = config.compatibilityMatrix.get(weather1) || [];
      const compatible2 = config.compatibilityMatrix.get(weather2) || [];

      if (compatible1.includes(weather2)) {
        throw new ConfigValidationError(
          `Opposite weather types ${weather1} and ${weather2} are marked as compatible`
        );
      }
      if (compatible2.includes(weather1)) {
        throw new ConfigValidationError(
          `Opposite weather types ${weather2} and ${weather1} are marked as compatible`
        );
      }
    }
  }
}

/**
 * Default weather configuration loader instance
 */
export const weatherConfigLoader = WeatherConfigLoader.getInstance();
