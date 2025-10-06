/**
 * Specific Game Modes Tests
 */

import {
  ALL_GAME_MODES,
  TWELVE_MONTH_CAMPAIGN,
  WEATHER_CHAOS,
  FORECAST_MODE,
  WEATHER_SURVIVAL,
  BLITZ_MODE,
  ELEMENTAL_MASTERY,
  createSeasonalEventMode,
  getGameModeByName,
  getGameModesByCategory,
  validateGameModeForPlayers,
  getBeginnerGameModes,
  getAdvancedGameModes,
} from "../manager/game-modes";
import { GameModeManager, GameState } from "../manager/game-mode-manager";
import { WeatherManager } from "../manager/weather-manager";
import { SeasonManager } from "../manager/season-manager";
import { WeatherConfigLoader } from "../config/config-loader";
import { SeasonType, WeatherType } from "../types";
import defaultWeatherConfig from "../config/weather-effects.json";

describe("Game Modes", () => {
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

  describe("Game Mode Definitions", () => {
    test("should have all required game modes", () => {
      expect(ALL_GAME_MODES.length).toBeGreaterThanOrEqual(10);

      const modeNames = ALL_GAME_MODES.map((mode) => mode.name);
      expect(modeNames).toContain("12-month-campaign");
      expect(modeNames).toContain("weather-chaos");
      expect(modeNames).toContain("forecast-mode");
      expect(modeNames).toContain("weather-survival");
      expect(modeNames).toContain("blitz-mode");
      expect(modeNames).toContain("elemental-mastery");
    });

    test("should have seasonal event modes for all seasons", () => {
      const modeNames = ALL_GAME_MODES.map((mode) => mode.name);
      expect(modeNames).toContain("seasonal-event-spring");
      expect(modeNames).toContain("seasonal-event-summer");
      expect(modeNames).toContain("seasonal-event-autumn");
      expect(modeNames).toContain("seasonal-event-winter");
    });

    test("should find game modes by name", () => {
      const campaignMode = getGameModeByName("12-month-campaign");
      expect(campaignMode).toBeDefined();
      expect(campaignMode!.name).toBe("12-month-campaign");

      const nonExistentMode = getGameModeByName("non-existent-mode");
      expect(nonExistentMode).toBeUndefined();
    });
  });

  describe("12-Month Campaign Mode", () => {
    test("should have correct configuration", () => {
      expect(TWELVE_MONTH_CAMPAIGN.name).toBe("12-month-campaign");
      expect(TWELVE_MONTH_CAMPAIGN.turnLimit).toBe(12);
      expect(TWELVE_MONTH_CAMPAIGN.weatherRules.weatherSource).toBe("seasonal");
      expect(TWELVE_MONTH_CAMPAIGN.weatherRules.allowPlayerWeatherControl).toBe(
        true
      );
      expect(TWELVE_MONTH_CAMPAIGN.weatherRules.allowWeatherMixing).toBe(false);
      expect(TWELVE_MONTH_CAMPAIGN.weatherRules.maxWeatherTypes).toBe(1);
    });

    test("should process seasonal weather correctly", () => {
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

    test("should apply special rules", () => {
      gameModeManager.setGameMode("12-month-campaign");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "12-month-campaign",
        weatherHistory: [],
      };

      // Should not throw error when applying special rules
      expect(() => {
        gameModeManager.applySpecialRules(gameState);
      }).not.toThrow();
    });
  });

  describe("Weather Chaos Mode", () => {
    test("should have correct configuration", () => {
      expect(WEATHER_CHAOS.name).toBe("weather-chaos");
      expect(WEATHER_CHAOS.turnLimit).toBe(15);
      expect(WEATHER_CHAOS.weatherRules.weatherSource).toBe("random");
      expect(WEATHER_CHAOS.weatherRules.allowWeatherMixing).toBe(true);
      expect(WEATHER_CHAOS.weatherRules.maxWeatherTypes).toBe(5);
    });

    test("should generate random weather with mixing", () => {
      gameModeManager.setGameMode("weather-chaos");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "weather-chaos",
        weatherHistory: [],
      };

      const weather = gameModeManager.processWeatherForTurn(gameState);
      expect(weather.length).toBeGreaterThan(0);
      expect(weather.length).toBeLessThanOrEqual(5);
    });

    test("should have chaos-specific special rules", () => {
      expect(WEATHER_CHAOS.specialRules).toBeDefined();
      expect(WEATHER_CHAOS.specialRules!.length).toBe(2);

      const ruleNames = WEATHER_CHAOS.specialRules!.map((rule) => rule.name);
      expect(ruleNames).toContain("chaos-multiplier");
      expect(ruleNames).toContain("random-weather-burst");
    });
  });

  describe("Seasonal Event Modes", () => {
    test("should create seasonal event modes correctly", () => {
      const springMode = createSeasonalEventMode("Spring");
      expect(springMode.name).toBe("seasonal-event-spring");
      expect(springMode.description).toContain("Spring");
      expect(springMode.weatherRules.weatherSource).toBe("seasonal");
    });

    test("should process weather for forced season", () => {
      const winterMode = createSeasonalEventMode("Winter");
      gameModeManager.registerGameMode(winterMode);
      gameModeManager.setGameMode("seasonal-event-winter");

      const gameState: GameState = {
        currentTurn: 2, // Turn 2 to trigger weather change (frequency is 2)
        currentMonth: 6, // June, but should use Winter weather
        gameMode: "seasonal-event-winter",
        weatherHistory: [],
      };

      // Apply special rules first to set forced season
      gameModeManager.applySpecialRules(gameState);
      expect(gameState.forcedSeason).toBe("Winter");

      // Mock the current weather to be empty so weather change is triggered
      jest.spyOn(weatherManager, "getCurrentWeather").mockReturnValue([]);

      const weather = gameModeManager.processWeatherForTurn(gameState);
      expect(weather).toHaveLength(1);

      // Should be winter weather types
      const winterWeather = [
        "Cold",
        "Snowy",
        "Foggy",
        "Windy",
        "Cloudy",
        "Stormy",
      ];
      expect(winterWeather).toContain(weather[0]);
    });

    test("should apply seasonal lock special rule", () => {
      const summerMode = createSeasonalEventMode("Summer");
      gameModeManager.registerGameMode(summerMode);
      gameModeManager.setGameMode("seasonal-event-summer");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "seasonal-event-summer",
        weatherHistory: [],
      };

      gameModeManager.applySpecialRules(gameState);
      expect(gameState.forcedSeason).toBe("Summer");
    });
  });

  describe("Forecast Mode", () => {
    test("should have correct configuration", () => {
      expect(FORECAST_MODE.name).toBe("forecast-mode");
      expect(FORECAST_MODE.weatherRules.weatherSource).toBe("predetermined");
      expect(FORECAST_MODE.weatherRules.allowPlayerWeatherControl).toBe(false);
    });

    test("should process predetermined weather", () => {
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

    test("should apply forecast special rules", () => {
      gameModeManager.setGameMode("forecast-mode");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "forecast-mode",
        weatherHistory: [],
      };

      gameModeManager.applySpecialRules(gameState);
      expect(gameState.weatherVisible).toBe(true);
    });
  });

  describe("Weather Survival Mode", () => {
    test("should have correct configuration", () => {
      expect(WEATHER_SURVIVAL.name).toBe("weather-survival");
      expect(WEATHER_SURVIVAL.turnLimit).toBe(20);
      expect(WEATHER_SURVIVAL.weatherRules.weatherSource).toBe("random");
      expect(WEATHER_SURVIVAL.weatherRules.allowWeatherMixing).toBe(true);
      expect(WEATHER_SURVIVAL.weatherRules.maxWeatherTypes).toBe(3);
    });

    test("should apply weather intensity scaling", () => {
      gameModeManager.setGameMode("weather-survival");

      const gameState: GameState = {
        currentTurn: 9, // Turn 9 should have intensity multiplier
        currentMonth: 9,
        gameMode: "weather-survival",
        weatherHistory: [],
      };

      gameModeManager.applySpecialRules(gameState);
      expect(gameState.weatherIntensity).toBeGreaterThan(1);
      expect(gameState.weatherIntensity).toBe(1.15); // 1 + (floor(9/3) * 0.05) = 1.15
    });

    test("should trigger weather storms", () => {
      gameModeManager.setGameMode("weather-survival");

      const gameState: GameState = {
        currentTurn: 10, // Turn 10 should trigger storm
        currentMonth: 10,
        gameMode: "weather-survival",
        weatherHistory: [],
      };

      gameModeManager.applySpecialRules(gameState);
      expect(gameState.weatherStorm).toBe(true);
    });
  });

  describe("Blitz Mode", () => {
    test("should have correct configuration", () => {
      expect(BLITZ_MODE.name).toBe("blitz-mode");
      expect(BLITZ_MODE.turnLimit).toBe(8);
      expect(BLITZ_MODE.weatherRules.weatherSource).toBe("random");
      expect(BLITZ_MODE.weatherRules.maxWeatherTypes).toBe(2);
    });

    test("should apply rapid weather changes", () => {
      gameModeManager.setGameMode("blitz-mode");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "blitz-mode",
        weatherHistory: [],
      };

      gameModeManager.applySpecialRules(gameState);
      expect(gameState.rapidWeatherChanges).toBe(true);
      expect(gameState.turnTimeLimit).toBe(30);
    });
  });

  describe("Elemental Mastery Mode", () => {
    test("should have correct configuration", () => {
      expect(ELEMENTAL_MASTERY.name).toBe("elemental-mastery");
      expect(ELEMENTAL_MASTERY.turnLimit).toBe(15);
      expect(ELEMENTAL_MASTERY.weatherRules.weatherSource).toBe("seasonal");
      expect(ELEMENTAL_MASTERY.weatherRules.allowWeatherMixing).toBe(true);
      expect(ELEMENTAL_MASTERY.weatherRules.maxWeatherTypes).toBe(2);
    });

    test("should enable elemental mastery tracking", () => {
      gameModeManager.setGameMode("elemental-mastery");

      const gameState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "elemental-mastery",
        weatherHistory: [],
      };

      gameModeManager.applySpecialRules(gameState);
      expect(gameState.elementalMasteryTracking).toBe(true);
    });
  });

  describe("Game Mode Categories", () => {
    test("should categorize game modes correctly", () => {
      const campaignModes = getGameModesByCategory("campaign");
      expect(campaignModes).toHaveLength(1);
      expect(campaignModes[0].name).toBe("12-month-campaign");

      const chaosModes = getGameModesByCategory("chaos");
      expect(chaosModes).toHaveLength(1);
      expect(chaosModes[0].name).toBe("weather-chaos");

      const seasonalModes = getGameModesByCategory("seasonal");
      expect(seasonalModes).toHaveLength(4);
      expect(seasonalModes.map((m) => m.name)).toContain(
        "seasonal-event-spring"
      );

      const forecastModes = getGameModesByCategory("forecast");
      expect(forecastModes).toHaveLength(1);
      expect(forecastModes[0].name).toBe("forecast-mode");

      const survivalModes = getGameModesByCategory("survival");
      expect(survivalModes).toHaveLength(1);
      expect(survivalModes[0].name).toBe("weather-survival");

      const blitzModes = getGameModesByCategory("blitz");
      expect(blitzModes).toHaveLength(1);
      expect(blitzModes[0].name).toBe("blitz-mode");

      const masteryModes = getGameModesByCategory("mastery");
      expect(masteryModes).toHaveLength(1);
      expect(masteryModes[0].name).toBe("elemental-mastery");
    });
  });

  describe("Player Validation", () => {
    test("should validate player counts for different modes", () => {
      expect(validateGameModeForPlayers(TWELVE_MONTH_CAMPAIGN, 2)).toBe(true);
      expect(validateGameModeForPlayers(TWELVE_MONTH_CAMPAIGN, 4)).toBe(true);
      expect(validateGameModeForPlayers(TWELVE_MONTH_CAMPAIGN, 0)).toBe(false);
      expect(validateGameModeForPlayers(TWELVE_MONTH_CAMPAIGN, 7)).toBe(false);

      expect(validateGameModeForPlayers(BLITZ_MODE, 4)).toBe(true);
      expect(validateGameModeForPlayers(BLITZ_MODE, 5)).toBe(false);

      expect(validateGameModeForPlayers(WEATHER_SURVIVAL, 1)).toBe(false);
      expect(validateGameModeForPlayers(WEATHER_SURVIVAL, 2)).toBe(true);
    });
  });

  describe("Difficulty Categorization", () => {
    test("should categorize beginner modes", () => {
      const beginnerModes = getBeginnerGameModes();
      expect(beginnerModes.length).toBeGreaterThan(0);

      const beginnerNames = beginnerModes.map((mode) => mode.name);
      expect(beginnerNames).toContain("12-month-campaign");
      expect(beginnerNames).toContain("forecast-mode");
      expect(beginnerNames).toContain("seasonal-event-spring");
    });

    test("should categorize advanced modes", () => {
      const advancedModes = getAdvancedGameModes();
      expect(advancedModes.length).toBeGreaterThan(0);

      const advancedNames = advancedModes.map((mode) => mode.name);
      expect(advancedNames).toContain("weather-chaos");
      expect(advancedNames).toContain("weather-survival");
      expect(advancedNames).toContain("blitz-mode");
      expect(advancedNames).toContain("elemental-mastery");
    });
  });

  describe("Integration with GameModeManager", () => {
    test("should initialize with all game modes", () => {
      const availableModes = gameModeManager.getAvailableModes();
      expect(availableModes.length).toBe(ALL_GAME_MODES.length);
    });

    test("should set default mode to 12-month campaign", () => {
      const currentMode = gameModeManager.getCurrentMode();
      expect(currentMode).toBeDefined();
      expect(currentMode!.name).toBe("12-month-campaign");
    });

    test("should switch between different game modes", () => {
      gameModeManager.setGameMode("weather-chaos");
      expect(gameModeManager.getCurrentMode()!.name).toBe("weather-chaos");

      gameModeManager.setGameMode("forecast-mode");
      expect(gameModeManager.getCurrentMode()!.name).toBe("forecast-mode");

      gameModeManager.setGameMode("seasonal-event-winter");
      expect(gameModeManager.getCurrentMode()!.name).toBe(
        "seasonal-event-winter"
      );
    });

    test("should generate weather schedules for different modes", () => {
      // Test forecast mode schedule generation
      const schedule = gameModeManager.generateWeatherSchedule(5);
      expect(schedule).toHaveLength(5);
      expect(schedule[0]).toHaveLength(1);

      // Test seasonal schedule generation
      const winterSchedule = gameModeManager.generateWeatherSchedule(
        3,
        "Winter"
      );
      expect(winterSchedule).toHaveLength(3);

      const allWeather = winterSchedule.flat();
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

  describe("Special Rule Execution", () => {
    test("should execute special rules without errors", () => {
      for (const mode of ALL_GAME_MODES) {
        if (mode.specialRules) {
          gameModeManager.registerGameMode(mode);
          gameModeManager.setGameMode(mode.name);

          const gameState: GameState = {
            currentTurn: 5,
            currentMonth: 5,
            gameMode: mode.name,
            weatherHistory: [],
          };

          expect(() => {
            gameModeManager.applySpecialRules(gameState);
          }).not.toThrow();
        }
      }
    });

    test("should modify game state through special rules", () => {
      // Test seasonal event mode
      gameModeManager.setGameMode("seasonal-event-autumn");
      const autumnState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "seasonal-event-autumn",
        weatherHistory: [],
      };

      gameModeManager.applySpecialRules(autumnState);
      expect(autumnState.forcedSeason).toBe("Autumn");

      // Test forecast mode
      gameModeManager.setGameMode("forecast-mode");
      const forecastState: GameState = {
        currentTurn: 1,
        currentMonth: 1,
        gameMode: "forecast-mode",
        weatherHistory: [],
      };

      gameModeManager.applySpecialRules(forecastState);
      expect(forecastState.weatherVisible).toBe(true);

      // Test survival mode
      gameModeManager.setGameMode("weather-survival");
      const survivalState: GameState = {
        currentTurn: 6,
        currentMonth: 6,
        gameMode: "weather-survival",
        weatherHistory: [],
      };

      gameModeManager.applySpecialRules(survivalState);
      expect(survivalState.weatherIntensity).toBeGreaterThan(1);
    });
  });
});
