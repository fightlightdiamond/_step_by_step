/**
 * Weather mixing validation logic
 */

import { WeatherType } from "../types";
import { OPPOSITE_WEATHER_PAIRS, MAX_ACTIVE_WEATHER_TYPES } from "../constants";
import { ProcessedWeatherConfig } from "../config/config-loader";

/**
 * Weather validation error types
 */
export enum ValidationErrorType {
  OPPOSITE_WEATHER = "OPPOSITE_WEATHER",
  INCOMPATIBLE_WEATHER = "INCOMPATIBLE_WEATHER",
  TOO_MANY_WEATHER_TYPES = "TOO_MANY_WEATHER_TYPES",
  INVALID_WEATHER_TYPE = "INVALID_WEATHER_TYPE",
}

/**
 * Weather validation error
 */
export class WeatherValidationError extends Error {
  constructor(
    public readonly errorType: ValidationErrorType,
    public readonly invalidWeather: WeatherType[],
    message: string
  ) {
    super(message);
    this.name = "WeatherValidationError";
  }
}

/**
 * Weather validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: WeatherValidationError[];
  warnings: string[];
}

/**
 * Weather mixing validator
 */
export class WeatherValidator {
  private compatibilityMatrix: Map<WeatherType, WeatherType[]>;
  private oppositeWeatherPairs: [WeatherType, WeatherType][];

  constructor(config: ProcessedWeatherConfig) {
    this.compatibilityMatrix = config.compatibilityMatrix;
    this.oppositeWeatherPairs = config.oppositeWeatherPairs;
  }

  /**
   * Validate a combination of weather types
   */
  public validateWeatherCombination(
    weatherTypes: WeatherType[]
  ): ValidationResult {
    const errors: WeatherValidationError[] = [];
    const warnings: string[] = [];

    // Remove duplicates
    const uniqueWeather = [...new Set(weatherTypes)];

    // Check for too many weather types
    if (uniqueWeather.length > MAX_ACTIVE_WEATHER_TYPES) {
      errors.push(
        new WeatherValidationError(
          ValidationErrorType.TOO_MANY_WEATHER_TYPES,
          uniqueWeather,
          `Too many weather types: ${uniqueWeather.length}. Maximum allowed: ${MAX_ACTIVE_WEATHER_TYPES}`
        )
      );
    }

    // Check for opposite weather types
    const oppositeErrors = this.checkOppositeWeatherTypes(uniqueWeather);
    errors.push(...oppositeErrors);

    // Check for incompatible weather types
    const incompatibilityErrors = this.checkWeatherCompatibility(uniqueWeather);
    errors.push(...incompatibilityErrors);

    // Add warnings for potentially problematic combinations
    const potentialWarnings = this.generateWarnings(uniqueWeather);
    warnings.push(...potentialWarnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if two weather types are opposites
   */
  public areOppositeWeatherTypes(
    weather1: WeatherType,
    weather2: WeatherType
  ): boolean {
    return this.oppositeWeatherPairs.some(
      ([type1, type2]) =>
        (type1 === weather1 && type2 === weather2) ||
        (type1 === weather2 && type2 === weather1)
    );
  }

  /**
   * Check if weather array contains opposite types
   */
  public hasOppositeWeatherTypes(weatherTypes: WeatherType[]): boolean {
    for (let i = 0; i < weatherTypes.length; i++) {
      for (let j = i + 1; j < weatherTypes.length; j++) {
        if (this.areOppositeWeatherTypes(weatherTypes[i], weatherTypes[j])) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if two weather types are compatible
   */
  public areWeatherTypesCompatible(
    weather1: WeatherType,
    weather2: WeatherType
  ): boolean {
    // Weather types are compatible if they appear in each other's compatibility lists
    const compatible1 = this.compatibilityMatrix.get(weather1) || [];
    const compatible2 = this.compatibilityMatrix.get(weather2) || [];

    return compatible1.includes(weather2) || compatible2.includes(weather1);
  }

  /**
   * Get all weather types compatible with a given weather type
   */
  public getCompatibleWeatherTypes(weatherType: WeatherType): WeatherType[] {
    return this.compatibilityMatrix.get(weatherType) || [];
  }

  /**
   * Get all weather types that are opposites of a given weather type
   */
  public getOppositeWeatherTypes(weatherType: WeatherType): WeatherType[] {
    const opposites: WeatherType[] = [];

    for (const [type1, type2] of this.oppositeWeatherPairs) {
      if (type1 === weatherType) {
        opposites.push(type2);
      } else if (type2 === weatherType) {
        opposites.push(type1);
      }
    }

    return opposites;
  }

  /**
   * Find the best compatible weather types for a given set
   */
  public findCompatibleWeatherTypes(
    baseWeather: WeatherType[],
    candidateWeather: WeatherType[]
  ): WeatherType[] {
    const compatible: WeatherType[] = [];

    for (const candidate of candidateWeather) {
      let isCompatibleWithAll = true;

      // Check if candidate is compatible with all base weather types
      for (const base of baseWeather) {
        if (!this.areWeatherTypesCompatible(base, candidate)) {
          isCompatibleWithAll = false;
          break;
        }
      }

      // Check if candidate is not opposite to any base weather type
      if (isCompatibleWithAll) {
        let hasOpposite = false;
        for (const base of baseWeather) {
          if (this.areOppositeWeatherTypes(base, candidate)) {
            hasOpposite = true;
            break;
          }
        }

        if (!hasOpposite) {
          compatible.push(candidate);
        }
      }
    }

    return compatible;
  }

  /**
   * Suggest weather types that would work well with the current combination
   */
  public suggestCompatibleWeather(
    currentWeather: WeatherType[]
  ): WeatherType[] {
    if (currentWeather.length === 0) {
      return [];
    }

    // Find weather types that are compatible with all current weather
    let suggestions: WeatherType[] = [];

    // Start with weather types compatible with the first weather type
    const firstWeatherCompatible = this.getCompatibleWeatherTypes(
      currentWeather[0]
    );

    for (const candidate of firstWeatherCompatible) {
      // Skip if already in current weather
      if (currentWeather.includes(candidate)) {
        continue;
      }

      // Check if compatible with all current weather types
      let isCompatibleWithAll = true;
      for (const current of currentWeather) {
        if (
          !this.areWeatherTypesCompatible(candidate, current) &&
          !this.areOppositeWeatherTypes(candidate, current)
        ) {
          isCompatibleWithAll = false;
          break;
        }
      }

      if (isCompatibleWithAll) {
        suggestions.push(candidate);
      }
    }

    return suggestions;
  }

  /**
   * Check for opposite weather types in the combination
   */
  private checkOppositeWeatherTypes(
    weatherTypes: WeatherType[]
  ): WeatherValidationError[] {
    const errors: WeatherValidationError[] = [];

    for (let i = 0; i < weatherTypes.length; i++) {
      for (let j = i + 1; j < weatherTypes.length; j++) {
        const weather1 = weatherTypes[i];
        const weather2 = weatherTypes[j];

        if (this.areOppositeWeatherTypes(weather1, weather2)) {
          errors.push(
            new WeatherValidationError(
              ValidationErrorType.OPPOSITE_WEATHER,
              [weather1, weather2],
              `Opposite weather types cannot coexist: ${weather1} and ${weather2}`
            )
          );
        }
      }
    }

    return errors;
  }

  /**
   * Check for incompatible weather types in the combination
   */
  private checkWeatherCompatibility(
    weatherTypes: WeatherType[]
  ): WeatherValidationError[] {
    const errors: WeatherValidationError[] = [];

    for (let i = 0; i < weatherTypes.length; i++) {
      for (let j = i + 1; j < weatherTypes.length; j++) {
        const weather1 = weatherTypes[i];
        const weather2 = weatherTypes[j];

        // Skip if they are opposites (already handled)
        if (this.areOppositeWeatherTypes(weather1, weather2)) {
          continue;
        }

        // Check if they are compatible
        if (!this.areWeatherTypesCompatible(weather1, weather2)) {
          errors.push(
            new WeatherValidationError(
              ValidationErrorType.INCOMPATIBLE_WEATHER,
              [weather1, weather2],
              `Incompatible weather types: ${weather1} and ${weather2}`
            )
          );
        }
      }
    }

    return errors;
  }

  /**
   * Generate warnings for potentially problematic combinations
   */
  private generateWarnings(weatherTypes: WeatherType[]): string[] {
    const warnings: string[] = [];

    // Warn about too many weather types (but not error level)
    if (weatherTypes.length > 3) {
      warnings.push(
        `Many weather types active (${weatherTypes.length}). This may create complex interactions.`
      );
    }

    // Warn about specific problematic combinations that aren't errors
    const problematicCombinations = [
      {
        types: ["Hot", "Humid"],
        warning: "Hot and Humid weather may create uncomfortable conditions",
      },
      {
        types: ["Cold", "Windy"],
        warning: "Cold and Windy weather may create harsh conditions",
      },
      {
        types: ["Stormy", "Foggy"],
        warning: "Stormy and Foggy weather may create dangerous visibility",
      },
    ];

    for (const { types, warning } of problematicCombinations) {
      if (types.every((type) => weatherTypes.includes(type as WeatherType))) {
        warnings.push(warning);
      }
    }

    return warnings;
  }
}

/**
 * Utility functions for weather validation
 */

/**
 * Quick validation function for weather combinations
 */
export function validateWeatherMix(
  weatherTypes: WeatherType[],
  config: ProcessedWeatherConfig
): boolean {
  const validator = new WeatherValidator(config);
  const result = validator.validateWeatherCombination(weatherTypes);
  return result.isValid;
}

/**
 * Check if weather types are opposites (utility function)
 */
export function areOppositeWeatherTypes(
  weather1: WeatherType,
  weather2: WeatherType
): boolean {
  return OPPOSITE_WEATHER_PAIRS.some(
    ([type1, type2]) =>
      (type1 === weather1 && type2 === weather2) ||
      (type1 === weather2 && type2 === weather1)
  );
}

/**
 * Check if weather array contains opposite types (utility function)
 */
export function hasOppositeWeatherTypes(weatherTypes: WeatherType[]): boolean {
  for (let i = 0; i < weatherTypes.length; i++) {
    for (let j = i + 1; j < weatherTypes.length; j++) {
      if (areOppositeWeatherTypes(weatherTypes[i], weatherTypes[j])) {
        return true;
      }
    }
  }
  return false;
}
