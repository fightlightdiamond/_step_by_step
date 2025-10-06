/**
 * Comprehensive configuration management system
 */

import {
  WeatherConfigLoader,
  ProcessedWeatherConfig,
  ConfigChangeListener,
} from "./config-loader";
import { WeatherType, SeasonType, WeatherPool } from "../types";
import * as path from "path";

/**
 * Configuration manager options
 */
export interface ConfigManagerOptions {
  configFilePath?: string;
  enableAutoReload?: boolean;
  fallbackToDefaults?: boolean;
  validateOnLoad?: boolean;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuration statistics
 */
export interface ConfigStats {
  weatherTypesCount: number;
  compatibilityRulesCount: number;
  oppositeWeatherPairsCount: number;
  effectLimits: { min: number; max: number };
  lastLoaded: Date | null;
  autoReloadEnabled: boolean;
  filePath: string | null;
}

/**
 * Comprehensive configuration manager for the weather engine
 */
export class WeatherConfigManager {
  private configLoader: WeatherConfigLoader;
  private options: ConfigManagerOptions;
  private loadedAt: Date | null = null;

  constructor(options: ConfigManagerOptions = {}) {
    this.configLoader = WeatherConfigLoader.getInstance();
    this.options = {
      enableAutoReload: false,
      fallbackToDefaults: true,
      validateOnLoad: true,
      ...options,
    };

    if (this.options.configFilePath) {
      this.loadConfiguration(this.options.configFilePath);
    }
  }

  /**
   * Load configuration from file
   */
  public loadConfiguration(filePath: string): ProcessedWeatherConfig {
    try {
      const config = this.configLoader.loadFromFile(filePath);
      this.loadedAt = new Date();

      if (this.options.enableAutoReload) {
        this.configLoader.enableAutoReload();
      }

      return config;
    } catch (error) {
      if (this.options.fallbackToDefaults) {
        console.warn(
          `Failed to load configuration from ${filePath}, falling back to defaults:`,
          error
        );
        return this.loadDefaultConfiguration();
      }
      throw error;
    }
  }

  /**
   * Load default configuration
   */
  public loadDefaultConfiguration(): ProcessedWeatherConfig {
    const defaultConfigPath = path.join(__dirname, "weather-effects.json");
    const config = this.configLoader.loadFromFile(defaultConfigPath);
    this.loadedAt = new Date();
    return config;
  }

  /**
   * Get current configuration
   */
  public getCurrentConfiguration(): ProcessedWeatherConfig | null {
    return this.configLoader.getCachedConfig();
  }

  /**
   * Reload configuration from file
   */
  public reloadConfiguration(): ProcessedWeatherConfig {
    const config = this.configLoader.reloadConfiguration();
    this.loadedAt = new Date();
    return config;
  }

  /**
   * Validate configuration
   */
  public validateConfiguration(
    config?: ProcessedWeatherConfig
  ): ConfigValidationResult {
    const targetConfig = config || this.getCurrentConfiguration();
    const result: ConfigValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!targetConfig) {
      result.isValid = false;
      result.errors.push("No configuration loaded");
      return result;
    }

    // Validate weather effects completeness
    const missingWeatherTypes = this.findMissingWeatherTypes(targetConfig);
    if (missingWeatherTypes.length > 0) {
      result.isValid = false;
      result.errors.push(
        `Missing weather types: ${missingWeatherTypes.join(", ")}`
      );
    }

    // Validate compatibility matrix consistency
    const compatibilityErrors = this.validateCompatibilityMatrix(targetConfig);
    result.errors.push(...compatibilityErrors);
    if (compatibilityErrors.length > 0) {
      result.isValid = false;
    }

    // Validate opposite weather pairs
    const oppositeErrors = this.validateOppositeWeatherPairs(targetConfig);
    result.errors.push(...oppositeErrors);
    if (oppositeErrors.length > 0) {
      result.isValid = false;
    }

    // Check for potential balance issues (warnings)
    const balanceWarnings = this.checkBalanceIssues(targetConfig);
    result.warnings.push(...balanceWarnings);

    return result;
  }

  /**
   * Get configuration statistics
   */
  public getConfigurationStats(): ConfigStats {
    const config = this.getCurrentConfiguration();
    const fileInfo = this.configLoader.getConfigFileInfo();

    return {
      weatherTypesCount: config ? config.weatherEffects.size : 0,
      compatibilityRulesCount: config
        ? Array.from(config.compatibilityMatrix.values()).reduce(
            (sum, rules) => sum + rules.length,
            0
          )
        : 0,
      oppositeWeatherPairsCount: config
        ? config.oppositeWeatherPairs.length
        : 0,
      effectLimits: config ? config.effectLimits : { min: 0, max: 0 },
      lastLoaded: this.loadedAt,
      autoReloadEnabled: this.configLoader.isAutoReloadEnabled(),
      filePath: fileInfo?.path || null,
    };
  }

  /**
   * Enable or disable auto-reload
   */
  public setAutoReload(enabled: boolean): void {
    if (enabled) {
      this.configLoader.enableAutoReload();
    } else {
      this.configLoader.disableAutoReload();
    }
    this.options.enableAutoReload = enabled;
  }

  /**
   * Add configuration change listener
   */
  public onConfigurationChange(listener: ConfigChangeListener): void {
    this.configLoader.addConfigChangeListener(listener);
  }

  /**
   * Remove configuration change listener
   */
  public removeConfigurationChangeListener(
    listener: ConfigChangeListener
  ): void {
    this.configLoader.removeConfigChangeListener(listener);
  }

  /**
   * Export current configuration to JSON
   */
  public exportConfiguration(): string {
    const config = this.getCurrentConfiguration();
    if (!config) {
      throw new Error("No configuration loaded to export");
    }

    // Convert Maps back to objects for JSON serialization
    const exportData = {
      weatherEffects: Object.fromEntries(config.weatherEffects),
      compatibilityMatrix: Object.fromEntries(config.compatibilityMatrix),
      oppositeWeatherPairs: config.oppositeWeatherPairs,
      effectLimits: config.effectLimits,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Create a backup of current configuration
   */
  public createConfigurationBackup(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const config = this.exportConfiguration();
    const backupData = {
      timestamp,
      version: "1.0.0",
      configuration: JSON.parse(config),
    };

    return JSON.stringify(backupData, null, 2);
  }

  /**
   * Dispose of the configuration manager
   */
  public dispose(): void {
    this.configLoader.disableAutoReload();
  }

  /**
   * Find missing weather types in configuration
   */
  private findMissingWeatherTypes(
    config: ProcessedWeatherConfig
  ): WeatherType[] {
    const requiredWeatherTypes: WeatherType[] = [
      "Sunny",
      "Cloudy",
      "Rainy",
      "Windy",
      "Stormy",
      "Foggy",
      "Snowy",
      "Hot",
      "Cold",
      "Warm",
      "Cool",
      "Humid",
    ];

    return requiredWeatherTypes.filter(
      (weatherType) => !config.weatherEffects.has(weatherType)
    );
  }

  /**
   * Validate compatibility matrix consistency
   */
  private validateCompatibilityMatrix(
    config: ProcessedWeatherConfig
  ): string[] {
    const errors: string[] = [];

    // Check for symmetric compatibility (if A is compatible with B, B should be compatible with A)
    for (const [weatherType, compatibleTypes] of config.compatibilityMatrix) {
      for (const compatibleType of compatibleTypes) {
        const reverseCompatible =
          config.compatibilityMatrix.get(compatibleType) || [];
        if (!reverseCompatible.includes(weatherType)) {
          errors.push(
            `Asymmetric compatibility: ${weatherType} is compatible with ${compatibleType}, but not vice versa`
          );
        }
      }
    }

    return errors;
  }

  /**
   * Validate opposite weather pairs
   */
  private validateOppositeWeatherPairs(
    config: ProcessedWeatherConfig
  ): string[] {
    const errors: string[] = [];

    for (const [weather1, weather2] of config.oppositeWeatherPairs) {
      // Check if opposite weathers are marked as compatible
      const compatible1 = config.compatibilityMatrix.get(weather1) || [];
      const compatible2 = config.compatibilityMatrix.get(weather2) || [];

      if (compatible1.includes(weather2)) {
        errors.push(
          `Opposite weathers ${weather1} and ${weather2} are marked as compatible`
        );
      }
      if (compatible2.includes(weather1)) {
        errors.push(
          `Opposite weathers ${weather2} and ${weather1} are marked as compatible`
        );
      }
    }

    return errors;
  }

  /**
   * Check for potential balance issues
   */
  private checkBalanceIssues(config: ProcessedWeatherConfig): string[] {
    const warnings: string[] = [];

    // Check for extreme effect values
    for (const [weatherType, effects] of config.weatherEffects) {
      for (const [element, value] of Object.entries(effects)) {
        if (Math.abs(value) > 30) {
          warnings.push(
            `High effect value: ${weatherType} has ${value} effect on ${element} (consider balancing)`
          );
        }
      }
    }

    // Check for weather types with no compatible weather
    for (const [weatherType, compatibleTypes] of config.compatibilityMatrix) {
      if (compatibleTypes.length === 0) {
        warnings.push(
          `${weatherType} has no compatible weather types (may be too restrictive)`
        );
      }
    }

    return warnings;
  }
}
