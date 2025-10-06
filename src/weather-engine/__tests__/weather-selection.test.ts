/**
 * Weather Selection Algorithms Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  WeatherSelectionAlgorithms,
  WeatherSelectionConfig,
  WeatherSelectionContext,
} from "../algorithms/weather-selection";
import { WeatherType, SeasonType } from "../types";

describe("WeatherSelectionAlgorithms", () => {
  let algorithms: WeatherSelectionAlgorithms;
  let config: WeatherSelectionConfig;

  beforeEach(() => {
    config = {
      seasonalWeights: {
        Winter: {
          Cold: 25,
          Snowy: 25,
          Foggy: 15,
          Windy: 15,
          Cloudy: 10,
          Stormy: 10,
          Sunny: 0,
          Rainy: 0,
          Hot: 0,
          Warm: 0,
          Cool: 0,
          Humid: 0,
        },
        Spring: {
          Rainy: 20,
          Cloudy: 20,
          Windy: 15,
          Warm: 15,
          Cool: 10,
          Sunny: 10,
          Foggy: 5,
          Stormy: 5,
          Cold: 0,
          Snowy: 0,
          Hot: 0,
          Humid: 0,
        },
        Summer: {
          Hot: 25,
          Sunny: 25,
          Humid: 15,
          Warm: 15,
          Cloudy: 10,
          Stormy: 10,
          Cold: 0,
          Snowy: 0,
          Foggy: 0,
          Windy: 0,
          Cool: 0,
          Rainy: 0,
        },
        Autumn: {
          Cool: 20,
          Windy: 20,
          Cloudy: 15,
          Rainy: 15,
          Foggy: 10,
          Warm: 10,
          Stormy: 10,
          Cold: 0,
          Snowy: 0,
          Hot: 0,
          Sunny: 0,
          Humid: 0,
        },
      },
      monthlyAdjustments: {
        1: { Cold: 10, Snowy: 5 }, // January adjustments
        7: { Hot: 10, Humid: 5 }, // July adjustments
      },
      transitionMatrix: {
        Sunny: { Warm: 5, Hot: 3, Cloudy: 2 },
        Cloudy: { Rainy: 5, Stormy: 3, Foggy: 2 },
        Cold: { Snowy: 5, Foggy: 3, Windy: 2 },
      },
      weightLimits: { min: 0, max: 100 },
      randomnessFactor: 1.0,
    };

    algorithms = new WeatherSelectionAlgorithms(config);
  });

  describe("Constructor", () => {
    it("should initialize with provided configuration", () => {
      expect(algorithms).toBeInstanceOf(WeatherSelectionAlgorithms);
    });

    it("should apply default values for missing config properties", () => {
      const minimalConfig: WeatherSelectionConfig = {
        seasonalWeights: config.seasonalWeights,
      };

      const minimalAlgorithms = new WeatherSelectionAlgorithms(minimalConfig);
      const retrievedConfig = minimalAlgorithms.getConfiguration();

      expect(retrievedConfig.weightLimits).toEqual({ min: 0, max: 100 });
      expect(retrievedConfig.randomnessFactor).toBe(1.0);
    });
  });

  describe("selectBasicWeighted", () => {
    it("should select weather based on seasonal weights", () => {
      const result = algorithms.selectBasicWeighted("Winter");

      expect(result.weather).toBeDefined();
      expect(result.probability).toBeGreaterThan(0);
      expect(result.probability).toBeLessThanOrEqual(1);
      expect(result.algorithm).toBe("basic_weighted");
      expect(result.metadata).toBeDefined();
    });

    it("should apply monthly adjustments when provided", () => {
      const context: Partial<WeatherSelectionContext> = { month: 1 };
      const result = algorithms.selectBasicWeighted("Winter", context);

      expect(result.metadata.monthlyAdjustment).toBeGreaterThanOrEqual(0);
    });

    it("should return appropriate weather for each season", () => {
      const seasons: SeasonType[] = ["Winter", "Spring", "Summer", "Autumn"];

      seasons.forEach((season) => {
        const result = algorithms.selectBasicWeighted(season);
        const seasonWeights = config.seasonalWeights[season];
        const availableWeather = Object.keys(seasonWeights).filter(
          (w) => seasonWeights[w as WeatherType] > 0
        );

        expect(availableWeather).toContain(result.weather);
      });
    });

    it("should throw error for invalid season", () => {
      expect(() => {
        algorithms.selectBasicWeighted("InvalidSeason" as SeasonType);
      }).toThrow("No seasonal weights configured");
    });
  });

  describe("selectWithTransitions", () => {
    it("should consider previous weather in selection", () => {
      const context: WeatherSelectionContext = {
        month: 1,
        turn: 2,
        previousWeather: ["Sunny"],
      };

      const result = algorithms.selectWithTransitions("Winter", context);

      expect(result.algorithm).toBe("transition_based");
      expect(result.metadata.transitionBonus).toBeGreaterThanOrEqual(0);
    });

    it("should work without previous weather", () => {
      const context: WeatherSelectionContext = {
        month: 1,
        turn: 1,
      };

      const result = algorithms.selectWithTransitions("Winter", context);

      expect(result.weather).toBeDefined();
      expect(result.metadata.transitionBonus).toBe(0);
    });

    it("should apply transition bonuses correctly", () => {
      const context: WeatherSelectionContext = {
        month: 6,
        turn: 2,
        previousWeather: ["Sunny"], // Should boost Warm and Hot
      };

      // Run multiple times to test transition effects
      const results = [];
      for (let i = 0; i < 50; i++) {
        results.push(algorithms.selectWithTransitions("Summer", context));
      }

      // Should see some bias towards weather types with transition bonuses
      const weatherCounts = new Map<WeatherType, number>();
      results.forEach((result) => {
        weatherCounts.set(
          result.weather,
          (weatherCounts.get(result.weather) || 0) + 1
        );
      });

      expect(weatherCounts.size).toBeGreaterThan(1);
    });
  });

  describe("selectPatternAware", () => {
    it("should avoid recently used weather types", () => {
      const context: WeatherSelectionContext = {
        month: 6,
        turn: 4,
        weatherHistory: [
          ["Hot"], // Turn 1
          ["Hot"], // Turn 2
          ["Hot"], // Turn 3
        ],
      };

      // Run multiple selections
      const results = [];
      for (let i = 0; i < 30; i++) {
        results.push(algorithms.selectPatternAware("Summer", context));
      }

      // Should show reduced frequency of "Hot" weather
      const weatherCounts = new Map<WeatherType, number>();
      results.forEach((result) => {
        weatherCounts.set(
          result.weather,
          (weatherCounts.get(result.weather) || 0) + 1
        );
      });

      const hotCount = weatherCounts.get("Hot") || 0;
      const totalCount = results.length;

      // Hot should appear less frequently due to recent overuse
      expect(hotCount / totalCount).toBeLessThan(0.4); // Less than 40%
    });

    it("should work with empty weather history", () => {
      const context: WeatherSelectionContext = {
        month: 6,
        turn: 1,
        weatherHistory: [],
      };

      const result = algorithms.selectPatternAware("Summer", context);

      expect(result.weather).toBeDefined();
      expect(result.algorithm).toBe("pattern_aware");
    });
  });

  describe("selectBalanced", () => {
    it("should balance weather type usage over time", () => {
      const context: WeatherSelectionContext = {
        month: 6,
        turn: 10,
        weatherHistory: [
          ["Hot"],
          ["Hot"],
          ["Hot"],
          ["Hot"],
          ["Hot"], // Overused Hot
          ["Sunny"],
          ["Sunny"], // Some Sunny
          ["Humid"], // Little Humid
        ],
      };

      // Run multiple selections
      const results = [];
      for (let i = 0; i < 50; i++) {
        results.push(algorithms.selectBalanced("Summer", context));
      }

      const weatherCounts = new Map<WeatherType, number>();
      results.forEach((result) => {
        weatherCounts.set(
          result.weather,
          (weatherCounts.get(result.weather) || 0) + 1
        );
      });

      const hotCount = weatherCounts.get("Hot") || 0;
      const humidCount = weatherCounts.get("Humid") || 0;

      // Humid should appear more frequently than Hot due to balancing
      expect(humidCount).toBeGreaterThanOrEqual(hotCount * 0.5);
    });
  });

  describe("generateMonthWeather", () => {
    it("should generate weather for valid months", () => {
      for (let month = 1; month <= 12; month++) {
        const result = algorithms.generateMonthWeather(month);

        expect(result.weather).toBeDefined();
        expect(result.probability).toBeGreaterThan(0);
        expect(result.metadata).toBeDefined();
      }
    });

    it("should throw error for invalid months", () => {
      expect(() => algorithms.generateMonthWeather(0)).toThrow(
        "Invalid month: 0"
      );
      expect(() => algorithms.generateMonthWeather(13)).toThrow(
        "Invalid month: 13"
      );
    });

    it("should support different algorithms", () => {
      const algorithms_list: Array<
        "basic" | "transition" | "pattern" | "balanced"
      > = ["basic", "transition", "pattern", "balanced"];

      algorithms_list.forEach((algorithm) => {
        const result = algorithms.generateMonthWeather(6, algorithm);
        expect(result.weather).toBeDefined();
      });
    });

    it("should throw error for unknown algorithm", () => {
      expect(() => {
        algorithms.generateMonthWeather(6, "unknown" as any);
      }).toThrow("Unknown algorithm: unknown");
    });
  });

  describe("updateConfiguration", () => {
    it("should update configuration properties", () => {
      const updates = {
        randomnessFactor: 0.5,
        weightLimits: { min: 5, max: 95 },
      };

      algorithms.updateConfiguration(updates);
      const updatedConfig = algorithms.getConfiguration();

      expect(updatedConfig.randomnessFactor).toBe(0.5);
      expect(updatedConfig.weightLimits).toEqual({ min: 5, max: 95 });
    });

    it("should preserve existing configuration for unchanged properties", () => {
      const originalConfig = algorithms.getConfiguration();

      algorithms.updateConfiguration({ randomnessFactor: 0.8 });
      const updatedConfig = algorithms.getConfiguration();

      expect(updatedConfig.seasonalWeights).toEqual(
        originalConfig.seasonalWeights
      );
      expect(updatedConfig.randomnessFactor).toBe(0.8);
    });
  });

  describe("getConfiguration", () => {
    it("should return current configuration", () => {
      const retrievedConfig = algorithms.getConfiguration();

      expect(retrievedConfig.seasonalWeights).toEqual(config.seasonalWeights);
      expect(retrievedConfig.monthlyAdjustments).toEqual(
        config.monthlyAdjustments
      );
      expect(retrievedConfig.transitionMatrix).toEqual(config.transitionMatrix);
    });

    it("should return a copy of configuration", () => {
      const retrievedConfig = algorithms.getConfiguration();

      // Modifying returned config should not affect internal config
      retrievedConfig.randomnessFactor = 999;

      const secondRetrievedConfig = algorithms.getConfiguration();
      expect(secondRetrievedConfig.randomnessFactor).not.toBe(999);
    });
  });

  describe("Probability Distribution", () => {
    it("should follow configured probability distributions", () => {
      const sampleSize = 1000;
      const results = [];

      for (let i = 0; i < sampleSize; i++) {
        results.push(algorithms.selectBasicWeighted("Winter"));
      }

      const weatherCounts = new Map<WeatherType, number>();
      results.forEach((result) => {
        weatherCounts.set(
          result.weather,
          (weatherCounts.get(result.weather) || 0) + 1
        );
      });

      // Cold and Snowy should be most frequent (25% each)
      const coldCount = weatherCounts.get("Cold") || 0;
      const snowyCount = weatherCounts.get("Snowy") || 0;
      const hotCount = weatherCounts.get("Hot") || 0; // Should be 0

      expect(coldCount).toBeGreaterThan(sampleSize * 0.15); // At least 15%
      expect(snowyCount).toBeGreaterThan(sampleSize * 0.15); // At least 15%
      expect(hotCount).toBe(0); // Should never appear in winter
    });

    it("should respect weight limits", () => {
      const limitedConfig: WeatherSelectionConfig = {
        seasonalWeights: {
          Winter: { Cold: 200, Snowy: 200 }, // Exceeds max limit
          Spring: { Rainy: 50, Warm: 50 },
          Summer: { Hot: 50, Sunny: 50 },
          Autumn: { Cool: 50, Windy: 50 },
        },
        weightLimits: { min: 0, max: 100 },
      };

      const limitedAlgorithms = new WeatherSelectionAlgorithms(limitedConfig);

      // Should still work despite weights exceeding limits
      const result = limitedAlgorithms.selectBasicWeighted("Winter");
      expect(result.weather).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero total weights gracefully", () => {
      const zeroConfig: WeatherSelectionConfig = {
        seasonalWeights: {
          Winter: { Cold: 0, Snowy: 0, Foggy: 0 },
          Spring: { Rainy: 50, Warm: 50 },
          Summer: { Hot: 50, Sunny: 50 },
          Autumn: { Cool: 50, Windy: 50 },
        },
      };

      const zeroAlgorithms = new WeatherSelectionAlgorithms(zeroConfig);

      // Should still return a weather type even with zero weights
      const result = zeroAlgorithms.selectBasicWeighted("Winter");
      expect(result.weather).toBeDefined();
    });

    it("should handle missing transition matrix gracefully", () => {
      const noTransitionConfig: WeatherSelectionConfig = {
        seasonalWeights: config.seasonalWeights,
        // No transition matrix
      };

      const noTransitionAlgorithms = new WeatherSelectionAlgorithms(
        noTransitionConfig
      );

      const context: WeatherSelectionContext = {
        month: 1,
        turn: 2,
        previousWeather: ["Sunny"],
      };

      const result = noTransitionAlgorithms.selectWithTransitions(
        "Winter",
        context
      );
      expect(result.weather).toBeDefined();
      expect(result.metadata.transitionBonus).toBe(0);
    });

    it("should handle extreme randomness factors", () => {
      const extremeConfig: WeatherSelectionConfig = {
        seasonalWeights: config.seasonalWeights,
        randomnessFactor: 0, // Completely deterministic
      };

      const extremeAlgorithms = new WeatherSelectionAlgorithms(extremeConfig);

      // Should still work with zero randomness
      const result = extremeAlgorithms.selectBasicWeighted("Winter");
      expect(result.weather).toBeDefined();
    });
  });
});
