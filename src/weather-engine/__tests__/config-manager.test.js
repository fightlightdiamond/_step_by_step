/**
 * Unit tests for configuration management system
 */

const { WeatherConfigManager } = require("../config/config-manager");
const { WeatherConfigLoader } = require("../config/config-loader");
const { WEATHER_TYPES, ELEMENT_TYPES } = require("../constants");

// Mock fs module
jest.mock("fs");

describe("WeatherConfigManager", () => {
  let configManager;
  let mockConfigLoader;

  const createMockConfig = () => ({
    weatherEffects: new Map(
      WEATHER_TYPES.map((weather) => [
        weather,
        { Fire: 0, Ice: 0, Lightning: 0 },
      ])
    ),
    compatibilityMatrix: new Map(WEATHER_TYPES.map((weather) => [weather, []])),
    oppositeWeatherPairs: [["Hot", "Cold"]],
    effectLimits: { min: -40, max: 40 },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigLoader = WeatherConfigLoader.getInstance();

    // Mock the config loader methods
    jest
      .spyOn(mockConfigLoader, "loadFromFile")
      .mockReturnValue(createMockConfig());
    jest
      .spyOn(mockConfigLoader, "getCachedConfig")
      .mockReturnValue(createMockConfig());
    jest
      .spyOn(mockConfigLoader, "reloadConfiguration")
      .mockReturnValue(createMockConfig());
    jest
      .spyOn(mockConfigLoader, "enableAutoReload")
      .mockImplementation(() => {});
    jest
      .spyOn(mockConfigLoader, "disableAutoReload")
      .mockImplementation(() => {});
    jest.spyOn(mockConfigLoader, "isAutoReloadEnabled").mockReturnValue(false);
    jest.spyOn(mockConfigLoader, "getConfigFileInfo").mockReturnValue({
      path: "/test/config.json",
      lastModified: Date.now(),
    });
    jest
      .spyOn(mockConfigLoader, "addConfigChangeListener")
      .mockImplementation(() => {});
    jest
      .spyOn(mockConfigLoader, "removeConfigChangeListener")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    if (configManager) {
      configManager.dispose();
    }
  });

  describe("initialization", () => {
    test("should create manager with default options", () => {
      configManager = new WeatherConfigManager();
      expect(configManager).toBeDefined();
    });

    test("should create manager with custom options", () => {
      const options = {
        configFilePath: "/test/config.json",
        enableAutoReload: true,
        fallbackToDefaults: false,
        validateOnLoad: true,
      };

      configManager = new WeatherConfigManager(options);
      expect(configManager).toBeDefined();
      expect(mockConfigLoader.loadFromFile).toHaveBeenCalledWith(
        "/test/config.json"
      );
    });

    test("should enable auto-reload when specified in options", () => {
      configManager = new WeatherConfigManager({
        configFilePath: "/test/config.json",
        enableAutoReload: true,
      });

      expect(mockConfigLoader.enableAutoReload).toHaveBeenCalled();
    });
  });

  describe("configuration loading", () => {
    beforeEach(() => {
      configManager = new WeatherConfigManager();
    });

    test("should load configuration from file", () => {
      const config = configManager.loadConfiguration("/test/config.json");

      expect(config).toBeDefined();
      expect(mockConfigLoader.loadFromFile).toHaveBeenCalledWith(
        "/test/config.json"
      );
    });

    test("should load default configuration", () => {
      const config = configManager.loadDefaultConfiguration();

      expect(config).toBeDefined();
      expect(mockConfigLoader.loadFromFile).toHaveBeenCalled();
    });

    test("should fallback to defaults on load failure", () => {
      jest
        .spyOn(mockConfigLoader, "loadFromFile")
        .mockImplementationOnce(() => {
          throw new Error("File not found");
        })
        .mockReturnValueOnce(createMockConfig());

      configManager = new WeatherConfigManager({
        configFilePath: "/invalid/path.json",
        fallbackToDefaults: true,
      });

      expect(mockConfigLoader.loadFromFile).toHaveBeenCalledTimes(2);
    });

    test("should throw error when fallback is disabled", () => {
      jest.spyOn(mockConfigLoader, "loadFromFile").mockImplementation(() => {
        throw new Error("File not found");
      });

      expect(() => {
        configManager = new WeatherConfigManager({
          configFilePath: "/invalid/path.json",
          fallbackToDefaults: false,
        });
      }).toThrow("File not found");
    });

    test("should get current configuration", () => {
      const config = configManager.getCurrentConfiguration();
      expect(config).toBeDefined();
      expect(mockConfigLoader.getCachedConfig).toHaveBeenCalled();
    });

    test("should reload configuration", () => {
      const config = configManager.reloadConfiguration();
      expect(config).toBeDefined();
      expect(mockConfigLoader.reloadConfiguration).toHaveBeenCalled();
    });
  });

  describe("configuration validation", () => {
    beforeEach(() => {
      configManager = new WeatherConfigManager();
    });

    test("should validate complete configuration", () => {
      const result = configManager.validateConfiguration();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should detect missing weather types", () => {
      const incompleteConfig = createMockConfig();
      incompleteConfig.weatherEffects.delete("Sunny");

      const result = configManager.validateConfiguration(incompleteConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing weather types: Sunny");
    });

    test("should detect asymmetric compatibility", () => {
      const invalidConfig = createMockConfig();
      invalidConfig.compatibilityMatrix.set("Sunny", ["Cloudy"]);
      invalidConfig.compatibilityMatrix.set("Cloudy", []); // Missing reverse compatibility

      const result = configManager.validateConfiguration(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((error) =>
          error.includes("Asymmetric compatibility")
        )
      ).toBe(true);
    });

    test("should detect opposite weathers marked as compatible", () => {
      const invalidConfig = createMockConfig();
      invalidConfig.compatibilityMatrix.set("Hot", ["Cold"]);
      invalidConfig.oppositeWeatherPairs = [["Hot", "Cold"]];

      const result = configManager.validateConfiguration(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((error) =>
          error.includes(
            "Opposite weathers Hot and Cold are marked as compatible"
          )
        )
      ).toBe(true);
    });

    test("should warn about extreme effect values", () => {
      const config = createMockConfig();
      config.weatherEffects.set("Sunny", { Fire: 35, Ice: -35, Lightning: 0 });

      const result = configManager.validateConfiguration(config);

      expect(
        result.warnings.some((warning) => warning.includes("High effect value"))
      ).toBe(true);
    });

    test("should warn about isolated weather types", () => {
      const config = createMockConfig();
      config.compatibilityMatrix.set("Sunny", []); // No compatible weather

      const result = configManager.validateConfiguration(config);

      expect(
        result.warnings.some((warning) =>
          warning.includes("has no compatible weather types")
        )
      ).toBe(true);
    });

    test("should handle validation with no configuration loaded", () => {
      jest.spyOn(mockConfigLoader, "getCachedConfig").mockReturnValue(null);

      const result = configManager.validateConfiguration();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("No configuration loaded");
    });
  });

  describe("configuration statistics", () => {
    beforeEach(() => {
      configManager = new WeatherConfigManager();
    });

    test("should provide configuration statistics", () => {
      // Load a configuration first to have valid stats
      configManager.loadConfiguration("/test/config.json");
      const stats = configManager.getConfigurationStats();

      expect(stats.weatherTypesCount).toBe(WEATHER_TYPES.length);
      expect(stats.oppositeWeatherPairsCount).toBe(1);
      expect(stats.effectLimits).toEqual({ min: -40, max: 40 });
      expect(stats.lastLoaded).toBeInstanceOf(Date);
      expect(stats.filePath).toBe("/test/config.json");
    });

    test("should handle statistics with no configuration", () => {
      jest.spyOn(mockConfigLoader, "getCachedConfig").mockReturnValue(null);
      jest.spyOn(mockConfigLoader, "getConfigFileInfo").mockReturnValue(null);

      const stats = configManager.getConfigurationStats();

      expect(stats.weatherTypesCount).toBe(0);
      expect(stats.compatibilityRulesCount).toBe(0);
      expect(stats.oppositeWeatherPairsCount).toBe(0);
      expect(stats.filePath).toBeNull();
    });
  });

  describe("auto-reload management", () => {
    beforeEach(() => {
      configManager = new WeatherConfigManager();
    });

    test("should enable auto-reload", () => {
      configManager.setAutoReload(true);
      expect(mockConfigLoader.enableAutoReload).toHaveBeenCalled();
    });

    test("should disable auto-reload", () => {
      configManager.setAutoReload(false);
      expect(mockConfigLoader.disableAutoReload).toHaveBeenCalled();
    });
  });

  describe("configuration change listeners", () => {
    beforeEach(() => {
      configManager = new WeatherConfigManager();
    });

    test("should add configuration change listener", () => {
      const listener = jest.fn();
      configManager.onConfigurationChange(listener);

      expect(mockConfigLoader.addConfigChangeListener).toHaveBeenCalledWith(
        listener
      );
    });

    test("should remove configuration change listener", () => {
      const listener = jest.fn();
      configManager.removeConfigurationChangeListener(listener);

      expect(mockConfigLoader.removeConfigChangeListener).toHaveBeenCalledWith(
        listener
      );
    });
  });

  describe("configuration export and backup", () => {
    beforeEach(() => {
      configManager = new WeatherConfigManager();
    });

    test("should export configuration to JSON", () => {
      const exported = configManager.exportConfiguration();
      const parsed = JSON.parse(exported);

      expect(parsed.weatherEffects).toBeDefined();
      expect(parsed.compatibilityMatrix).toBeDefined();
      expect(parsed.oppositeWeatherPairs).toBeDefined();
      expect(parsed.effectLimits).toBeDefined();
    });

    test("should create configuration backup", () => {
      const backup = configManager.createConfigurationBackup();
      const parsed = JSON.parse(backup);

      expect(parsed.timestamp).toBeDefined();
      expect(parsed.version).toBe("1.0.0");
      expect(parsed.configuration).toBeDefined();
    });

    test("should throw error when exporting with no configuration", () => {
      jest.spyOn(mockConfigLoader, "getCachedConfig").mockReturnValue(null);

      expect(() => configManager.exportConfiguration()).toThrow(
        "No configuration loaded to export"
      );
    });
  });

  describe("disposal", () => {
    test("should dispose properly", () => {
      configManager = new WeatherConfigManager();
      configManager.dispose();

      expect(mockConfigLoader.disableAutoReload).toHaveBeenCalled();
    });
  });
});
