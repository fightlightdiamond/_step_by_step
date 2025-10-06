/**
 * Performance Benchmarking Tests for Weather Engine
 * Tests performance characteristics and identifies bottlenecks
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { WeatherManager } from "../manager/weather-manager";
import { SeasonManager } from "../manager/season-manager";
import { WeatherCardManager } from "../manager/weather-card-manager";
import { IntegratedWeatherManager } from "../manager/integrated-weather-manager";
import { WeatherConfigLoader } from "../config/config-loader";
import { WeatherType, WeatherCard } from "../types";
import defaultWeatherConfig from "../config/weather-effects.json";

interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  operationsPerSecond: number;
  memoryUsage?: {
    before: number;
    after: number;
    delta: number;
  };
}

describe("Weather Engine Performance Benchmarks", () => {
  let config: any;
  let weatherManager: WeatherManager;
  let seasonManager: SeasonManager;
  let cardManager: WeatherCardManager;
  let integratedManager: IntegratedWeatherManager;

  beforeEach(() => {
    const configLoader = WeatherConfigLoader.getInstance();
    config = configLoader.loadFromData(defaultWeatherConfig);
    weatherManager = new WeatherManager(config);
    seasonManager = new SeasonManager();
    cardManager = new WeatherCardManager();
    integratedManager = new IntegratedWeatherManager(config);
  });

  describe("Core Weather Operations", () => {
    it("should benchmark weather application performance", () => {
      const iterations = 10000;
      const weatherCombinations = [
        ["Sunny"],
        ["Rainy", "Cloudy"],
        ["Hot", "Humid", "Sunny"],
        ["Cold", "Snowy", "Windy"],
        ["Stormy", "Rainy", "Cloudy", "Windy"],
      ];

      const result = benchmarkOperation(
        "Weather Application",
        iterations,
        () => {
          const combination =
            weatherCombinations[
              Math.floor(Math.random() * weatherCombinations.length)
            ];
          weatherManager.applyWeather(combination);
        }
      );

      // Should handle at least 1000 operations per second
      expect(result.operationsPerSecond).toBeGreaterThan(1000);
      expect(result.averageTime).toBeLessThan(1); // Less than 1ms average

      logBenchmarkResult(result);
    });

    it("should benchmark elemental effect calculations", () => {
      const iterations = 50000;

      // Set up various weather states
      const weatherStates = [
        ["Sunny", "Hot"],
        ["Rainy", "Cold", "Stormy"],
        ["Windy", "Cloudy", "Cool"],
        ["Snowy", "Foggy", "Cold"],
        ["Humid", "Warm", "Sunny"],
      ];

      let stateIndex = 0;
      const result = benchmarkOperation(
        "Elemental Effect Calculation",
        iterations,
        () => {
          weatherManager.applyWeather(
            weatherStates[stateIndex % weatherStates.length]
          );
          weatherManager.calculateElementalModifiers();
          stateIndex++;
        }
      );

      // Should handle at least 5000 calculations per second
      expect(result.operationsPerSecond).toBeGreaterThan(5000);
      expect(result.averageTime).toBeLessThan(0.2); // Less than 0.2ms average

      logBenchmarkResult(result);
    });

    it("should benchmark weather validation performance", () => {
      const iterations = 20000;
      const testCombinations = generateTestWeatherCombinations(100);

      let combinationIndex = 0;
      const result = benchmarkOperation(
        "Weather Validation",
        iterations,
        () => {
          const combination =
            testCombinations[combinationIndex % testCombinations.length];
          weatherManager.validateWeatherCombination(combination);
          combinationIndex++;
        }
      );

      // Should handle at least 2000 validations per second
      expect(result.operationsPerSecond).toBeGreaterThan(2000);
      expect(result.averageTime).toBeLessThan(0.5); // Less than 0.5ms average

      logBenchmarkResult(result);
    });
  });

  describe("Seasonal Weather Performance", () => {
    it("should benchmark seasonal weather generation", () => {
      const iterations = 15000;

      let month = 1;
      const result = benchmarkOperation(
        "Seasonal Weather Generation",
        iterations,
        () => {
          seasonManager.getWeatherForMonth(month);
          month = (month % 12) + 1;
        }
      );

      // Should handle at least 3000 generations per second
      expect(result.operationsPerSecond).toBeGreaterThan(3000);
      expect(result.averageTime).toBeLessThan(0.33); // Less than 0.33ms average

      logBenchmarkResult(result);
    });

    it("should benchmark weather pattern prediction", () => {
      const iterations = 1000;

      const result = benchmarkOperation(
        "Weather Pattern Prediction",
        iterations,
        () => {
          const startMonth = Math.floor(Math.random() * 12) + 1;
          const months = Math.floor(Math.random() * 6) + 1;
          seasonManager.predictWeatherPattern(startMonth, months, "transition");
        }
      );

      // Should handle at least 100 predictions per second
      expect(result.operationsPerSecond).toBeGreaterThan(100);
      expect(result.averageTime).toBeLessThan(10); // Less than 10ms average

      logBenchmarkResult(result);
    });
  });

  describe("Card System Performance", () => {
    it("should benchmark card play operations", () => {
      const iterations = 8000;
      const testCards = generateTestWeatherCards(50);

      weatherManager.applyWeather(["Cloudy"]); // Set initial weather

      let cardIndex = 0;
      const result = benchmarkOperation(
        "Card Play Operations",
        iterations,
        () => {
          const card = testCards[cardIndex % testCards.length];
          try {
            cardManager.playCard(card, weatherManager.getCurrentWeather());
          } catch (error) {
            // Some cards may fail validation, that's expected
          }
          cardIndex++;
        }
      );

      // Should handle at least 1000 card plays per second
      expect(result.operationsPerSecond).toBeGreaterThan(1000);
      expect(result.averageTime).toBeLessThan(1); // Less than 1ms average

      logBenchmarkResult(result);
    });

    it("should benchmark card validation", () => {
      const iterations = 25000;
      const testCards = generateTestWeatherCards(100);

      let cardIndex = 0;
      const result = benchmarkOperation("Card Validation", iterations, () => {
        const card = testCards[cardIndex % testCards.length];
        cardManager.validateCardPlay(card);
        cardIndex++;
      });

      // Should handle at least 5000 validations per second
      expect(result.operationsPerSecond).toBeGreaterThan(5000);
      expect(result.averageTime).toBeLessThan(0.2); // Less than 0.2ms average

      logBenchmarkResult(result);
    });
  });

  describe("Integrated System Performance", () => {
    it("should benchmark full turn processing", () => {
      const iterations = 2000;

      let turn = 1;
      const result = benchmarkOperation(
        "Full Turn Processing",
        iterations,
        () => {
          integratedManager.startTurn(turn);

          // Simulate turn activities
          const weather = generateRandomWeatherCombination();
          integratedManager.applyWeather(weather);

          const card = generateRandomWeatherCard(turn);
          if (integratedManager.canPlayCard(card)) {
            integratedManager.playCard(card);
          }

          integratedManager.calculateElementalModifiers();
          integratedManager.endTurn();

          turn++;
        }
      );

      // Should handle at least 200 full turns per second
      expect(result.operationsPerSecond).toBeGreaterThan(200);
      expect(result.averageTime).toBeLessThan(5); // Less than 5ms average

      logBenchmarkResult(result);
    });

    it("should benchmark game mode switching", () => {
      const iterations = 5000;
      const gameModes = [
        "12-month-campaign",
        "weather-chaos",
        "seasonal-event",
        "forecast-mode",
        "weather-survival",
      ];

      let modeIndex = 0;
      const result = benchmarkOperation(
        "Game Mode Switching",
        iterations,
        () => {
          const mode = gameModes[modeIndex % gameModes.length];
          integratedManager.setGameMode(mode);
          modeIndex++;
        }
      );

      // Should handle at least 1000 mode switches per second
      expect(result.operationsPerSecond).toBeGreaterThan(1000);
      expect(result.averageTime).toBeLessThan(1); // Less than 1ms average

      logBenchmarkResult(result);
    });
  });

  describe("Memory Performance", () => {
    it("should benchmark memory usage during extended gameplay", () => {
      const memoryBefore = process.memoryUsage().heapUsed;

      // Simulate 1000 turns of gameplay
      for (let turn = 1; turn <= 1000; turn++) {
        integratedManager.startTurn(turn);

        const weather = generateRandomWeatherCombination();
        integratedManager.applyWeather(weather);

        const card = generateRandomWeatherCard(turn);
        if (integratedManager.canPlayCard(card)) {
          integratedManager.playCard(card);
        }

        integratedManager.calculateElementalModifiers();
        integratedManager.endTurn();

        // Force garbage collection every 100 turns if available
        if (turn % 100 === 0 && global.gc) {
          global.gc();
        }
      }

      const memoryAfter = process.memoryUsage().heapUsed;
      const memoryIncrease = memoryAfter - memoryBefore;
      const memoryIncreaseKB = memoryIncrease / 1024;

      console.log(
        `Memory usage after 1000 turns: +${memoryIncreaseKB.toFixed(2)} KB`
      );

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it("should benchmark memory efficiency of weather history", () => {
      const memoryBefore = process.memoryUsage().heapUsed;

      // Build up large weather history
      for (let i = 0; i < 5000; i++) {
        integratedManager.startTurn(i + 1);
        const weather = generateRandomWeatherCombination();
        integratedManager.applyWeather(weather);
        integratedManager.endTurn();
      }

      const memoryAfter = process.memoryUsage().heapUsed;
      const memoryIncrease = memoryAfter - memoryBefore;
      const memoryIncreaseKB = memoryIncrease / 1024;

      console.log(
        `Memory usage for 5000 turn history: +${memoryIncreaseKB.toFixed(2)} KB`
      );

      // Should be efficient with history storage
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });
  });

  describe("Scalability Tests", () => {
    it("should maintain performance with increasing complexity", () => {
      const complexityLevels = [1, 2, 3, 4, 5];
      const results: BenchmarkResult[] = [];

      complexityLevels.forEach((level) => {
        const iterations = 1000;

        const result = benchmarkOperation(
          `Complexity Level ${level}`,
          iterations,
          () => {
            // Increase complexity by adding more weather types and operations
            const weatherCount = level;
            const weather = generateRandomWeatherCombination().slice(
              0,
              weatherCount
            );

            integratedManager.applyWeather(weather);
            integratedManager.calculateElementalModifiers();

            // Add more operations at higher complexity levels
            for (let i = 0; i < level; i++) {
              integratedManager.validateCurrentWeather();
            }
          }
        );

        results.push(result);
        logBenchmarkResult(result);
      });

      // Performance should degrade gracefully
      for (let i = 1; i < results.length; i++) {
        const prevOps = results[i - 1].operationsPerSecond;
        const currentOps = results[i].operationsPerSecond;

        // Should not degrade by more than 50% per complexity level
        expect(currentOps).toBeGreaterThan(prevOps * 0.5);
      }
    });
  });
});

// Benchmark utility functions
function benchmarkOperation(
  name: string,
  iterations: number,
  operation: () => void
): BenchmarkResult {
  const memoryBefore = process.memoryUsage().heapUsed;

  // Warm up
  for (let i = 0; i < Math.min(100, iterations / 10); i++) {
    operation();
  }

  // Actual benchmark
  const startTime = process.hrtime.bigint();

  for (let i = 0; i < iterations; i++) {
    operation();
  }

  const endTime = process.hrtime.bigint();
  const memoryAfter = process.memoryUsage().heapUsed;

  const totalTimeNs = Number(endTime - startTime);
  const totalTimeMs = totalTimeNs / 1_000_000;
  const averageTimeMs = totalTimeMs / iterations;
  const operationsPerSecond = 1000 / averageTimeMs;

  return {
    operation: name,
    iterations,
    totalTime: totalTimeMs,
    averageTime: averageTimeMs,
    operationsPerSecond,
    memoryUsage: {
      before: memoryBefore,
      after: memoryAfter,
      delta: memoryAfter - memoryBefore,
    },
  };
}

function logBenchmarkResult(result: BenchmarkResult): void {
  console.log(`\n📊 ${result.operation} Benchmark:`);
  console.log(`   Iterations: ${result.iterations.toLocaleString()}`);
  console.log(`   Total Time: ${result.totalTime.toFixed(2)}ms`);
  console.log(`   Average Time: ${result.averageTime.toFixed(4)}ms`);
  console.log(
    `   Operations/sec: ${Math.round(
      result.operationsPerSecond
    ).toLocaleString()}`
  );

  if (result.memoryUsage) {
    const memoryDeltaKB = result.memoryUsage.delta / 1024;
    console.log(`   Memory Delta: ${memoryDeltaKB.toFixed(2)} KB`);
  }
}

function generateTestWeatherCombinations(count: number): WeatherType[][] {
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

  const combinations: WeatherType[][] = [];

  for (let i = 0; i < count; i++) {
    const size = Math.floor(Math.random() * 4) + 1; // 1-4 weather types
    const combination: WeatherType[] = [];

    for (let j = 0; j < size; j++) {
      const weather = allWeather[Math.floor(Math.random() * allWeather.length)];
      if (!combination.includes(weather)) {
        combination.push(weather);
      }
    }

    combinations.push(combination);
  }

  return combinations;
}

function generateTestWeatherCards(count: number): WeatherCard[] {
  const weatherTypes: WeatherType[] = [
    "Sunny",
    "Rainy",
    "Stormy",
    "Hot",
    "Cold",
    "Windy",
    "Cloudy",
    "Snowy",
  ];

  const cards: WeatherCard[] = [];

  for (let i = 0; i < count; i++) {
    cards.push({
      id: `benchmark-card-${i}`,
      type: Math.random() < 0.8 ? "Weather" : "BreakWeather",
      name: `Benchmark Card ${i}`,
      description: `Test card for benchmarking ${i}`,
      weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
      cost: Math.floor(Math.random() * 5) + 1,
    });
  }

  return cards;
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
  const selected: WeatherType[] = [];

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
    id: `perf-test-card-${id}`,
    type: "Weather",
    name: `Performance Test Card ${id}`,
    description: `Performance test weather card ${id}`,
    weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
  };
}
