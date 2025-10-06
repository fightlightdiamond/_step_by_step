/**
 * WeatherManager integration test with validation (Node.js compatible)
 */

const fs = require("fs");
const path = require("path");

// Enhanced mock WeatherManager with validation integration
class TestWeatherManagerWithValidation {
  constructor(config, initialState, options = {}) {
    this.config = config;
    this.weatherState = {
      currentWeather: [],
      turn: 1,
      month: 1,
      season: "Winter",
      activeCards: [],
      ...initialState,
    };
    this.stateHistory = [];
    this.eventListeners = new Map();
    this.debugMode = options.debugMode || false;
    this.logLevel = options.logLevel || "warn";
    this.validationStats = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      warningValidations: 0,
    };
    this.MONTH_TO_SEASON = {
      1: "Winter",
      2: "Winter",
      3: "Spring",
      4: "Spring",
      5: "Spring",
      6: "Summer",
      7: "Summer",
      8: "Summer",
      9: "Autumn",
      10: "Autumn",
      11: "Autumn",
      12: "Winter",
    };

    this.log("info", "WeatherManager initialized", {
      initialState: this.weatherState,
      debugMode: this.debugMode,
      logLevel: this.logLevel,
    });
  }

  // Logging functionality
  log(level, message, data) {
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

    if (this.debugMode && level === "debug") {
      console.debug(`[DEBUG] WeatherManager: ${message}`, data);
    }
  }

  setDebugMode(enabled) {
    this.debugMode = enabled;
    this.log("info", `Debug mode ${enabled ? "enabled" : "disabled"}`);
  }

  setLogLevel(level) {
    const oldLevel = this.logLevel;
    this.logLevel = level;
    this.log("info", `Log level changed from ${oldLevel} to ${level}`);
  }

  isDebugMode() {
    return this.debugMode;
  }

  getLogLevel() {
    return this.logLevel;
  }

  // Enhanced validation
  validateWeatherCombination(weatherTypes) {
    this.validationStats.totalValidations++;

    const errors = [];
    const warnings = [];

    // Check for opposite weather types
    const opposites = [
      ["Hot", "Cold"],
      ["Sunny", "Snowy"],
      ["Sunny", "Stormy"],
    ];
    for (const [type1, type2] of opposites) {
      if (weatherTypes.includes(type1) && weatherTypes.includes(type2)) {
        errors.push({
          errorType: "OPPOSITE_WEATHER",
          message: `Opposite weather types cannot coexist: ${type1} and ${type2}`,
          invalidWeather: [type1, type2],
        });
      }
    }

    // Check for too many weather types
    if (weatherTypes.length > 5) {
      errors.push({
        errorType: "TOO_MANY_WEATHER_TYPES",
        message: `Too many weather types: ${weatherTypes.length}. Maximum allowed: 5`,
        invalidWeather: weatherTypes,
      });
    }

    // Generate warnings
    if (weatherTypes.length > 3) {
      warnings.push(
        `Many weather types active (${weatherTypes.length}). This may create complex interactions.`
      );
    }

    const isValid = errors.length === 0;

    if (isValid) {
      this.validationStats.successfulValidations++;
    } else {
      this.validationStats.failedValidations++;
    }

    if (warnings.length > 0) {
      this.validationStats.warningValidations++;
    }

    return { isValid, errors, warnings };
  }

  validateWeatherCombinationDetailed(weatherTypes) {
    this.log("debug", "Performing detailed weather validation", {
      weatherTypes,
    });

    const validationResult = this.validateWeatherCombination(weatherTypes);
    const suggestions = this.getWeatherSuggestions();

    // Analyze compatibility
    const compatibilityAnalysis = {
      compatible: [],
      incompatible: [],
      opposite: [],
    };

    const opposites = [
      ["Hot", "Cold"],
      ["Sunny", "Snowy"],
      ["Sunny", "Stormy"],
    ];

    for (let i = 0; i < weatherTypes.length; i++) {
      for (let j = i + 1; j < weatherTypes.length; j++) {
        const weather1 = weatherTypes[i];
        const weather2 = weatherTypes[j];

        let isOpposite = false;
        for (const [type1, type2] of opposites) {
          if (
            (weather1 === type1 && weather2 === type2) ||
            (weather1 === type2 && weather2 === type1)
          ) {
            isOpposite = true;
            break;
          }
        }

        if (isOpposite) {
          if (!compatibilityAnalysis.opposite.includes(weather1)) {
            compatibilityAnalysis.opposite.push(weather1);
          }
          if (!compatibilityAnalysis.opposite.includes(weather2)) {
            compatibilityAnalysis.opposite.push(weather2);
          }
        } else {
          // Assume compatible if not opposite (simplified)
          if (!compatibilityAnalysis.compatible.includes(weather1)) {
            compatibilityAnalysis.compatible.push(weather1);
          }
          if (!compatibilityAnalysis.compatible.includes(weather2)) {
            compatibilityAnalysis.compatible.push(weather2);
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

  // Enhanced applyWeather with validation integration
  applyWeather(weatherTypes, options = {}) {
    const opts = {
      validateChange: true,
      triggerEvents: true,
      source: "manual",
      logLevel: this.logLevel,
      ...options,
    };

    this.log("debug", "Attempting to apply weather", {
      weatherTypes,
      currentWeather: this.weatherState.currentWeather,
      options: opts,
    });

    let validationResult;
    if (opts.validateChange) {
      validationResult = this.validateWeatherCombination(weatherTypes);

      if (!validationResult.isValid) {
        this.log("error", "Weather validation failed", {
          weatherTypes,
          errors: validationResult.errors,
        });

        if (opts.triggerEvents) {
          this.emitEvent("validationError", {
            weatherTypes,
            validationResult,
            source: opts.source,
          });
        }

        throw new Error(
          `Invalid weather combination: ${validationResult.errors
            .map((e) => e.message)
            .join(", ")}`
        );
      }

      if (validationResult.warnings.length > 0) {
        this.log("warn", "Weather validation warnings", {
          weatherTypes,
          warnings: validationResult.warnings,
        });

        if (opts.triggerEvents) {
          this.emitEvent("validationWarning", {
            weatherTypes,
            validationResult,
            source: opts.source,
          });
        }
      }
    } else {
      validationResult = this.validateWeatherCombination(weatherTypes);
      if (!validationResult.isValid) {
        this.log("warn", "Weather validation bypassed - would have failed", {
          weatherTypes,
          errors: validationResult.errors.map((e) => e.message),
        });
      }
    }

    this.saveStateToHistory();

    const previousWeather = [...this.weatherState.currentWeather];
    this.weatherState.currentWeather = [...weatherTypes];

    this.log("info", "Weather applied successfully", {
      previousWeather,
      newWeather: weatherTypes,
      source: opts.source,
      reason: opts.reason,
    });

    if (opts.triggerEvents) {
      this.emitEvent("weatherChanged", {
        previousWeather,
        newWeather: weatherTypes,
        source: opts.source,
        reason: opts.reason,
        validationResult,
      });
    }

    return validationResult;
  }

  // Other methods (simplified versions)
  getCurrentWeatherState() {
    return { ...this.weatherState };
  }

  getCurrentWeather() {
    return [...this.weatherState.currentWeather];
  }

  getWeatherSuggestions() {
    return ["Warm", "Cool", "Cloudy"];
  }

  saveStateToHistory() {
    this.stateHistory.push({ ...this.weatherState });
    if (this.stateHistory.length > 50) {
      this.stateHistory.shift();
    }
  }

  addEventListener(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }

  removeEventListener(event, listener) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emitEvent(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event, data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      }
    }
  }

  getValidationStatistics() {
    return { ...this.validationStats };
  }
}

// Test functions
function runIntegrationTests() {
  console.log("Running WeatherManager Integration Tests...\n");

  let passed = 0;
  let failed = 0;

  function test(name, testFn) {
    try {
      testFn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`✗ ${name}: ${error.message}`);
      failed++;
    }
  }

  const mockConfig = {
    weatherEffects: new Map(),
    compatibilityMatrix: new Map(),
    oppositeWeatherPairs: [],
    effectLimits: { min: -40, max: 40 },
  };

  let weatherManager;

  test("should initialize with debug mode and logging", () => {
    weatherManager = new TestWeatherManagerWithValidation(
      mockConfig,
      undefined,
      {
        debugMode: true,
        logLevel: "debug",
      }
    );

    if (!weatherManager.isDebugMode())
      throw new Error("Debug mode not enabled");
    if (weatherManager.getLogLevel() !== "debug")
      throw new Error("Log level not set");
  });

  test("should emit validation error events", () => {
    let errorEventFired = false;
    weatherManager.addEventListener("validationError", () => {
      errorEventFired = true;
    });

    try {
      weatherManager.applyWeather(["Hot", "Cold"]);
    } catch (error) {
      // Expected to throw
    }

    if (!errorEventFired) throw new Error("Validation error event not fired");
  });

  test("should emit validation warning events", () => {
    let warningEventFired = false;
    weatherManager.addEventListener("validationWarning", () => {
      warningEventFired = true;
    });

    // Apply weather that generates warnings
    weatherManager.applyWeather(["Sunny", "Warm", "Hot", "Humid"]);

    if (!warningEventFired)
      throw new Error("Validation warning event not fired");
  });

  test("should provide detailed validation analysis", () => {
    const result = weatherManager.validateWeatherCombinationDetailed([
      "Sunny",
      "Hot",
      "Cold",
    ]);

    if (!result.validationResult) throw new Error("Missing validation result");
    if (!result.suggestions) throw new Error("Missing suggestions");
    if (!result.compatibilityAnalysis)
      throw new Error("Missing compatibility analysis");

    if (!result.compatibilityAnalysis.opposite.includes("Hot")) {
      throw new Error("Hot not identified as opposite");
    }
    if (!result.compatibilityAnalysis.opposite.includes("Cold")) {
      throw new Error("Cold not identified as opposite");
    }
  });

  test("should respect log level settings", () => {
    let infoLogCalled = false;
    let debugLogCalled = false;

    const originalConsoleInfo = console.info;
    const originalConsoleDebug = console.debug;

    console.info = () => {
      infoLogCalled = true;
    };
    console.debug = () => {
      debugLogCalled = true;
    };

    weatherManager.setLogLevel("error");
    weatherManager.applyWeather(["Sunny"]);

    if (infoLogCalled) throw new Error("Info log called with error level");

    weatherManager.setLogLevel("debug");
    weatherManager.applyWeather(["Rainy"]);

    if (!debugLogCalled)
      throw new Error("Debug log not called with debug level");

    console.info = originalConsoleInfo;
    console.debug = originalConsoleDebug;
  });

  test("should track validation statistics", () => {
    const newManager = new TestWeatherManagerWithValidation(mockConfig);

    // Perform some validations
    newManager.applyWeather(["Sunny"]);

    try {
      newManager.applyWeather(["Hot", "Cold"]);
    } catch (error) {
      // Expected to fail
    }

    const stats = newManager.getValidationStatistics();

    if (stats.totalValidations < 2)
      throw new Error("Total validations not tracked");
    if (stats.successfulValidations < 1)
      throw new Error("Successful validations not tracked");
    if (stats.failedValidations < 1)
      throw new Error("Failed validations not tracked");
  });

  test("should include validation results in weather change events", () => {
    let eventData = null;
    weatherManager.addEventListener("weatherChanged", (event, data) => {
      eventData = data;
    });

    weatherManager.applyWeather(["Sunny", "Warm"]);

    if (!eventData) throw new Error("Weather change event not fired");
    if (!eventData.validationResult)
      throw new Error("Validation result not included in event");
    if (!eventData.validationResult.isValid)
      throw new Error("Validation result should be valid");
  });

  test("should handle validation bypass with warnings", () => {
    let warnLogCalled = false;
    const originalConsoleWarn = console.warn;

    console.warn = (message) => {
      if (message.includes("Weather validation bypassed")) {
        warnLogCalled = true;
      }
    };

    weatherManager.applyWeather(["Hot", "Cold"], { validateChange: false });

    if (!warnLogCalled) throw new Error("Validation bypass warning not logged");

    console.warn = originalConsoleWarn;
  });

  test("should maintain state consistency during validation failures", () => {
    const initialWeather = weatherManager.getCurrentWeather();

    try {
      weatherManager.applyWeather(["Hot", "Cold"]);
    } catch (error) {
      // Expected to fail
    }

    const currentWeather = weatherManager.getCurrentWeather();
    if (JSON.stringify(currentWeather) !== JSON.stringify(initialWeather)) {
      throw new Error("State changed after validation failure");
    }
  });

  test("should handle edge cases in detailed validation", () => {
    // Empty weather array
    const emptyResult = weatherManager.validateWeatherCombinationDetailed([]);
    if (!emptyResult.validationResult.isValid)
      throw new Error("Empty weather should be valid");

    // Single weather type
    const singleResult = weatherManager.validateWeatherCombinationDetailed([
      "Sunny",
    ]);
    if (!singleResult.validationResult.isValid)
      throw new Error("Single weather should be valid");

    // Maximum weather types
    const maxWeather = ["Sunny", "Warm", "Windy", "Humid", "Cloudy"];
    const maxResult =
      weatherManager.validateWeatherCombinationDetailed(maxWeather);
    if (!maxResult.validationResult)
      throw new Error("Max weather validation failed");
  });

  console.log(`\nIntegration Test Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("All WeatherManager integration tests passed! ✓");
  }
}

// Run the tests
runIntegrationTests();
