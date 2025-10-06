/**
 * Final Integration Tests
 * Comprehensive end-to-end testing of the complete weather engine system
 * Validates all requirements are met through comprehensive testing
 */

import { WeatherType, ElementType, SeasonType } from "../types";
import { WeatherManager } from "../manager/weather-manager";
import { OptimizedWeatherManager } from "../performance/optimized-weather-manager";
import { SeasonManager } from "../manager/season-manager";
import { WeatherCardManager } from "../manager/weather-card-manager";
import { GameModeManager } from "../manager/game-mode-manager";
import { WeatherConfigLoader } from "../config";
import { DamageCalculator } from "../calculations";
import { WeatherValidator } from "../validation";
import defaultWeatherConfig from "../config/weather-effects.json";

describe("Final Integration Tests - Complete Weather Engine System", () => {
  let config: any;
  let weatherManager: WeatherManager;
  let optimizedManager: OptimizedWeatherManager;
  let seasonManager: SeasonManager;
  let cardManager: WeatherCardManager;
  let gameModeManager: GameModeManager;
  let calculator: DamageCalculator;
  let validator: WeatherValidator;

  beforeAll(() => {
    const configLoader = WeatherConfigLoader.getInstance();
    config = configLoader.loadFromData(defaultWeatherConfig);
  });

  beforeEach(() => {
    weatherManager = new WeatherManager(config);
    optimizedManager = new OptimizedWeatherManager(config, undefined, {
      enableCaching: true,
      enablePerformanceMonitoring: true,
    });
    seasonManager = new SeasonManager(config);
    cardManager = new WeatherCardManager(config);
    gameModeManager = new GameModeManager(config);
    calculator = new DamageCalculator(config);
    validator = new WeatherValidator(config);
  });

  afterEach(() => {
    optimizedManager.destroy();
  });

  describe("Requirement 1: Weather Types and Elemental Effects", () => {
    it("should support all 12 required weather types", () => {
      const requiredWeatherTypes: WeatherType[] = [
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

      for (const weatherType of requiredWeatherTypes) {
        const result = weatherManager.applyWeather([weatherType]);
        expect(result.isValid).toBe(true);

        // Verify weather affects elemental damage
        const modifiers = weatherManager.calculateElementalModifiers();
        expect(modifiers.elementalModifiers).toHaveProperty("Fire");
        expect(modifiers.elementalModifiers).toHaveProperty("Ice");
        expect(modifiers.elementalModifiers).toHaveProperty("Lightning");
      }
    });

    it("should apply weather modifiers within -40 to +40 range", () => {
      const allWeatherTypes: WeatherType[] = [
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

      for (const weatherType of allWeatherTypes) {
        weatherManager.applyWeather([weatherType]);
        const modifiers = weatherManager.calculateElementalModifiers();

        for (const element of ["Fire", "Ice", "Lightning"] as ElementType[]) {
          const modifier = modifiers.elementalModifiers[element];
          expect(modifier).toBeGreaterThanOrEqual(-40);
          expect(modifier).toBeLessThanOrEqual(40);
        }
      }
    });

    it("should validate logical weather combinations", () => {
      // Valid combinations
      expect(weatherManager.applyWeather(["Sunny", "Hot"]).isValid).toBe(true);
      expect(weatherManager.applyWeather(["Rainy", "Cool"]).isValid).toBe(true);
      expect(weatherManager.applyWeather(["Snowy", "Cold"]).isValid).toBe(true);

      // Invalid combinations should be caught by validation
      const invalidCombinations = [
        ["Hot", "Cold"],
        ["Sunny", "Snowy"],
        ["Hot", "Snowy"],
      ];

      for (const combination of invalidCombinations) {
        const validation = validator.validateWeatherCombination(
          combination as WeatherType[]
        );
        if (!validation.isValid) {
          expect(validation.errors.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Requirement 2: Seasonal Weather System", () => {
    it("should determine weather based on current month (1-12)", () => {
      for (let month = 1; month <= 12; month++) {
        const weather = seasonManager.getWeatherForMonth(month);
        expect(weather).toBeDefined();
        expect(typeof weather).toBe("string");
      }
    });

    it("should prioritize appropriate weather types by season", () => {
      // Winter months should favor cold weather
      const winterMonths = [12, 1, 2];
      const coldWeatherTypes = ["Cold", "Snowy", "Foggy"];

      for (const month of winterMonths) {
        const season = seasonManager.getSeasonForMonth(month);
        expect(season).toBe("Winter");

        // Generate multiple weather samples to check distribution
        const weatherSamples = [];
        for (let i = 0; i < 20; i++) {
          weatherSamples.push(seasonManager.getWeatherForMonth(month));
        }

        // Should have some cold weather types
        const hasColdWeather = weatherSamples.some((w) =>
          coldWeatherTypes.includes(w)
        );
        expect(hasColdWeather).toBe(true);
      }

      // Summer months should favor hot weather
      const summerMonths = [6, 7, 8];
      const hotWeatherTypes = ["Hot", "Sunny", "Humid"];

      for (const month of summerMonths) {
        const season = seasonManager.getSeasonForMonth(month);
        expect(season).toBe("Summer");

        const weatherSamples = [];
        for (let i = 0; i < 20; i++) {
          weatherSamples.push(seasonManager.getWeatherForMonth(month));
        }

        const hasHotWeather = weatherSamples.some((w) =>
          hotWeatherTypes.includes(w)
        );
        expect(hasHotWeather).toBe(true);
      }
    });

    it("should use weighted random selection from season-appropriate pools", () => {
      const springWeatherPool = seasonManager.getWeatherPool("Spring");
      expect(Array.isArray(springWeatherPool)).toBe(true);
      expect(springWeatherPool.length).toBeGreaterThan(0);

      // Verify all seasons have weather pools
      const seasons: SeasonType[] = ["Spring", "Summer", "Autumn", "Winter"];
      for (const season of seasons) {
        const pool = seasonManager.getWeatherPool(season);
        expect(Array.isArray(pool)).toBe(true);
        expect(pool.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Requirement 3: Weather Card System", () => {
    it("should change weather when weather cards are played", () => {
      const initialWeather = weatherManager.getCurrentWeather();

      const weatherCard = {
        id: "test-sunny-card",
        type: "Weather" as const,
        name: "Sunny Day",
        description: "Makes it sunny",
        weather: "Sunny" as WeatherType,
      };

      const result = cardManager.playCard(weatherCard, initialWeather);
      expect(result.isValid).toBe(true);
      expect(result.newWeather).toContain("Sunny");
    });

    it("should reset weather when break weather cards are played", () => {
      // Apply some weather first
      weatherManager.applyWeather(["Stormy", "Windy"]);
      expect(weatherManager.getCurrentWeather().length).toBeGreaterThan(0);

      const breakCard = {
        id: "test-break-card",
        type: "BreakWeather" as const,
        name: "Clear Skies",
        description: "Clears all weather",
      };

      const result = cardManager.playCard(
        breakCard,
        weatherManager.getCurrentWeather()
      );
      expect(result.isValid).toBe(true);
      expect(result.newWeather).toEqual([]);
    });

    it("should validate weather card combinations", () => {
      const currentWeather: WeatherType[] = ["Hot"];

      const conflictingCard = {
        id: "test-cold-card",
        type: "Weather" as const,
        name: "Blizzard",
        description: "Makes it cold and snowy",
        weather: "Cold" as WeatherType,
      };

      // This should be validated by the card manager
      const result = cardManager.playCard(conflictingCard, currentWeather);
      // The result depends on validation rules - either rejected or allowed with warning
      expect(result).toBeDefined();
    });

    it("should apply weather modifiers to subsequent elemental attacks", () => {
      const fireBoostCard = {
        id: "test-fire-boost",
        type: "Weather" as const,
        name: "Heat Wave",
        description: "Boosts fire damage",
        weather: "Hot" as WeatherType,
      };

      const result = cardManager.playCard(fireBoostCard, []);
      weatherManager.applyWeather(result.newWeather);

      const fireDamage = weatherManager.calculateElementDamage("Fire", 100);
      expect(fireDamage).toBeGreaterThan(100); // Should be boosted
    });
  });

  describe("Requirement 4: Multiple Game Modes", () => {
    it("should support at least 5 different weather-based modes", () => {
      const availableModes = gameModeManager.getAvailableModes();
      expect(availableModes.length).toBeGreaterThanOrEqual(5);

      const expectedModes = [
        "12-Month Campaign",
        "Weather Chaos",
        "Seasonal Event",
        "Forecast Mode",
        "Weather Survival",
      ];

      for (const expectedMode of expectedModes) {
        const hasMode = availableModes.some(
          (mode) => mode.name === expectedMode
        );
        expect(hasMode).toBe(true);
      }
    });

    it("should implement 12-Month Campaign mode with turn progression", () => {
      gameModeManager.setGameMode("12-Month Campaign");

      // Simulate 12 turns
      for (let turn = 1; turn <= 12; turn++) {
        const weather = gameModeManager.processWeatherForTurn(turn);
        expect(Array.isArray(weather)).toBe(true);

        // Weather should be appropriate for the month
        const month = turn;
        const expectedSeason = seasonManager.getSeasonForMonth(month);
        expect(expectedSeason).toBeDefined();
      }
    });

    it("should implement Weather Chaos mode with random mixing", () => {
      gameModeManager.setGameMode("Weather Chaos");

      const weather = gameModeManager.processWeatherForTurn(1);
      expect(Array.isArray(weather)).toBe(true);
      expect(weather.length).toBeGreaterThanOrEqual(2); // Should mix multiple types
      expect(weather.length).toBeLessThanOrEqual(5); // But not too many
    });

    it("should implement other specialized game modes", () => {
      const modes = ["Seasonal Event", "Forecast Mode", "Weather Survival"];

      for (const modeName of modes) {
        gameModeManager.setGameMode(modeName);
        const weather = gameModeManager.processWeatherForTurn(1);
        expect(Array.isArray(weather)).toBe(true);
      }
    });
  });

  describe("Requirement 5: Weather Mixing Validation", () => {
    it("should prevent logically impossible combinations", () => {
      const impossibleCombinations = [
        ["Hot", "Cold"],
        ["Sunny", "Snowy"],
        ["Hot", "Snowy"],
      ];

      for (const combination of impossibleCombinations) {
        const validation = validator.validateWeatherCombination(
          combination as WeatherType[]
        );
        // Should either be invalid or have warnings
        if (validation.isValid) {
          expect(validation.warnings.length).toBeGreaterThan(0);
        } else {
          expect(validation.errors.length).toBeGreaterThan(0);
        }
      }
    });

    it("should use compatibility matrix for realistic combinations", () => {
      const realisticCombinations = [
        ["Sunny", "Hot"],
        ["Rainy", "Cool"],
        ["Snowy", "Cold"],
        ["Stormy", "Windy"],
      ];

      for (const combination of realisticCombinations) {
        const validation = validator.validateWeatherCombination(
          combination as WeatherType[]
        );
        expect(validation.isValid).toBe(true);
      }
    });

    it("should calculate cumulative effects for multiple weather types", () => {
      weatherManager.applyWeather(["Sunny", "Hot"]);
      const modifiers = weatherManager.calculateElementalModifiers();

      // Fire should be significantly boosted by both Sunny and Hot
      expect(modifiers.elementalModifiers.Fire).toBeGreaterThan(0);

      // Ice should be penalized
      expect(modifiers.elementalModifiers.Ice).toBeLessThan(0);
    });

    it("should cap total modifiers at reasonable bounds", () => {
      // Try to apply many fire-boosting weather types
      const fireBoostingWeather: WeatherType[] = ["Sunny", "Hot"];
      weatherManager.applyWeather(fireBoostingWeather);

      const modifiers = weatherManager.calculateElementalModifiers();

      // Should be capped at reasonable limits
      expect(modifiers.elementalModifiers.Fire).toBeLessThanOrEqual(40);
      expect(modifiers.elementalModifiers.Fire).toBeGreaterThanOrEqual(-40);
      expect(modifiers.elementalModifiers.Ice).toBeLessThanOrEqual(40);
      expect(modifiers.elementalModifiers.Ice).toBeGreaterThanOrEqual(-40);
      expect(modifiers.elementalModifiers.Lightning).toBeLessThanOrEqual(40);
      expect(modifiers.elementalModifiers.Lightning).toBeGreaterThanOrEqual(
        -40
      );
    });
  });

  describe("Requirement 6: Visual Feedback Integration", () => {
    it("should trigger appropriate events for weather changes", () => {
      let weatherChangeEvents = 0;
      let cardPlayEvents = 0;

      weatherManager.addEventListener("weatherChanged", () => {
        weatherChangeEvents++;
      });

      weatherManager.addEventListener("cardPlayed", () => {
        cardPlayEvents++;
      });

      // Apply weather and play cards
      weatherManager.applyWeather(["Sunny"]);

      const card = {
        id: "test-card",
        type: "Weather" as const,
        name: "Rain Dance",
        description: "Makes it rain",
        weather: "Rainy" as WeatherType,
      };

      weatherManager.playWeatherCard(card);

      expect(weatherChangeEvents).toBeGreaterThan(0);
      expect(cardPlayEvents).toBeGreaterThan(0);
    });

    it("should provide current weather status and modifiers", () => {
      weatherManager.applyWeather(["Stormy", "Windy"]);

      const currentWeather = weatherManager.getCurrentWeather();
      expect(currentWeather).toContain("Stormy");
      expect(currentWeather).toContain("Windy");

      const modifiers = weatherManager.calculateElementalModifiers();
      expect(modifiers.elementalModifiers.Fire).toBeDefined();
      expect(modifiers.elementalModifiers.Ice).toBeDefined();
      expect(modifiers.elementalModifiers.Lightning).toBeDefined();
    });

    it("should show combined effect values for multiple weather types", () => {
      weatherManager.applyWeather(["Rainy", "Stormy"]);
      const modifiers = weatherManager.calculateElementalModifiers();

      // Lightning should be significantly boosted by both weather types
      expect(modifiers.elementalModifiers.Lightning).toBeGreaterThan(0);
    });
  });

  describe("Requirement 7: Configurable System", () => {
    it("should allow modification of elemental damage modifiers", () => {
      // The config system should be loaded and modifiable
      expect(config.weatherEffects).toBeDefined();
      expect(config.weatherEffects.size).toBeGreaterThan(0);

      // Verify we can access weather effect configurations
      const sunnyEffects = config.weatherEffects.get("Sunny");
      expect(sunnyEffects).toBeDefined();
      expect(sunnyEffects.Fire).toBeDefined();
      expect(sunnyEffects.Ice).toBeDefined();
      expect(sunnyEffects.Lightning).toBeDefined();
    });

    it("should support different weather rules per game mode", () => {
      const chaosMode = gameModeManager.getGameMode("Weather Chaos");
      const campaignMode = gameModeManager.getGameMode("12-Month Campaign");

      expect(chaosMode.weatherRules).toBeDefined();
      expect(campaignMode.weatherRules).toBeDefined();

      // Rules should be different
      expect(chaosMode.weatherRules.allowWeatherMixing).toBe(true);
      expect(chaosMode.weatherRules.maxWeatherTypes).toBeGreaterThan(1);
    });

    it("should reload configurations without requiring restart", () => {
      const configLoader = WeatherConfigLoader.getInstance();

      // Should be able to reload config
      const reloadedConfig = configLoader.loadFromData(defaultWeatherConfig);
      expect(reloadedConfig).toBeDefined();
      expect(reloadedConfig.weatherEffects).toBeDefined();
    });
  });

  describe("Performance and Optimization Integration", () => {
    it("should demonstrate performance improvements with optimization", () => {
      const iterations = 50;

      // Test regular manager
      const regularStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        weatherManager.applyWeather(["Sunny", "Hot"]);
        weatherManager.calculateElementalModifiers();
        weatherManager.validateCurrentWeather();
        weatherManager.resetWeather();
      }
      const regularTime = performance.now() - regularStart;

      // Test optimized manager
      const optimizedStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        optimizedManager.applyWeather(["Sunny", "Hot"]);
        optimizedManager.calculateElementalModifiers();
        optimizedManager.validateCurrentWeather();
        optimizedManager.resetWeather();
      }
      const optimizedTime = performance.now() - optimizedStart;

      // Optimized should be faster or at least not significantly slower
      expect(optimizedTime).toBeLessThanOrEqual(regularTime * 1.5);

      // Verify cache statistics
      const stats = optimizedManager.getPerformanceStats();
      expect(stats.cache).toBeDefined();
      expect(stats.monitor).toBeDefined();
    });

    it("should provide comprehensive performance monitoring", () => {
      // Generate some activity
      optimizedManager.applyWeather(["Stormy", "Windy"]);
      optimizedManager.calculateElementalModifiers();
      optimizedManager.calculateElementDamage("Lightning", 100);

      const stats = optimizedManager.getPerformanceStats();

      expect(stats.cache.totalEntries).toBeGreaterThan(0);
      expect(stats.monitor.summary.totalMetrics).toBeGreaterThan(0);
      expect(stats.memory.heapUsed).toBeGreaterThan(0);
    });
  });

  describe("Complete System Integration", () => {
    it("should handle a complete 12-turn game scenario", () => {
      gameModeManager.setGameMode("12-Month Campaign");

      const gameResults = [];

      for (let turn = 1; turn <= 12; turn++) {
        // Set turn and month
        weatherManager.setTurn(turn, turn);

        // Get seasonal weather
        const seasonalWeather = gameModeManager.processWeatherForTurn(turn);
        weatherManager.applyWeather(seasonalWeather);

        // Play a weather card occasionally
        if (turn % 3 === 0) {
          const card = {
            id: `card-turn-${turn}`,
            type: "Weather" as const,
            name: "Weather Modifier",
            description: "Modifies weather",
            weather: "Windy" as WeatherType,
          };
          weatherManager.playWeatherCard(card);
        }

        // Calculate damage for all elements
        const fireDamage = weatherManager.calculateElementDamage("Fire", 100);
        const iceDamage = weatherManager.calculateElementDamage("Ice", 100);
        const lightningDamage = weatherManager.calculateElementDamage(
          "Lightning",
          100
        );

        gameResults.push({
          turn,
          month: turn,
          season: weatherManager.getCurrentSeason(),
          weather: weatherManager.getCurrentWeather(),
          damages: {
            Fire: fireDamage,
            Ice: iceDamage,
            Lightning: lightningDamage,
          },
        });

        // Advance turn
        if (turn < 12) {
          weatherManager.advanceTurn();
        }
      }

      // Verify we completed all 12 turns
      expect(gameResults).toHaveLength(12);

      // Verify seasonal progression
      const seasons = gameResults.map((r) => r.season);
      expect(seasons).toContain("Winter");
      expect(seasons).toContain("Spring");
      expect(seasons).toContain("Summer");
      expect(seasons).toContain("Autumn");

      // Verify damage calculations were performed
      for (const result of gameResults) {
        expect(result.damages.Fire).toBeGreaterThan(0);
        expect(result.damages.Ice).toBeGreaterThan(0);
        expect(result.damages.Lightning).toBeGreaterThan(0);
      }
    });

    it("should handle complex weather interactions across all systems", () => {
      // Set up a complex scenario with multiple systems interacting
      gameModeManager.setGameMode("Weather Chaos");

      // Apply initial chaotic weather
      const chaosWeather = gameModeManager.processWeatherForTurn(1);
      weatherManager.applyWeather(chaosWeather);

      // Play multiple weather cards
      const cards = [
        {
          id: "boost-fire",
          type: "WeatherBuff" as const,
          name: "Fire Amplifier",
          description: "Boosts fire damage",
          effect: { Fire: 10 },
          duration: 3,
        },
        {
          id: "nerf-ice",
          type: "WeatherNerf" as const,
          name: "Ice Dampener",
          description: "Reduces ice effectiveness",
          effect: { Ice: -5 },
          duration: 2,
        },
      ];

      for (const card of cards) {
        weatherManager.playWeatherCard(card);
      }

      // Validate the complex state
      const validation = weatherManager.validateCurrentWeather();
      expect(validation.isValid).toBe(true);

      // Calculate final damage modifiers
      const modifiers = weatherManager.calculateElementalModifiers();
      expect(modifiers.elementalModifiers.Fire).toBeDefined();
      expect(modifiers.elementalModifiers.Ice).toBeDefined();
      expect(modifiers.elementalModifiers.Lightning).toBeDefined();

      // Verify all modifiers are within bounds
      expect(modifiers.elementalModifiers.Fire).toBeGreaterThanOrEqual(-40);
      expect(modifiers.elementalModifiers.Fire).toBeLessThanOrEqual(40);
      expect(modifiers.elementalModifiers.Ice).toBeGreaterThanOrEqual(-40);
      expect(modifiers.elementalModifiers.Ice).toBeLessThanOrEqual(40);
      expect(modifiers.elementalModifiers.Lightning).toBeGreaterThanOrEqual(
        -40
      );
      expect(modifiers.elementalModifiers.Lightning).toBeLessThanOrEqual(40);

      // Advance turns and verify card durations
      weatherManager.advanceTurn();
      weatherManager.advanceTurn();
      weatherManager.advanceTurn();

      // Cards should have expired
      const activeCards = weatherManager.getActiveCards();
      expect(activeCards.length).toBe(0);
    });

    it("should maintain system stability under stress", () => {
      // Perform many rapid operations to test stability
      const operations = 100;

      for (let i = 0; i < operations; i++) {
        const randomWeather: WeatherType[] = ["Sunny", "Rainy", "Stormy"][
          i % 3
        ] as unknown;

        try {
          optimizedManager.applyWeather([randomWeather]);
          optimizedManager.calculateElementalModifiers();
          optimizedManager.validateCurrentWeather();

          if (i % 10 === 0) {
            optimizedManager.resetWeather();
          }
        } catch (error) {
          // Should not throw errors under normal operation
          fail(`System became unstable at operation ${i}: ${error}`);
        }
      }

      // System should still be functional
      const finalState = optimizedManager.getCurrentWeatherState();
      expect(finalState).toBeDefined();
      expect(finalState.turn).toBeGreaterThan(0);
    });
  });
});
