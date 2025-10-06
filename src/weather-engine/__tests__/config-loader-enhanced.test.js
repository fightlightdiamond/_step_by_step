/**
 * Enhanced unit tests for weather effects configuration loader
 */

const {
  WeatherConfigLoader,
  ConfigValidationError,
} = require("../config/config-loader");
const { WEATHER_TYPES, ELEMENT_TYPES } = require("../constants");

describe("WeatherConfigLoader Enhanced Features", () => {
  let configLoader;

  const createValidConfig = () => ({
    weatherEffects: Object.fromEntries(
      WEATHER_TYPES.map((weather) => [
        weather,
        { Fire: 0, Ice: 0, Lightning: 0 },
      ])
    ),
    compatibilityMatrix: Object.fromEntries(
      WEATHER_TYPES.map((weather) => [weather, []])
    ),
    oppositeWeatherPairs: [["Hot", "Cold"]],
    effectLimits: { min: -40, max: 40 },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    configLoader = WeatherConfigLoader.getInstance();
    configLoader.clearCache();
  });

  describe("schema validation integration", () => {
    test("should validate configuration against schema", () => {
      const config = createValidConfig();
      const result = configLoader.loadFromData(config);

      expect(result).toBeDefined();
      expect(result.weatherEffects.size).toBe(WEATHER_TYPES.length);
    });

    test("should reject configuration that fails schema validation", () => {
      const invalidConfig = createValidConfig();
      invalidConfig.weatherEffects.Sunny.Fire = 50; // Exceeds limit

      expect(() => configLoader.loadFromData(invalidConfig)).toThrow(
        ConfigValidationError
      );
    });
  });

  describe("configuration change listeners", () => {
    test("should add and notify configuration change listeners", () => {
      const listener = jest.fn();
      configLoader.addConfigChangeListener(listener);

      const config = createValidConfig();
      const result = configLoader.loadFromData(config);

      expect(listener).toHaveBeenCalledWith(result);
    });

    test("should remove configuration change listeners", () => {
      const listener = jest.fn();
      configLoader.addConfigChangeListener(listener);
      configLoader.removeConfigChangeListener(listener);

      const config = createValidConfig();
      configLoader.loadFromData(config);

      expect(listener).not.toHaveBeenCalled();
    });

    test("should handle listener errors gracefully", () => {
      const faultyListener = jest.fn().mockImplementation(() => {
        throw new Error("Listener error");
      });
      const goodListener = jest.fn();

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      configLoader.addConfigChangeListener(faultyListener);
      configLoader.addConfigChangeListener(goodListener);

      const config = createValidConfig();
      // Should not throw despite faulty listener
      expect(() => configLoader.loadFromData(config)).not.toThrow();
      expect(goodListener).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("runtime configuration management", () => {
    test("should handle auto-reload without loaded file", () => {
      configLoader.clearCache();
      expect(() => configLoader.enableAutoReload()).toThrow(
        ConfigValidationError
      );
    });

    test("should handle reload without loaded file", () => {
      configLoader.clearCache();
      expect(() => configLoader.reloadConfiguration()).toThrow(
        ConfigValidationError
      );
    });

    test("should return null file info when no file loaded", () => {
      configLoader.clearCache();
      const info = configLoader.getConfigFileInfo();
      expect(info).toBeNull();
    });

    test("should track auto-reload state", () => {
      // Initially should be false
      expect(configLoader.isAutoReloadEnabled()).toBe(false);
    });
  });

  describe("enhanced validation features", () => {
    test("should validate configuration with schema validation first", () => {
      const config = createValidConfig();
      // Add an invalid property that would pass basic validation but fail schema
      config.invalidProperty = "should not be here";

      expect(() => configLoader.loadFromData(config)).toThrow(
        ConfigValidationError
      );
    });

    test("should provide detailed error messages for schema failures", () => {
      const config = createValidConfig();
      config.weatherEffects.Sunny.Fire = 100; // Exceeds schema limit

      try {
        configLoader.loadFromData(config);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigValidationError);
        expect(error.message).toContain("Schema validation failed");
      }
    });

    test("should handle JSON parsing errors gracefully", () => {
      const invalidJSON = "{ invalid json }";

      expect(() => configLoader.loadFromJSON(invalidJSON)).toThrow(
        ConfigValidationError
      );
    });
  });

  describe("configuration caching and state management", () => {
    test("should cache configuration after loading", () => {
      const config = createValidConfig();
      const result = configLoader.loadFromData(config);
      const cached = configLoader.getCachedConfig();

      expect(cached).toBe(result);
    });

    test("should clear cache when requested", () => {
      const config = createValidConfig();
      configLoader.loadFromData(config);
      expect(configLoader.getCachedConfig()).not.toBeNull();

      configLoader.clearCache();
      expect(configLoader.getCachedConfig()).toBeNull();
    });

    test("should maintain singleton pattern", () => {
      const instance1 = WeatherConfigLoader.getInstance();
      const instance2 = WeatherConfigLoader.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
