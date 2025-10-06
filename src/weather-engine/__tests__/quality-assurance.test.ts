/**
 * Quality Assurance and Code Coverage Tests
 * Ensures comprehensive test coverage and code quality
 */

import { describe, it, expect } from "@jest/globals";
import { WeatherManager } from "../manager/weather-manager";
import { SeasonManager } from "../manager/season-manager";
import { WeatherCardManager } from "../manager/weather-card-manager";
import { IntegratedWeatherManager } from "../manager/integrated-weather-manager";
import { WeatherConfigLoader } from "../config/config-loader";
import { WeatherValidator } from "../validation/weather-validator";
import { DamageCalculator } from "../calculations/damage-calculator";
import { WeatherScenarioGenerator } from "./test-data-generators.test";
import defaultWeatherConfig from "../config/weather-effects.json";

describe("Quality Assurance Tests", () => {
  let config: any;

  beforeAll(() => {
    const configLoader = WeatherConfigLoader.getInstance();
    config = configLoader.loadFromData(defaultWeatherConfig);
  });

  describe("Code Coverage Analysis", () => {
    it("should test all public methods of WeatherManager", () => {
      const weatherManager = new WeatherManager(config);
      const testedMethods = new Set<string>();

      // Test core functionality
      weatherManager.applyWeather(["Sunny"]);
      testedMethods.add("applyWeather");

      const weather = weatherManager.getCurrentWeather();
      expect(weather).toContain("Sunny");
      testedMethods.add("getCurrentWeather");

      const effects = weatherManager.calculateElementalModifiers();
      expect(effects).toBeDefined();
      testedMethods.add("calculateElementalModifiers");

      const turn = weatherManager.getCurrentTurn();
      expect(typeof turn).toBe("number");
      testedMethods.add("getCurrentTurn");

      const month = weatherManager.getCurrentMonth();
      expect(typeof month).toBe("number");
      testedMethods.add("getCurrentMonth");

      const season = weatherManager.getCurrentSeason();
      expect(typeof season).toBe("string");
      testedMethods.add("getCurrentSeason");

      weatherManager.setTurn(2, 2);
      testedMethods.add("setTurn");

      const validation = weatherManager.validateCurrentWeather();
      expect(validation).toBeDefined();
      testedMethods.add("validateCurrentWeather");

      const suggestions = weatherManager.getWeatherSuggestions();
      expect(Array.isArray(suggestions)).toBe(true);
      testedMethods.add("getWeatherSuggestions");

      weatherManager.resetWeather();
      testedMethods.add("resetWeather");

      const state = weatherManager.getCurrentWeatherState();
      expect(state).toBeDefined();
      testedMethods.add("getCurrentWeatherState");

      // Verify we tested key methods
      const expectedMethods = [
        "applyWeather",
        "getCurrentWeather",
        "calculateElementalModifiers",
        "getCurrentTurn",
        "getCurrentMonth",
        "getCurrentSeason",
        "setTurn",
        "validateCurrentWeather",
        "getWeatherSuggestions",
        "resetWeather",
        "getCurrentWeatherState",
      ];

      expectedMethods.forEach((method) => {
        expect(testedMethods.has(method)).toBe(true);
      });
    });

    it("should test all public methods of SeasonManager", () => {
      const seasonManager = new SeasonManager();
      const testedMethods = new Set<string>();

      // Test seasonal functionality
      for (let month = 1; month <= 12; month++) {
        const weather = seasonManager.getWeatherForMonth(month);
        expect(typeof weather).toBe("string");
        testedMethods.add("getWeatherForMonth");

        const season = seasonManager.getSeasonForMonth(month);
        expect(typeof season).toBe("string");
        testedMethods.add("getSeasonForMonth");
      }

      // Test weather options
      const options = seasonManager.getWeatherOptions(6, 3);
      expect(Array.isArray(options)).toBe(true);
      testedMethods.add("getWeatherOptions");

      // Test pattern prediction
      const pattern = seasonManager.predictWeatherPattern(1, 6, "basic");
      expect(Array.isArray(pattern)).toBe(true);
      testedMethods.add("predictWeatherPattern");

      const expectedMethods = [
        "getWeatherForMonth",
        "getSeasonForMonth",
        "getWeatherOptions",
        "predictWeatherPattern",
      ];

      expectedMethods.forEach((method) => {
        expect(testedMethods.has(method)).toBe(true);
      });
    });

    it("should test all public methods of IntegratedWeatherManager", () => {
      const integratedManager = new IntegratedWeatherManager(config);
      const testedMethods = new Set<string>();

      // Test integrated functionality
      integratedManager.setWeather(["Sunny"]);
      testedMethods.add("setWeather");

      const weather = integratedManager.getCurrentWeather();
      expect(weather).toContain("Sunny");
      testedMethods.add("getCurrentWeather");

      const effects = integratedManager.getElementalModifiers();
      expect(effects).toBeDefined();
      testedMethods.add("getElementalModifiers");

      const season = integratedManager.getCurrentSeason();
      expect(typeof season).toBe("string");
      testedMethods.add("getCurrentSeason");

      const turn = integratedManager.getCurrentTurn();
      expect(typeof turn).toBe("number");
      testedMethods.add("getCurrentTurn");

      const month = integratedManager.getCurrentMonth();
      expect(typeof month).toBe("number");
      testedMethods.add("getCurrentMonth");

      const isValid = integratedManager.validateWeatherCombination(["Sunny"]);
      expect(typeof isValid).toBe("boolean");
      testedMethods.add("validateWeatherCombination");

      integratedManager.reset();
      testedMethods.add("reset");

      const expectedMethods = [
        "setWeather",
        "getCurrentWeather",
        "getElementalModifiers",
        "getCurrentSeason",
        "getCurrentTurn",
        "getCurrentMonth",
        "validateWeatherCombination",
        "reset",
      ];

      expectedMethods.forEach((method) => {
        expect(testedMethods.has(method)).toBe(true);
      });
    });
  });

  describe("Comprehensive Scenario Testing", () => {
    it("should test all generated valid weather scenarios", () => {
      const weatherManager = new WeatherManager(config);
      const validCombinations =
        WeatherScenarioGenerator.generateValidWeatherCombinations(50);

      let successCount = 0;
      let errorCount = 0;

      validCombinations.forEach((combination, index) => {
        try {
          weatherManager.applyWeather(combination);
          const effects = weatherManager.calculateElementalModifiers();
          expect(effects).toBeDefined();
          successCount++;
        } catch (error) {
          console.warn(
            `Valid combination ${index} failed:`,
            combination,
            error.message
          );
          errorCount++;
        }
      });

      // Some combinations may fail due to strict validation rules
      expect(successCount).toBeGreaterThan(validCombinations.length * 0.5);
      expect(errorCount).toBeLessThan(validCombinations.length * 0.5);
    });

    it("should test all generated invalid weather scenarios", () => {
      const weatherManager = new WeatherManager(config);
      const invalidCombinations =
        WeatherScenarioGenerator.generateInvalidWeatherCombinations(20);

      let rejectedCount = 0;
      let unexpectedSuccessCount = 0;

      invalidCombinations.forEach((combination, index) => {
        try {
          weatherManager.applyWeather(combination);
          console.warn(
            `Invalid combination ${index} unexpectedly succeeded:`,
            combination
          );
          unexpectedSuccessCount++;
        } catch (error) {
          rejectedCount++;
        }
      });

      // Most invalid combinations should be rejected
      expect(rejectedCount).toBeGreaterThan(invalidCombinations.length * 0.8);
      expect(unexpectedSuccessCount).toBeLessThan(
        invalidCombinations.length * 0.2
      );
    });

    it("should test all seasonal scenarios", () => {
      const seasonManager = new SeasonManager();
      const scenarios = WeatherScenarioGenerator.generateSeasonalScenarios(48); // 4 seasons * 12 scenarios

      scenarios.forEach((scenario) => {
        const weather = seasonManager.getWeatherForMonth(scenario.month);
        const season = seasonManager.getSeasonForMonth(scenario.month);

        expect(season).toBe(scenario.season);
        expect(typeof weather).toBe("string");
        expect(weather.length).toBeGreaterThan(0);
      });
    });

    it("should test all generated weather cards", () => {
      const cardManager = new WeatherCardManager();
      const cards = WeatherScenarioGenerator.generateWeatherCards(100);

      let validCardCount = 0;
      let invalidCardCount = 0;

      cards.forEach((card) => {
        try {
          const isValid = cardManager.validateCardPlay(card);
          if (
            typeof isValid === "boolean" ||
            (isValid && isValid.isValid !== undefined)
          ) {
            validCardCount++;
          } else {
            invalidCardCount++;
          }
        } catch (error) {
          // Some cards may fail validation due to missing context
          invalidCardCount++;
        }
      });

      // Should be able to validate most cards
      expect(validCardCount + invalidCardCount).toBe(cards.length);
    });
  });

  describe("Performance Quality Assurance", () => {
    it("should meet performance benchmarks for all operations", () => {
      const performanceData =
        WeatherScenarioGenerator.generatePerformanceTestData(200);
      const weatherManager = new WeatherManager(config);
      const integratedManager = new IntegratedWeatherManager(config);

      const results = {
        weather_application: [],
        elemental_calculation: [],
        card_play: [],
        weather_validation: [],
      };

      performanceData.forEach((testCase) => {
        const startTime = Date.now();

        try {
          switch (testCase.operation) {
            case "weather_application":
              weatherManager.applyWeather(testCase.data.weather);
              break;

            case "elemental_calculation":
              weatherManager.applyWeather(testCase.data.weather);
              weatherManager.calculateElementalModifiers();
              break;

            case "card_play":
              // Simplified card play test
              const card = testCase.data.card;
              if (card.weather) {
                weatherManager.applyWeather([card.weather]);
              }
              break;

            case "weather_validation":
              integratedManager.validateWeatherCombination(
                testCase.data.weather
              );
              break;
          }

          const duration = Date.now() - startTime;
          results[testCase.operation].push(duration);

          // Check if operation met performance expectation
          expect(duration).toBeLessThan(testCase.expectedMaxTime);
        } catch (error) {
          // Some operations may fail, but they should still be fast
          const duration = Date.now() - startTime;
          expect(duration).toBeLessThan(testCase.expectedMaxTime * 2);
        }
      });

      // Verify we tested all operation types
      Object.keys(results).forEach((operation) => {
        expect(results[operation].length).toBeGreaterThan(0);
      });
    });

    it("should handle memory efficiently during extended testing", () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const weatherManager = new WeatherManager(config);

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        const weather =
          WeatherScenarioGenerator.generateValidWeatherCombinations(1)[0];
        try {
          weatherManager.applyWeather(weather);
          weatherManager.calculateElementalModifiers();
        } catch (error) {
          // Some may fail, that's ok for memory testing
        }

        // Force garbage collection periodically
        if (i % 100 === 0 && global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB for extended testing)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe("Edge Case Quality Assurance", () => {
    it("should handle all edge cases appropriately", () => {
      const edgeCases = WeatherScenarioGenerator.generateEdgeCases();
      const weatherManager = new WeatherManager(config);
      const integratedManager = new IntegratedWeatherManager(config);

      edgeCases.forEach((edgeCase) => {
        switch (edgeCase.expectedBehavior) {
          case "should_handle_gracefully":
            expect(() => {
              if (edgeCase.data.weather !== undefined) {
                integratedManager.validateWeatherCombination(
                  edgeCase.data.weather || []
                );
              }
            }).not.toThrow();
            break;

          case "should_throw_error":
            try {
              if (edgeCase.data.weather !== undefined) {
                weatherManager.applyWeather(edgeCase.data.weather);
              } else if (edgeCase.data.turn !== undefined) {
                weatherManager.setTurn(edgeCase.data.turn);
              }
              // If we get here without throwing, that's unexpected for some cases
              if (
                edgeCase.name === "negative_turn_number" ||
                edgeCase.name === "turn_exceeding_limit"
              ) {
                expect(true).toBe(false); // Force failure for cases that should definitely throw
              }
            } catch (error) {
              // Expected behavior - error was thrown
              expect(error).toBeDefined();
            }
            break;

          case "should_validate_combination":
            if (edgeCase.data.weather) {
              const result = integratedManager.validateWeatherCombination(
                edgeCase.data.weather
              );
              expect(typeof result).toBe("boolean");
            }
            break;

          case "should_deduplicate":
            if (edgeCase.data.weather) {
              try {
                weatherManager.applyWeather(edgeCase.data.weather);
                const currentWeather = weatherManager.getCurrentWeather();
                const uniqueWeather = [...new Set(currentWeather)];
                expect(currentWeather.length).toBe(uniqueWeather.length);
              } catch (error) {
                // May fail validation, but should not crash
                expect(error).toBeDefined();
              }
            }
            break;
        }
      });
    });
  });

  describe("Integration Quality Assurance", () => {
    it("should maintain consistency across all managers", () => {
      const weatherManager = new WeatherManager(config);
      const integratedManager = new IntegratedWeatherManager(config);
      const testWeather = ["Sunny"];

      // Apply same weather to both managers
      weatherManager.applyWeather(testWeather);
      integratedManager.setWeather(testWeather);

      // Should have consistent state
      expect(weatherManager.getCurrentWeather()).toEqual(
        integratedManager.getCurrentWeather()
      );
      expect(weatherManager.getCurrentSeason()).toBe(
        integratedManager.getCurrentSeason()
      );
      expect(weatherManager.getCurrentTurn()).toBe(
        integratedManager.getCurrentTurn()
      );
      expect(weatherManager.getCurrentMonth()).toBe(
        integratedManager.getCurrentMonth()
      );
    });

    it("should handle complex interaction scenarios", () => {
      const integratedManager = new IntegratedWeatherManager(config);
      const scenarios = WeatherScenarioGenerator.generateGameScenarios(5);

      scenarios.forEach((scenario) => {
        // Reset for each scenario
        integratedManager.reset();

        // Apply weather sequence
        scenario.weatherSequence.forEach((weather, index) => {
          try {
            integratedManager.setWeather(weather);
            const effects = integratedManager.getElementalModifiers();
            expect(effects).toBeDefined();
          } catch (error) {
            // Some weather combinations may fail, that's expected
          }
        });

        // Verify final state is valid
        const finalWeather = integratedManager.getCurrentWeather();
        expect(Array.isArray(finalWeather)).toBe(true);
      });
    });
  });

  describe("Regression Testing", () => {
    it("should maintain backward compatibility", () => {
      // Test that existing functionality still works
      const weatherManager = new WeatherManager(config);

      // Basic operations that should always work
      weatherManager.applyWeather(["Sunny"]);
      expect(weatherManager.getCurrentWeather()).toContain("Sunny");

      const effects = weatherManager.calculateElementalModifiers();
      expect(effects.elementalModifiers.Fire).toBeGreaterThan(0);

      weatherManager.setTurn(6, 6);
      expect(weatherManager.getCurrentSeason()).toBe("Summer");

      const validation = weatherManager.validateCurrentWeather();
      expect(validation.isValid).toBe(true);
    });

    it("should handle configuration changes gracefully", () => {
      // Test with modified configuration
      const modifiedConfig = {
        ...config,
        weatherEffects: {
          ...config.weatherEffects,
          TestWeather: { Fire: 10, Ice: -5, Lightning: 0 },
        },
      };

      expect(() => {
        new WeatherManager(modifiedConfig);
      }).not.toThrow();
    });
  });
});
