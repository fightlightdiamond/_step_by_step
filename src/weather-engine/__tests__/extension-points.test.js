/**
 * Unit tests for extension points
 */

const {
  WeatherTypeExtensions,
  GameModeExtensions,
  WeatherCardExtensions,
  ExtensionManager,
} = require("../extensions/extension-points");
const { pluginRegistry } = require("../extensions/plugin-system");

describe("Extension Points", () => {
  let mockPlugin;

  beforeEach(async () => {
    // Clear any existing plugins
    const activePlugins = pluginRegistry.getActivePlugins();
    for (const plugin of activePlugins) {
      try {
        await pluginRegistry.deactivatePlugin(plugin.name);
      } catch (error) {
        // Ignore deactivation errors during cleanup
      }
    }

    // Clear the plugin registry completely
    const allPlugins = pluginRegistry.getPlugins();
    for (const plugin of allPlugins) {
      try {
        pluginRegistry["plugins"].delete(plugin.name);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    mockPlugin = {
      name: "test-extension-plugin",
      version: "1.0.0",
      description: "Test plugin for extension points",

      weatherTypes: [
        {
          name: "CustomWeather",
          displayName: "Custom Weather",
          description: "A custom weather type",
          effects: { Fire: 15, Ice: -10, Lightning: 5 },
          compatibleWith: ["Sunny", "Windy"],
          oppositeOf: ["Cold"],

          validate: (weather) => !weather.includes("Snowy"),
          calculateEffects: (baseEffects, context) => ({
            Fire: baseEffects.Fire + context.turn,
            Ice: baseEffects.Ice,
            Lightning: baseEffects.Lightning,
          }),
        },
      ],

      gameModes: [
        {
          name: "CustomMode",
          displayName: "Custom Mode",
          description: "A custom game mode",
          rules: {
            weatherChangeFrequency: 2,
            allowPlayerWeatherControl: true,
            allowWeatherMixing: true,
            maxWeatherTypes: 2,
            weatherSource: "custom",
          },

          onStart: jest.fn(),
          onTurnStart: jest.fn(),
          generateWeather: jest.fn().mockReturnValue(["Sunny"]),
          validateAction: jest.fn().mockReturnValue(true),
        },
      ],

      weatherCards: [
        {
          id: "custom-card",
          name: "Custom Card",
          description: "A custom weather card",
          type: "Weather",
          weather: "Sunny",
          cost: 3,
          rarity: "rare",

          canPlay: jest.fn().mockReturnValue(true),
          onPlay: jest.fn(),
          onExpire: jest.fn(),
        },
      ],
    };

    pluginRegistry.registerPlugin(mockPlugin);
  });

  describe("WeatherTypeExtensions", () => {
    let weatherExtensions;

    beforeEach(async () => {
      weatherExtensions = WeatherTypeExtensions.getInstance();
      await pluginRegistry.activatePlugin("test-extension-plugin");
    });

    test("should include custom weather types in getAllWeatherTypes", () => {
      const allTypes = weatherExtensions.getAllWeatherTypes();

      expect(allTypes).toContain("CustomWeather");
      expect(allTypes).toContain("Sunny"); // Built-in type
      expect(allTypes.length).toBeGreaterThan(12); // 12 built-in + custom
    });

    test("should validate custom weather types", () => {
      expect(weatherExtensions.isValidWeatherType("CustomWeather")).toBe(true);
      expect(weatherExtensions.isValidWeatherType("Sunny")).toBe(true);
      expect(weatherExtensions.isValidWeatherType("InvalidWeather")).toBe(
        false
      );
    });

    test("should get effects for custom weather types", () => {
      const context = {
        turn: 5,
        currentWeather: [],
        activeCards: [],
        gameMode: "test",
      };
      const effects = weatherExtensions.getWeatherEffects(
        "CustomWeather",
        context
      );

      expect(effects.Fire).toBe(20); // 15 + 5 (turn)
      expect(effects.Ice).toBe(-10);
      expect(effects.Lightning).toBe(5);
    });

    test("should get compatible weather types", () => {
      const compatible =
        weatherExtensions.getCompatibleWeatherTypes("CustomWeather");

      expect(compatible).toContain("Sunny");
      expect(compatible).toContain("Windy");
    });

    test("should get opposite weather types", () => {
      const opposites =
        weatherExtensions.getOppositeWeatherTypes("CustomWeather");

      expect(opposites).toContain("Cold");
    });

    test("should validate weather combinations with custom logic", () => {
      expect(
        weatherExtensions.validateWeatherCombination(["CustomWeather", "Sunny"])
      ).toBe(true);
      expect(
        weatherExtensions.validateWeatherCombination(["CustomWeather", "Snowy"])
      ).toBe(false);
    });
  });

  describe("GameModeExtensions", () => {
    let gameModeExtensions;

    beforeEach(async () => {
      gameModeExtensions = GameModeExtensions.getInstance();
      await pluginRegistry.activatePlugin("test-extension-plugin");
    });

    test("should include custom game modes in getAllGameModes", () => {
      const allModes = gameModeExtensions.getAllGameModes();

      expect(allModes).toContain("CustomMode");
      expect(allModes).toContain("12-Month Campaign"); // Built-in mode
    });

    test("should validate custom game modes", () => {
      expect(gameModeExtensions.isValidGameMode("CustomMode")).toBe(true);
      expect(gameModeExtensions.isValidGameMode("12-Month Campaign")).toBe(
        true
      );
      expect(gameModeExtensions.isValidGameMode("InvalidMode")).toBe(false);
    });

    test("should get game mode definition", () => {
      const definition = gameModeExtensions.getGameModeDefinition("CustomMode");

      expect(definition).toBeDefined();
      expect(definition.name).toBe("CustomMode");
      expect(definition.rules.maxWeatherTypes).toBe(2);
    });

    test("should execute game mode lifecycle hooks", () => {
      const context = {
        currentTurn: 1,
        maxTurns: 10,
        weatherHistory: [],
        playerStates: [],
        gameState: {},
      };

      gameModeExtensions.executeGameModeHook("CustomMode", "onStart", context);
      expect(mockPlugin.gameModes[0].onStart).toHaveBeenCalledWith(context);

      gameModeExtensions.executeGameModeHook(
        "CustomMode",
        "onTurnStart",
        context,
        1
      );
      expect(mockPlugin.gameModes[0].onTurnStart).toHaveBeenCalledWith(
        1,
        context
      );
    });

    test("should generate weather for custom game mode", () => {
      const context = {
        currentTurn: 1,
        maxTurns: 10,
        weatherHistory: [],
        playerStates: [],
        gameState: {},
      };

      const weather = gameModeExtensions.generateWeatherForGameMode(
        "CustomMode",
        1,
        context
      );

      expect(weather).toEqual(["Sunny"]);
      expect(mockPlugin.gameModes[0].generateWeather).toHaveBeenCalledWith(
        1,
        context
      );
    });

    test("should validate actions for custom game mode", () => {
      const context = {
        currentTurn: 1,
        maxTurns: 10,
        weatherHistory: [],
        playerStates: [],
        gameState: {},
      };
      const action = { type: "playCard", cardId: "test" };

      const isValid = gameModeExtensions.validateActionForGameMode(
        "CustomMode",
        action,
        context
      );

      expect(isValid).toBe(true);
      expect(mockPlugin.gameModes[0].validateAction).toHaveBeenCalledWith(
        action,
        context
      );
    });

    test("should handle errors in game mode hooks gracefully", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockPlugin.gameModes[0].onStart.mockImplementation(() => {
        throw new Error("Hook error");
      });

      const context = {
        currentTurn: 1,
        maxTurns: 10,
        weatherHistory: [],
        playerStates: [],
        gameState: {},
      };

      expect(() =>
        gameModeExtensions.executeGameModeHook("CustomMode", "onStart", context)
      ).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("WeatherCardExtensions", () => {
    let cardExtensions;

    beforeEach(async () => {
      cardExtensions = WeatherCardExtensions.getInstance();
      await pluginRegistry.activatePlugin("test-extension-plugin");
    });

    test("should get all custom weather cards", () => {
      const allCards = cardExtensions.getAllWeatherCards();

      expect(allCards).toHaveLength(1);
      expect(allCards[0].id).toBe("custom-card");
      expect(allCards[0].name).toBe("Custom Card");
    });

    test("should get custom card definition", () => {
      const definition = cardExtensions.getCustomCardDefinition("custom-card");

      expect(definition).toBeDefined();
      expect(definition.id).toBe("custom-card");
      expect(definition.rarity).toBe("rare");
    });

    test("should check if card can be played", () => {
      const context = {
        card: { id: "custom-card" },
        currentWeather: ["Sunny"],
        playerId: "player1",
        turn: 1,
        gameMode: "test",
      };

      const canPlay = cardExtensions.canPlayCard("custom-card", context);

      expect(canPlay).toBe(true);
      expect(mockPlugin.weatherCards[0].canPlay).toHaveBeenCalledWith(context);
    });

    test("should execute card play logic", () => {
      const context = {
        card: { id: "custom-card" },
        currentWeather: ["Sunny"],
        playerId: "player1",
        turn: 1,
        gameMode: "test",
      };

      cardExtensions.executeCardPlay("custom-card", context);

      expect(mockPlugin.weatherCards[0].onPlay).toHaveBeenCalledWith(context);
    });

    test("should execute card expiration logic", () => {
      const context = {
        card: { id: "custom-card" },
        currentWeather: ["Sunny"],
        playerId: "player1",
        turn: 1,
        gameMode: "test",
      };

      cardExtensions.executeCardExpiration("custom-card", context);

      expect(mockPlugin.weatherCards[0].onExpire).toHaveBeenCalledWith(context);
    });

    test("should get cards by rarity", () => {
      const rareCards = cardExtensions.getCardsByRarity("rare");

      expect(rareCards).toHaveLength(1);
      expect(rareCards[0].id).toBe("custom-card");
    });

    test("should handle errors in card logic gracefully", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockPlugin.weatherCards[0].onPlay.mockImplementation(() => {
        throw new Error("Card error");
      });

      const context = {
        card: { id: "custom-card" },
        currentWeather: ["Sunny"],
        playerId: "player1",
        turn: 1,
        gameMode: "test",
      };

      expect(() =>
        cardExtensions.executeCardPlay("custom-card", context)
      ).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("ExtensionManager", () => {
    let extensionManager;

    beforeEach(async () => {
      extensionManager = ExtensionManager.getInstance();
      await pluginRegistry.activatePlugin("test-extension-plugin");
    });

    test("should provide access to all extension points", () => {
      expect(extensionManager.weatherTypes).toBeInstanceOf(
        WeatherTypeExtensions
      );
      expect(extensionManager.gameModes).toBeInstanceOf(GameModeExtensions);
      expect(extensionManager.weatherCards).toBeInstanceOf(
        WeatherCardExtensions
      );
    });

    test("should provide extension statistics", () => {
      const stats = extensionManager.getExtensionStats();

      expect(stats.customWeatherTypes).toBe(1);
      expect(stats.customGameModes).toBe(1);
      expect(stats.customWeatherCards).toBe(1);
      expect(stats.activePlugins).toBe(1);
    });

    test("should maintain singleton pattern", () => {
      const instance1 = ExtensionManager.getInstance();
      const instance2 = ExtensionManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
