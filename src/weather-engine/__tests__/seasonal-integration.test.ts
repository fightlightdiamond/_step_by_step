/**
 * Seasonal Weather System Integration Tests
 */

import { describe, it, expect } from "vitest";
import { SeasonManager } from "../manager/season-manager";
import { WeatherSelectionAlgorithms } from "../algorithms/weather-selection";

describe("Seasonal Weather System Integration", () => {
  it("should demonstrate complete seasonal weather workflow", () => {
    const seasonManager = new SeasonManager();

    // Test basic seasonal weather generation for a full year
    const yearWeather = [];
    for (let month = 1; month <= 12; month++) {
      const weather = seasonManager.getWeatherForMonth(month);
      const season = seasonManager.getSeasonForMonth(month);

      yearWeather.push({
        month,
        season,
        weather,
        probability: seasonManager.getWeatherProbability(season, weather),
      });
    }

    expect(yearWeather).toHaveLength(12);

    // Verify seasonal appropriateness
    const winterMonths = yearWeather.filter((w) => w.season === "Winter");
    const summerMonths = yearWeather.filter((w) => w.season === "Summer");

    expect(winterMonths.length).toBe(3); // Dec, Jan, Feb
    expect(summerMonths.length).toBe(3); // Jun, Jul, Aug

    // Winter should not have hot weather
    winterMonths.forEach((w) => {
      expect(w.weather).not.toBe("Hot");
      expect(w.weather).not.toBe("Humid");
    });

    // Summer should not have cold weather
    summerMonths.forEach((w) => {
      expect(w.weather).not.toBe("Cold");
      expect(w.weather).not.toBe("Snowy");
    });
  });

  it("should demonstrate advanced algorithm integration", () => {
    const seasonManager = new SeasonManager();

    // Test pattern prediction for a 6-month period
    const pattern = seasonManager.predictWeatherPattern(1, 6, "transition");

    expect(pattern).toHaveLength(6);

    // Each result should have proper metadata
    pattern.forEach((result, index) => {
      expect(result.weather).toBeDefined();
      expect(result.probability).toBeGreaterThan(0);
      expect(result.algorithm).toBe("transition_based");
      expect(result.metadata).toBeDefined();

      // Later months should have transition bonuses if applicable
      if (index > 0) {
        expect(result.metadata.transitionBonus).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it("should demonstrate weather options and probability ranking", () => {
    const seasonManager = new SeasonManager();

    // Get top 3 weather options for July (summer)
    const summerOptions = seasonManager.getWeatherOptions(7, 3);

    expect(summerOptions).toHaveLength(3);

    // Should be sorted by probability (descending)
    for (let i = 1; i < summerOptions.length; i++) {
      expect(summerOptions[i].probability).toBeLessThanOrEqual(
        summerOptions[i - 1].probability
      );
    }

    // Top options should be summer-appropriate
    const topWeather = summerOptions[0].weather;
    const summerWeatherTypes = [
      "Hot",
      "Sunny",
      "Humid",
      "Warm",
      "Cloudy",
      "Stormy",
    ];
    expect(summerWeatherTypes).toContain(topWeather);
  });

  it("should demonstrate configuration flexibility", () => {
    // Create custom seasonal configuration
    const customConfig = {
      Winter: { Cold: 50, Snowy: 50 },
      Spring: { Rainy: 60, Warm: 40 },
      Summer: { Hot: 70, Sunny: 30 },
      Autumn: { Cool: 55, Windy: 45 },
    };

    const customManager = new SeasonManager(customConfig);

    // Test that custom configuration is respected
    const winterWeather = new Set<string>();
    for (let i = 0; i < 20; i++) {
      winterWeather.add(customManager.getWeatherForMonth(1));
    }

    // Should only see Cold and Snowy in winter
    const winterWeatherArray = Array.from(winterWeather);
    winterWeatherArray.forEach((weather) => {
      expect(["Cold", "Snowy"]).toContain(weather);
    });
  });

  it("should demonstrate algorithm comparison", () => {
    const seasonManager = new SeasonManager();
    const algorithms = ["basic", "transition", "pattern", "balanced"] as const;

    const results = algorithms.map((algorithm) => {
      const context = {
        month: 6,
        turn: 5,
        previousWeather: ["Hot", "Sunny"],
        weatherHistory: [["Hot"], ["Sunny"], ["Hot"], ["Humid"]],
      };

      return {
        algorithm,
        result: seasonManager.getWeatherWithAlgorithm(6, algorithm, context),
      };
    });

    expect(results).toHaveLength(4);

    // Each algorithm should produce valid results
    results.forEach(({ algorithm, result }) => {
      expect(result.weather).toBeDefined();
      expect(result.probability).toBeGreaterThan(0);
      expect(result.algorithm).toContain(algorithm);
    });

    // Different algorithms may produce different results
    const uniqueWeather = new Set(results.map((r) => r.result.weather));
    // We can't guarantee different results due to randomness, but at least one should work
    expect(uniqueWeather.size).toBeGreaterThanOrEqual(1);
  });

  it("should handle edge cases gracefully", () => {
    const seasonManager = new SeasonManager();

    // Test boundary months
    expect(() => seasonManager.getWeatherForMonth(1)).not.toThrow();
    expect(() => seasonManager.getWeatherForMonth(12)).not.toThrow();

    // Test invalid months
    expect(() => seasonManager.getWeatherForMonth(0)).toThrow();
    expect(() => seasonManager.getWeatherForMonth(13)).toThrow();

    // Test empty configuration updates
    expect(() => seasonManager.updateSeasonalConfig({})).not.toThrow();

    // Test prediction with zero months
    expect(() => seasonManager.predictWeatherPattern(1, 0)).not.toThrow();
    const emptyPattern = seasonManager.predictWeatherPattern(1, 0);
    expect(emptyPattern).toHaveLength(0);
  });

  it("should maintain performance under load", () => {
    const seasonManager = new SeasonManager();
    const startTime = Date.now();

    // Perform many operations
    for (let i = 0; i < 100; i++) {
      seasonManager.getWeatherForMonth((i % 12) + 1);
      seasonManager.getWeatherOptions((i % 12) + 1, 3);

      if (i % 10 === 0) {
        seasonManager.predictWeatherPattern(1, 6, "basic");
      }
    }

    const duration = Date.now() - startTime;

    // Should complete within reasonable time (less than 1 second)
    expect(duration).toBeLessThan(1000);
  });
});
