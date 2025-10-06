/**
 * Game Mode Manager Tests
 */

import {
  GameModeManager,
  GameAction,
  GameState,
} from "../manager/game-mode-manager";
import { WeatherManager } from "../manager/weather-manager";
import { SeasonManager } from "../manager/season-manager";
import { WeatherConfigLoader } from "../config/config-loader";
import { GameMode, WeatherType, SeasonType } from "../types";
import defaultWeatherConfig from "../config/weather-effects.json";

describe("GameModeManager", () => {
  let gameModeManager: GameModeManager;
  let weatherManager: WeatherManager;
  let seasonManager: SeasonManager;

  beforeEach(() => {
    const configLoader = WeatherConfigLoader.getInstance();
    const config = configLoader.loadFromData(defaultWeatherConfig);
    weatherManager = new WeatherManager(config);
    seasonManager = new SeasonManager();
    gameModeManager = new GameModeManager(weatherManager, seasonManager);
  });

  describe("Game Mode Registration and Management", () => {
    test("should initialize with default mode", () => {
      const availableModes = gameModeManager.getAvailableModes();
      expect(availableModes.length).toBeGreaterThanOrEqual(10);

      // Should have 12-month-campaign as current mode
      const currentMode = gameModeManager.getCurrentMode();
      expect(currentMode).toBeDefined();
      expect(currentMode!.name).toBe("12-month-campaign");
    });

    test("should register new game mode", () => {
      const testMode: GameMode = {
        name: "test-mode",
        description: "Test mode for unit testing",
        weatherRules: {
          weatherChangeFrequency: 2,
          allowPlayerWeatherControl: false,
          allowWeatherMixing: true,
          maxWeatherTypes: 3,
          weatherSource: "random",
        },
        turnLimit: 10,
      };

      const initialCount = gameModeManager.getAvailableModes().length;
      gameModeManager.registerGameMode(testMode);
      const availableModes = gameModeManager.getAvailableModes();
      expect(availableModes).toHaveLength(initialCount + 1);
      expect(
        availableModes.find((mode) => mode.name === "test-mode")
      ).toBeDefined();
    });

    test("should set current game mode", () => {
      const testMode: GameMode = {
        name: "test-mode",
        description: "Test mode",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: true,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "seasonal",
        },
        turnLimit: 12,
      };

      gameModeManager.registerGameMode(testMode);
      gameModeManager.setGameMode("test-mode");

      const currentMode = gameModeManager.getCurrentMode();
      expect(currentMode).toBeDefined();
      expect(currentMode!.name).toBe("test-mode");
    });

    test("should throw error when setting non-existent mode", () => {
      expect(() => {
        gameModeManager.setGameMode("non-existent-mode");
      }).toThrow("Game mode 'non-existent-mode' not found");
    });
  });

  describe("Weather Processing", () => {
    test("should process seasonal weather", () => {
      gameModeManager.setGameMode("12-month-campaign");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 6, // June (Summer)
        gameMode: "12-month-campaign",
        weatherHistory: [],
      };

      const weather = gameModeManager.processWeatherForTurn(gameState);
      expect(weather).toHaveLength(1);
      expect(weather[0]).toBeDefined();
    });

    test("should process random weather", () => {
      const randomMode: GameMode = {
        name: "random-mode",
        description: "Random weather mode",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: false,
          allowWeatherMixing: true,
          maxWeatherTypes: 3,
          weatherSource: "random",
        },
        turnLimit: 12,
      };

      gameModeManager.registerGameMode(randomMode);
      gameModeManager.setGameMode("random-mode");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "random-mode",
        weatherHistory: [],
      };

      const weather = gameModeManager.processWeatherForTurn(gameState);
      expect(weather.length).toBeGreaterThan(0);
      expect(weather.length).toBeLessThanOrEqual(3);
    });

    test("should process predetermined weather", () => {
      const forecastMode: GameMode = {
        name: "forecast-mode",
        description: "Predetermined weather mode",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: false,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "predetermined",
        },
        turnLimit: 3,
      };

      gameModeManager.registerGameMode(forecastMode);
      gameModeManager.setGameMode("forecast-mode");

      const predeterminedWeather: WeatherType[][] = [
        ["Sunny"],
        ["Rainy"],
        ["Snowy"],
      ];

      const gameState: GameState = {
        currentTurn: 2,
        currentMonth: 2,
        gameMode: "forecast-mode",
        weatherHistory: [["Sunny"]],
        predeterminedWeather,
      };

      const weather = gameModeManager.processWeatherForTurn(gameState);
      expect(weather).toEqual(["Rainy"]);
    });

    test("should respect weather change frequency", () => {
      const slowChangeMode: GameMode = {
        name: "slow-change-mode",
        description: "Weather changes every 3 turns",
        weatherRules: {
          weatherChangeFrequency: 3,
          allowPlayerWeatherControl: false,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "seasonal",
        },
        turnLimit: 12,
      };

      gameModeManager.registerGameMode(slowChangeMode);
      gameModeManager.setGameMode("slow-change-mode");

      // Mock current weather
      jest
        .spyOn(weatherManager, "getCurrentWeather")
        .mockReturnValue(["Sunny"]);

      const gameState: GameState = {
        currentTurn: 2, // Not divisible by 3
        currentMonth: 1,
        gameMode: "slow-change-mode",
        weatherHistory: [],
      };

      const weather = gameModeManager.processWeatherForTurn(gameState);
      expect(weather).toEqual(["Sunny"]); // Should return current weather
    });

    test("should limit weather types based on rules", () => {
      const limitedMode: GameMode = {
        name: "limited-mode",
        description: "Limited weather types",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: false,
          allowWeatherMixing: true,
          maxWeatherTypes: 2,
          weatherSource: "random",
        },
        turnLimit: 12,
      };

      gameModeManager.registerGameMode(limitedMode);
      gameModeManager.setGameMode("limited-mode");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "limited-mode",
        weatherHistory: [],
      };

      const weather = gameModeManager.processWeatherForTurn(gameState);
      expect(weather.length).toBeLessThanOrEqual(2);
    });

    test("should disable weather mixing when not allowed", () => {
      const noMixingMode: GameMode = {
        name: "no-mixing-mode",
        description: "No weather mixing allowed",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: false,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "random",
        },
        turnLimit: 12,
      };

      gameModeManager.registerGameMode(noMixingMode);
      gameModeManager.setGameMode("no-mixing-mode");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "no-mixing-mode",
        weatherHistory: [],
      };

      const weather = gameModeManager.processWeatherForTurn(gameState);
      expect(weather).toHaveLength(1);
    });

    test("should throw error when no mode is set", () => {
      // Reset to no mode
      gameModeManager.reset();

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "none",
        weatherHistory: [],
      };

      expect(() => {
        gameModeManager.processWeatherForTurn(gameState);
      }).toThrow("No game mode set");
    });
  });

  describe("Rule Validation", () => {
    test("should validate weather change actions", () => {
      const controlMode: GameMode = {
        name: "control-mode",
        description: "Player controlled weather",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: true,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "player-controlled",
        },
        turnLimit: 12,
      };

      gameModeManager.registerGameMode(controlMode);
      gameModeManager.setGameMode("control-mode");

      const weatherChangeAction: GameAction = {
        type: "weather_change",
        data: { newWeather: ["Sunny"] },
      };

      expect(gameModeManager.validateModeRules(weatherChangeAction)).toBe(true);
    });

    test("should reject weather change when not allowed", () => {
      const noControlMode: GameMode = {
        name: "no-control-mode",
        description: "No player weather control",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: false,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "seasonal",
        },
        turnLimit: 12,
      };

      gameModeManager.registerGameMode(noControlMode);
      gameModeManager.setGameMode("no-control-mode");

      const weatherChangeAction: GameAction = {
        type: "weather_change",
        data: { newWeather: ["Sunny"] },
      };

      expect(gameModeManager.validateModeRules(weatherChangeAction)).toBe(
        false
      );
    });

    test("should validate weather card plays", () => {
      gameModeManager.setGameMode("12-month-campaign"); // Campaign allows player control

      const cardPlayAction: GameAction = {
        type: "card_play",
        data: { cardType: "Weather", weather: "Sunny" },
      };

      expect(gameModeManager.validateModeRules(cardPlayAction)).toBe(true);
    });

    test("should reject weather card plays when not allowed", () => {
      const noControlMode: GameMode = {
        name: "no-control-mode",
        description: "No player weather control",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: false,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "seasonal",
        },
        turnLimit: 12,
      };

      gameModeManager.registerGameMode(noControlMode);
      gameModeManager.setGameMode("no-control-mode");

      const cardPlayAction: GameAction = {
        type: "card_play",
        data: { cardType: "Weather", weather: "Sunny" },
      };

      expect(gameModeManager.validateModeRules(cardPlayAction)).toBe(false);
    });

    test("should allow non-weather card plays regardless of control settings", () => {
      const noControlMode: GameMode = {
        name: "no-control-mode",
        description: "No player weather control",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: false,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "seasonal",
        },
        turnLimit: 12,
      };

      gameModeManager.registerGameMode(noControlMode);
      gameModeManager.setGameMode("no-control-mode");

      const cardPlayAction: GameAction = {
        type: "card_play",
        data: { cardType: "WeatherBuff", effect: { Fire: 10 } },
      };

      expect(gameModeManager.validateModeRules(cardPlayAction)).toBe(true);
    });

    test("should always allow turn advancement", () => {
      const turnAction: GameAction = {
        type: "turn_advance",
        data: {},
      };

      expect(gameModeManager.validateModeRules(turnAction)).toBe(true);
    });
  });

  describe("Game End Conditions", () => {
    test("should detect game end based on turn limit", () => {
      const shortMode: GameMode = {
        name: "short-mode",
        description: "Short game mode",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: true,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "seasonal",
        },
        turnLimit: 5,
      };

      gameModeManager.registerGameMode(shortMode);
      gameModeManager.setGameMode("short-mode");

      const gameState: GameState = {
        currentTurn: 5,
        currentMonth: 5,
        gameMode: "short-mode",
        weatherHistory: [],
      };

      expect(gameModeManager.shouldGameEnd(gameState)).toBe(true);
    });

    test("should not end game before turn limit", () => {
      const shortMode: GameMode = {
        name: "short-mode",
        description: "Short game mode",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: true,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "seasonal",
        },
        turnLimit: 5,
      };

      gameModeManager.registerGameMode(shortMode);
      gameModeManager.setGameMode("short-mode");

      const gameState: GameState = {
        currentTurn: 3,
        currentMonth: 3,
        gameMode: "short-mode",
        weatherHistory: [],
      };

      expect(gameModeManager.shouldGameEnd(gameState)).toBe(false);
    });
  });

  describe("Weather Schedule Generation", () => {
    test("should generate weather schedule for forecast mode", () => {
      const schedule = gameModeManager.generateWeatherSchedule(3);
      expect(schedule).toHaveLength(3);
      expect(schedule[0]).toHaveLength(1); // Each turn should have one weather type
      expect(schedule[1]).toHaveLength(1);
      expect(schedule[2]).toHaveLength(1);
    });

    test("should generate seasonal weather schedule", () => {
      const schedule = gameModeManager.generateWeatherSchedule(3, "Winter");
      expect(schedule).toHaveLength(3);

      // All weather should be winter-appropriate
      const allWeather = schedule.flat();
      const winterWeather = [
        "Cold",
        "Snowy",
        "Foggy",
        "Windy",
        "Cloudy",
        "Stormy",
      ];

      for (const weather of allWeather) {
        expect(winterWeather).toContain(weather);
      }
    });
  });

  describe("Special Rules", () => {
    test("should apply special rules when defined", () => {
      const mockEffect = jest.fn();
      const specialRuleMode: GameMode = {
        name: "special-rule-mode",
        description: "Mode with special rules",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: true,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "seasonal",
        },
        turnLimit: 12,
        specialRules: [
          {
            name: "test-rule",
            description: "Test special rule",
            effect: mockEffect,
          },
        ],
      };

      gameModeManager.registerGameMode(specialRuleMode);
      gameModeManager.setGameMode("special-rule-mode");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "special-rule-mode",
        weatherHistory: [],
      };

      gameModeManager.applySpecialRules(gameState);
      expect(mockEffect).toHaveBeenCalledWith(gameState);
    });

    test("should not apply special rules when none defined", () => {
      // Create a mode without special rules
      const simpleMode: GameMode = {
        name: "simple-mode",
        description: "Simple mode without special rules",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: true,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "seasonal",
        },
        turnLimit: 12,
      };

      gameModeManager.registerGameMode(simpleMode);
      gameModeManager.setGameMode("simple-mode");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "simple-mode",
        weatherHistory: [],
      };

      // Should not throw error
      expect(() => {
        gameModeManager.applySpecialRules(gameState);
      }).not.toThrow();
    });
  });

  describe("Utility Methods", () => {
    test("should get current weather rules", () => {
      gameModeManager.setGameMode("12-month-campaign");
      const rules = gameModeManager.getCurrentWeatherRules();

      expect(rules).toBeDefined();
      expect(rules!.weatherSource).toBe("seasonal");
      expect(rules!.allowPlayerWeatherControl).toBe(true);
    });

    test("should return null weather rules when no mode set", () => {
      gameModeManager.reset();
      const rules = gameModeManager.getCurrentWeatherRules();
      expect(rules).toBeNull();
    });

    test("should reset game mode manager", () => {
      gameModeManager.setGameMode("weather-chaos");
      expect(gameModeManager.getCurrentMode()).toBeDefined();
      expect(gameModeManager.getCurrentMode()!.name).toBe("weather-chaos");

      gameModeManager.reset();
      expect(gameModeManager.getCurrentMode()).toBeNull();
    });
  });

  describe("Error Handling", () => {
    test("should throw error for unknown weather source", () => {
      const invalidMode: GameMode = {
        name: "invalid-mode",
        description: "Invalid weather source mode",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: false,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "invalid" as unknown,
        },
        turnLimit: 12,
      };

      gameModeManager.registerGameMode(invalidMode);
      gameModeManager.setGameMode("invalid-mode");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "invalid-mode",
        weatherHistory: [],
      };

      expect(() => {
        gameModeManager.processWeatherForTurn(gameState);
      }).toThrow("Unknown weather source: invalid");
    });

    test("should throw error for predetermined weather without schedule", () => {
      const forecastMode: GameMode = {
        name: "forecast-mode",
        description: "Predetermined weather mode",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: false,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "predetermined",
        },
        turnLimit: 3,
      };

      gameModeManager.registerGameMode(forecastMode);
      gameModeManager.setGameMode("forecast-mode");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "forecast-mode",
        weatherHistory: [],
        // No predeterminedWeather provided
      };

      expect(() => {
        gameModeManager.processWeatherForTurn(gameState);
      }).toThrow("Predetermined weather not available for forecast mode");
    });

    test("should throw error for predetermined weather beyond schedule", () => {
      const forecastMode: GameMode = {
        name: "forecast-mode",
        description: "Predetermined weather mode",
        weatherRules: {
          weatherChangeFrequency: 1,
          allowPlayerWeatherControl: false,
          allowWeatherMixing: false,
          maxWeatherTypes: 1,
          weatherSource: "predetermined",
        },
        turnLimit: 3,
      };

      gameModeManager.registerGameMode(forecastMode);
      gameModeManager.setGameMode("forecast-mode");

      const gameState: GameState = {
        currentTurn: 5, // Beyond the schedule
        currentMonth: 5,
        gameMode: "forecast-mode",
        weatherHistory: [],
        predeterminedWeather: [["Sunny"], ["Rainy"]], // Only 2 turns scheduled
      };

      expect(() => {
        gameModeManager.processWeatherForTurn(gameState);
      }).toThrow("No predetermined weather available for this turn");
    });
  });
});
