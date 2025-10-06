/**
 * Tests for error handling and recovery system
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  WeatherEngineError,
  WeatherValidationError,
  CardPlayError,
  ConfigurationError,
  GameStateError,
  SeasonError,
  WeatherCalculationError,
  SecurityError,
  InputValidationError,
  StateCorruptionError,
  ErrorSeverity,
  RecoveryStrategy,
} from "../types/errors";
import {
  ErrorRecoveryManager,
  createSafeFallbackWeatherState,
  sanitizeWeatherTypes,
} from "../utils/error-recovery";
import {
  WeatherLogger,
  LogLevel,
  WeatherDebugger,
} from "../utils/error-logger";
import { WeatherType } from "../types/weather";

describe("Error Types", () => {
  describe("WeatherEngineError", () => {
    class TestError extends WeatherEngineError {
      constructor(message: string) {
        super(
          message,
          "TEST_ERROR",
          ErrorSeverity.MEDIUM,
          RecoveryStrategy.RETRY
        );
      }
    }

    it("should create error with proper properties", () => {
      const error = new TestError("Test error message");

      expect(error.message).toBe("Test error message");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.recoveryStrategy).toBe(RecoveryStrategy.RETRY);
      expect(error.recoveryAttempts).toBe(0);
      expect(error.maxRecoveryAttempts).toBe(3);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it("should track recovery attempts", () => {
      const error = new TestError("Test error");

      expect(error.canRecover()).toBe(true);

      error.incrementRecoveryAttempts();
      expect(error.recoveryAttempts).toBe(1);

      error.incrementRecoveryAttempts();
      error.incrementRecoveryAttempts();
      error.incrementRecoveryAttempts();

      expect(error.canRecover()).toBe(false);
    });

    it("should provide error details", () => {
      const error = new TestError("Test error");
      const details = error.getErrorDetails();

      expect(details).toHaveProperty("name");
      expect(details).toHaveProperty("message");
      expect(details).toHaveProperty("code");
      expect(details).toHaveProperty("severity");
      expect(details).toHaveProperty("recoveryStrategy");
      expect(details).toHaveProperty("timestamp");
      expect(details).toHaveProperty("context");
    });
  });

  describe("Specific Error Types", () => {
    it("should create WeatherValidationError correctly", () => {
      const invalidWeather: WeatherType[] = ["Hot", "Cold"];
      const error = new WeatherValidationError(
        invalidWeather,
        "Opposite weather types"
      );

      expect(error.invalidWeather).toEqual(invalidWeather);
      expect(error.reason).toBe("Opposite weather types");
      expect(error.code).toBe("WEATHER_VALIDATION_ERROR");
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it("should create CardPlayError correctly", () => {
      const card = { id: "1", name: "Test Card", type: "Weather" as const };
      const error = new CardPlayError(card, "Invalid card play");

      expect(error.card).toEqual(card);
      expect(error.reason).toBe("Invalid card play");
      expect(error.code).toBe("CARD_PLAY_ERROR");
    });

    it("should create SecurityError with critical severity", () => {
      const error = new SecurityError(
        "input_validation",
        "injection_attempt",
        "SQL injection detected"
      );

      expect(error.severity).toBe(ErrorSeverity.CRITICAL);
      expect(error.recoveryStrategy).toBe(RecoveryStrategy.MANUAL);
      expect(error.securityCheck).toBe("input_validation");
    });

    it("should create StateCorruptionError with reset strategy", () => {
      const error = new StateCorruptionError(
        "gameState",
        { turn: 1 },
        { turn: -1 }
      );

      expect(error.severity).toBe(ErrorSeverity.CRITICAL);
      expect(error.recoveryStrategy).toBe(RecoveryStrategy.RESET);
      expect(error.corruptedState).toBe("gameState");
    });
  });
});

describe("Error Recovery Manager", () => {
  let logger: WeatherLogger;
  let recoveryManager: ErrorRecoveryManager;
  let fallbackStates: any;

  beforeEach(() => {
    logger = new WeatherLogger({ enableConsoleOutput: false });
    fallbackStates = {
      defaultWeather: ["Sunny"],
      defaultGameState: { currentTurn: 1 },
      defaultWeatherState: createSafeFallbackWeatherState(),
    };
    recoveryManager = new ErrorRecoveryManager(logger, fallbackStates);
  });

  describe("Recovery Strategies", () => {
    it("should handle retry strategy for calculation errors", async () => {
      const error = new WeatherCalculationError(
        "elemental_damage",
        {},
        "Division by zero"
      );
      const result = await recoveryManager.recoverFromError(error);

      expect(result.success).toBe(true);
      expect(result.recoveredState).toEqual({ Fire: 0, Ice: 0, Lightning: 0 });
      expect(result.message).toContain("Successfully retried calculation");
    });

    it("should handle fallback strategy for validation errors", async () => {
      const error = new WeatherValidationError(
        ["Hot", "Cold"],
        "Opposite weather types"
      );
      const result = await recoveryManager.recoverFromError(error);

      expect(result.success).toBe(true);
      expect(result.recoveredState).toEqual(["Sunny"]);
      expect(result.fallbackUsed).toBe(true);
    });

    it("should handle reset strategy for state errors", async () => {
      const error = new GameStateError("currentTurn", "Invalid turn number");
      const result = await recoveryManager.recoverFromError(error);

      expect(result.success).toBe(true);
      expect(result.recoveredState).toHaveProperty("currentTurn", 1);
      expect(result.message).toContain("Reset to clean game state");
    });

    it("should handle ignore strategy for card errors", async () => {
      const card = { id: "1", name: "Test Card", type: "Weather" as const };
      const error = new CardPlayError(card, "Card not in hand");
      const result = await recoveryManager.recoverFromError(error);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Error ignored");
    });
  });

  describe("Recovery Limits", () => {
    it("should respect max recovery attempts", async () => {
      const error = new WeatherCalculationError("test", {}, "Test error");
      error.maxRecoveryAttempts = 1;

      // First recovery should succeed
      const result1 = await recoveryManager.recoverFromError(error);
      expect(result1.success).toBe(true);

      // Second recovery should fail due to max attempts
      const result2 = await recoveryManager.recoverFromError(error);
      expect(result2.success).toBe(false);
      expect(result2.message).toContain("Max recovery attempts exceeded");
    });

    it("should track recovery history", async () => {
      const error1 = new WeatherValidationError(["Hot"], "Test error 1");
      const error2 = new WeatherValidationError(["Cold"], "Test error 2");

      await recoveryManager.recoverFromError(error1);
      await recoveryManager.recoverFromError(error2);

      const stats = recoveryManager.getRecoveryStatistics();
      expect(stats["WEATHER_VALIDATION_ERROR_medium"]).toBe(2);
    });

    it("should check recovery limits", () => {
      const hasExceeded = recoveryManager.hasExceededRecoveryLimits(
        "TEST_ERROR",
        5
      );
      expect(hasExceeded).toBe(false);
    });
  });
});

describe("Weather Logger", () => {
  let logger: WeatherLogger;

  beforeEach(() => {
    logger = new WeatherLogger({
      enableConsoleOutput: false,
      minLevel: LogLevel.DEBUG,
    });
  });

  describe("Basic Logging", () => {
    it("should log messages at different levels", () => {
      logger.logDebug("Debug message");
      logger.logInfo("Info message");
      logger.logWarning("Warning message");

      const logs = logger.getLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
      expect(logs[1].level).toBe(LogLevel.INFO);
      expect(logs[2].level).toBe(LogLevel.WARNING);
    });

    it("should log errors with proper details", () => {
      const error = new WeatherValidationError(["Hot", "Cold"], "Test error");
      logger.logError(error);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].error).toBe(error);
    });

    it("should respect minimum log level", () => {
      logger.setLogLevel(LogLevel.WARNING);

      logger.logDebug("Debug message");
      logger.logInfo("Info message");
      logger.logWarning("Warning message");

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.WARNING);
    });
  });

  describe("Performance Logging", () => {
    it("should track performance metrics", () => {
      logger.logPerformance("weather_calculation", 150);
      logger.logPerformance("weather_calculation", 200);
      logger.logPerformance("card_validation", 50);

      const stats = logger.getPerformanceStatistics();
      expect(stats.weather_calculation.count).toBe(2);
      expect(stats.weather_calculation.average).toBe(175);
      expect(stats.weather_calculation.min).toBe(150);
      expect(stats.weather_calculation.max).toBe(200);
      expect(stats.card_validation.count).toBe(1);
    });
  });

  describe("Error Statistics", () => {
    it("should track error counts", () => {
      const error1 = new WeatherValidationError(["Hot"], "Error 1");
      const error2 = new WeatherValidationError(["Cold"], "Error 2");
      const error3 = new CardPlayError(
        { id: "1", name: "Card", type: "Weather" },
        "Error 3"
      );

      logger.logError(error1);
      logger.logError(error2);
      logger.logError(error3);

      const stats = logger.getErrorStatistics();
      expect(stats.WEATHER_VALIDATION_ERROR).toBe(2);
      expect(stats.CARD_PLAY_ERROR).toBe(1);
    });

    it("should get recent errors", () => {
      const error1 = new WeatherValidationError(["Hot"], "Error 1");
      const error2 = new CardPlayError(
        { id: "1", name: "Card", type: "Weather" },
        "Error 2"
      );

      logger.logInfo("Info message");
      logger.logError(error1);
      logger.logError(error2);

      const recentErrors = logger.getRecentErrors(5);
      expect(recentErrors).toHaveLength(2);
      expect(recentErrors[0].error).toBe(error1);
      expect(recentErrors[1].error).toBe(error2);
    });

    it("should detect critical errors", () => {
      expect(logger.hasCriticalErrors()).toBe(false);

      const criticalError = new SecurityError(
        "test",
        "test",
        "Critical security issue"
      );
      logger.logError(criticalError);

      expect(logger.hasCriticalErrors()).toBe(true);
    });
  });

  describe("Log Management", () => {
    it("should maintain max entries limit", () => {
      const smallLogger = new WeatherLogger({
        maxEntries: 3,
        enableConsoleOutput: false,
      });

      smallLogger.logInfo("Message 1");
      smallLogger.logInfo("Message 2");
      smallLogger.logInfo("Message 3");
      smallLogger.logInfo("Message 4");

      const logs = smallLogger.getLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe("Message 2");
      expect(logs[2].message).toBe("Message 4");
    });

    it("should filter logs by level", () => {
      logger.logDebug("Debug");
      logger.logInfo("Info");
      logger.logWarning("Warning");
      logger.logError(new Error("Error"));

      const errorLogs = logger.getLogs(LogLevel.ERROR);
      expect(errorLogs).toHaveLength(1);

      const warningLogs = logger.getLogs(LogLevel.WARNING);
      expect(warningLogs).toHaveLength(2);
    });

    it("should filter logs by time range", () => {
      const startTime = new Date();
      logger.logInfo("Message 1");

      // Wait a bit to ensure different timestamps
      const middleTime = new Date(Date.now() + 10);
      logger.logInfo("Message 2");

      const endTime = new Date(Date.now() + 20);
      logger.logInfo("Message 3");

      const logsInRange = logger.getLogsInRange(startTime, endTime);
      expect(logsInRange.length).toBeGreaterThanOrEqual(2);
    });

    it("should export logs as JSON", () => {
      logger.logInfo("Test message");
      const exported = logger.exportLogs();
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty("logs");
      expect(parsed).toHaveProperty("errorStatistics");
      expect(parsed).toHaveProperty("performanceStatistics");
      expect(parsed).toHaveProperty("exportTimestamp");
    });

    it("should clear logs", () => {
      const freshLogger = new WeatherLogger({
        enableConsoleOutput: false,
        minLevel: LogLevel.DEBUG,
      });

      freshLogger.logInfo("Message");
      freshLogger.logPerformance("test", 100);
      freshLogger.logError(new Error("Test error"));

      expect(freshLogger.getLogs()).toHaveLength(3); // Info + Debug (from performance) + Error

      freshLogger.clearLogs();

      expect(freshLogger.getLogs()).toHaveLength(0);
      expect(freshLogger.getErrorStatistics()).toEqual({});
      expect(freshLogger.getPerformanceStatistics()).toEqual({});
    });
  });
});

describe("Weather Debugger", () => {
  let logger: WeatherLogger;
  let weatherDebugger: WeatherDebugger;

  beforeEach(() => {
    logger = new WeatherLogger({
      enableConsoleOutput: false,
      minLevel: LogLevel.DEBUG,
    });
    weatherDebugger = new WeatherDebugger(logger);
  });

  describe("Breakpoints", () => {
    it("should manage breakpoints", () => {
      expect(weatherDebugger.isBreakpointActive("test")).toBe(false);

      weatherDebugger.addBreakpoint("test");
      expect(weatherDebugger.isBreakpointActive("test")).toBe(true);

      weatherDebugger.removeBreakpoint("test");
      expect(weatherDebugger.isBreakpointActive("test")).toBe(false);
    });
  });

  describe("Variable Watching", () => {
    it("should watch variable changes", () => {
      weatherDebugger.watchVariable("testVar", "initial");
      weatherDebugger.watchVariable("testVar", "changed");

      const watched = weatherDebugger.getWatchedVariables();
      expect(watched.testVar).toBe("changed");

      const logs = logger.getLogs();
      const changeLog = logs.find((log) =>
        log.message.includes("Variable changed")
      );
      expect(changeLog).toBeDefined();
    });
  });

  describe("State Dumping and Tracing", () => {
    it("should dump state for debugging", () => {
      const state = { weather: "Sunny", turn: 1 };
      weatherDebugger.dumpState("gameState", state);

      const logs = logger.getLogs();
      const dumpLog = logs.find((log) => log.message.includes("State dump"));
      expect(dumpLog).toBeDefined();
      expect(dumpLog?.context?.state).toEqual(state);
    });

    it("should trace function execution", () => {
      weatherDebugger.trace("calculateWeather", ["Sunny", "Hot"], { Fire: 10 });

      const logs = logger.getLogs();
      const traceLog = logs.find((log) =>
        log.message.includes("Function trace")
      );
      expect(traceLog).toBeDefined();
    });

    it("should assert conditions", () => {
      weatherDebugger.assert(true, "This should not log");
      weatherDebugger.assert(false, "This should log an error");

      const logs = logger.getLogs();
      const errorLogs = logs.filter((log) => log.level === LogLevel.ERROR);
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].message).toContain("Assertion failed");
    });
  });

  describe("Cleanup", () => {
    it("should clear debug data", () => {
      weatherDebugger.addBreakpoint("test");
      weatherDebugger.watchVariable("var", "value");

      weatherDebugger.clear();

      expect(weatherDebugger.isBreakpointActive("test")).toBe(false);
      expect(weatherDebugger.getWatchedVariables()).toEqual({});
    });
  });
});

describe("Utility Functions", () => {
  describe("createSafeFallbackWeatherState", () => {
    it("should create safe weather state", () => {
      const state = createSafeFallbackWeatherState();

      expect(state.currentWeather).toEqual(["Sunny"]);
      expect(state.turn).toBe(1);
      expect(state.month).toBe(1);
      expect(state.season).toBe("Spring");
      expect(state.activeCards).toEqual([]);
      expect(state.elementalModifiers).toEqual({
        Fire: 0,
        Ice: 0,
        Lightning: 0,
      });
    });
  });

  describe("sanitizeWeatherTypes", () => {
    it("should filter valid weather types", () => {
      const input = ["Sunny", "InvalidWeather", "Rainy", 123, null, "Hot"];
      const result = sanitizeWeatherTypes(input);

      expect(result).toEqual(["Sunny", "Rainy", "Hot"]);
    });

    it("should limit to maximum 5 weather types", () => {
      const input = [
        "Sunny",
        "Rainy",
        "Hot",
        "Cold",
        "Windy",
        "Stormy",
        "Foggy",
      ];
      const result = sanitizeWeatherTypes(input);

      expect(result).toHaveLength(5);
      expect(result).toEqual(["Sunny", "Rainy", "Hot", "Cold", "Windy"]);
    });

    it("should handle empty input", () => {
      const result = sanitizeWeatherTypes([]);
      expect(result).toEqual([]);
    });
  });
});

describe("Error Recovery Scenarios", () => {
  let logger: WeatherLogger;
  let recoveryManager: ErrorRecoveryManager;

  beforeEach(() => {
    logger = new WeatherLogger({ enableConsoleOutput: false });
    const fallbackStates = {
      defaultWeather: ["Sunny"],
      defaultGameState: { currentTurn: 1 },
      defaultWeatherState: createSafeFallbackWeatherState(),
    };
    recoveryManager = new ErrorRecoveryManager(logger, fallbackStates);
  });

  it("should handle cascading errors", async () => {
    const error1 = new WeatherValidationError(
      ["Hot", "Cold"],
      "Opposite weather"
    );
    const error2 = new GameStateError(
      "turn",
      "Invalid turn after weather error"
    );

    const result1 = await recoveryManager.recoverFromError(error1);
    const result2 = await recoveryManager.recoverFromError(error2);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    const stats = recoveryManager.getRecoveryStatistics();
    expect(Object.keys(stats)).toHaveLength(2);
  });

  it("should handle unknown error types gracefully", async () => {
    class UnknownError extends WeatherEngineError {
      constructor() {
        super(
          "Unknown error",
          "UNKNOWN_ERROR",
          ErrorSeverity.LOW,
          RecoveryStrategy.MANUAL
        );
      }
    }

    const error = new UnknownError();
    const result = await recoveryManager.recoverFromError(error);

    expect(result.success).toBe(false);
    expect(result.message).toContain("manual intervention required");
  });
});
