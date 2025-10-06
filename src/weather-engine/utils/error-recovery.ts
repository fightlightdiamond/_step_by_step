/**
 * Error recovery mechanisms for the weather engine
 */

import {
  WeatherEngineError,
  ErrorSeverity,
  RecoveryStrategy,
  WeatherValidationError,
  GameStateError,
  ConfigurationError,
  WeatherCalculationError,
  StateCorruptionError,
} from "../types/errors";
import { WeatherType, GameState, WeatherState } from "../types/weather";
import { WeatherLogger } from "./error-logger";

/**
 * Recovery result
 */
export interface RecoveryResult {
  success: boolean;
  recoveredState?: any;
  fallbackUsed?: boolean;
  message: string;
}

/**
 * Default fallback states
 */
export interface FallbackStates {
  defaultWeather: WeatherType[];
  defaultGameState: Partial<GameState>;
  defaultWeatherState: WeatherState;
}

/**
 * Error recovery manager
 */
export class ErrorRecoveryManager {
  private logger: WeatherLogger;
  private fallbackStates: FallbackStates;
  private recoveryHistory: Map<string, number> = new Map();

  constructor(logger: WeatherLogger, fallbackStates: FallbackStates) {
    this.logger = logger;
    this.fallbackStates = fallbackStates;
  }

  /**
   * Attempt to recover from an error
   */
  async recoverFromError(error: WeatherEngineError): Promise<RecoveryResult> {
    this.logger.logError(error);

    // Check if error can be recovered
    if (!error.canRecover()) {
      return {
        success: false,
        message: `Cannot recover from error: ${error.message}. Max recovery attempts exceeded or manual intervention required.`,
      };
    }

    // Increment recovery attempts
    error.incrementRecoveryAttempts();

    // Track recovery attempts for this error type
    const errorKey = `${error.code}_${error.severity}`;
    const attempts = this.recoveryHistory.get(errorKey) || 0;
    this.recoveryHistory.set(errorKey, attempts + 1);

    // Apply recovery strategy
    switch (error.recoveryStrategy) {
      case RecoveryStrategy.RETRY:
        return await this.retryOperation(error);

      case RecoveryStrategy.FALLBACK:
        return await this.useFallback(error);

      case RecoveryStrategy.RESET:
        return await this.resetState(error);

      case RecoveryStrategy.IGNORE:
        return await this.ignoreError(error);

      default:
        return {
          success: false,
          message: `No recovery strategy available for error: ${error.message}`,
        };
    }
  }

  /**
   * Retry the operation that caused the error
   */
  private async retryOperation(
    error: WeatherEngineError
  ): Promise<RecoveryResult> {
    this.logger.logInfo(`Retrying operation for error: ${error.code}`);

    // For weather calculation errors, try with default values
    if (error instanceof WeatherCalculationError) {
      try {
        // Use fallback calculation with safe defaults
        const recoveredState = this.performSafeCalculation(error);
        return {
          success: true,
          recoveredState,
          message: `Successfully retried calculation with safe defaults`,
        };
      } catch (retryError) {
        return {
          success: false,
          message: `Retry failed: ${
            retryError instanceof Error ? retryError.message : "Unknown error"
          }`,
        };
      }
    }

    return {
      success: false,
      message: `Retry not implemented for error type: ${error.constructor.name}`,
    };
  }

  /**
   * Use fallback values
   */
  private async useFallback(
    error: WeatherEngineError
  ): Promise<RecoveryResult> {
    this.logger.logInfo(`Using fallback for error: ${error.code}`);

    if (error instanceof WeatherValidationError) {
      return {
        success: true,
        recoveredState: this.fallbackStates.defaultWeather,
        fallbackUsed: true,
        message: `Used default weather fallback: ${this.fallbackStates.defaultWeather.join(
          ", "
        )}`,
      };
    }

    if (error instanceof ConfigurationError) {
      return {
        success: true,
        recoveredState: this.getDefaultConfiguration(),
        fallbackUsed: true,
        message: `Used default configuration fallback`,
      };
    }

    return {
      success: true,
      recoveredState: this.fallbackStates.defaultGameState,
      fallbackUsed: true,
      message: `Used generic fallback state`,
    };
  }

  /**
   * Reset state to known good state
   */
  private async resetState(error: WeatherEngineError): Promise<RecoveryResult> {
    this.logger.logWarning(`Resetting state for error: ${error.code}`);

    if (
      error instanceof GameStateError ||
      error instanceof StateCorruptionError
    ) {
      const cleanState = this.createCleanGameState();
      return {
        success: true,
        recoveredState: cleanState,
        message: `Reset to clean game state`,
      };
    }

    return {
      success: true,
      recoveredState: this.fallbackStates.defaultGameState,
      message: `Reset to default state`,
    };
  }

  /**
   * Ignore the error and continue
   */
  private async ignoreError(
    error: WeatherEngineError
  ): Promise<RecoveryResult> {
    this.logger.logInfo(`Ignoring error: ${error.code}`);

    return {
      success: true,
      message: `Error ignored: ${error.message}`,
    };
  }

  /**
   * Perform safe calculation with fallback values
   */
  private performSafeCalculation(error: WeatherCalculationError): any {
    // Return safe default calculation results
    switch (error.calculationType) {
      case "elemental_damage":
        return { Fire: 0, Ice: 0, Lightning: 0 };

      case "weather_effects":
        return this.fallbackStates.defaultWeather;

      case "seasonal_selection":
        return this.fallbackStates.defaultWeather[0] || "Sunny";

      default:
        return null;
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfiguration(): any {
    return {
      weatherEffects: {
        Sunny: { Fire: 10, Ice: -5, Lightning: -5 },
        Cloudy: { Fire: -5, Ice: 5, Lightning: 0 },
        Rainy: { Fire: -10, Ice: 5, Lightning: 10 },
      },
      compatibilityMatrix: new Map(),
      oppositeWeatherPairs: [
        ["Hot", "Cold"],
        ["Sunny", "Stormy"],
      ],
    };
  }

  /**
   * Create clean game state
   */
  private createCleanGameState(): Partial<GameState> {
    return {
      currentTurn: 1,
      currentMonth: 1,
      weatherState: this.fallbackStates.defaultWeatherState,
      playerStates: [],
      gameMode: "standard",
    };
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStatistics(): Record<string, number> {
    return Object.fromEntries(this.recoveryHistory);
  }

  /**
   * Clear recovery history
   */
  clearRecoveryHistory(): void {
    this.recoveryHistory.clear();
  }

  /**
   * Check if error type has exceeded recovery limits
   */
  hasExceededRecoveryLimits(
    errorCode: string,
    maxAttempts: number = 10
  ): boolean {
    const attempts = this.recoveryHistory.get(errorCode) || 0;
    return attempts >= maxAttempts;
  }
}

/**
 * Utility functions for error recovery
 */

/**
 * Create safe fallback weather state
 */
export function createSafeFallbackWeatherState(): WeatherState {
  return {
    currentWeather: ["Sunny"],
    turn: 1,
    month: 1,
    season: "Spring",
    activeCards: [],
    weatherHistory: [],
    elementalModifiers: { Fire: 0, Ice: 0, Lightning: 0 },
  };
}

/**
 * Validate and sanitize weather types
 */
export function sanitizeWeatherTypes(weatherTypes: any[]): WeatherType[] {
  const validWeatherTypes: WeatherType[] = [
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

  return weatherTypes
    .filter((weather) => typeof weather === "string")
    .filter((weather) => validWeatherTypes.includes(weather as WeatherType))
    .slice(0, 5); // Limit to maximum 5 weather types
}

/**
 * Create error-safe game state
 */
export function createErrorSafeGameState(
  partialState: Partial<GameState> = {}
): GameState {
  const defaultState: GameState = {
    currentTurn: 1,
    currentMonth: 1,
    weatherState: createSafeFallbackWeatherState(),
    playerStates: [],
    gameMode: "standard",
    turnHistory: [],
  };

  return { ...defaultState, ...partialState };
}
