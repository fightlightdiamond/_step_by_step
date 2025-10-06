/**
 * Security manager for the weather engine
 * Coordinates all security measures and validation
 */

import { WeatherLogger } from "../utils/error-logger";
import { ErrorRecoveryManager } from "../utils/error-recovery";
import {
  InputValidator,
  StateIntegrityChecker,
  AntiCheatValidator,
  ValidationResult,
} from "../validation/input-validator";
import {
  SecurityError,
  InputValidationError,
  StateCorruptionError,
} from "../types/errors";
import { WeatherType, WeatherCard, GameState } from "../types/weather";

/**
 * Security configuration
 */
export interface SecurityConfig {
  enableInputValidation: boolean;
  enableStateIntegrityChecks: boolean;
  enableAntiCheat: boolean;
  enableSecurityLogging: boolean;
  strictMode: boolean;
  maxValidationErrors: number;
  securityLogLevel: "low" | "medium" | "high" | "critical";
}

/**
 * Security audit result
 */
export interface SecurityAuditResult {
  passed: boolean;
  violations: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendations: string[];
  timestamp: Date;
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
 * Security manager class
 */
export class SecurityManager {
  private logger: WeatherLogger;
  private recoveryManager: ErrorRecoveryManager;
  private config: SecurityConfig;
  private validationErrorCount: number = 0;
  private securityViolations: Map<string, number> = new Map();
  private lastAudit: SecurityAuditResult | null = null;

  constructor(
    logger: WeatherLogger,
    recoveryManager: ErrorRecoveryManager,
    config: Partial<SecurityConfig> = {}
  ) {
    this.logger = logger;
    this.recoveryManager = recoveryManager;
    this.config = {
      enableInputValidation: true,
      enableStateIntegrityChecks: true,
      enableAntiCheat: true,
      enableSecurityLogging: true,
      strictMode: false,
      maxValidationErrors: 10,
      securityLogLevel: "medium",
      ...config,
    };
  }

  /**
   * Validate weather types with security checks
   */
  async validateWeatherTypes(
    input: unknown,
    context: string = "weather_types"
  ): Promise<WeatherType[]> {
    if (!this.config.enableInputValidation) {
      return input;
    }

    try {
      // First perform security checks
      const securityCheck = InputValidator.performSecurityCheck(input, context);
      if (!securityCheck.passed) {
        const error = new SecurityError(
          context,
          securityCheck.riskLevel,
          `Security violations: ${securityCheck.violations.join(", ")}`
        );
        this.handleSecurityError(error, context);

        if (this.config.strictMode) {
          throw error;
        }

        // In non-strict mode, return empty array as fallback
        return [];
      }

      // Then perform validation
      const result = InputValidator.validateWeatherTypes(input);

      if (!result.isValid) {
        this.handleValidationError(result, context);
      }

      // Add security warnings if needed
      if (securityCheck.violations.length > 0) {
        result.warnings = result.warnings || [];
        result.warnings.push(...securityCheck.violations);
      }

      this.logSecurityEvent("input_validation", "success", context);
      return result.sanitizedValue || [];
    } catch (error) {
      this.handleSecurityError(error as SecurityError, context);

      if (this.config.strictMode) {
        throw error;
      }

      // In non-strict mode, return empty array as fallback
      return [];
    }
  }

  /**
   * Validate weather card with security checks
   */
  async validateWeatherCard(
    input: unknown,
    context: string = "weather_card"
  ): Promise<WeatherCard> {
    if (!this.config.enableInputValidation) {
      return input;
    }

    try {
      // First perform security checks
      const securityCheck = InputValidator.performSecurityCheck(input, context);
      if (!securityCheck.passed) {
        const error = new SecurityError(
          context,
          securityCheck.riskLevel,
          `Security violations: ${securityCheck.violations.join(", ")}`
        );
        this.handleSecurityError(error, context);

        if (this.config.strictMode) {
          throw error;
        }

        // In non-strict mode, return a safe fallback card
        return {
          id: "safe-fallback",
          name: "Safe Card",
          type: "Weather",
        } as WeatherCard;
      }

      // Then perform validation
      const result = InputValidator.validateWeatherCard(input);

      if (!result.isValid) {
        this.handleValidationError(result, context);
      }

      // Add security warnings if needed
      if (securityCheck.violations.length > 0) {
        result.warnings = result.warnings || [];
        result.warnings.push(...securityCheck.violations);
      }

      this.logSecurityEvent("card_validation", "success", context);
      return result.sanitizedValue!;
    } catch (error) {
      this.handleSecurityError(error as SecurityError, context);

      if (this.config.strictMode) {
        throw error;
      }

      // In non-strict mode, return a safe fallback card
      return {
        id: "safe-fallback",
        name: "Safe Card",
        type: "Weather",
      } as WeatherCard;
    }
  }

  /**
   * Validate game state with security checks
   */
  async validateGameState(
    input: unknown,
    context: string = "game_state"
  ): Promise<Partial<GameState>> {
    if (!this.config.enableInputValidation) {
      return input;
    }

    try {
      // First perform security checks
      const securityCheck = InputValidator.performSecurityCheck(input, context);
      if (!securityCheck.passed) {
        const error = new SecurityError(
          context,
          securityCheck.riskLevel,
          `Security violations: ${securityCheck.violations.join(", ")}`
        );
        this.handleSecurityError(error, context);

        if (this.config.strictMode) {
          throw error;
        }

        // In non-strict mode, return empty state as fallback
        return {};
      }

      // Then perform validation
      const result = InputValidator.validateGameState(input);

      if (!result.isValid) {
        this.handleValidationError(result, context);
      }

      // Add security warnings if needed
      if (securityCheck.violations.length > 0) {
        result.warnings = result.warnings || [];
        result.warnings.push(...securityCheck.violations);
      }

      this.logSecurityEvent("state_validation", "success", context);
      return result.sanitizedValue || {};
    } catch (error) {
      this.handleSecurityError(error as SecurityError, context);

      if (this.config.strictMode) {
        throw error;
      }

      // In non-strict mode, return empty state as fallback
      return {};
    }
  }

  /**
   * Check state integrity
   */
  async checkStateIntegrity(
    state: GameState,
    context: string = "state_integrity"
  ): Promise<void> {
    if (!this.config.enableStateIntegrityChecks) {
      return;
    }

    const result = StateIntegrityChecker.checkGameStateIntegrity(state);

    if (!result.passed) {
      const error = new StateCorruptionError(
        context,
        "Expected valid state",
        state,
        { systemState: { violations: result.violations } }
      );

      this.handleSecurityError(error, context);

      if (this.config.strictMode) {
        throw error;
      }
    }

    if (result.violations.length > 0) {
      this.logSecurityEvent("integrity_check", "warning", context, {
        violations: result.violations,
        riskLevel: result.riskLevel,
      });
    }
  }

  /**
   * Check for state tampering
   */
  async checkForTampering(
    oldState: GameState,
    newState: GameState,
    allowedChanges: string[],
    context: string = "tampering_check"
  ): Promise<void> {
    if (!this.config.enableStateIntegrityChecks) {
      return;
    }

    const result = StateIntegrityChecker.checkForTampering(
      oldState,
      newState,
      allowedChanges
    );

    if (!result.passed) {
      const error = new SecurityError(
        context,
        "state_tampering",
        `State tampering detected: ${result.violations.join(", ")}`,
        { systemState: { oldState, newState, allowedChanges } }
      );

      this.handleSecurityError(error, context);

      if (this.config.strictMode) {
        throw error;
      }
    }
  }

  /**
   * Validate player action
   */
  async validatePlayerAction(
    action: Record<string, unknown>,
    gameState: GameState,
    playerHistory: PlayerActionHistory[],
    context: string = "player_action"
  ): Promise<void> {
    if (!this.config.enableAntiCheat) {
      return;
    }

    const result = AntiCheatValidator.validatePlayerAction(
      action,
      gameState,
      playerHistory
    );

    if (!result.passed) {
      const error = new SecurityError(
        context,
        "anti_cheat",
        `Anti-cheat violation: ${result.violations.join(", ")}`,
        { playerAction: JSON.stringify(action), systemState: { gameState } }
      );

      this.handleSecurityError(error, context);

      if (this.config.strictMode) {
        throw error;
      }
    }

    if (result.violations.length > 0) {
      this.logSecurityEvent("anti_cheat", "warning", context, {
        violations: result.violations,
        riskLevel: result.riskLevel,
      });
    }
  }

  /**
   * Validate weather change
   */
  async validateWeatherChange(
    oldWeather: WeatherType[],
    newWeather: WeatherType[],
    allowedMethods: string[],
    context: string = "weather_change"
  ): Promise<void> {
    if (!this.config.enableAntiCheat) {
      return;
    }

    const result = AntiCheatValidator.validateWeatherChange(
      oldWeather,
      newWeather,
      allowedMethods
    );

    if (!result.passed) {
      const error = new SecurityError(
        context,
        "weather_manipulation",
        `Invalid weather change: ${result.violations.join(", ")}`,
        { systemState: { oldWeather, newWeather, allowedMethods } }
      );

      this.handleSecurityError(error, context);

      if (this.config.strictMode) {
        throw error;
      }
    }
  }

  /**
   * Perform comprehensive security audit
   */
  async performSecurityAudit(
    gameState: GameState
  ): Promise<SecurityAuditResult> {
    const result: SecurityAuditResult = {
      passed: true,
      violations: [],
      riskLevel: "low",
      recommendations: [],
      timestamp: new Date(),
    };

    // Check state integrity
    if (this.config.enableStateIntegrityChecks) {
      const integrityResult =
        StateIntegrityChecker.checkGameStateIntegrity(gameState);
      if (!integrityResult.passed) {
        result.passed = false;
        result.violations.push(...integrityResult.violations);
        result.riskLevel = this.escalateRiskLevel(
          result.riskLevel,
          integrityResult.riskLevel
        );
      }
    }

    // Check validation error rate
    if (this.validationErrorCount > this.config.maxValidationErrors) {
      result.violations.push(
        `High validation error rate: ${this.validationErrorCount}`
      );
      result.riskLevel = this.escalateRiskLevel(result.riskLevel, "medium");
      result.recommendations.push("Review input validation processes");
    }

    // Check security violation patterns
    for (const [violation, count] of this.securityViolations) {
      if (count > 5) {
        result.violations.push(
          `Repeated security violation: ${violation} (${count} times)`
        );
        result.riskLevel = this.escalateRiskLevel(result.riskLevel, "high");
        result.recommendations.push(`Investigate ${violation} violations`);
      }
    }

    // Add general recommendations
    if (!this.config.strictMode) {
      result.recommendations.push(
        "Consider enabling strict mode for enhanced security"
      );
    }

    if (!this.config.enableSecurityLogging) {
      result.recommendations.push(
        "Enable security logging for better monitoring"
      );
    }

    this.lastAudit = result;
    this.logSecurityEvent(
      "security_audit",
      result.passed ? "success" : "failure",
      "audit",
      {
        violations: result.violations,
        riskLevel: result.riskLevel,
        recommendations: result.recommendations,
      }
    );

    return result;
  }

  /**
   * Get security statistics
   */
  getSecurityStatistics(): Record<string, unknown> {
    return {
      validationErrorCount: this.validationErrorCount,
      securityViolations: Object.fromEntries(this.securityViolations),
      lastAudit: this.lastAudit,
      config: this.config,
      errorFrequency: this.logger.getErrorFrequency(),
      criticalErrors: this.logger.hasCriticalErrors(),
    };
  }

  /**
   * Reset security counters
   */
  resetSecurityCounters(): void {
    this.validationErrorCount = 0;
    this.securityViolations.clear();
    this.lastAudit = null;
  }

  /**
   * Update security configuration
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logSecurityEvent("config_update", "success", "security_manager", {
      newConfig,
    });
  }

  /**
   * Handle validation errors
   */
  private handleValidationError(
    result: ValidationResult,
    context: string
  ): void {
    this.validationErrorCount++;

    const error = new InputValidationError(
      context,
      result,
      `Validation failed: ${result.errors.join(", ")}`
    );

    // Check if validation errors contain potentially malicious content
    const errorText = result.errors.join(" ").toLowerCase();
    if (
      errorText.includes("script") ||
      errorText.includes("injection") ||
      errorText.includes("xss")
    ) {
      const violationType = "malicious_input_validation";
      const currentCount = this.securityViolations.get(violationType) || 0;
      this.securityViolations.set(violationType, currentCount + 1);
    }

    this.logSecurityEvent("validation_error", "error", context, {
      errors: result.errors,
      warnings: result.warnings,
    });

    if (this.config.strictMode) {
      throw error;
    }
  }

  /**
   * Handle security errors
   */
  private handleSecurityError(error: SecurityError, context: string): void {
    // Count as validation error if it's input-related
    if (
      context.includes("validation") ||
      context.includes("input") ||
      context.includes("weather_types") ||
      context.includes("weather_card") ||
      context.includes("game_state")
    ) {
      this.validationErrorCount++;
    }

    const violationType = error.violationType || "unknown";
    const currentCount = this.securityViolations.get(violationType) || 0;
    this.securityViolations.set(violationType, currentCount + 1);

    this.logSecurityEvent("security_error", "error", context, {
      errorCode: error.code,
      violationType,
      severity: error.severity,
    });

    // Attempt recovery if possible
    if (typeof error.canRecover === "function" && error.canRecover()) {
      this.recoveryManager.recoverFromError(error).catch((recoveryError) => {
        this.logger.logError(recoveryError);
      });
    }
  }

  /**
   * Log security events
   */
  private logSecurityEvent(
    eventType: string,
    status: "success" | "warning" | "error" | "failure",
    context: string,
    details?: Record<string, unknown>
  ): void {
    if (!this.config.enableSecurityLogging) {
      return;
    }

    const message = `Security event: ${eventType} - ${status} in ${context}`;
    const logContext = {
      eventType,
      status,
      context,
      ...details,
    };

    switch (status) {
      case "success":
        this.logger.logDebug(message, logContext);
        break;
      case "warning":
        this.logger.logWarning(message, logContext);
        break;
      case "error":
      case "failure":
        this.logger.logError(new Error(message), logContext);
        break;
    }
  }

  /**
   * Escalate risk level
   */
  private escalateRiskLevel(
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
 * Global security manager instance
 */
let globalSecurityManager: SecurityManager | null = null;

/**
 * Get or create global security manager
 */
export function getGlobalSecurityManager(
  logger?: WeatherLogger,
  recoveryManager?: ErrorRecoveryManager,
  config?: Partial<SecurityConfig>
): SecurityManager {
  if (!globalSecurityManager && logger && recoveryManager) {
    globalSecurityManager = new SecurityManager(
      logger,
      recoveryManager,
      config
    );
  }

  if (!globalSecurityManager) {
    throw new Error(
      "Security manager not initialized. Provide logger and recovery manager."
    );
  }

  return globalSecurityManager;
}

/**
 * Set global security manager
 */
export function setGlobalSecurityManager(manager: SecurityManager): void {
  globalSecurityManager = manager;
}
