/**
 * Stress Tests for Weather Engine
 * Tests system behavior under extreme conditions and extended usage
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { WeatherManager } from "../manager/weather-manager";
import { IntegratedWeatherManager } from "../manager/integrated-weather-manager";
import { WeatherConfigLoader } from "../config/config-loader";
import { WeatherType, WeatherCard } from "../types";
import defaultWeatherConfig from "../config/weather-effects.json";

describe("Weather Engine Stress Tests", () => {
  let integratedManager: IntegratedWeatherManager;
  let config: any;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    const configLoader = WeatherConfigLoader.getInstance();
    config = configLoader.loadFromData(defaultWeatherConfig);
    integratedManager = new IntegratedWeatherManager(config);

    // Suppress console output during stress tests
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore console output
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe("Extended Gameplay Sessions", () => {
    it("should handle 10,000 turn marathon session", () => {
      const sessionData = {
        turns: 0,
        weatherChanges: 0,
        cardsPlayed: 0,
        errors: 0,
        memorySnapshots: [],
      };

      const startTime = Date.now();
      const initialMemory = process.memoryUsage().heapUsed;

      for (let turn = 1; turn <= 10000; turn++) {
        try {
          integratedManager.startTurn(turn);
          sessionData.turns++;

          // Randomly change weather (70% chance)
          if (Math.random() < 0.7) {
            const weather = generateStressTestWeather();
            integratedManager.applyWeather(weather);
            sessionData.weatherChanges++;
          }

          // Randomly play cards (40% chance)
          if (Math.random() < 0.4) {
            const card = generateStressTestCard(turn);
            if (integratedManager.canPlayCard(card)) {
              integratedManager.playCard(card);
              sessionData.cardsPlayed++;
            }
          }

          // Calculate effects every turn
          integratedManager.calculateElementalModifiers();

          // Take memory snapshots periodically
          if (turn % 1000 === 0) {
            sessionData.memorySnapshots.push({
              turn,
              memory: process.memoryUsage().heapUsed,
              timestamp: Date.now(),
            });

            // Force garbage collection if available
            if (global.gc) {
              global.gc();
            }
          }

          integratedManager.endTurn();
        } catch (error) {
          sessionData.errors++;
          console.error(`Error on turn ${turn}:`, error);
        }
      }

      const endTime = Date.now();
      const finalMemory = process.memoryUsage().heapUsed;
      const duration = endTime - startTime;

      // Verify session completed successfully
      expect(sessionData.turns).toBe(10000);
      expect(sessionData.errors).toBe(0);
      expect(duration).toBeLessThan(60000); // Should complete within 1 minute

      // Memory usage should be reasonable
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB

      // Performance should remain consistent
      const avgTimePerTurn = duration / 10000;
      expect(avgTimePerTurn).toBeLessThan(5); // Less than 5ms per turn

      console.log(`\n🏃‍♂️ Marathon Session Results:`);
      console.log(`   Turns: ${sessionData.turns.toLocaleString()}`);
      console.log(
        `   Weather Changes: ${sessionData.weatherChanges.toLocaleString()}`
      );
      console.log(
        `   Cards Played: ${sessionData.cardsPlayed.toLocaleString()}`
      );
      console.log(`   Duration: ${duration.toLocaleString()}ms`);
      console.log(`   Avg Time/Turn: ${avgTimePerTurn.toFixed(2)}ms`);
      console.log(
        `   Memory Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`
      );
    });

    it("should handle rapid-fire operations", () => {
      const operations = 50000;
      const startTime = Date.now();
      let successCount = 0;
      let errorCount = 0;

      // Perform rapid operations without delays
      for (let i = 0; i < operations; i++) {
        try {
          const operationType = i % 4;

          switch (operationType) {
            case 0: // Weather application
              const weather = generateStressTestWeather();
              integratedManager.applyWeather(weather);
              break;

            case 1: // Effect calculation
              integratedManager.calculateElementalModifiers();
              break;

            case 2: // Weather validation
              const testWeather = generateStressTestWeather();
              integratedManager.validateWeatherCombination(testWeather);
              break;

            case 3: // Card operations
              const card = generateStressTestCard(i);
              integratedManager.canPlayCard(card);
              break;
          }

          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      const duration = Date.now() - startTime;
      const operationsPerSecond = operations / (duration / 1000);

      expect(successCount).toBeGreaterThan(operations * 0.8); // At least 80% success
      expect(operationsPerSecond).toBeGreaterThan(1000); // At least 1000 ops/sec
      expect(duration).toBeLessThan(50000); // Complete within 50 seconds

      console.log(`\n⚡ Rapid-Fire Operations Results:`);
      console.log(`   Operations: ${operations.toLocaleString()}`);
      console.log(`   Success: ${successCount.toLocaleString()}`);
      console.log(`   Errors: ${errorCount.toLocaleString()}`);
      console.log(`   Duration: ${duration.toLocaleString()}ms`);
      console.log(
        `   Ops/Second: ${Math.round(operationsPerSecond).toLocaleString()}`
      );
    });
  });

  describe("Memory Stress Tests", () => {
    it("should handle massive weather history without memory leaks", () => {
      const historySize = 50000;
      const memorySnapshots = [];

      // Build massive weather history
      for (let i = 0; i < historySize; i++) {
        integratedManager.startTurn(i + 1);

        const weather = generateStressTestWeather();
        integratedManager.applyWeather(weather);

        // Take memory snapshots periodically
        if (i % 5000 === 0) {
          memorySnapshots.push({
            turn: i + 1,
            memory: process.memoryUsage().heapUsed,
          });
        }

        integratedManager.endTurn();
      }

      // Analyze memory growth pattern
      const memoryGrowth = [];
      for (let i = 1; i < memorySnapshots.length; i++) {
        const growth =
          memorySnapshots[i].memory - memorySnapshots[i - 1].memory;
        memoryGrowth.push(growth);
      }

      // Memory growth should be linear or sublinear, not exponential
      const avgGrowth =
        memoryGrowth.reduce((sum, growth) => sum + growth, 0) /
        memoryGrowth.length;
      const maxGrowth = Math.max(...memoryGrowth);

      expect(maxGrowth).toBeLessThan(avgGrowth * 3); // No sudden memory spikes
      expect(avgGrowth).toBeLessThan(1024 * 1024); // Less than 1MB growth per 5000 turns

      console.log(`\n💾 Memory Stress Test Results:`);
      console.log(`   History Size: ${historySize.toLocaleString()} turns`);
      console.log(
        `   Avg Memory Growth: ${(avgGrowth / 1024).toFixed(2)} KB per 5K turns`
      );
      console.log(
        `   Max Memory Growth: ${(maxGrowth / 1024).toFixed(2)} KB per 5K turns`
      );
    });

    it("should handle concurrent memory pressure", async () => {
      const concurrentTasks = 20;
      const tasksPerWorker = 1000;

      const tasks = Array.from(
        { length: concurrentTasks },
        (_, index) =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              const localManager = new IntegratedWeatherManager(config);

              for (let i = 0; i < tasksPerWorker; i++) {
                localManager.startTurn(i + 1);

                const weather = generateStressTestWeather();
                localManager.applyWeather(weather);

                const card = generateStressTestCard(i);
                if (localManager.canPlayCard(card)) {
                  localManager.playCard(card);
                }

                localManager.calculateElementalModifiers();
                localManager.endTurn();
              }

              resolve();
            }, Math.random() * 100); // Stagger start times
          })
      );

      const startTime = Date.now();
      await Promise.all(tasks);
      const duration = Date.now() - startTime;

      // All tasks should complete successfully
      expect(duration).toBeLessThan(30000); // Within 30 seconds

      console.log(`\n🔄 Concurrent Memory Pressure Results:`);
      console.log(`   Concurrent Tasks: ${concurrentTasks}`);
      console.log(`   Tasks per Worker: ${tasksPerWorker.toLocaleString()}`);
      console.log(
        `   Total Operations: ${(
          concurrentTasks * tasksPerWorker
        ).toLocaleString()}`
      );
      console.log(`   Duration: ${duration.toLocaleString()}ms`);
    });
  });

  describe("Error Recovery Stress Tests", () => {
    it("should recover from repeated invalid operations", () => {
      const invalidOperations = 5000;
      let recoveryCount = 0;
      let errorCount = 0;

      // Set initial valid state
      integratedManager.applyWeather(["Sunny"]);
      const initialWeather = integratedManager.getCurrentWeather();

      for (let i = 0; i < invalidOperations; i++) {
        try {
          // Attempt various invalid operations
          const operationType = i % 5;

          switch (operationType) {
            case 0: // Invalid weather combinations
              integratedManager.applyWeather(["Hot", "Cold"]);
              break;

            case 1: // Invalid cards
              const invalidCard: WeatherCard = {
                id: `invalid-${i}`,
                type: "Weather",
                name: "Invalid Card",
                description: "Should fail",
                weather: "Cold", // Conflicts with current Sunny weather
              };
              integratedManager.playCard(invalidCard);
              break;

            case 2: // Empty weather
              integratedManager.applyWeather([]);
              break;

            case 3: // Undefined weather
              integratedManager.applyWeather(undefined as any);
              break;

            case 4: // Invalid weather type
              integratedManager.applyWeather(["InvalidWeather" as WeatherType]);
              break;
          }
        } catch (error) {
          errorCount++;

          // Verify system recovered to valid state
          const currentWeather = integratedManager.getCurrentWeather();
          if (currentWeather.length > 0) {
            recoveryCount++;
          }
        }
      }

      // System should maintain valid state despite errors
      const finalWeather = integratedManager.getCurrentWeather();
      expect(finalWeather).toBeDefined();
      expect(finalWeather.length).toBeGreaterThan(0);

      // Should have caught most invalid operations
      expect(errorCount).toBeGreaterThan(invalidOperations * 0.8);

      // Should have recovered from most errors
      expect(recoveryCount).toBeGreaterThan(errorCount * 0.9);

      console.log(`\n🛡️ Error Recovery Stress Results:`);
      console.log(
        `   Invalid Operations: ${invalidOperations.toLocaleString()}`
      );
      console.log(`   Errors Caught: ${errorCount.toLocaleString()}`);
      console.log(
        `   Successful Recoveries: ${recoveryCount.toLocaleString()}`
      );
      console.log(
        `   Recovery Rate: ${((recoveryCount / errorCount) * 100).toFixed(1)}%`
      );
    });

    it("should handle corrupted state recovery", () => {
      const corruptionAttempts = 1000;
      let recoverySuccesses = 0;

      for (let i = 0; i < corruptionAttempts; i++) {
        try {
          // Set valid initial state
          integratedManager.applyWeather(["Sunny", "Warm"]);

          // Attempt to corrupt state through various means
          const corruptionType = i % 4;

          switch (corruptionType) {
            case 0: // Force invalid weather through direct manipulation
              try {
                (integratedManager as any).weatherManager.currentWeather = [
                  "Hot",
                  "Cold",
                ];
                integratedManager.calculateElementalModifiers(); // Should detect corruption
              } catch (error) {
                // Expected - system should detect and recover
              }
              break;

            case 1: // Corrupt through rapid state changes
              for (let j = 0; j < 10; j++) {
                try {
                  integratedManager.applyWeather(generateStressTestWeather());
                } catch (error) {
                  // Some may fail, that's expected
                }
              }
              break;

            case 2: // Corrupt through invalid card sequences
              const cards = Array.from({ length: 5 }, (_, idx) =>
                generateStressTestCard(i * 10 + idx)
              );
              for (const card of cards) {
                try {
                  integratedManager.playCard(card);
                } catch (error) {
                  // Some may fail, that's expected
                }
              }
              break;

            case 3: // Corrupt through mode switching
              const modes = [
                "12-month-campaign",
                "weather-chaos",
                "seasonal-event",
              ];
              for (const mode of modes) {
                try {
                  integratedManager.setGameMode(mode);
                } catch (error) {
                  // Some may fail, that's expected
                }
              }
              break;
          }

          // Verify system is in valid state after corruption attempt
          const weather = integratedManager.getCurrentWeather();
          const effects = integratedManager.calculateElementalModifiers();
          const isValid = integratedManager.validateCurrentWeather();

          if (weather.length > 0 && effects && isValid) {
            recoverySuccesses++;
          }
        } catch (error) {
          // System should handle corruption gracefully
          console.warn(`Corruption attempt ${i} caused error:`, error.message);
        }
      }

      const recoveryRate = (recoverySuccesses / corruptionAttempts) * 100;

      // Should recover from most corruption attempts
      expect(recoveryRate).toBeGreaterThan(80);

      console.log(`\n🔧 State Corruption Recovery Results:`);
      console.log(
        `   Corruption Attempts: ${corruptionAttempts.toLocaleString()}`
      );
      console.log(
        `   Successful Recoveries: ${recoverySuccesses.toLocaleString()}`
      );
      console.log(`   Recovery Rate: ${recoveryRate.toFixed(1)}%`);
    });
  });

  describe("Extreme Load Tests", () => {
    it("should handle maximum weather complexity", () => {
      const maxComplexityTests = 1000;
      let successCount = 0;

      for (let i = 0; i < maxComplexityTests; i++) {
        try {
          // Create maximum complexity weather scenario
          const maxWeather: WeatherType[] = [
            "Sunny",
            "Warm",
            "Humid",
            "Windy",
            "Cloudy",
          ];
          integratedManager.applyWeather(maxWeather);

          // Apply multiple cards
          const cards = [
            generateStressTestCard(i * 3),
            generateStressTestCard(i * 3 + 1),
            generateStressTestCard(i * 3 + 2),
          ];

          for (const card of cards) {
            if (integratedManager.canPlayCard(card)) {
              integratedManager.playCard(card);
            }
          }

          // Calculate complex effects
          const effects = integratedManager.calculateElementalModifiers();
          expect(effects).toBeDefined();

          // Validate complex state
          const isValid = integratedManager.validateCurrentWeather();
          expect(isValid).toBe(true);

          successCount++;
        } catch (error) {
          console.warn(`Max complexity test ${i} failed:`, error.message);
        }
      }

      const successRate = (successCount / maxComplexityTests) * 100;
      expect(successRate).toBeGreaterThan(90); // Should handle 90%+ of max complexity scenarios

      console.log(`\n🌪️ Maximum Complexity Results:`);
      console.log(`   Tests: ${maxComplexityTests.toLocaleString()}`);
      console.log(`   Successes: ${successCount.toLocaleString()}`);
      console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    });

    it("should handle resource exhaustion gracefully", () => {
      const resourceTests = 2000;
      let gracefulHandling = 0;

      for (let i = 0; i < resourceTests; i++) {
        try {
          // Create resource-intensive operations
          const largeWeatherHistory = Array.from({ length: 100 }, () =>
            generateStressTestWeather()
          );

          for (const weather of largeWeatherHistory) {
            integratedManager.startTurn(
              i * 100 + largeWeatherHistory.indexOf(weather)
            );
            integratedManager.applyWeather(weather);
            integratedManager.calculateElementalModifiers();
            integratedManager.endTurn();
          }

          // Create many cards
          const manyCards = Array.from({ length: 50 }, (_, idx) =>
            generateStressTestCard(i * 50 + idx)
          );

          for (const card of manyCards) {
            try {
              if (integratedManager.canPlayCard(card)) {
                integratedManager.playCard(card);
              }
            } catch (error) {
              // Expected for some cards
            }
          }

          gracefulHandling++;
        } catch (error) {
          // Should handle resource exhaustion gracefully
          if (
            error.message.includes("memory") ||
            error.message.includes("limit")
          ) {
            gracefulHandling++; // Graceful handling of resource limits
          }
        }
      }

      const gracefulRate = (gracefulHandling / resourceTests) * 100;
      expect(gracefulRate).toBeGreaterThan(95); // Should handle 95%+ gracefully

      console.log(`\n🔋 Resource Exhaustion Results:`);
      console.log(`   Tests: ${resourceTests.toLocaleString()}`);
      console.log(`   Graceful Handling: ${gracefulHandling.toLocaleString()}`);
      console.log(`   Graceful Rate: ${gracefulRate.toFixed(1)}%`);
    });
  });
});

// Stress test utility functions
function generateStressTestWeather(): WeatherType[] {
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

  const count = Math.floor(Math.random() * 4) + 1; // 1-4 weather types
  const selected: WeatherType[] = [];

  while (selected.length < count) {
    const weather = allWeather[Math.floor(Math.random() * allWeather.length)];
    if (!selected.includes(weather)) {
      selected.push(weather);
    }
  }

  return selected;
}

function generateStressTestCard(id: number): WeatherCard {
  const weatherTypes: WeatherType[] = [
    "Sunny",
    "Rainy",
    "Stormy",
    "Hot",
    "Cold",
    "Windy",
    "Cloudy",
    "Snowy",
    "Foggy",
    "Warm",
    "Cool",
    "Humid",
  ];

  const cardTypes = [
    "Weather",
    "BreakWeather",
    "WeatherBuff",
    "WeatherNerf",
  ] as const;

  return {
    id: `stress-card-${id}`,
    type: cardTypes[Math.floor(Math.random() * cardTypes.length)],
    name: `Stress Test Card ${id}`,
    description: `Stress test card ${id}`,
    weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
    cost: Math.floor(Math.random() * 10) + 1,
    duration: Math.floor(Math.random() * 5) + 1,
  };
}
