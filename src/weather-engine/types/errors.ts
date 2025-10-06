/**
 * Error types for the weather engine
 */

import { WeatherType, WeatherCard, GameState } from "./weather";

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Error recovery strategies
 */
export enum RecoveryStrategy {
  RETRY = "retry",
  FALLBACK = "fallback",
  RESET = "reset",
  IGNORE = "ignore",
  MANUAL = "manual",
}

/**
 * Error context information
 */
export interface ErrorContext {
  timestamp: Date;
  gameState?: Partial<GameState>;
  playerAction?: string;
  systemState?: Record<string, any>;
  stackTrace?: string;
}

/**
 * Base weather engine error
 */
export abstract class WeatherEngineError extends Error {
  public readonly timestamp: Date;
  public readonly context: ErrorContext;
  public recoveryAttempts: number = 0;
  public maxRecoveryAttempts: number = 3;

  constructor(
    message: string,
    public readonly code: string,
    public readonly severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public readonly recoveryStrategy: RecoveryStrategy = RecoveryStrategy.FALLBACK,
    context: Partial<ErrorContext> = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = {
      timestamp: this.timestamp,
      stackTrace: this.stack,
      ...context,
    };
  }

  /**
   * Check if error can be recovered from
   */
  canRecover(): boolean {
    return (
      this.recoveryAttempts < this.maxRecoveryAttempts &&
      this.recoveryStrategy !== RecoveryStrategy.MANUAL
    );
  }

  /**
   * Increment recovery attempt counter
   */
  incrementRecoveryAttempts(): void {
    this.recoveryAttempts++;
  }

  /**
   * Get error details for logging
   */
  getErrorDetails(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      recoveryStrategy: this.recoveryStrategy,
      recoveryAttempts: this.recoveryAttempts,
      maxRecoveryAttempts: this.maxRecoveryAttempts,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
    };
  }
}

/**
 * Weather validation error
 */
export class WeatherValidationError extends WeatherEngineError {
  constructor(
    public readonly invalidWeather: WeatherType[],
    public readonly reason: string,
    context: Partial<ErrorContext> = {}
  ) {
    super(
      `Invalid weather combination: ${reason}`,
      "WEATHER_VALIDATION_ERROR",
      ErrorSeverity.MEDIUM,
      RecoveryStrategy.FALLBACK,
      context
    );
  }
}

/**
 * Card play error
 */
export class CardPlayError extends WeatherEngineError {
  constructor(
    public readonly card: WeatherCard,
    public readonly reason: string,
    context: Partial<ErrorContext> = {}
  ) {
    super(
      `Cannot play card ${card.name}: ${reason}`,
      "CARD_PLAY_ERROR",
      ErrorSeverity.MEDIUM,
      RecoveryStrategy.IGNORE,
      context
    );
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends WeatherEngineError {
  constructor(
    public readonly configPath: string,
    public readonly reason: string,
    context: Partial<ErrorContext> = {}
  ) {
    super(
      `Configuration error in ${configPath}: ${reason}`,
      "CONFIGURATION_ERROR",
      ErrorSeverity.HIGH,
      RecoveryStrategy.FALLBACK,
      context
    );
  }
}

/**
 * Game state error
 */
export class GameStateError extends WeatherEngineError {
  constructor(
    public readonly stateProperty: string,
    public readonly reason: string,
    context: Partial<ErrorContext> = {}
  ) {
    super(
      `Game state error in ${stateProperty}: ${reason}`,
      "GAME_STATE_ERROR",
      ErrorSeverity.HIGH,
      RecoveryStrategy.RESET,
      context
    );
  }
}

/**
 * Game mode error
 */
export class GameModeError extends WeatherEngineError {
  constructor(
    public readonly modeName: string,
    public readonly reason: string,
    context: Partial<ErrorContext> = {}
  ) {
    super(
      `Game mode error in ${modeName}: ${reason}`,
      "GAME_MODE_ERROR",
      ErrorSeverity.MEDIUM,
      RecoveryStrategy.FALLBACK,
      context
    );
  }
}

/**
 * Season manager error
 */
export class SeasonError extends WeatherEngineError {
  constructor(
    public readonly season: string,
    public readonly month: number,
    public readonly reason: string,
    context: Partial<ErrorContext> = {}
  ) {
    super(
      `Season error for ${season} (month ${month}): ${reason}`,
      "SEASON_ERROR",
      ErrorSeverity.MEDIUM,
      RecoveryStrategy.FALLBACK,
      context
    );
  }
}

/**
 * Weather calculation error
 */
export class WeatherCalculationError extends WeatherEngineError {
  constructor(
    public readonly calculationType: string,
    public readonly inputData: any,
    public readonly reason: string,
    context: Partial<ErrorContext> = {}
  ) {
    super(
      `Weather calculation error in ${calculationType}: ${reason}`,
      "WEATHER_CALCULATION_ERROR",
      ErrorSeverity.HIGH,
      RecoveryStrategy.RETRY,
      context
    );
  }
}

/**
 * Plugin system error
 */
export class PluginError extends WeatherEngineError {
  constructor(
    public readonly pluginName: string,
    public readonly operation: string,
    public readonly reason: string,
    context: Partial<ErrorContext> = {}
  ) {
    super(
      `Plugin error in ${pluginName} during ${operation}: ${reason}`,
      "PLUGIN_ERROR",
      ErrorSeverity.LOW,
      RecoveryStrategy.IGNORE,
      context
    );
  }
}

/**
 * Security validation error
 */
export class SecurityError extends WeatherEngineError {
  constructor(
    public readonly securityCheck: string,
    public readonly violationType: string,
    public readonly reason: string,
    context: Partial<ErrorContext> = {}
  ) {
    super(
      `Security violation in ${securityCheck}: ${reason}`,
      "SECURITY_ERROR",
      ErrorSeverity.CRITICAL,
      RecoveryStrategy.MANUAL,
      context
    );
  }
}

/**
 * Input validation error
 */
export class InputValidationError extends WeatherEngineError {
  constructor(
    public readonly inputField: string,
    public readonly inputValue: any,
    public readonly reason: string,
    context: Partial<ErrorContext> = {}
  ) {
    super(
      `Input validation error for ${inputField}: ${reason}`,
      "INPUT_VALIDATION_ERROR",
      ErrorSeverity.MEDIUM,
      RecoveryStrategy.IGNORE,
      context
    );
  }
}

/**
 * State corruption error
 */
export class StateCorruptionError extends WeatherEngineError {
  constructor(
    public readonly corruptedState: string,
    public readonly expectedState: any,
    public readonly actualState: any,
    context: Partial<ErrorContext> = {}
  ) {
    super(
      `State corruption detected in ${corruptedState}`,
      "STATE_CORRUPTION_ERROR",
      ErrorSeverity.CRITICAL,
      RecoveryStrategy.RESET,
      context
    );
  }
}
