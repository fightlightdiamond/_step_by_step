/**
 * Weather Manager - Core weather state management system
 */

import {
  WeatherType,
  WeatherState,
  WeatherCard,
  ElementType,
  SeasonType,
} from "../types";
import {
  WeatherValidator,
  ValidationResult,
  WeatherValidationError,
  ValidationErrorType,
} from "../validation";
import { DamageCalculator, DamageCalculationResult } from "../calculations";
import { ProcessedWeatherConfig } from "../config";
import { MONTH_TO_SEASON, DEFAULT_GAME_CONFIG } from "../constants";

/**
 * Weather manager events
 */
export type WeatherManagerEvent =
  | "weatherChanged"
  | "turnAdvanced"
  | "cardPlayed"
  | "weatherReset"
  | "stateRestored"
  | "validationError"
  | "validationWarning";

/**
 * Weather manager event listener
 */
export type WeatherManagerEventListener = (
  event: WeatherManagerEvent,
  data: any
) => void;

/**
 * Weather change options
 */
export interface WeatherChangeOptions {
  validateChange?: boolean;
  triggerEvents?: boolean;
  source?: "natural" | "card" | "manual" | "system";
  reason?: string;
  logLevel?: "none" | "error" | "warn" | "info" | "debug";
}

/**
 * Weather manager state persistence data
 */
export interface WeatherManagerPersistenceData {
  weatherState: WeatherState;
  config: ProcessedWeatherConfig;
  version: string;
  timestamp: number;
}

/**
 * Weather manager error types
 */
export enum WeatherManagerErrorType {
  INVALID_WEATHER_COMBINATION = "INVALID_WEATHER_COMBINATION",
  INVALID_TURN = "INVALID_TURN",
  INVALID_MONTH = "INVALID_MONTH",
  CARD_PLAY_ERROR = "CARD_PLAY_ERROR",
  STATE_CORRUPTION = "STATE_CORRUPTION",
  CONFIG_ERROR = "CONFIG_ERROR",
}

/**
 * Weather manager error
 */
export class WeatherManagerError extends Error {
  constructor(
    public readonly errorType: WeatherManagerErrorType,
    message: string,
    public readonly context?: any
  ) {
    super(message);
    this.name = "WeatherManagerError";
  }
}

/**
 * Core weather management system
 */
export class WeatherManager {
  private weatherState: WeatherState;
  private validator: WeatherValidator;
  private calculator: DamageCalculator;
  private config: ProcessedWeatherConfig;
  private eventListeners: Map<
    WeatherManagerEvent,
    WeatherManagerEventListener[]
  >;
  private stateHistory: WeatherState[];
  private maxHistorySize: number;
  private debugMode: boolean;
  private logLevel: "none" | "error" | "warn" | "info" | "debug";

  constructor(
    config: ProcessedWeatherConfig,
    initialState?: Partial<WeatherState>,
    options?: {
      debugMode?: boolean;
      logLevel?: "none" | "error" | "warn" | "info" | "debug";
      maxHistorySize?: number;
    }
  ) {
    this.config = config;
    this.validator = new WeatherValidator(config);
    this.calculator = new DamageCalculator(config);
    this.eventListeners = new Map();
    this.stateHistory = [];
    this.maxHistorySize = options?.maxHistorySize ?? 50;
    this.debugMode = options?.debugMode ?? false;
    this.logLevel = options?.logLevel ?? "warn";

    // Initialize weather state
    this.weatherState = this.createInitialState(initialState);
    this.validateState();

    this.log("info", "WeatherManager initialized", {
      initialState: this.weatherState,
      debugMode: this.debugMode,
      logLevel: this.logLevel,
    });
  }

  /**
   * Get current weather state (read-only copy)
   */
  public getCurrentWeatherState(): Readonly<WeatherState> {
    return { ...this.weatherState };
  }

  /**
   * Get current weather types
   */
  public getCurrentWeather(): WeatherType[] {
    return [...this.weatherState.currentWeather];
  }

  /**
   * Get current turn number
   */
  public getCurrentTurn(): number {
    return this.weatherState.turn;
  }

  /**
   * Get current month
   */
  public getCurrentMonth(): number {
    return this.weatherState.month;
  }

  /**
   * Get current season
   */
  public getCurrentSeason(): SeasonType {
    return this.weatherState.season;
  }

  /**
   * Get active weather cards
   */
  public getActiveCards(): WeatherCard[] {
    return [...this.weatherState.activeCards];
  }

  /**
   * Apply new weather types
   */
  public applyWeather(
    weatherTypes: WeatherType[],
    options: WeatherChangeOptions = {}
  ): ValidationResult {
    const opts: WeatherChangeOptions = {
      validateChange: true,
      triggerEvents: true,
      source: "manual",
      ...options,
    };

    // Validate weather combination if requested
    if (opts.validateChange) {
      const validationResult =
        this.validator.validateWeatherCombination(weatherTypes);
      if (!validationResult.isValid) {
        throw new WeatherManagerError(
          WeatherManagerErrorType.INVALID_WEATHER_COMBINATION,
          `Invalid weather combination: ${validationResult.errors
            .map((e) => e.message)
            .join(", ")}`,
          { weatherTypes, validationResult }
        );
      }
    }

    // Save current state to history
    this.saveStateToHistory();

    // Update weather state
    const previousWeather = [...this.weatherState.currentWeather];
    this.weatherState.currentWeather = [...weatherTypes];

    // Trigger events if requested
    if (opts.triggerEvents) {
      this.emitEvent("weatherChanged", {
        previousWeather,
        newWeather: weatherTypes,
        source: opts.source,
        reason: opts.reason,
      });
    }

    // Return validation result (will be valid if we got here)
    return this.validator.validateWeatherCombination(weatherTypes);
  }

  /**
   * Reset weather to neutral state
   */
  public resetWeather(options: WeatherChangeOptions = {}): void {
    const opts: WeatherChangeOptions = {
      triggerEvents: true,
      source: "system",
      reason: "Weather reset",
      ...options,
    };

    this.saveStateToHistory();

    const previousWeather = [...this.weatherState.currentWeather];
    this.weatherState.currentWeather = [];

    if (opts.triggerEvents) {
      this.emitEvent("weatherReset", {
        previousWeather,
        source: opts.source,
        reason: opts.reason,
      });
    }
  }

  /**
   * Advance to next turn
   */
  public advanceTurn(): void {
    if (this.weatherState.turn >= DEFAULT_GAME_CONFIG.TURNS_PER_GAME) {
      throw new WeatherManagerError(
        WeatherManagerErrorType.INVALID_TURN,
        `Cannot advance beyond turn ${DEFAULT_GAME_CONFIG.TURNS_PER_GAME}`
      );
    }

    this.saveStateToHistory();

    this.weatherState.turn += 1;
    this.weatherState.month = (this.weatherState.month % 12) + 1;
    this.weatherState.season = MONTH_TO_SEASON[this.weatherState.month];

    // Process card expirations
    this.processCardExpirations();

    this.emitEvent("turnAdvanced", {
      turn: this.weatherState.turn,
      month: this.weatherState.month,
      season: this.weatherState.season,
    });
  }

  /**
   * Set specific turn and month
   */
  public setTurn(turn: number, month?: number): void {
    if (turn < 1 || turn > DEFAULT_GAME_CONFIG.TURNS_PER_GAME) {
      throw new WeatherManagerError(
        WeatherManagerErrorType.INVALID_TURN,
        `Turn must be between 1 and ${DEFAULT_GAME_CONFIG.TURNS_PER_GAME}`
      );
    }

    const targetMonth = month ?? turn;
    if (targetMonth < 1 || targetMonth > 12) {
      throw new WeatherManagerError(
        WeatherManagerErrorType.INVALID_MONTH,
        `Month must be between 1 and 12`
      );
    }

    this.saveStateToHistory();

    this.weatherState.turn = turn;
    this.weatherState.month = targetMonth;
    this.weatherState.season = MONTH_TO_SEASON[targetMonth];

    this.emitEvent("turnAdvanced", {
      turn: this.weatherState.turn,
      month: this.weatherState.month,
      season: this.weatherState.season,
    });
  }

  /**
   * Play a weather card
   */
  public playWeatherCard(card: WeatherCard): ValidationResult {
    // Validate card can be played
    if (card.weather && !this.isValidWeatherType(card.weather)) {
      throw new WeatherManagerError(
        WeatherManagerErrorType.CARD_PLAY_ERROR,
        `Invalid weather type in card: ${card.weather}`
      );
    }

    this.saveStateToHistory();

    // Handle different card types
    switch (card.type) {
      case "Weather":
        if (card.weather) {
          const newWeather = [
            ...this.weatherState.currentWeather,
            card.weather,
          ];
          const validationResult = this.applyWeather(newWeather, {
            source: "card",
            reason: `Played weather card: ${card.name}`,
          });

          // Add card to active cards if it has duration
          if (card.duration && card.duration > 0) {
            this.weatherState.activeCards.push({ ...card });
          }

          this.emitEvent("cardPlayed", { card, effect: "weather_change" });
          return validationResult;
        }
        break;

      case "BreakWeather":
        this.resetWeather({
          source: "card",
          reason: `Played break weather card: ${card.name}`,
        });

        if (card.duration && card.duration > 0) {
          this.weatherState.activeCards.push({ ...card });
        }

        this.emitEvent("cardPlayed", { card, effect: "weather_break" });
        break;

      case "WeatherBuff":
      case "WeatherNerf":
        // Add card to active cards for effect processing
        if (card.duration && card.duration > 0) {
          this.weatherState.activeCards.push({ ...card });
        }

        this.emitEvent("cardPlayed", { card, effect: "weather_modifier" });
        break;
    }

    // Return current weather validation
    return this.validator.validateWeatherCombination(
      this.weatherState.currentWeather
    );
  }

  /**
   * Calculate current elemental damage modifiers
   */
  public calculateElementalModifiers(): DamageCalculationResult {
    return this.calculator.calculateElementalModifiers(
      this.weatherState.currentWeather
    );
  }

  /**
   * Calculate damage for specific element
   */
  public calculateElementDamage(
    element: ElementType,
    baseDamage: number
  ): number {
    return this.calculator.calculateElementDamageModifier(
      element,
      this.weatherState.currentWeather,
      baseDamage
    );
  }

  /**
   * Validate current weather state
   */
  public validateCurrentWeather(): ValidationResult {
    return this.validator.validateWeatherCombination(
      this.weatherState.currentWeather
    );
  }

  /**
   * Get weather suggestions for current state
   */
  public getWeatherSuggestions(): WeatherType[] {
    return this.validator.suggestCompatibleWeather(
      this.weatherState.currentWeather
    );
  }

  /**
   * Restore state from persistence data
   */
  public restoreState(persistenceData: WeatherManagerPersistenceData): void {
    // Validate persistence data
    if (!persistenceData.weatherState || !persistenceData.config) {
      throw new WeatherManagerError(
        WeatherManagerErrorType.STATE_CORRUPTION,
        "Invalid persistence data"
      );
    }

    this.saveStateToHistory();

    // Restore state
    this.weatherState = { ...persistenceData.weatherState };
    this.config = persistenceData.config;

    // Recreate validator and calculator with restored config
    this.validator = new WeatherValidator(this.config);
    this.calculator = new DamageCalculator(this.config);

    // Validate restored state
    this.validateState();

    this.emitEvent("stateRestored", { persistenceData });
  }

  /**
   * Get state for persistence
   */
  public getPersistenceData(): WeatherManagerPersistenceData {
    return {
      weatherState: { ...this.weatherState },
      config: this.config,
      version: "1.0.0",
      timestamp: Date.now(),
    };
  }

  /**
   * Get state history
   */
  public getStateHistory(): WeatherState[] {
    return [...this.stateHistory];
  }

  /**
   * Undo last state change
   */
  public undoLastChange(): boolean {
    if (this.stateHistory.length === 0) {
      return false;
    }

    const previousState = this.stateHistory.pop()!;
    this.weatherState = { ...previousState };

    this.emitEvent("stateRestored", { source: "undo" });
    return true;
  }

  /**
   * Clear state history
   */
  public clearHistory(): void {
    this.stateHistory = [];
  }

  /**
   * Add event listener
   */
  public addEventListener(
    event: WeatherManagerEvent,
    listener: WeatherManagerEventListener
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(
    event: WeatherManagerEvent,
    listener: WeatherManagerEventListener
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Remove all event listeners
   */
  public removeAllEventListeners(): void {
    this.eventListeners.clear();
  }

  /**
   * Create initial weather state
   */
  private createInitialState(
    initialState?: Partial<WeatherState>
  ): WeatherState {
    const defaultState: WeatherState = {
      currentWeather: [],
      turn: 1,
      month: DEFAULT_GAME_CONFIG.STARTING_MONTH,
      season: MONTH_TO_SEASON[DEFAULT_GAME_CONFIG.STARTING_MONTH],
      activeCards: [],
    };

    return { ...defaultState, ...initialState };
  }

  /**
   * Validate current state integrity
   */
  private validateState(): void {
    // Validate turn
    if (
      this.weatherState.turn < 1 ||
      this.weatherState.turn > DEFAULT_GAME_CONFIG.TURNS_PER_GAME
    ) {
      throw new WeatherManagerError(
        WeatherManagerErrorType.STATE_CORRUPTION,
        `Invalid turn: ${this.weatherState.turn}`
      );
    }

    // Validate month
    if (this.weatherState.month < 1 || this.weatherState.month > 12) {
      throw new WeatherManagerError(
        WeatherManagerErrorType.STATE_CORRUPTION,
        `Invalid month: ${this.weatherState.month}`
      );
    }

    // Validate season matches month
    const expectedSeason = MONTH_TO_SEASON[this.weatherState.month];
    if (this.weatherState.season !== expectedSeason) {
      throw new WeatherManagerError(
        WeatherManagerErrorType.STATE_CORRUPTION,
        `Season ${this.weatherState.season} doesn't match month ${this.weatherState.month}`
      );
    }

    // Validate weather types
    for (const weather of this.weatherState.currentWeather) {
      if (!this.isValidWeatherType(weather)) {
        throw new WeatherManagerError(
          WeatherManagerErrorType.STATE_CORRUPTION,
          `Invalid weather type: ${weather}`
        );
      }
    }
  }

  /**
   * Check if weather type is valid
   */
  private isValidWeatherType(weather: WeatherType): boolean {
    return this.config.weatherEffects.has(weather);
  }

  /**
   * Process card expirations
   */
  private processCardExpirations(): void {
    const expiredCards: WeatherCard[] = [];

    this.weatherState.activeCards = this.weatherState.activeCards.filter(
      (card) => {
        if (card.duration !== undefined) {
          card.duration -= 1;
          if (card.duration <= 0) {
            expiredCards.push(card);
            return false;
          }
        }
        return true;
      }
    );

    // Emit events for expired cards
    for (const card of expiredCards) {
      this.emitEvent("cardPlayed", { card, effect: "card_expired" });
    }
  }

  /**
   * Save current state to history
   */
  private saveStateToHistory(): void {
    this.stateHistory.push({ ...this.weatherState });

    // Limit history size
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: WeatherManagerEvent, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event, data);
        } catch (error) {
          console.error(
            `Error in weather manager event listener for ${event}:`,
            error
          );
        }
      }
    }
  }

  /**
   * Log message with level filtering
   */
  private log(
    level: "error" | "warn" | "info" | "debug",
    message: string,
    data?: any
  ): void {
    const levels = { none: 0, error: 1, warn: 2, info: 3, debug: 4 };
    const currentLevel = levels[this.logLevel];
    const messageLevel = levels[level];

    if (messageLevel <= currentLevel) {
      const timestamp = new Date().toISOString();
      const logData = data ? ` ${JSON.stringify(data)}` : "";
      console[level](
        `[${timestamp}] WeatherManager ${level.toUpperCase()}: ${message}${logData}`
      );
    }

    // Always log to debug mode if enabled
    if (this.debugMode && level === "debug") {
      console.debug(`[DEBUG] WeatherManager: ${message}`, data);
    }
  }

  /**
   * Enable or disable debug mode
   */
  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.log("info", `Debug mode ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Set logging level
   */
  public setLogLevel(
    level: "none" | "error" | "warn" | "info" | "debug"
  ): void {
    const oldLevel = this.logLevel;
    this.logLevel = level;
    this.log("info", `Log level changed from ${oldLevel} to ${level}`);
  }

  /**
   * Get current debug mode status
   */
  public isDebugMode(): boolean {
    return this.debugMode;
  }

  /**
   * Get current log level
   */
  public getLogLevel(): string {
    return this.logLevel;
  }

  /**
   * Validate weather combination with detailed error reporting
   */
  public validateWeatherCombinationDetailed(weatherTypes: WeatherType[]): {
    validationResult: ValidationResult;
    suggestions: WeatherType[];
    compatibilityAnalysis: {
      compatible: WeatherType[];
      incompatible: WeatherType[];
      opposite: WeatherType[];
    };
  } {
    this.log("debug", "Performing detailed weather validation", {
      weatherTypes,
    });

    const validationResult =
      this.validator.validateWeatherCombination(weatherTypes);
    const suggestions = this.validator.suggestCompatibleWeather(weatherTypes);

    // Analyze compatibility
    const compatibilityAnalysis = {
      compatible: [] as WeatherType[],
      incompatible: [] as WeatherType[],
      opposite: [] as WeatherType[],
    };

    for (let i = 0; i < weatherTypes.length; i++) {
      for (let j = i + 1; j < weatherTypes.length; j++) {
        const weather1 = weatherTypes[i];
        const weather2 = weatherTypes[j];

        if (this.validator.areOppositeWeatherTypes(weather1, weather2)) {
          if (!compatibilityAnalysis.opposite.includes(weather1)) {
            compatibilityAnalysis.opposite.push(weather1);
          }
          if (!compatibilityAnalysis.opposite.includes(weather2)) {
            compatibilityAnalysis.opposite.push(weather2);
          }
        } else if (
          this.validator.areWeatherTypesCompatible(weather1, weather2)
        ) {
          if (!compatibilityAnalysis.compatible.includes(weather1)) {
            compatibilityAnalysis.compatible.push(weather1);
          }
          if (!compatibilityAnalysis.compatible.includes(weather2)) {
            compatibilityAnalysis.compatible.push(weather2);
          }
        } else {
          if (!compatibilityAnalysis.incompatible.includes(weather1)) {
            compatibilityAnalysis.incompatible.push(weather1);
          }
          if (!compatibilityAnalysis.incompatible.includes(weather2)) {
            compatibilityAnalysis.incompatible.push(weather2);
          }
        }
      }
    }

    this.log("debug", "Detailed validation complete", {
      validationResult,
      suggestions,
      compatibilityAnalysis,
    });

    return {
      validationResult,
      suggestions,
      compatibilityAnalysis,
    };
  }
}
