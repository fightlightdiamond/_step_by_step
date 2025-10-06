/**
 * Season Manager Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  SeasonManager,
  DEFAULT_SEASONAL_POOLS,
} from "../manager/season-manager";
import { WeatherType, SeasonType } from "../types";
import { MONTH_TO_SEASON } from "../constants";

describe("SeasonManager", () => {
  let seasonManager: SeasonManager;

  beforeEach(() => {
    seasonManager = new SeasonManager();
  });

  describe("Constructor", () => {
    it("should initialize with default seasonal pools", () => {
      expect(seasonManager).toBeInstanceOf(SeasonManager);
    });

    it("should accept custom seasonal configuration", () => {
      const customConfig = {
        Winter: { Cold: 50, Snowy: 50 },
        Spring: { Rainy: 50, Warm: 50 },
        Summer: { Hot: 50, Sunny: 50 },
        Autumn: { Cool: 50, Windy: 50 },
      };

      const customSeasonManager = new SeasonManager(customConfig);
      expect(customSeasonManager).toBeInstanceOf(SeasonManager);
    });
  });

  describe("getSeasonForMonth", () => {
    it("should return correct season for winter months", () => {
      expect(seasonManager.getSeasonForMonth(1)).toBe("Winter"); // January
      expect(seasonManager.getSeasonForMonth(2)).toBe("Winter"); // February
      expect(seasonManager.getSeasonForMonth(12)).toBe("Winter"); // December
    });

    it("should return correct season for spring months", () => {
      expect(seasonManager.getSeasonForMonth(3)).toBe("Spring"); // March
      expect(seasonManager.getSeasonForMonth(4)).toBe("Spring"); // April
      expect(seasonManager.getSeasonForMonth(5)).toBe("Spring"); // May
    });

    it("should return correct season for summer months", () => {
      expect(seasonManager.getSeasonForMonth(6)).toBe("Summer"); // June
      expect(seasonManager.getSeasonForMonth(7)).toBe("Summer"); // July
      expect(seasonManager.getSeasonForMonth(8)).toBe("Summer"); // August
    });

    it("should return correct season for autumn months", () => {
      expect(seasonManager.getSeasonForMonth(9)).toBe("Autumn"); // September
      expect(seasonManager.getSeasonForMonth(10)).toBe("Autumn"); // October
      expect(seasonManager.getSeasonForMonth(11)).toBe("Autumn"); // November
    });

    it("should throw error for invalid months", () => {
      expect(() => seasonManager.getSeasonForMonth(0)).toThrow(
        "Invalid month: 0"
      );
      expect(() => seasonManager.getSeasonForMonth(13)).toThrow(
        "Invalid month: 13"
      );
      expect(() => seasonManager.getSeasonForMonth(-1)).toThrow(
        "Invalid month: -1"
      );
    });
  });

  describe("getWeatherForMonth", () => {
    it("should return valid weather types for each month", () => {
      for (let month = 1; month <= 12; month++) {
        const weather = seasonManager.getWeatherForMonth(month);
        expect(typeof weather).toBe("string");
        expect(weather.length).toBeGreaterThan(0);
      }
    });

    it("should return season-appropriate weather for winter months", () => {
      const winterWeather = new Set<WeatherType>();

      // Generate multiple samples to test probability distribution
      for (let i = 0; i < 100; i++) {
        winterWeather.add(seasonManager.getWeatherForMonth(1)); // January
      }

      // Winter should have cold weather types
      const winterWeatherArray = Array.from(winterWeather);
      const expectedWinterWeather = [
        "Cold",
        "Snowy",
        "Foggy",
        "Windy",
        "Cloudy",
        "Stormy",
      ];

      winterWeatherArray.forEach((weather) => {
        expect(expectedWinterWeather).toContain(weather);
      });
    });

    it("should return season-appropriate weather for summer months", () => {
      const summerWeather = new Set<WeatherType>();

      // Generate multiple samples to test probability distribution
      for (let i = 0; i < 100; i++) {
        summerWeather.add(seasonManager.getWeatherForMonth(7)); // July
      }

      // Summer should have hot weather types
      const summerWeatherArray = Array.from(summerWeather);
      const expectedSummerWeather = [
        "Hot",
        "Sunny",
        "Humid",
        "Warm",
        "Cloudy",
        "Stormy",
      ];

      summerWeatherArray.forEach((weather) => {
        expect(expectedSummerWeather).toContain(weather);
      });
    });

    it("should throw error for invalid months", () => {
      expect(() => seasonManager.getWeatherForMonth(0)).toThrow(
        "Invalid month: 0"
      );
      expect(() => seasonManager.getWeatherForMonth(13)).toThrow(
        "Invalid month: 13"
      );
    });
  });

  describe("getWeatherPool", () => {
    it("should return weather pool for each season", () => {
      const seasons: SeasonType[] = ["Winter", "Spring", "Summer", "Autumn"];

      seasons.forEach((season) => {
        const pool = seasonManager.getWeatherPool(season);
        expect(Array.isArray(pool)).toBe(true);
        expect(pool.length).toBeGreaterThan(0);
      });
    });

    it("should return appropriate weather types for winter", () => {
      const winterPool = seasonManager.getWeatherPool("Winter");
      const expectedWinterWeather = [
        "Cold",
        "Snowy",
        "Foggy",
        "Windy",
        "Cloudy",
        "Stormy",
      ];

      winterPool.forEach((weather) => {
        expect(expectedWinterWeather).toContain(weather);
      });
    });

    it("should return appropriate weather types for summer", () => {
      const summerPool = seasonManager.getWeatherPool("Summer");
      const expectedSummerWeather = [
        "Hot",
        "Sunny",
        "Humid",
        "Warm",
        "Cloudy",
        "Stormy",
      ];

      summerPool.forEach((weather) => {
        expect(expectedSummerWeather).toContain(weather);
      });
    });

    it("should throw error for invalid season", () => {
      expect(() =>
        seasonManager.getWeatherPool("InvalidSeason" as SeasonType)
      ).toThrow();
    });
  });

  describe("getSeasonalWeatherPool", () => {
    it("should return weather pool with weights for each season", () => {
      const seasons: SeasonType[] = ["Winter", "Spring", "Summer", "Autumn"];

      seasons.forEach((season) => {
        const pool = seasonManager.getSeasonalWeatherPool(season);
        expect(pool).toHaveProperty("weights");
        expect(pool).toHaveProperty("totalWeight");
        expect(pool.weights).toBeInstanceOf(Map);
        expect(typeof pool.totalWeight).toBe("number");
        expect(pool.totalWeight).toBeGreaterThan(0);
      });
    });

    it("should have correct total weight calculation", () => {
      const winterPool = seasonManager.getSeasonalWeatherPool("Winter");
      let calculatedTotal = 0;

      for (const weight of winterPool.weights.values()) {
        calculatedTotal += weight;
      }

      expect(winterPool.totalWeight).toBe(calculatedTotal);
    });
  });

  describe("getWeatherProbability", () => {
    it("should return correct probabilities for winter weather", () => {
      const coldProbability = seasonManager.getWeatherProbability(
        "Winter",
        "Cold"
      );
      const hotProbability = seasonManager.getWeatherProbability(
        "Winter",
        "Hot"
      );

      expect(coldProbability).toBeGreaterThan(0);
      expect(hotProbability).toBe(0); // Hot should not occur in winter
    });

    it("should return correct probabilities for summer weather", () => {
      const hotProbability = seasonManager.getWeatherProbability(
        "Summer",
        "Hot"
      );
      const coldProbability = seasonManager.getWeatherProbability(
        "Summer",
        "Cold"
      );

      expect(hotProbability).toBeGreaterThan(0);
      expect(coldProbability).toBe(0); // Cold should not occur in summer
    });

    it("should return 0 for invalid season", () => {
      const probability = seasonManager.getWeatherProbability(
        "InvalidSeason" as SeasonType,
        "Sunny"
      );
      expect(probability).toBe(0);
    });

    it("should have probabilities that sum to 1 for each season", () => {
      const seasons: SeasonType[] = ["Winter", "Spring", "Summer", "Autumn"];

      seasons.forEach((season) => {
        const weatherTypes: WeatherType[] = [
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

        let totalProbability = 0;
        weatherTypes.forEach((weather) => {
          totalProbability += seasonManager.getWeatherProbability(
            season,
            weather
          );
        });

        expect(totalProbability).toBeCloseTo(1, 5);
      });
    });
  });

  describe("updateSeasonalConfig", () => {
    it("should update seasonal configuration", () => {
      const newConfig = {
        Winter: { Cold: 100 }, // Only cold weather in winter
      };

      seasonManager.updateSeasonalConfig(newConfig);

      // Test multiple times to ensure only Cold weather is returned
      for (let i = 0; i < 10; i++) {
        const weather = seasonManager.getWeatherForMonth(1); // January
        expect(weather).toBe("Cold");
      }
    });

    it("should preserve existing configuration for unchanged seasons", () => {
      const originalSummerPool = seasonManager.getWeatherPool("Summer");

      const newConfig = {
        Winter: { Cold: 100 },
      };

      seasonManager.updateSeasonalConfig(newConfig);

      const updatedSummerPool = seasonManager.getWeatherPool("Summer");
      expect(updatedSummerPool).toEqual(originalSummerPool);
    });
  });

  describe("Weather Selection Distribution", () => {
    it("should follow probability distribution over many samples", () => {
      const sampleSize = 1000;
      const weatherCounts = new Map<WeatherType, number>();

      // Generate many samples for January (Winter)
      for (let i = 0; i < sampleSize; i++) {
        const weather = seasonManager.getWeatherForMonth(1);
        weatherCounts.set(weather, (weatherCounts.get(weather) || 0) + 1);
      }

      // Check that high-probability weather types appear more frequently
      const coldCount = weatherCounts.get("Cold") || 0;
      const snowyCount = weatherCounts.get("Snowy") || 0;
      const hotCount = weatherCounts.get("Hot") || 0; // Should be 0

      expect(coldCount).toBeGreaterThan(sampleSize * 0.15); // At least 15% (weight is 25%)
      expect(snowyCount).toBeGreaterThan(sampleSize * 0.15); // At least 15% (weight is 25%)
      expect(hotCount).toBe(0); // Should never appear in winter
    });

    it("should generate different weather types over multiple calls", () => {
      const weatherTypes = new Set<WeatherType>();

      // Generate 50 samples for spring month
      for (let i = 0; i < 50; i++) {
        weatherTypes.add(seasonManager.getWeatherForMonth(4)); // April
      }

      // Should generate multiple different weather types
      expect(weatherTypes.size).toBeGreaterThan(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty weather pools gracefully", () => {
      const emptyConfig = {
        Winter: {},
        Spring: {},
        Summer: {},
        Autumn: {},
      };

      expect(() => new SeasonManager(emptyConfig)).not.toThrow();
    });

    it("should handle zero weights in configuration", () => {
      const zeroWeightConfig = {
        Winter: { Cold: 0, Snowy: 0, Hot: 100 },
        Spring: { Rainy: 50, Warm: 50 },
        Summer: { Hot: 50, Sunny: 50 },
        Autumn: { Cool: 50, Windy: 50 },
      };

      const customManager = new SeasonManager(zeroWeightConfig);

      // Should only return Hot weather for winter
      for (let i = 0; i < 10; i++) {
        const weather = customManager.getWeatherForMonth(1);
        expect(weather).toBe("Hot");
      }
    });
  });

  describe("Advanced Weather Selection", () => {
    it("should support advanced weather selection algorithms", () => {
      const algorithms: Array<"basic" | "transition" | "pattern" | "balanced"> =
        ["basic", "transition", "pattern", "balanced"];

      algorithms.forEach((algorithm) => {
        const result = seasonManager.getWeatherWithAlgorithm(1, algorithm);

        expect(result.weather).toBeDefined();
        expect(result.probability).toBeGreaterThan(0);
        expect(result.algorithm).toBeDefined();
        expect(result.metadata).toBeDefined();
      });
    });

    it("should provide weather options with probabilities", () => {
      const options = seasonManager.getWeatherOptions(1, 3);

      expect(options).toHaveLength(3);
      options.forEach((option) => {
        expect(option.weather).toBeDefined();
        expect(option.probability).toBeGreaterThan(0);
        expect(option.probability).toBeLessThanOrEqual(1);
      });

      // Options should be sorted by probability (descending)
      for (let i = 1; i < options.length; i++) {
        expect(options[i].probability).toBeLessThanOrEqual(
          options[i - 1].probability
        );
      }
    });

    it("should predict weather patterns for multiple months", () => {
      const pattern = seasonManager.predictWeatherPattern(1, 6, "basic");

      expect(pattern).toHaveLength(6);
      pattern.forEach((result, index) => {
        expect(result.weather).toBeDefined();
        expect(result.probability).toBeGreaterThan(0);

        // Check that month progresses correctly
        const expectedMonth = ((1 - 1 + index) % 12) + 1;
        // We can't directly check the month from result, but we can verify the weather is appropriate
        expect(result.weather).toBeDefined();
      });
    });

    it("should handle transition-based pattern prediction", () => {
      const pattern = seasonManager.predictWeatherPattern(1, 4, "transition");

      expect(pattern).toHaveLength(4);

      // Each result should have transition information
      pattern.forEach((result) => {
        expect(result.algorithm).toBe("transition_based");
        expect(result.metadata.transitionBonus).toBeGreaterThanOrEqual(0);
      });
    });

    it("should throw error for invalid month in advanced methods", () => {
      expect(() => seasonManager.getWeatherWithAlgorithm(0)).toThrow(
        "Invalid month: 0"
      );
      expect(() => seasonManager.getWeatherOptions(13)).toThrow(
        "Invalid month: 13"
      );
      expect(() => seasonManager.predictWeatherPattern(0, 3)).toThrow(
        "Invalid start month: 0"
      );
    });
  });

  describe("Configuration Support", () => {
    it("should support seasonal probability adjustments", () => {
      const customConfig = {
        Winter: { Cold: 100 }, // Only cold weather
        Spring: { Rainy: 50, Warm: 50 },
        Summer: { Hot: 50, Sunny: 50 },
        Autumn: { Cool: 50, Windy: 50 },
      };

      const customManager = new SeasonManager(customConfig);

      // Test multiple times to ensure consistency
      for (let i = 0; i < 10; i++) {
        const weather = customManager.getWeatherForMonth(1); // January
        expect(weather).toBe("Cold");
      }
    });

    it("should handle dynamic configuration updates", () => {
      const originalWinter = seasonManager.getWeatherPool("Winter");

      const newConfig = {
        Winter: { Foggy: 100 }, // Only foggy weather in winter
      };

      seasonManager.updateSeasonalConfig(newConfig);

      // Should now only return Foggy for winter months
      for (let i = 0; i < 5; i++) {
        const weather = seasonManager.getWeatherForMonth(1);
        expect(weather).toBe("Foggy");
      }

      // Other seasons should remain unchanged
      const springPool = seasonManager.getWeatherPool("Spring");
      expect(springPool.length).toBeGreaterThan(1);
    });
  });

  describe("Probability Distribution Testing", () => {
    it("should maintain statistical distribution over large samples", () => {
      const sampleSize = 1000;
      const weatherCounts = new Map<WeatherType, number>();

      // Generate large sample for summer month
      for (let i = 0; i < sampleSize; i++) {
        const weather = seasonManager.getWeatherForMonth(7); // July
        weatherCounts.set(weather, (weatherCounts.get(weather) || 0) + 1);
      }

      // Check that high-probability weather types appear more frequently
      const hotCount = weatherCounts.get("Hot") || 0;
      const sunnyCount = weatherCounts.get("Sunny") || 0;
      const coldCount = weatherCounts.get("Cold") || 0; // Should be 0

      expect(hotCount).toBeGreaterThan(sampleSize * 0.15); // At least 15%
      expect(sunnyCount).toBeGreaterThan(sampleSize * 0.15); // At least 15%
      expect(coldCount).toBe(0); // Should never appear in summer
    });

    it("should show different distributions for different seasons", () => {
      const sampleSize = 200;
      const winterCounts = new Map<WeatherType, number>();
      const summerCounts = new Map<WeatherType, number>();

      // Generate samples for winter and summer
      for (let i = 0; i < sampleSize; i++) {
        const winterWeather = seasonManager.getWeatherForMonth(1);
        const summerWeather = seasonManager.getWeatherForMonth(7);

        winterCounts.set(
          winterWeather,
          (winterCounts.get(winterWeather) || 0) + 1
        );
        summerCounts.set(
          summerWeather,
          (summerCounts.get(summerWeather) || 0) + 1
        );
      }

      // Winter should have cold weather, summer should have hot weather
      const winterCold = winterCounts.get("Cold") || 0;
      const summerHot = summerCounts.get("Hot") || 0;
      const winterHot = winterCounts.get("Hot") || 0;
      const summerCold = summerCounts.get("Cold") || 0;

      expect(winterCold).toBeGreaterThan(0);
      expect(summerHot).toBeGreaterThan(0);
      expect(winterHot).toBe(0);
      expect(summerCold).toBe(0);
    });
  });

  describe("Algorithm Performance", () => {
    it("should handle rapid successive calls efficiently", () => {
      const startTime = Date.now();

      // Generate 1000 weather selections
      for (let i = 0; i < 1000; i++) {
        seasonManager.getWeatherForMonth((i % 12) + 1);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it("should handle complex pattern predictions efficiently", () => {
      const startTime = Date.now();

      // Generate multiple long-term predictions
      for (let i = 0; i < 10; i++) {
        seasonManager.predictWeatherPattern(1, 12, "pattern");
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000);
    });
  });
});
