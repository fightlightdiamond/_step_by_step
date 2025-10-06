/**
 * Input validation and sanitization for the weather engine
 */

import {
  WeatherType,
  WeatherCard,
  GameState,
  WeatherState,
} from "../types/weather";
import { InputValidationError, SecurityError } from "../types/errors";

/**
 * Validation result
 */
export interface ValidationResult<T = unknown> {
  isValid: boolean;
  sanitizedValue?: T;
  errors: string[];
  warnings: string[];
}

/**
 * Security check result
 */
export interface SecurityCheckResult {
  passed: boolean;
  violations: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
}

/**
 * Input validation rules
 */
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: unknown[];
  customValidator?: (value: unknown) => boolean;
}

/**
 * Input validator class
 */
export class InputValidator {
  private static readonly VALID_WEATHER_TYPES: WeatherType[] = [
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

  private static readonly MAX_WEATHER_TYPES = 5;
  private static readonly MAX_STRING_LENGTH = 1000;
  private static readonly MAX_ARRAY_LENGTH = 100;
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi,
  ];

  /**
   * Validate and sanitize weather types
   */
  static validateWeatherTypes(input: unknown): ValidationResult<WeatherType[]> {
    const result: ValidationResult<WeatherType[]> = {
      isValid: false,
      errors: [],
      warnings: [],
    };

    // Check if input is an array
    if (!Array.isArray(input)) {
      result.errors.push("Weather types must be an array");
      return result;
    }

    // Check array length
    if (input.length === 0) {
      result.errors.push("At least one weather type is required");
      return result;
    }

    if (input.length > InputValidator.MAX_WEATHER_TYPES) {
      result.warnings.push(
        `Too many weather types (${input.length}). Limiting to ${InputValidator.MAX_WEATHER_TYPES}`
      );
    }

    // Validate and sanitize each weather type
    const sanitizedWeather: WeatherType[] = [];
    const seenWeather = new Set<WeatherType>();

    for (
      let i = 0;
      i < Math.min(input.length, InputValidator.MAX_WEATHER_TYPES);
      i++
    ) {
      const weather = input[i];

      // Check if it's a string
      if (typeof weather !== "string") {
        result.errors.push(`Weather type at index ${i} must be a string`);
        continue;
      }

      // Check if it's a valid weather type
      if (
        !InputValidator.VALID_WEATHER_TYPES.includes(weather as WeatherType)
      ) {
        result.errors.push(`Invalid weather type: ${weather}`);
        continue;
      }

      // Check for duplicates
      if (seenWeather.has(weather as WeatherType)) {
        result.warnings.push(`Duplicate weather type removed: ${weather}`);
        continue;
      }

      seenWeather.add(weather as WeatherType);
      sanitizedWeather.push(weather as WeatherType);
    }

    if (sanitizedWeather.length === 0) {
      result.errors.push("No valid weather types found");
      return result;
    }

    result.isValid = result.errors.length === 0;
    result.sanitizedValue = sanitizedWeather;
    return result;
  }

  /**
   * Validate weather card
   */
  static validateWeatherCard(input: unknown): ValidationResult<WeatherCard> {
    const result: ValidationResult<WeatherCard> = {
      isValid: false,
      errors: [],
      warnings: [],
    };

    if (!input || typeof input !== "object") {
      result.errors.push("Weather card must be an object");
      return result;
    }

    // Validate required fields
    if (!input.id || typeof input.id !== "string") {
      result.errors.push("Card ID is required and must be a string");
    }

    if (!input.name || typeof input.name !== "string") {
      result.errors.push("Card name is required and must be a string");
    }

    if (
      !input.type ||
      !["Weather", "BreakWeather", "WeatherBuff", "WeatherNerf"].includes(
        input.type
      )
    ) {
      result.errors.push(
        "Card type must be one of: Weather, BreakWeather, WeatherBuff, WeatherNerf"
      );
    }

    // Validate optional fields
    if (
      input.weather &&
      !InputValidator.VALID_WEATHER_TYPES.includes(input.weather)
    ) {
      result.errors.push(`Invalid weather type in card: ${input.weather}`);
    }

    if (
      input.duration &&
      (typeof input.duration !== "number" || input.duration < 0)
    ) {
      result.errors.push("Card duration must be a non-negative number");
    }

    if (input.cost && (typeof input.cost !== "number" || input.cost < 0)) {
      result.errors.push("Card cost must be a non-negative number");
    }

    // Sanitize strings
    const sanitizedCard: WeatherCard = {
      id: InputValidator.sanitizeString(input.id),
      name: InputValidator.sanitizeString(input.name),
      type: input.type,
      description: input.description
        ? InputValidator.sanitizeString(input.description)
        : "",
      weather: input.weather,
      effect: input.effect,
      duration: input.duration,
      cost: input.cost,
    };

    result.isValid = result.errors.length === 0;
    result.sanitizedValue = sanitizedCard;
    return result;
  }

  /**
   * Validate game state
   */
  static validateGameState(
    input: unknown
  ): ValidationResult<Partial<GameState>> {
    const result: ValidationResult<Partial<GameState>> = {
      isValid: false,
      errors: [],
      warnings: [],
    };

    if (!input || typeof input !== "object") {
      result.errors.push("Game state must be an object");
      return result;
    }

    const sanitizedState: Partial<GameState> = {};

    // Validate turn number
    if (input.currentTurn !== undefined) {
      if (
        typeof input.currentTurn !== "number" ||
        input.currentTurn < 1 ||
        input.currentTurn > 12
      ) {
        result.errors.push("Current turn must be a number between 1 and 12");
      } else {
        sanitizedState.currentTurn = Math.floor(input.currentTurn);
      }
    }

    // Validate month
    if (input.currentMonth !== undefined) {
      if (
        typeof input.currentMonth !== "number" ||
        input.currentMonth < 1 ||
        input.currentMonth > 12
      ) {
        result.errors.push("Current month must be a number between 1 and 12");
      } else {
        sanitizedState.currentMonth = Math.floor(input.currentMonth);
      }
    }

    // Validate game mode
    if (input.gameMode !== undefined) {
      if (typeof input.gameMode !== "string") {
        result.errors.push("Game mode must be a string");
      } else {
        sanitizedState.gameMode = InputValidator.sanitizeString(input.gameMode);
      }
    }

    // Validate weather state
    if (input.weatherState !== undefined) {
      const weatherStateResult = InputValidator.validateWeatherState(
        input.weatherState
      );
      if (!weatherStateResult.isValid) {
        result.errors.push(...weatherStateResult.errors);
      } else {
        sanitizedState.weatherState = weatherStateResult.sanitizedValue;
      }
    }

    result.isValid = result.errors.length === 0;
    result.sanitizedValue = sanitizedState;
    return result;
  }

  /**
   * Validate weather state
   */
  static validateWeatherState(input: unknown): ValidationResult<WeatherState> {
    const result: ValidationResult<WeatherState> = {
      isValid: false,
      errors: [],
      warnings: [],
    };

    if (!input || typeof input !== "object") {
      result.errors.push("Weather state must be an object");
      return result;
    }

    // Validate current weather
    const weatherResult = InputValidator.validateWeatherTypes(
      input.currentWeather
    );
    if (!weatherResult.isValid) {
      result.errors.push(...weatherResult.errors);
      return result;
    }

    // Validate turn and month
    if (typeof input.turn !== "number" || input.turn < 1 || input.turn > 12) {
      result.errors.push("Turn must be a number between 1 and 12");
    }

    if (
      typeof input.month !== "number" ||
      input.month < 1 ||
      input.month > 12
    ) {
      result.errors.push("Month must be a number between 1 and 12");
    }

    // Validate season
    const validSeasons = ["Spring", "Summer", "Autumn", "Winter"];
    if (!validSeasons.includes(input.season)) {
      result.errors.push(
        "Season must be one of: Spring, Summer, Autumn, Winter"
      );
    }

    const sanitizedState: WeatherState = {
      currentWeather: weatherResult.sanitizedValue!,
      turn: Math.floor(input.turn),
      month: Math.floor(input.month),
      season: input.season,
      activeCards: Array.isArray(input.activeCards) ? input.activeCards : [],
      weatherHistory: Array.isArray(input.weatherHistory)
        ? input.weatherHistory
        : undefined,
      elementalModifiers: input.elementalModifiers || {
        Fire: 0,
        Ice: 0,
        Lightning: 0,
      },
    };

    result.isValid = result.errors.length === 0;
    result.sanitizedValue = sanitizedState;
    return result;
  }

  /**
   * Validate numeric input
   */
  static validateNumber(
    input: unknown,
    min?: number,
    max?: number
  ): ValidationResult<number> {
    const result: ValidationResult<number> = {
      isValid: false,
      errors: [],
      warnings: [],
    };

    if (typeof input !== "number" || isNaN(input) || !isFinite(input)) {
      result.errors.push("Value must be a valid number");
      return result;
    }

    if (min !== undefined && input < min) {
      result.errors.push(`Value must be at least ${min}`);
      return result;
    }

    if (max !== undefined && input > max) {
      result.errors.push(`Value must be at most ${max}`);
      return result;
    }

    result.isValid = true;
    result.sanitizedValue = input;
    return result;
  }

  /**
   * Validate string input
   */
  static validateString(
    input: unknown,
    rules: ValidationRules = {}
  ): ValidationResult<string> {
    const result: ValidationResult<string> = {
      isValid: false,
      errors: [],
      warnings: [],
    };

    if (rules.required && (input === undefined || input === null)) {
      result.errors.push("Value is required");
      return result;
    }

    if (input === undefined || input === null) {
      result.isValid = true;
      result.sanitizedValue = "";
      return result;
    }

    if (typeof input !== "string") {
      result.errors.push("Value must be a string");
      return result;
    }

    // Check length constraints
    if (rules.minLength && input.length < rules.minLength) {
      result.errors.push(
        `String must be at least ${rules.minLength} characters long`
      );
    }

    if (rules.maxLength && input.length > rules.maxLength) {
      result.errors.push(
        `String must be at most ${rules.maxLength} characters long`
      );
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(input)) {
      result.errors.push("String does not match required pattern");
    }

    // Check allowed values
    if (rules.allowedValues && !rules.allowedValues.includes(input)) {
      result.errors.push(
        `Value must be one of: ${rules.allowedValues.join(", ")}`
      );
    }

    // Custom validation
    if (rules.customValidator && !rules.customValidator(input)) {
      result.errors.push("String failed custom validation");
    }

    // Sanitize the string
    const sanitized = InputValidator.sanitizeString(input);

    result.isValid = result.errors.length === 0;
    result.sanitizedValue = sanitized;
    return result;
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    if (typeof input !== "string") {
      return "";
    }

    // Limit length
    let sanitized = input.slice(0, InputValidator.MAX_STRING_LENGTH);

    // Remove dangerous patterns
    for (const pattern of InputValidator.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, "");
    }

    // Encode HTML entities
    sanitized = sanitized
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");

    // Remove null bytes and control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");

    return sanitized.trim();
  }

  /**
   * Perform security checks on input
   */
  static performSecurityCheck(
    input: unknown,
    context: string
  ): SecurityCheckResult {
    const result: SecurityCheckResult = {
      passed: true,
      violations: [],
      riskLevel: "low",
    };

    // Recursively check array elements
    if (Array.isArray(input)) {
      for (let i = 0; i < input.length; i++) {
        const elementCheck = InputValidator.performSecurityCheck(
          input[i],
          `${context}[${i}]`
        );
        if (!elementCheck.passed) {
          result.passed = false;
          result.violations.push(...elementCheck.violations);
          result.riskLevel = InputValidator.escalateRiskLevel(
            result.riskLevel,
            elementCheck.riskLevel
          );
        }
      }
    }

    // Check for injection attempts
    if (typeof input === "string") {
      for (const pattern of InputValidator.DANGEROUS_PATTERNS) {
        if (pattern.test(input)) {
          result.violations.push(
            `Potential code injection detected in ${context}`
          );
          result.riskLevel = "critical";
          result.passed = false;
        }
      }

      // Check for SQL injection patterns
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/gi,
        /(UNION\s+SELECT)/gi,
        /(\bOR\s+1\s*=\s*1\b)/gi,
        /(\bAND\s+1\s*=\s*1\b)/gi,
      ];

      for (const pattern of sqlPatterns) {
        if (pattern.test(input)) {
          result.violations.push(
            `Potential SQL injection detected in ${context}`
          );
          result.riskLevel = "high";
          result.passed = false;
        }
      }
    }

    // Check for oversized inputs
    if (
      typeof input === "string" &&
      input.length > InputValidator.MAX_STRING_LENGTH
    ) {
      result.violations.push(
        `Input too large in ${context} (${input.length} > ${InputValidator.MAX_STRING_LENGTH})`
      );
      result.riskLevel =
        result.riskLevel === "critical" ? "critical" : "medium";
    }

    if (
      Array.isArray(input) &&
      input.length > InputValidator.MAX_ARRAY_LENGTH
    ) {
      result.violations.push(
        `Array too large in ${context} (${input.length} > ${InputValidator.MAX_ARRAY_LENGTH})`
      );
      result.riskLevel =
        result.riskLevel === "critical" ? "critical" : "medium";
    }

    // Check for prototype pollution
    if (typeof input === "object" && input !== null) {
      const dangerousKeys = ["__proto__", "prototype"];
      for (const key of dangerousKeys) {
        if (Object.prototype.hasOwnProperty.call(input, key)) {
          result.violations.push(
            `Potential prototype pollution detected in ${context}`
          );
          result.riskLevel = "critical";
          result.passed = false;
        }
      }

      // Check for constructor manipulation (but not normal constructor property)
      if (
        Object.prototype.hasOwnProperty.call(input, "constructor") &&
        input.constructor !== Object &&
        input.constructor !== Array &&
        input.constructor !== Function
      ) {
        result.violations.push(
          `Potential constructor manipulation detected in ${context}`
        );
        result.riskLevel = "high";
        result.passed = false;
      }
    }

    return result;
  }

  /**
   * Validate and sanitize any input with security checks
   */
  static validateAndSanitize<T = unknown>(
    input: unknown,
    validator: (input: unknown) => ValidationResult<T>,
    context: string
  ): ValidationResult<T> {
    // First perform security checks
    const securityCheck = InputValidator.performSecurityCheck(input, context);
    if (!securityCheck.passed) {
      throw new SecurityError(
        context,
        securityCheck.riskLevel,
        `Security violations: ${securityCheck.violations.join(", ")}`
      );
    }

    // Then perform validation
    const validationResult = validator(input);

    // Add security warnings if needed
    if (securityCheck.violations.length > 0) {
      validationResult.warnings = validationResult.warnings || [];
      validationResult.warnings.push(...securityCheck.violations);
    }

    return validationResult;
  }

  /**
   * Escalate risk level
   */
  private static escalateRiskLevel(
    current: "low" | "medium" | "high" | "critical",
    new_level: "low" | "medium" | "high" | "critical"
  ): "low" | "medium" | "high" | "critical" {
    const levels = { low: 0, medium: 1, high: 2, critical: 3 };
    const currentLevel = levels[current];
    const newLevel = levels[new_level];

    return newLevel > currentLevel ? new_level : current;
  }
}

/**
 * State integrity checker
 */
export class StateIntegrityChecker {
  /**
   * Check game state integrity
   */
  static checkGameStateIntegrity(state: GameState): SecurityCheckResult {
    const result: SecurityCheckResult = {
      passed: true,
      violations: [],
      riskLevel: "low",
    };

    // Check turn/month consistency
    if (state.currentTurn !== state.currentMonth) {
      result.violations.push("Turn and month are inconsistent");
      result.riskLevel = "medium";
    }

    // Check weather state consistency
    if (state.weatherState.turn !== state.currentTurn) {
      result.violations.push("Weather state turn does not match game turn");
      result.riskLevel = "medium";
    }

    if (state.weatherState.month !== state.currentMonth) {
      result.violations.push("Weather state month does not match game month");
      result.riskLevel = "medium";
    }

    // Check for impossible weather combinations
    const weatherTypes = state.weatherState.currentWeather;
    const opposites = [
      ["Hot", "Cold"],
      ["Sunny", "Stormy"],
      ["Rainy", "Sunny"],
    ];

    for (const [weather1, weather2] of opposites) {
      if (
        weatherTypes.includes(weather1 as WeatherType) &&
        weatherTypes.includes(weather2 as WeatherType)
      ) {
        result.violations.push(
          `Impossible weather combination: ${weather1} and ${weather2}`
        );
        result.riskLevel = "high";
        result.passed = false;
      }
    }

    // Check elemental modifiers are within bounds
    const modifiers = state.weatherState.elementalModifiers;
    for (const [element, value] of Object.entries(modifiers)) {
      if (typeof value !== "number" || value < -40 || value > 40) {
        result.violations.push(
          `Elemental modifier out of bounds: ${element} = ${value}`
        );
        result.riskLevel = "high";
        result.passed = false;
      }
    }

    return result;
  }

  /**
   * Check for state tampering
   */
  static checkForTampering(
    previousState: GameState,
    currentState: GameState,
    allowedChanges: string[]
  ): SecurityCheckResult {
    const result: SecurityCheckResult = {
      passed: true,
      violations: [],
      riskLevel: "low",
    };

    // Check if only allowed properties have changed
    const changes = StateIntegrityChecker.getStateChanges(
      previousState,
      currentState
    );

    for (const change of changes) {
      if (!allowedChanges.includes(change)) {
        result.violations.push(`Unauthorized state change: ${change}`);
        result.riskLevel = "critical";
        result.passed = false;
      }
    }

    // Check for impossible state transitions
    if (currentState.currentTurn < previousState.currentTurn) {
      result.violations.push("Turn cannot go backwards");
      result.riskLevel = "critical";
      result.passed = false;
    }

    if (currentState.currentTurn > previousState.currentTurn + 1) {
      result.violations.push("Turn cannot skip ahead");
      result.riskLevel = "high";
      result.passed = false;
    }

    return result;
  }

  /**
   * Get list of changed properties between two states
   */
  static getStateChanges(oldState: GameState, newState: GameState): string[] {
    const changes: string[] = [];

    // Simple property comparison
    const simpleProps = ["currentTurn", "currentMonth", "gameMode"];
    for (const prop of simpleProps) {
      if (
        oldState[prop as keyof GameState] !== newState[prop as keyof GameState]
      ) {
        changes.push(prop);
      }
    }

    // Weather state comparison
    if (
      JSON.stringify(oldState.weatherState) !==
      JSON.stringify(newState.weatherState)
    ) {
      changes.push("weatherState");
    }

    // Player states comparison
    if (
      JSON.stringify(oldState.playerStates) !==
      JSON.stringify(newState.playerStates)
    ) {
      changes.push("playerStates");
    }

    return changes;
  }
}

/**
 * Player action history entry
 */
interface PlayerActionHistory {
  turn: number;
  type: string;
  timestamp: number;
}

/**
 * Anti-cheat validator
 */
export class AntiCheatValidator {
  private static readonly MAX_ACTIONS_PER_TURN = 10;
  private static readonly MAX_WEATHER_CHANGES_PER_TURN = 3;

  /**
   * Validate player action
   */
  static validatePlayerAction(
    action: Record<string, unknown>,
    gameState: GameState,
    playerHistory: PlayerActionHistory[]
  ): SecurityCheckResult {
    const result: SecurityCheckResult = {
      passed: true,
      violations: [],
      riskLevel: "low",
    };

    // Check action rate limiting
    const currentTurnActions = playerHistory.filter(
      (h) => h.turn === gameState.currentTurn
    );

    if (currentTurnActions.length >= AntiCheatValidator.MAX_ACTIONS_PER_TURN) {
      result.violations.push("Too many actions per turn");
      result.riskLevel = "high";
      result.passed = false;
    }

    // Check weather change frequency
    const weatherChanges = currentTurnActions.filter(
      (h) => h.type === "weather_change"
    );

    if (
      weatherChanges.length >= AntiCheatValidator.MAX_WEATHER_CHANGES_PER_TURN
    ) {
      result.violations.push("Too many weather changes per turn");
      result.riskLevel = "medium";
    }

    // Validate action timing
    const lastAction = playerHistory[playerHistory.length - 1];
    if (lastAction && Date.now() - lastAction.timestamp < 100) {
      result.violations.push("Actions too frequent (possible automation)");
      result.riskLevel = "high";
      result.passed = false;
    }

    return result;
  }

  /**
   * Validate weather change
   */
  static validateWeatherChange(
    oldWeather: WeatherType[],
    newWeather: WeatherType[],
    _allowedMethods: string[]
  ): SecurityCheckResult {
    const result: SecurityCheckResult = {
      passed: true,
      violations: [],
      riskLevel: "low",
    };

    // Check if weather change is too drastic
    const addedWeather = newWeather.filter((w) => !oldWeather.includes(w));
    const removedWeather = oldWeather.filter((w) => !newWeather.includes(w));

    if (addedWeather.length > 2 || removedWeather.length > 2) {
      result.violations.push("Weather change too drastic");
      result.riskLevel = "medium";
    }

    // Check for impossible weather transitions
    const impossibleTransitions = [
      { from: "Sunny", to: "Stormy" },
      { from: "Hot", to: "Cold" },
      { from: "Rainy", to: "Sunny" },
    ];

    for (const transition of impossibleTransitions) {
      if (
        oldWeather.includes(transition.from as WeatherType) &&
        newWeather.includes(transition.to as WeatherType)
      ) {
        result.violations.push(
          `Impossible weather transition: ${transition.from} to ${transition.to}`
        );
        result.riskLevel = "high";
        result.passed = false;
      }
    }

    return result;
  }
}
