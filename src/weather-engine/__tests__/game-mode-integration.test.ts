/**
 * Comprehensive Game Mode Integration Tests
 * Tests all game mode combinations and interactions
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { IntegratedWeatherManager } from "../manager/integrated-weather-manager";
import { GameModeManager } from "../manager/game-mode-manager";
import { WeatherConfigLoader } from "../config/config-loader";
import { WeatherType, WeatherCard, GameMode } from "../types";
import defaultWeatherConfig from "../config/weather-effects.json";

describe("Game Mode Integration Tests", () => {
  let integratedManager: IntegratedWeatherManager;
  let gameModeManager: GameModeManager;
  let config: any;

  beforeEach(() => {
    const configLoader = WeatherConfigLoader.getInstance();
    config = configLoader.loadFromData(defaultWeatherConfig);
    integratedManager = new IntegratedWeatherManager(config);
    gameModeManager = new GameModeManager();
  });

  describe("12-Month Campaign Mode", () => {
    beforeEach(() => {
      integratedManager.setGameMode("12-month-campaign");
    });

    it("should progress through all 12 months with appropriate seasonal weather", () => {
      const campaignData = [];

      for (let month = 1; month <= 12; month++) {
        integratedManager.startTurn(month, month);

        const weather = integratedManager.getCurrentWeather();
        const season = integratedManager.getCurrentSeason();
        const elementalEffects =
          integratedManager.calculateElementalModifiers();

        campaignData.push({
          month,
          season,
          weather: [...weather],
          elementalEffects: { ...elementalEffects },
        });

        // Verify seasonal appropriateness
        switch (season) {
          case "Winter":
            expect(["December", "January", "February"]).toContain(
              getMonthName(month)
            );
            // Winter weather should not include hot weather
            expect(weather).not.toContain("Hot");
            expect(weather).not.toContain("Humid");
            break;

          case "Spring":
            expect(["March", "April", "May"]).toContain(getMonthName(month));
            // Spring should have transitional weather
            break;

          case "Summer":
            expect(["June", "July", "August"]).toContain(getMonthName(month));
            // Summer weather should not include cold weather
            expect(weather).not.toContain("Cold");
            expect(weather).not.toContain("Snowy");
            break;

          case "Autumn":
            expect(["September", "October", "November"]).toContain(
              getMonthName(month)
            );
            // Autumn should have transitional weather
            break;
        }

        integratedManager.endTurn();
      }

      // Verify complete campaign
      expect(campaignData).toHaveLength(12);

      // Verify seasonal distribution
      const seasons = campaignData.map((d) => d.season);
      expect(seasons.filter((s) => s === "Winter")).toHaveLength(3);
      expect(seasons.filter((s) => s === "Spring")).toHaveLength(3);
      expect(seasons.filter((s) => s === "Summer")).toHaveLength(3);
      expect(seasons.filter((s) => s === "Autumn")).toHaveLength(3);
    });

    it("should handle player weather cards within seasonal constraints", () => {
      const cardPlayResults = [];

      for (let month = 1; month <= 12; month++) {
        integratedManager.startTurn(month, month);

        const season = integratedManager.getCurrentSeason();

        // Test season-appropriate cards
        const seasonalCard = createSeasonalCard(season, month);
        const canPlaySeasonal = integratedManager.canPlayCard(seasonalCard);

        if (canPlaySeasonal) {
          integratedManager.playCard(seasonalCard);
        }

        // Test season-inappropriate cards
        const inappropriateCard = createInappropriateSeasonalCard(
          season,
          month
        );
        const canPlayInappropriate =
          integratedManager.canPlayCard(inappropriateCard);

        cardPlayResults.push({
          month,
          season,
          seasonalCardPlayed: canPlaySeasonal,
          inappropriateCardBlocked: !canPlayInappropriate,
        });

        integratedManager.endTurn();
      }

      // Most seasonal cards should be playable
      const seasonalSuccessRate =
        cardPlayResults.filter((r) => r.seasonalCardPlayed).length / 12;
      expect(seasonalSuccessRate).toBeGreaterThan(0.7);

      // Most inappropriate cards should be blocked
      const blockingRate =
        cardPlayResults.filter((r) => r.inappropriateCardBlocked).length / 12;
      expect(blockingRate).toBeGreaterThan(0.5);
    });

    it("should maintain campaign progression state", () => {
      const progressionStates = [];

      for (let month = 1; month <= 12; month++) {
        integratedManager.startTurn(month, month);

        const state = {
          month,
          turn: month,
          weather: integratedManager.getCurrentWeather(),
          season: integratedManager.getCurrentSeason(),
          history: integratedManager.getWeatherHistory(3),
        };

        progressionStates.push(state);
        integratedManager.endTurn();
      }

      // Verify progression continuity
      for (let i = 1; i < progressionStates.length; i++) {
        const prev = progressionStates[i - 1];
        const current = progressionStates[i];

        expect(current.month).toBe(prev.month + 1);
        expect(current.turn).toBe(prev.turn + 1);

        // History should include previous weather
        expect(current.history.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Weather Chaos Mode", () => {
    beforeEach(() => {
      integratedManager.setGameMode("weather-chaos");
    });

    it("should generate chaotic but valid weather combinations", () => {
      const chaosResults = [];

      for (let turn = 1; turn <= 50; turn++) {
        integratedManager.startTurn(turn);

        const weather = integratedManager.getCurrentWeather();
        const isValid = integratedManager.validateCurrentWeather();
        const elementalEffects =
          integratedManager.calculateElementalModifiers();

        chaosResults.push({
          turn,
          weatherCount: weather.length,
          weather: [...weather],
          isValid,
          elementalEffects: { ...elementalEffects },
          totalEffect:
            Math.abs(elementalEffects.Fire) +
            Math.abs(elementalEffects.Ice) +
            Math.abs(elementalEffects.Lightning),
        });

        integratedManager.endTurn();
      }

      // All weather should be valid despite chaos
      expect(chaosResults.every((r) => r.isValid)).toBe(true);

      // Should have variety in weather combinations
      const uniqueCombinations = new Set(
        chaosResults.map((r) => r.weather.sort().join(","))
      );
      expect(uniqueCombinations.size).toBeGreaterThan(20);

      // Should have mixed weather counts (chaos should create complexity)
      const weatherCounts = chaosResults.map((r) => r.weatherCount);
      expect(Math.max(...weatherCounts)).toBeGreaterThan(2);
      expect(Math.min(...weatherCounts)).toBeGreaterThanOrEqual(1);

      // Should create significant elemental effects
      const avgTotalEffect =
        chaosResults.reduce((sum, r) => sum + r.totalEffect, 0) /
        chaosResults.length;
      expect(avgTotalEffect).toBeGreaterThan(20);
    });

    it("should handle card interactions in chaotic weather", () => {
      const cardInteractions = [];

      for (let turn = 1; turn <= 30; turn++) {
        integratedManager.startTurn(turn);

        const initialWeather = integratedManager.getCurrentWeather();

        // Try to play various types of cards
        const weatherCard = createRandomWeatherCard(turn);
        const breakCard = createBreakWeatherCard(turn);

        const weatherCardResult = {
          canPlay: integratedManager.canPlayCard(weatherCard),
          played: false,
        };

        if (weatherCardResult.canPlay) {
          integratedManager.playCard(weatherCard);
          weatherCardResult.played = true;
        }

        const breakCardResult = {
          canPlay: integratedManager.canPlayCard(breakCard),
          played: false,
        };

        if (breakCardResult.canPlay) {
          integratedManager.playCard(breakCard);
          breakCardResult.played = true;
        }

        const finalWeather = integratedManager.getCurrentWeather();

        cardInteractions.push({
          turn,
          initialWeather: [...initialWeather],
          finalWeather: [...finalWeather],
          weatherCard: weatherCardResult,
          breakCard: breakCardResult,
          weatherChanged: !arraysEqual(initialWeather, finalWeather),
        });

        integratedManager.endTurn();
      }

      // Some cards should be playable in chaos mode
      const playableWeatherCards = cardInteractions.filter(
        (i) => i.weatherCard.played
      ).length;
      const playableBreakCards = cardInteractions.filter(
        (i) => i.breakCard.played
      ).length;

      expect(playableWeatherCards).toBeGreaterThan(5);
      expect(playableBreakCards).toBeGreaterThan(3);

      // Cards should cause weather changes when played
      const changesFromCards = cardInteractions.filter(
        (i) => i.weatherChanged && (i.weatherCard.played || i.breakCard.played)
      ).length;
      expect(changesFromCards).toBeGreaterThan(3);
    });
  });

  describe("Seasonal Event Mode", () => {
    const seasons = ["Winter", "Spring", "Summer", "Autumn"] as const;

    seasons.forEach((season) => {
      it(`should restrict weather to ${season} season only`, () => {
        integratedManager.setGameMode("seasonal-event");
        gameModeManager.setSeasonalEventSeason(season);

        const eventResults = [];

        for (let turn = 1; turn <= 20; turn++) {
          integratedManager.startTurn(turn);

          const weather = integratedManager.getCurrentWeather();
          const currentSeason = integratedManager.getCurrentSeason();

          // Should be restricted to the event season
          expect(currentSeason).toBe(season);

          // Weather should be appropriate for the season
          verifySeasonalWeather(weather, season);

          eventResults.push({
            turn,
            season: currentSeason,
            weather: [...weather],
          });

          integratedManager.endTurn();
        }

        // All turns should be in the same season
        expect(eventResults.every((r) => r.season === season)).toBe(true);

        // Should still have weather variety within the season
        const uniqueWeather = new Set(
          eventResults.map((r) => r.weather.join(","))
        );
        expect(uniqueWeather.size).toBeGreaterThan(3);
      });
    });

    it("should handle season transitions in event mode", () => {
      const transitionResults = [];

      seasons.forEach((fromSeason, fromIndex) => {
        seasons.forEach((toSeason, toIndex) => {
          if (fromIndex !== toIndex) {
            integratedManager.setGameMode("seasonal-event");
            gameModeManager.setSeasonalEventSeason(fromSeason);
            integratedManager.startTurn(1);

            const beforeWeather = integratedManager.getCurrentWeather();
            const beforeSeason = integratedManager.getCurrentSeason();

            // Transition to new season
            gameModeManager.setSeasonalEventSeason(toSeason);

            const afterWeather = integratedManager.getCurrentWeather();
            const afterSeason = integratedManager.getCurrentSeason();

            transitionResults.push({
              from: fromSeason,
              to: toSeason,
              beforeSeason,
              afterSeason,
              weatherChanged: !arraysEqual(beforeWeather, afterWeather),
            });

            integratedManager.endTurn();
          }
        });
      });

      // All transitions should update the season
      expect(transitionResults.every((r) => r.afterSeason === r.to)).toBe(true);

      // Most transitions should change weather
      const weatherChangeRate =
        transitionResults.filter((r) => r.weatherChanged).length /
        transitionResults.length;
      expect(weatherChangeRate).toBeGreaterThan(0.5);
    });
  });

  describe("Forecast Mode", () => {
    beforeEach(() => {
      integratedManager.setGameMode("forecast-mode");
    });

    it("should provide accurate weather forecasts", () => {
      const forecastAccuracy = [];

      for (let turn = 1; turn <= 20; turn++) {
        integratedManager.startTurn(turn);

        // Get forecast for next 5 turns
        const forecast = integratedManager.getWeatherForecast(5);
        expect(forecast).toHaveLength(5);

        // Verify forecast structure
        forecast.forEach((forecastItem, index) => {
          expect(forecastItem).toHaveProperty("turn", turn + index + 1);
          expect(forecastItem).toHaveProperty("weather");
          expect(forecastItem).toHaveProperty("probability");
          expect(forecastItem.weather).toBeDefined();
          expect(forecastItem.probability).toBeGreaterThan(0);
          expect(forecastItem.probability).toBeLessThanOrEqual(1);
        });

        forecastAccuracy.push({
          turn,
          forecast: forecast.map((f) => ({ ...f })),
        });

        integratedManager.endTurn();
      }

      // Forecasts should be consistent and reasonable
      expect(forecastAccuracy).toHaveLength(20);

      // Each forecast should have reasonable probabilities
      forecastAccuracy.forEach(({ forecast }) => {
        const avgProbability =
          forecast.reduce((sum, f) => sum + f.probability, 0) / forecast.length;
        expect(avgProbability).toBeGreaterThan(0.1);
        expect(avgProbability).toBeLessThan(1);
      });
    });

    it("should allow strategic planning based on forecasts", () => {
      const strategicPlanning = [];

      for (let turn = 1; turn <= 15; turn++) {
        integratedManager.startTurn(turn);

        const forecast = integratedManager.getWeatherForecast(3);
        const currentWeather = integratedManager.getCurrentWeather();

        // Plan strategy based on forecast
        const strategy = planStrategyFromForecast(forecast, currentWeather);

        // Execute strategy
        const strategyResult = executeStrategy(integratedManager, strategy);

        strategicPlanning.push({
          turn,
          forecast: forecast.map((f) => ({ ...f })),
          strategy,
          result: strategyResult,
        });

        integratedManager.endTurn();
      }

      // Strategic planning should be possible
      expect(strategicPlanning).toHaveLength(15);

      // Strategies should be executable
      const successfulStrategies = strategicPlanning.filter(
        (s) => s.result.success
      ).length;
      expect(successfulStrategies).toBeGreaterThan(10);
    });
  });

  describe("Weather Survival Mode", () => {
    beforeEach(() => {
      integratedManager.setGameMode("weather-survival");
    });

    it("should create continuous weather challenges", () => {
      const survivalChallenges = [];
      let previousWeather: WeatherType[] = [];

      for (let turn = 1; turn <= 40; turn++) {
        integratedManager.startTurn(turn);

        const currentWeather = integratedManager.getCurrentWeather();
        const weatherChanged = !arraysEqual(currentWeather, previousWeather);
        const elementalEffects =
          integratedManager.calculateElementalModifiers();

        // Calculate challenge level
        const challengeLevel = calculateChallengeLevel(
          currentWeather,
          elementalEffects
        );

        survivalChallenges.push({
          turn,
          weather: [...currentWeather],
          weatherChanged,
          challengeLevel,
          elementalEffects: { ...elementalEffects },
        });

        previousWeather = [...currentWeather];
        integratedManager.endTurn();
      }

      // Should have frequent weather changes
      const changeRate =
        survivalChallenges.filter((c) => c.weatherChanged).length /
        survivalChallenges.length;
      expect(changeRate).toBeGreaterThan(0.6); // At least 60% of turns should have changes

      // Should maintain high challenge levels
      const avgChallengeLevel =
        survivalChallenges.reduce((sum, c) => sum + c.challengeLevel, 0) /
        survivalChallenges.length;
      expect(avgChallengeLevel).toBeGreaterThan(0.5);

      // Should have variety in challenges
      const uniqueWeatherStates = new Set(
        survivalChallenges.map((c) => c.weather.join(","))
      );
      expect(uniqueWeatherStates.size).toBeGreaterThan(25);
    });

    it("should test player adaptation capabilities", () => {
      const adaptationTests = [];

      for (let turn = 1; turn <= 30; turn++) {
        integratedManager.startTurn(turn);

        const weather = integratedManager.getCurrentWeather();
        const elementalEffects =
          integratedManager.calculateElementalModifiers();

        // Test different adaptation strategies
        const adaptationStrategies = [
          testElementalAdaptation(integratedManager, elementalEffects),
          testCardAdaptation(integratedManager, weather),
          testWeatherCounterplay(integratedManager, weather),
        ];

        const adaptationScore =
          adaptationStrategies.reduce(
            (sum, strategy) => sum + strategy.score,
            0
          ) / adaptationStrategies.length;

        adaptationTests.push({
          turn,
          weather: [...weather],
          elementalEffects: { ...elementalEffects },
          adaptationScore,
          strategies: adaptationStrategies.map((s) => ({
            type: s.type,
            score: s.score,
          })),
        });

        integratedManager.endTurn();
      }

      // Adaptation should be challenging but possible
      const avgAdaptationScore =
        adaptationTests.reduce((sum, t) => sum + t.adaptationScore, 0) /
        adaptationTests.length;
      expect(avgAdaptationScore).toBeGreaterThan(0.3);
      expect(avgAdaptationScore).toBeLessThan(0.8); // Should be challenging

      // Should require different adaptation strategies
      const strategyVariety = new Set();
      adaptationTests.forEach((test) => {
        test.strategies.forEach((strategy) => {
          if (strategy.score > 0.5) {
            strategyVariety.add(strategy.type);
          }
        });
      });
      expect(strategyVariety.size).toBeGreaterThan(1);
    });
  });

  describe("Cross-Mode Interactions", () => {
    it("should handle mode transitions without data loss", () => {
      const modes = [
        "12-month-campaign",
        "weather-chaos",
        "seasonal-event",
        "forecast-mode",
        "weather-survival",
      ];
      const transitionData = [];

      modes.forEach((fromMode, fromIndex) => {
        modes.forEach((toMode, toIndex) => {
          if (fromIndex !== toIndex) {
            // Set initial mode and state
            integratedManager.setGameMode(fromMode);
            integratedManager.startTurn(1);
            integratedManager.applyWeather(["Sunny", "Warm"]);

            const beforeState = {
              weather: integratedManager.getCurrentWeather(),
              effects: integratedManager.calculateElementalModifiers(),
              history: integratedManager.getWeatherHistory(3),
            };

            // Transition to new mode
            integratedManager.setGameMode(toMode);

            const afterState = {
              weather: integratedManager.getCurrentWeather(),
              effects: integratedManager.calculateElementalModifiers(),
              history: integratedManager.getWeatherHistory(3),
            };

            transitionData.push({
              from: fromMode,
              to: toMode,
              beforeState,
              afterState,
              dataPreserved:
                afterState.history.length >= beforeState.history.length,
            });

            integratedManager.endTurn();
          }
        });
      });

      // All transitions should complete successfully
      expect(transitionData).toHaveLength(modes.length * (modes.length - 1));

      // Most transitions should preserve some data
      const dataPreservationRate =
        transitionData.filter((t) => t.dataPreserved).length /
        transitionData.length;
      expect(dataPreservationRate).toBeGreaterThan(0.7);
    });

    it("should maintain consistent behavior across mode switches", () => {
      const consistencyTests = [];
      const testWeather: WeatherType[] = ["Sunny", "Warm"];

      const modes = [
        "12-month-campaign",
        "weather-chaos",
        "seasonal-event",
        "forecast-mode",
        "weather-survival",
      ];

      modes.forEach((mode) => {
        integratedManager.setGameMode(mode);
        integratedManager.startTurn(1);
        integratedManager.applyWeather(testWeather);

        const effects = integratedManager.calculateElementalModifiers();
        const isValid = integratedManager.validateCurrentWeather();

        consistencyTests.push({
          mode,
          weather: [...testWeather],
          effects: { ...effects },
          isValid,
        });

        integratedManager.endTurn();
      });

      // Core functionality should be consistent across modes
      expect(consistencyTests.every((t) => t.isValid)).toBe(true);

      // Elemental effects should be consistent for same weather
      const fireEffects = consistencyTests.map((t) => t.effects.Fire);
      const iceEffects = consistencyTests.map((t) => t.effects.Ice);
      const lightningEffects = consistencyTests.map((t) => t.effects.Lightning);

      // All fire effects should be the same (same weather input)
      expect(new Set(fireEffects).size).toBe(1);
      expect(new Set(iceEffects).size).toBe(1);
      expect(new Set(lightningEffects).size).toBe(1);
    });
  });
});

// Helper functions
function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month - 1];
}

function createSeasonalCard(season: string, id: number): WeatherCard {
  const seasonalWeather: Record<string, WeatherType[]> = {
    Winter: ["Cold", "Snowy", "Foggy"],
    Spring: ["Rainy", "Warm", "Windy"],
    Summer: ["Hot", "Sunny", "Humid"],
    Autumn: ["Cool", "Cloudy", "Windy"],
  };

  const weather = seasonalWeather[season] || ["Cloudy"];

  return {
    id: `seasonal-${season}-${id}`,
    type: "Weather",
    name: `${season} Weather Card`,
    description: `Brings ${season} weather`,
    weather: weather[Math.floor(Math.random() * weather.length)],
  };
}

function createInappropriateSeasonalCard(
  season: string,
  id: number
): WeatherCard {
  const oppositeWeather: Record<string, WeatherType[]> = {
    Winter: ["Hot", "Sunny", "Humid"],
    Spring: ["Snowy", "Cold"],
    Summer: ["Cold", "Snowy", "Foggy"],
    Autumn: ["Hot", "Humid"],
  };

  const weather = oppositeWeather[season] || ["Stormy"];

  return {
    id: `inappropriate-${season}-${id}`,
    type: "Weather",
    name: `Inappropriate ${season} Card`,
    description: `Brings weather inappropriate for ${season}`,
    weather: weather[Math.floor(Math.random() * weather.length)],
  };
}

function createRandomWeatherCard(id: number): WeatherCard {
  const weatherTypes: WeatherType[] = [
    "Sunny",
    "Rainy",
    "Stormy",
    "Hot",
    "Cold",
    "Windy",
  ];

  return {
    id: `random-${id}`,
    type: "Weather",
    name: `Random Weather Card ${id}`,
    description: `Random weather card ${id}`,
    weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
  };
}

function createBreakWeatherCard(id: number): WeatherCard {
  return {
    id: `break-${id}`,
    type: "BreakWeather",
    name: `Break Weather Card ${id}`,
    description: `Breaks current weather ${id}`,
  };
}

function verifySeasonalWeather(weather: WeatherType[], season: string): void {
  const seasonalConstraints: Record<string, { forbidden: WeatherType[] }> = {
    Winter: { forbidden: ["Hot", "Humid"] },
    Spring: { forbidden: [] },
    Summer: { forbidden: ["Cold", "Snowy"] },
    Autumn: { forbidden: [] },
  };

  const constraints = seasonalConstraints[season];
  if (constraints) {
    constraints.forbidden.forEach((forbiddenWeather) => {
      expect(weather).not.toContain(forbiddenWeather);
    });
  }
}

function planStrategyFromForecast(
  forecast: any[],
  currentWeather: WeatherType[]
): any {
  // Simple strategy planning based on forecast
  const upcomingWeather = forecast.map((f) => f.weather).flat();
  const weatherCounts = upcomingWeather.reduce((counts, weather) => {
    counts[weather] = (counts[weather] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const dominantWeather = Object.entries(weatherCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0] as WeatherType;

  return {
    type: "forecast-based",
    dominantWeather,
    preparation: `Prepare for ${dominantWeather}`,
    cardChoice: dominantWeather,
  };
}

function executeStrategy(
  manager: IntegratedWeatherManager,
  strategy: any
): any {
  try {
    // Try to execute the strategy
    if (strategy.cardChoice) {
      const card: WeatherCard = {
        id: "strategy-card",
        type: "Weather",
        name: "Strategy Card",
        description: "Card chosen by strategy",
        weather: strategy.cardChoice,
      };

      if (manager.canPlayCard(card)) {
        manager.playCard(card);
        return { success: true, action: "card_played" };
      }
    }

    return { success: true, action: "strategy_planned" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function calculateChallengeLevel(
  weather: WeatherType[],
  elementalEffects: any
): number {
  // Calculate challenge based on weather complexity and elemental effects
  const weatherComplexity = weather.length / 5; // Normalize to 0-1
  const effectMagnitude =
    (Math.abs(elementalEffects.Fire) +
      Math.abs(elementalEffects.Ice) +
      Math.abs(elementalEffects.Lightning)) /
    120; // Normalize to 0-1

  return Math.min(1, (weatherComplexity + effectMagnitude) / 2);
}

function testElementalAdaptation(
  manager: IntegratedWeatherManager,
  elementalEffects: any
): any {
  // Test how well player can adapt to elemental effects
  const totalEffects =
    Math.abs(elementalEffects.Fire) +
    Math.abs(elementalEffects.Ice) +
    Math.abs(elementalEffects.Lightning);
  const adaptationScore = Math.min(1, totalEffects / 60); // Normalize

  return {
    type: "elemental",
    score: adaptationScore,
    effects: elementalEffects,
  };
}

function testCardAdaptation(
  manager: IntegratedWeatherManager,
  weather: WeatherType[]
): any {
  // Test card-based adaptation
  const testCard: WeatherCard = {
    id: "adaptation-test",
    type: "Weather",
    name: "Adaptation Test Card",
    description: "Test adaptation",
    weather: "Cloudy", // Neutral weather
  };

  const canPlay = manager.canPlayCard(testCard);
  const score = canPlay ? 0.8 : 0.2;

  return {
    type: "card",
    score,
    canPlay,
  };
}

function testWeatherCounterplay(
  manager: IntegratedWeatherManager,
  weather: WeatherType[]
): any {
  // Test weather counterplay strategies
  const hasExtremeWeather = weather.some((w) =>
    ["Hot", "Cold", "Stormy"].includes(w)
  );
  const counterplayScore = hasExtremeWeather ? 0.7 : 0.4;

  return {
    type: "counterplay",
    score: counterplayScore,
    hasExtremeWeather,
  };
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}
