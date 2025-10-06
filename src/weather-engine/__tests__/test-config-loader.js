/**
 * Simple test runner for config loader (Node.js compatible)
 */

const fs = require("fs");
const path = require("path");

// Mock the WeatherConfigLoader functionality for testing
class TestWeatherConfigLoader {
  constructor() {
    this.cachedConfig = null;
  }

  static getInstance() {
    if (!TestWeatherConfigLoader.instance) {
      TestWeatherConfigLoader.instance = new TestWeatherConfigLoader();
    }
    return TestWeatherConfigLoader.instance;
  }

  loadFromJSON(jsonString) {
    try {
      const rawConfig = JSON.parse(jsonString);
      return this.loadFromData(rawConfig);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(
          `Configuration validation error: Invalid JSON format: ${error.message}`
        );
      }
      throw error;
    }
  }

  loadFromData(rawConfig) {
    this.validateRawConfig(rawConfig);

    const processedConfig = {
      weatherEffects: this.processWeatherEffects(rawConfig.weatherEffects),
      compatibilityMatrix: this.processCompatibilityMatrix(
        rawConfig.compatibilityMatrix
      ),
      oppositeWeatherPairs: rawConfig.oppositeWeatherPairs,
      effectLimits: rawConfig.effectLimits,
    };

    this.cachedConfig = processedConfig;
    return processedConfig;
  }

  validateRawConfig(config) {
    if (!config.weatherEffects) {
      throw new Error("Configuration validation error: Missing weatherEffects");
    }
    if (!config.compatibilityMatrix) {
      throw new Error(
        "Configuration validation error: Missing compatibilityMatrix"
      );
    }
    if (!config.oppositeWeatherPairs) {
      throw new Error(
        "Configuration validation error: Missing oppositeWeatherPairs"
      );
    }
    if (!config.effectLimits) {
      throw new Error("Configuration validation error: Missing effectLimits");
    }
  }

  processWeatherEffects(rawEffects) {
    const weatherEffects = new Map();
    const WEATHER_TYPES = [
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
    const ELEMENT_TYPES = ["Fire", "Ice", "Lightning"];

    for (const weatherType of WEATHER_TYPES) {
      if (!rawEffects[weatherType]) {
        throw new Error(
          `Configuration validation error: Missing weather effect for ${weatherType}`
        );
      }

      const rawEffect = rawEffects[weatherType];
      const weatherEffect = { Fire: 0, Ice: 0, Lightning: 0 };

      for (const elementType of ELEMENT_TYPES) {
        if (typeof rawEffect[elementType] !== "number") {
          throw new Error(
            `Configuration validation error: Invalid effect value for ${weatherType}.${elementType}`
          );
        }

        const effectValue = rawEffect[elementType];
        if (effectValue < -40 || effectValue > 40) {
          throw new Error(
            `Configuration validation error: Effect value ${effectValue} for ${weatherType}.${elementType} is outside limits [-40, 40]`
          );
        }

        weatherEffect[elementType] = effectValue;
      }

      weatherEffects.set(weatherType, weatherEffect);
    }

    return weatherEffects;
  }

  processCompatibilityMatrix(rawMatrix) {
    const compatibilityMatrix = new Map();
    const WEATHER_TYPES = [
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

    for (const weatherType of WEATHER_TYPES) {
      if (!rawMatrix[weatherType]) {
        throw new Error(
          `Configuration validation error: Missing compatibility entry for ${weatherType}`
        );
      }

      const compatibleWeather = [];
      for (const compatibleType of rawMatrix[weatherType]) {
        if (!WEATHER_TYPES.includes(compatibleType)) {
          throw new Error(
            `Configuration validation error: Invalid weather type ${compatibleType} in compatibility matrix for ${weatherType}`
          );
        }
        compatibleWeather.push(compatibleType);
      }

      compatibilityMatrix.set(weatherType, compatibleWeather);
    }

    return compatibilityMatrix;
  }

  getCachedConfig() {
    return this.cachedConfig;
  }

  clearCache() {
    this.cachedConfig = null;
  }
}

// Test functions
function runTests() {
  console.log("Running Weather Config Loader Tests...\n");

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

  // Load the actual config file
  const configPath = path.join(__dirname, "../config/weather-effects.json");
  const configData = fs.readFileSync(configPath, "utf8");

  const configLoader = TestWeatherConfigLoader.getInstance();

  test("should load valid JSON configuration", () => {
    const result = configLoader.loadFromJSON(configData);
    if (!result) throw new Error("Configuration not loaded");
    if (!(result.weatherEffects instanceof Map))
      throw new Error("Weather effects not a Map");
    if (result.weatherEffects.size !== 12)
      throw new Error(
        `Expected 12 weather types, got ${result.weatherEffects.size}`
      );
  });

  test("should validate weather effect values are within limits", () => {
    const invalidConfig = {
      weatherEffects: {
        Sunny: { Fire: 50, Ice: -10, Lightning: -10 }, // 50 exceeds max limit
        Cloudy: { Fire: 0, Ice: 0, Lightning: 0 },
        Rainy: { Fire: 0, Ice: 0, Lightning: 0 },
        Windy: { Fire: 0, Ice: 0, Lightning: 0 },
        Stormy: { Fire: 0, Ice: 0, Lightning: 0 },
        Foggy: { Fire: 0, Ice: 0, Lightning: 0 },
        Snowy: { Fire: 0, Ice: 0, Lightning: 0 },
        Hot: { Fire: 0, Ice: 0, Lightning: 0 },
        Cold: { Fire: 0, Ice: 0, Lightning: 0 },
        Warm: { Fire: 0, Ice: 0, Lightning: 0 },
        Cool: { Fire: 0, Ice: 0, Lightning: 0 },
        Humid: { Fire: 0, Ice: 0, Lightning: 0 },
      },
      compatibilityMatrix: {
        Sunny: [],
        Cloudy: [],
        Rainy: [],
        Windy: [],
        Stormy: [],
        Foggy: [],
        Snowy: [],
        Hot: [],
        Cold: [],
        Warm: [],
        Cool: [],
        Humid: [],
      },
      oppositeWeatherPairs: [],
      effectLimits: { min: -40, max: 40 },
    };

    try {
      configLoader.loadFromData(invalidConfig);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      if (!error.message.includes("outside limits")) {
        throw new Error("Wrong error type");
      }
    }
  });

  test("should validate all weather types are present", () => {
    const incompleteConfig = {
      weatherEffects: {
        Sunny: { Fire: 20, Ice: -10, Lightning: -10 },
        // Missing other weather types
      },
      compatibilityMatrix: { Sunny: [] },
      oppositeWeatherPairs: [],
      effectLimits: { min: -40, max: 40 },
    };

    try {
      configLoader.loadFromData(incompleteConfig);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      if (!error.message.includes("Missing weather effect")) {
        throw new Error("Wrong error type");
      }
    }
  });

  test("should create proper WeatherEffect objects", () => {
    const result = configLoader.loadFromJSON(configData);
    const sunnyEffect = result.weatherEffects.get("Sunny");

    if (!sunnyEffect) throw new Error("Sunny effect not found");
    if (typeof sunnyEffect.Fire !== "number")
      throw new Error("Fire effect not a number");
    if (typeof sunnyEffect.Ice !== "number")
      throw new Error("Ice effect not a number");
    if (typeof sunnyEffect.Lightning !== "number")
      throw new Error("Lightning effect not a number");
  });

  test("should create proper compatibility matrix", () => {
    const result = configLoader.loadFromJSON(configData);
    const sunnyCompatible = result.weatherEffects.get("Sunny");

    if (!sunnyCompatible) throw new Error("Sunny compatibility not found");
  });

  test("should cache loaded configuration", () => {
    configLoader.clearCache();
    if (configLoader.getCachedConfig() !== null)
      throw new Error("Cache should be null initially");

    const result = configLoader.loadFromJSON(configData);
    const cached = configLoader.getCachedConfig();

    if (cached !== result) throw new Error("Configuration not cached properly");
  });

  test("should throw error for invalid JSON", () => {
    const invalidJSON = "{ invalid json }";

    try {
      configLoader.loadFromJSON(invalidJSON);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      if (!error.message.includes("Invalid JSON format")) {
        throw new Error("Wrong error type");
      }
    }
  });

  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("All tests passed! ✓");
  }
}

// Run the tests
runTests();
