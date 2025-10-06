/**
 * Unit tests for plugin system
 */

const { PluginRegistry } = require("../extensions/plugin-system");

describe("PluginRegistry", () => {
  let registry;
  let mockPlugin;

  beforeEach(() => {
    registry = new PluginRegistry();
    mockPlugin = {
      name: "test-plugin",
      version: "1.0.0",
      description: "Test plugin",

      weatherTypes: [
        {
          name: "TestWeather",
          displayName: "Test Weather",
          description: "A test weather type",
          effects: { Fire: 10, Ice: -5, Lightning: 0 },
          compatibleWith: ["Sunny"],
          oppositeOf: ["Cold"],
        },
      ],

      gameModes: [
        {
          name: "TestMode",
          displayName: "Test Mode",
          description: "A test game mode",
          rules: {
            weatherChangeFrequency: 1,
            allowPlayerWeatherControl: true,
            allowWeatherMixing: false,
            maxWeatherTypes: 1,
            weatherSource: "random",
          },
        },
      ],

      weatherCards: [
        {
          id: "test-card",
          name: "Test Card",
          description: "A test weather card",
          type: "Weather",
          weather: "Sunny",
          cost: 2,
        },
      ],

      initialize: jest.fn(),
      activate: jest.fn(),
      deactivate: jest.fn(),
      onWeatherChange: jest.fn(),
      onGameModeChange: jest.fn(),
      onCardPlayed: jest.fn(),
    };
  });

  describe("plugin registration", () => {
    test("should register a plugin", () => {
      registry.registerPlugin(mockPlugin);

      const plugins = registry.getPlugins();
      expect(plugins).toHaveLength(1);
      expect(plugins[0]).toBe(mockPlugin);
    });

    test("should throw error when registering duplicate plugin", () => {
      registry.registerPlugin(mockPlugin);

      expect(() => registry.registerPlugin(mockPlugin)).toThrow(
        "Plugin test-plugin is already registered"
      );
    });
  });

  describe("plugin activation", () => {
    beforeEach(() => {
      registry.registerPlugin(mockPlugin);
    });

    test("should activate a plugin", async () => {
      await registry.activatePlugin("test-plugin");

      expect(mockPlugin.initialize).toHaveBeenCalled();
      expect(mockPlugin.activate).toHaveBeenCalled();

      const activePlugins = registry.getActivePlugins();
      expect(activePlugins).toHaveLength(1);
      expect(activePlugins[0]).toBe(mockPlugin);
    });

    test("should register plugin extensions on activation", async () => {
      await registry.activatePlugin("test-plugin");

      const weatherTypes = registry.getCustomWeatherTypes();
      const gameModes = registry.getCustomGameModes();
      const weatherCards = registry.getCustomWeatherCards();

      expect(weatherTypes).toHaveLength(1);
      expect(weatherTypes[0].name).toBe("TestWeather");

      expect(gameModes).toHaveLength(1);
      expect(gameModes[0].name).toBe("TestMode");

      expect(weatherCards).toHaveLength(1);
      expect(weatherCards[0].id).toBe("test-card");
    });

    test("should throw error when activating non-existent plugin", async () => {
      await expect(registry.activatePlugin("non-existent")).rejects.toThrow(
        "Plugin non-existent not found"
      );
    });

    test("should warn when activating already active plugin", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      await registry.activatePlugin("test-plugin");
      await registry.activatePlugin("test-plugin");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Plugin test-plugin is already active"
      );
      consoleSpy.mockRestore();
    });
  });

  describe("plugin deactivation", () => {
    beforeEach(async () => {
      registry.registerPlugin(mockPlugin);
      await registry.activatePlugin("test-plugin");
    });

    test("should deactivate a plugin", async () => {
      await registry.deactivatePlugin("test-plugin");

      expect(mockPlugin.deactivate).toHaveBeenCalled();

      const activePlugins = registry.getActivePlugins();
      expect(activePlugins).toHaveLength(0);
    });

    test("should unregister plugin extensions on deactivation", async () => {
      await registry.deactivatePlugin("test-plugin");

      const weatherTypes = registry.getCustomWeatherTypes();
      const gameModes = registry.getCustomGameModes();
      const weatherCards = registry.getCustomWeatherCards();

      expect(weatherTypes).toHaveLength(0);
      expect(gameModes).toHaveLength(0);
      expect(weatherCards).toHaveLength(0);
    });

    test("should warn when deactivating inactive plugin", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      await registry.deactivatePlugin("test-plugin");
      await registry.deactivatePlugin("test-plugin");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Plugin test-plugin is not active"
      );
      consoleSpy.mockRestore();
    });
  });

  describe("event system", () => {
    beforeEach(async () => {
      registry.registerPlugin(mockPlugin);
      await registry.activatePlugin("test-plugin");
    });

    test("should emit events to plugin handlers", () => {
      registry.emit("weatherChange", ["Sunny"], ["Rainy"]);

      expect(mockPlugin.onWeatherChange).toHaveBeenCalledWith(
        ["Sunny"],
        ["Rainy"]
      );
    });

    test("should emit events to registered event handlers", () => {
      const handler = jest.fn();

      // Use the plugin context to register handler
      const context = registry.createPluginContext();
      context.on("customEvent", handler);

      registry.emit("customEvent", "test data");

      expect(handler).toHaveBeenCalledWith("test data");
    });

    test("should handle errors in event handlers gracefully", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockPlugin.onWeatherChange.mockImplementation(() => {
        throw new Error("Handler error");
      });

      expect(() => registry.emit("weatherChange", [], [])).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("extension registration", () => {
    test("should prevent duplicate weather type registration", () => {
      const weatherType = {
        name: "DuplicateWeather",
        displayName: "Duplicate Weather",
        description: "Test duplicate",
        effects: { Fire: 0, Ice: 0, Lightning: 0 },
        compatibleWith: [],
      };

      registry.registerWeatherType(weatherType);

      expect(() => registry.registerWeatherType(weatherType)).toThrow(
        "Weather type DuplicateWeather is already registered"
      );
    });

    test("should prevent duplicate game mode registration", () => {
      const gameMode = {
        name: "DuplicateMode",
        displayName: "Duplicate Mode",
        description: "Test duplicate",
        rules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: false,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "random",
        },
      };

      registry.registerGameMode(gameMode);

      expect(() => registry.registerGameMode(gameMode)).toThrow(
        "Game mode DuplicateMode is already registered"
      );
    });

    test("should prevent duplicate weather card registration", () => {
      const weatherCard = {
        id: "duplicate-card",
        name: "Duplicate Card",
        description: "Test duplicate",
        type: "Weather",
      };

      registry.registerWeatherCard(weatherCard);

      expect(() => registry.registerWeatherCard(weatherCard)).toThrow(
        "Weather card duplicate-card is already registered"
      );
    });
  });
});
