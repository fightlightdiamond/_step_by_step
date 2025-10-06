/**
 * End-to-End Integration Tests for Complete Weather System
 * Tests full game scenarios, performance, stress testing, and all game mode combinations
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { WeatherManager } from "../manager/weather-manager";
import { SeasonManager } from "../manager/season-manager";
import { WeatherCardManager } from "../manager/weather-card-manager";
import { GameModeManager } from "../manager/game-mode-manager";
import { IntegratedWeatherManager } from "../manager/integrated-weather-manager";
import { WeatherConfigLoader } from "../config/config-loader";
import { WeatherType, WeatherCard, GameMode } from "../types";
import defaultWeatherConfig from "../config/weather-effects.json";

describe("End-to-End Weather System Integration", () => {
  let integratedManager: IntegratedWeatherManager;
  let config: any;

  beforeEach(() => {
    const configLoader = WeatherConfigLoader.getInstance();
    config = configLoader.loadFromData(defaultWeatherConfig);
    integratedManager = new IntegratedWeatherManager(config);
  });

  describe("Full Game Scenarios", () => {
    it("should handle complete 12-month campaign game", async () => {
      // Initialize 12-month campaign mode
      integratedManager.setGameMode("12-month-campaign");

      const gameHistory = [];
      const playerActions = [];

      // Simulate 12 turns representing 12 months
      for (let turn = 1; turn <= 12; turn++) {
        const month = turn;

        // Start turn with seasonal weather
        const turnStart = Date.now();
        integratedManager.startTurn(turn, month);

        const currentWeather = integratedManager.getCurrentWeather();
        const season = integratedManager.getCurrentSeason();

        // Verify seasonal appropriateness
        expect(currentWeather).toBeDefined();
        expect(season).toBeDefined();

        // Simulate player actions during turn
        const playerAction = await simulatePlayerTurn(integratedManager, turn);
        playerActions.push(playerAction);

        // Calculate elemental effects for combat
        const elementalEffects =
          integratedManager.calculateElementalModifiers();
        expect(elementalEffects).toHaveProperty("Fire");
        expect(elementalEffects).toHaveProperty("Ice");
        expect(elementalEffects).toHaveProperty("Lightning");

        // Record turn history
        gameHistory.push({
          turn,
          month,
          season,
          weather: [...currentWeather],
          elementalEffects: { ...elementalEffects },
          playerAction,
          duration: Date.now() - turnStart,
        });

        // End turn
        integratedManager.endTurn();
      }

      // Verify complete game state
      expect(gameHistory).toHaveLength(12);
      expect(playerActions).toHaveLength(12);

      // Verify seasonal distribution
      const seasons = gameHistory.map((h) => h.season);
      expect(seasons.filter((s) => s === "Winter")).toHaveLength(3);
      expect(seasons.filter((s) => s === "Spring")).toHaveLength(3);
      expect(seasons.filter((s) => s === "Summer")).toHaveLength(3);
      expect(seasons.filter((s) => s === "Autumn")).toHaveLength(3);

      // Verify performance (each turn should complete quickly)
      const avgTurnDuration =
        gameHistory.reduce((sum, h) => sum + h.duration, 0) / 12;
      expect(avgTurnDuration).toBeLessThan(100); // Less than 100ms per turn
    });

    it("should handle weather chaos mode with complex interactions", async () => {
      integratedManager.setGameMode("weather-chaos");

      const chaosResults = [];

      // Run 20 turns of weather chaos
      for (let turn = 1; turn <= 20; turn++) {
        integratedManager.startTurn(turn);

        const weather = integratedManager.getCurrentWeather();
        const isValid = integratedManager.validateCurrentWeather();

        // In chaos mode, weather should be mixed but still valid
        expect(weather.length).toBeGreaterThanOrEqual(2);
        expect(weather.length).toBeLessThanOrEqual(5);
        expect(isValid).toBe(true);

        // Test card interactions in chaotic weather
        const testCard: WeatherCard = {
          id: `chaos-card-${turn}`,
          type: "Weather",
          name: "Chaos Weather Card",
          description: "Test card for chaos mode",
          weather: "Sunny",
        };

        const canPlay = integratedManager.canPlayCard(testCard);
        if (canPlay) {
          integratedManager.playCard(testCard);
        }

        chaosResults.push({
          turn,
          weatherCount: weather.length,
          weatherTypes: [...weather],
          cardPlayed: canPlay,
          elementalEffects: integratedManager.calculateElementalModifiers(),
        });

        integratedManager.endTurn();
      }

      // Verify chaos mode characteristics
      expect(chaosResults).toHaveLength(20);

      // Should have variety in weather combinations
      const uniqueCombinations = new Set(
        chaosResults.map((r) => r.weatherTypes.sort().join(","))
      );
      expect(uniqueCombinations.size).toBeGreaterThan(10);

      // Should have mixed weather counts
      const weatherCounts = chaosResults.map((r) => r.weatherCount);
      expect(Math.max(...weatherCounts)).toBeGreaterThan(2);
    });

    it("should handle weather survival mode with continuous changes", async () => {
      integratedManager.setGameMode("weather-survival");

      const survivalData = [];
      let consecutiveChanges = 0;
      let previousWeather: WeatherType[] = [];

      // Run survival mode for 30 turns
      for (let turn = 1; turn <= 30; turn++) {
        integratedManager.startTurn(turn);

        const currentWeather = integratedManager.getCurrentWeather();

        // Check if weather changed from previous turn
        const weatherChanged = !arraysEqual(currentWeather, previousWeather);
        if (weatherChanged) {
          consecutiveChanges++;
        }

        // Test player adaptation to changing weather
        const adaptationResult = await testPlayerAdaptation(
          integratedManager,
          currentWeather
        );

        survivalData.push({
          turn,
          weather: [...currentWeather],
          weatherChanged,
          adaptationSuccess: adaptationResult.success,
          adaptationScore: adaptationResult.score,
        });

        previousWeather = [...currentWeather];
        integratedManager.endTurn();
      }

      // Verify survival mode characteristics
      expect(survivalData).toHaveLength(30);

      // Should have frequent weather changes (at least 50% of turns)
      const changesCount = survivalData.filter((d) => d.weatherChanged).length;
      expect(changesCount).toBeGreaterThan(15);

      // Should challenge player adaptation
      const avgAdaptationScore =
        survivalData.reduce((sum, d) => sum + d.adaptationScore, 0) / 30;
      expect(avgAdaptationScore).toBeGreaterThan(0.3); // Some success but challenging
    });
  });

  describe("Performance Tests", () => {
    it("should handle rapid weather calculations efficiently", () => {
      const iterations = 1000;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        const randomWeather = generateRandomWeatherCombination();
        integratedManager.applyWeather(randomWeather);
        integratedManager.calculateElementalModifiers();
        integratedManager.validateCurrentWeather();
      }

      const duration = Date.now() - startTime;
      const avgTimePerOperation = duration / iterations;

      // Should average less than 1ms per operation
      expect(avgTimePerOperation).toBeLessThan(1);
      expect(duration).toBeLessThan(1000); // Total under 1 second
    });

    it("should handle concurrent weather operations", async () => {
      const concurrentOperations = 50;
      const promises = [];

      for (let i = 0; i < concurrentOperations; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            setTimeout(() => {
              const weather = generateRandomWeatherCombination();
              integratedManager.applyWeather(weather);
              const effects = integratedManager.calculateElementalModifiers();
              expect(effects).toBeDefined();
              resolve();
            }, Math.random() * 10);
          })
        );
      }

      const startTime = Date.now();
      await Promise.all(promises);
      const duration = Date.now() - startTime;

      // Should complete all concurrent operations quickly
      expect(duration).toBeLessThan(500);
    });

    it("should maintain performance with large weather histories", () => {
      // Build up large weather history
      for (let i = 0; i < 500; i++) {
        integratedManager.startTurn(i + 1);
        const weather = generateRandomWeatherCombination();
        integratedManager.applyWeather(weather);
        integratedManager.endTurn();
      }

      // Test performance with large history
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        integratedManager.getWeatherHistory(50);
        integratedManager.calculateElementalModifiers();
        integratedManager.predictNextWeather();
      }

      const duration = Date.now() - startTime;

      // Should maintain performance even with large history
      expect(duration).toBeLessThan(200);
    });
  });

  describe("Stress Tests", () => {
    it("should handle extended gameplay sessions without memory leaks", () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Simulate 1000 turns of gameplay
      for (let turn = 1; turn <= 1000; turn++) {
        integratedManager.startTurn(turn);

        // Apply random weather
        const weather = generateRandomWeatherCombination();
        integratedManager.applyWeather(weather);

        // Play random cards
        const card = generateRandomWeatherCard(turn);
        if (integratedManager.canPlayCard(card)) {
          integratedManager.playCard(card);
        }

        // Calculate effects
        integratedManager.calculateElementalModifiers();

        // End turn and cleanup
        integratedManager.endTurn();

        // Force garbage collection periodically
        if (turn % 100 === 0 && global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it("should handle extreme weather combinations gracefully", () => {
      const extremeCombinations = [
        // Maximum weather types
        ["Sunny", "Hot", "Humid", "Warm", "Cloudy"],
        // Potentially conflicting but valid
        ["Rainy", "Windy", "Stormy", "Cloudy"],
        // Edge cases
        ["Foggy", "Cool", "Windy"],
        // Single weather
        ["Snowy"],
        // Empty (should default)
        [],
      ];

      extremeCombinations.forEach((combination, index) => {
        expect(() => {
          integratedManager.applyWeather(combination);
          const effects = integratedManager.calculateElementalModifiers();
          expect(effects).toBeDefined();
        }).not.toThrow(
          `Failed on combination ${index}: ${combination.join(", ")}`
        );
      });
    });

    it("should recover from error conditions", () => {
      // Test recovery from invalid states
      const originalWeather = integratedManager.getCurrentWeather();

      // Force invalid state (if possible)
      try {
        integratedManager.applyWeather(["Hot", "Cold"]); // Should fail
      } catch (error) {
        // Should maintain previous valid state
        expect(integratedManager.getCurrentWeather()).toEqual(originalWeather);
      }

      // Test recovery from corrupted config
      const corruptedManager = new IntegratedWeatherManager({
        ...config,
        weatherEffects: {}, // Corrupted
      });

      expect(() => {
        corruptedManager.applyWeather(["Sunny"]);
      }).not.toThrow(); // Should handle gracefully
    });
  });

  describe("All Game Mode Combinations", () => {
    const gameModes = [
      "12-month-campaign",
      "weather-chaos",
      "seasonal-event",
      "forecast-mode",
      "weather-survival",
    ];

    gameModes.forEach((mode) => {
      it(`should handle ${mode} mode completely`, () => {
        integratedManager.setGameMode(mode);

        // Test mode-specific behavior
        for (let turn = 1; turn <= 10; turn++) {
          integratedManager.startTurn(turn);

          const weather = integratedManager.getCurrentWeather();
          expect(weather).toBeDefined();

          // Verify mode-specific constraints
          switch (mode) {
            case "12-month-campaign":
              // Should follow seasonal patterns
              const season = integratedManager.getCurrentSeason();
              expect(season).toBeDefined();
              break;

            case "weather-chaos":
              // Should have multiple weather types
              expect(weather.length).toBeGreaterThanOrEqual(2);
              break;

            case "seasonal-event":
              // Should be restricted to one season
              const eventSeason = integratedManager.getCurrentSeason();
              expect(eventSeason).toBeDefined();
              break;

            case "forecast-mode":
              // Should have predictable weather
              const forecast = integratedManager.getWeatherForecast(5);
              expect(forecast).toHaveLength(5);
              break;

            case "weather-survival":
              // Should change frequently
              if (turn > 1) {
                // Weather should potentially change each turn
                expect(weather).toBeDefined();
              }
              break;
          }

          integratedManager.endTurn();
        }
      });
    });

    it("should handle mode transitions correctly", () => {
      const transitionResults = [];

      gameModes.forEach((fromMode, fromIndex) => {
        gameModes.forEach((toMode, toIndex) => {
          if (fromIndex !== toIndex) {
            // Test transition from one mode to another
            integratedManager.setGameMode(fromMode);
            integratedManager.startTurn(1);
            const beforeWeather = integratedManager.getCurrentWeather();

            integratedManager.setGameMode(toMode);
            const afterWeather = integratedManager.getCurrentWeather();

            transitionResults.push({
              from: fromMode,
              to: toMode,
              weatherChanged: !arraysEqual(beforeWeather, afterWeather),
              beforeWeather: [...beforeWeather],
              afterWeather: [...afterWeather],
            });

            integratedManager.endTurn();
          }
        });
      });

      expect(transitionResults.length).toBe(
        gameModes.length * (gameModes.length - 1)
      );

      // All transitions should complete without errors
      transitionResults.forEach((result) => {
        expect(result.beforeWeather).toBeDefined();
        expect(result.afterWeather).toBeDefined();
      });
    });
  });

  describe("Integration Validation", () => {
    it("should maintain data consistency across all components", () => {
      // Test that all components stay in sync
      integratedManager.startTurn(1, 6); // June

      const weatherManager = integratedManager.getWeatherManager();
      const seasonManager = integratedManager.getSeasonManager();
      const cardManager = integratedManager.getCardManager();
      const gameModeManager = integratedManager.getGameModeManager();

      // All components should report consistent state
      const weather = weatherManager.getCurrentWeather();
      const season = seasonManager.getSeasonForMonth(6);
      const gameMode = gameModeManager.getCurrentMode();

      expect(weather).toEqual(integratedManager.getCurrentWeather());
      expect(season).toBe("Summer");
      expect(gameMode).toBeDefined();

      // Apply weather change and verify all components update
      const newWeather: WeatherType[] = ["Hot", "Sunny"];
      integratedManager.applyWeather(newWeather);

      expect(weatherManager.getCurrentWeather()).toEqual(newWeather);
      expect(integratedManager.getCurrentWeather()).toEqual(newWeather);
    });

    it("should handle complex interaction scenarios", () => {
      // Scenario: Player plays weather card during seasonal event in chaos mode
      integratedManager.setGameMode("weather-chaos");
      integratedManager.startTurn(1);

      const initialWeather = integratedManager.getCurrentWeather();

      // Play a weather card
      const card: WeatherCard = {
        id: "test-card",
        type: "Weather",
        name: "Test Weather Card",
        description: "Changes weather to Sunny",
        weather: "Sunny",
      };

      if (integratedManager.canPlayCard(card)) {
        integratedManager.playCard(card);

        const newWeather = integratedManager.getCurrentWeather();
        expect(newWeather).toContain("Sunny");

        // Verify elemental effects are updated
        const effects = integratedManager.calculateElementalModifiers();
        expect(effects.Fire).toBeGreaterThan(0); // Sunny should boost Fire
      }

      integratedManager.endTurn();
    });
  });
});

// Helper functions
async function simulatePlayerTurn(
  manager: IntegratedWeatherManager,
  turn: number
) {
  // Simulate various player actions during a turn
  const actions = [];

  // 50% chance to play a weather card
  if (Math.random() < 0.5) {
    const card = generateRandomWeatherCard(turn);
    if (manager.canPlayCard(card)) {
      manager.playCard(card);
      actions.push({ type: "card_played", card: card.name });
    }
  }

  // Simulate combat with elemental calculations
  const effects = manager.calculateElementalModifiers();
  const combatResult = {
    fireBonus: effects.Fire,
    iceBonus: effects.Ice,
    lightningBonus: effects.Lightning,
  };
  actions.push({ type: "combat", effects: combatResult });

  return {
    turn,
    actions,
    totalActions: actions.length,
  };
}

async function testPlayerAdaptation(
  manager: IntegratedWeatherManager,
  weather: WeatherType[]
) {
  // Simulate player trying to adapt to current weather conditions
  const effects = manager.calculateElementalModifiers();

  // Calculate adaptation score based on weather effects
  const totalEffects =
    Math.abs(effects.Fire) +
    Math.abs(effects.Ice) +
    Math.abs(effects.Lightning);
  const adaptationScore = Math.min(1, totalEffects / 60); // Normalize to 0-1

  return {
    success: adaptationScore > 0.3,
    score: adaptationScore,
    weather: [...weather],
    effects,
  };
}

function generateRandomWeatherCombination(): WeatherType[] {
  const allWeather: WeatherType[] = [
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

  const count = Math.floor(Math.random() * 3) + 1; // 1-3 weather types
  const selected = [];

  for (let i = 0; i < count; i++) {
    const weather = allWeather[Math.floor(Math.random() * allWeather.length)];
    if (!selected.includes(weather)) {
      selected.push(weather);
    }
  }

  return selected;
}

function generateRandomWeatherCard(id: number): WeatherCard {
  const weatherTypes: WeatherType[] = [
    "Sunny",
    "Rainy",
    "Stormy",
    "Hot",
    "Cold",
    "Windy",
  ];

  return {
    id: `test-card-${id}`,
    type: "Weather",
    name: `Test Card ${id}`,
    description: `Test weather card ${id}`,
    weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
  };
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}
