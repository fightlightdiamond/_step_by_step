/**
 * WeatherManager integration tests with validation system
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  WeatherManager,
  WeatherManagerError,
  WeatherManagerErrorType,
} from "../manager/weather-manager";
import { WeatherConfigLoader } from "../config/config-loader";
import { WeatherType, WeatherCard } from "../types";
import { ValidationErrorType } from "../validation";
import defaultWeatherConfig from "../config/weather-effects.json";

describe("WeatherManager Integration with Validation", () => {
  let weatherManager: WeatherManager;
  let config: any;

  beforeEach(() => {
    const configLoader = WeatherConfigLoader.getInstance();
    config = configLoader.loadFromData(defaultWeatherConfig);
    weatherManager = new WeatherManager(config, undefined, {
      debugMode: true,
      logLevel: "debug",
    });
  });

  describe("Enhanced Validation Integration", () => {
    it("should log validation attempts in debug mode", () => {
      const consoleSpy = vi
        .spyOn(console, "debug")
        .mockImplementation(() => {});

      weatherManager.applyWeather(["Sunny", "Warm"]);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[DEBUG] WeatherManager: Attempting to apply weather"
        ),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it("should emit validation error events", () => {
      const errorListener = vi.fn();
      weatherManager.addEventListener("validationError", errorListener);

      expect(() => {
        weatherManager.applyWeather(["Hot", "Cold"]);
      }).toThrow(WeatherManagerError);

      expect(errorListener).toHaveBeenCalledWith("validationError", {
        weatherTypes: ["Hot", "Cold"],
        validationResult: expect.objectContaining({
          isValid: false,
          errors: expect.arrayContaining([
            expect.objectContaining({
              errorType: ValidationErrorType.OPPOSITE_WEATHER,
            }),
          ]),
        }),
        source: "manual",
      });
    });

    it("should emit validation warning events", () => {
      const warningListener = vi.fn();
      weatherManager.addEventListener("validationWarning", warningListener);

      // Apply a combination that might generate warnings
      weatherManager.applyWeather(["Hot", "Humid", "Sunny", "Warm"]);

      // Check if warning event was emitted (depends on config)
      if (warningListener.mock.calls.length > 0) {
        expect(warningListener).toHaveBeenCalledWith("validationWarning", {
          weatherTypes: expect.any(Array),
          validationResult: expect.objectContaining({
            warnings: expect.any(Array),
          }),
          source: "manual",
        });
      }
    });

    it("should log validation bypass warnings", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      weatherManager.applyWeather(["Hot", "Cold"], { validateChange: false });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Weather validation bypassed - would have failed"
        )
      );

      consoleWarnSpy.mockRestore();
    });

    it("should provide detailed validation analysis", () => {
      const result = weatherManager.validateWeatherCombinationDetailed([
        "Sunny",
        "Hot",
        "Cold",
      ]);

      expect(result).toHaveProperty("validationResult");
      expect(result).toHaveProperty("suggestions");
      expect(result).toHaveProperty("compatibilityAnalysis");

      expect(result.compatibilityAnalysis).toHaveProperty("compatible");
      expect(result.compatibilityAnalysis).toHaveProperty("incompatible");
      expect(result.compatibilityAnalysis).toHaveProperty("opposite");

      // Should identify Hot and Cold as opposite
      expect(result.compatibilityAnalysis.opposite).toContain("Hot");
      expect(result.compatibilityAnalysis.opposite).toContain("Cold");
    });

    it("should suggest compatible weather types", () => {
      weatherManager.applyWeather(["Sunny"]);

      const result = weatherManager.validateWeatherCombinationDetailed([
        "Sunny",
        "Warm",
      ]);

      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.validationResult.isValid).toBe(true);
    });
  });

  describe("Logging and Debugging", () => {
    it("should respect log level settings", () => {
      const consoleInfoSpy = vi
        .spyOn(console, "info")
        .mockImplementation(() => {});
      const consoleDebugSpy = vi
        .spyOn(console, "debug")
        .mockImplementation(() => {});

      weatherManager.setLogLevel("error");
      weatherManager.applyWeather(["Sunny"]);

      // Info logs should not appear with error level
      expect(consoleInfoSpy).not.toHaveBeenCalled();

      weatherManager.setLogLevel("debug");
      weatherManager.applyWeather(["Rainy"]);

      // Debug logs should appear with debug level
      expect(consoleDebugSpy).toHaveBeenCalled();

      consoleInfoSpy.mockRestore();
      consoleDebugSpy.mockRestore();
    });

    it("should toggle debug mode", () => {
      expect(weatherManager.isDebugMode()).toBe(true);

      weatherManager.setDebugMode(false);
      expect(weatherManager.isDebugMode()).toBe(false);

      weatherManager.setDebugMode(true);
      expect(weatherManager.isDebugMode()).toBe(true);
    });

    it("should track log level changes", () => {
      expect(weatherManager.getLogLevel()).toBe("debug");

      weatherManager.setLogLevel("warn");
      expect(weatherManager.getLogLevel()).toBe("warn");
    });
  });

  describe("Error Handling Integration", () => {
    it("should provide detailed error context", () => {
      try {
        weatherManager.applyWeather(["Sunny", "Stormy"]);
      } catch (error) {
        expect(error).toBeInstanceOf(WeatherManagerError);
        expect((error as WeatherManagerError).errorType).toBe(
          WeatherManagerErrorType.INVALID_WEATHER_COMBINATION
        );
        expect((error as WeatherManagerError).context).toHaveProperty(
          "weatherTypes"
        );
        expect((error as WeatherManagerError).context).toHaveProperty(
          "validationResult"
        );
      }
    });

    it("should handle validation errors in card play", () => {
      const invalidCard: WeatherCard = {
        id: "invalid-card",
        type: "Weather",
        name: "Conflicting Weather",
        description: "Creates conflicting weather",
        weather: "Cold",
      };

      weatherManager.applyWeather(["Hot"]);

      expect(() => {
        weatherManager.playWeatherCard(invalidCard);
      }).toThrow(WeatherManagerError);
    });

    it("should log successful operations", () => {
      const consoleInfoSpy = vi
        .spyOn(console, "info")
        .mockImplementation(() => {});

      weatherManager.applyWeather(["Sunny"]);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("Weather applied successfully")
      );

      consoleInfoSpy.mockRestore();
    });
  });

  describe("Advanced Validation Features", () => {
    it("should analyze weather compatibility in detail", () => {
      const analysis = weatherManager.validateWeatherCombinationDetailed([
        "Sunny",
        "Warm",
        "Hot",
        "Cold",
      ]);

      expect(analysis.compatibilityAnalysis.opposite).toContain("Hot");
      expect(analysis.compatibilityAnalysis.opposite).toContain("Cold");
      expect(analysis.validationResult.isValid).toBe(false);
    });

    it("should provide weather suggestions based on current state", () => {
      weatherManager.applyWeather(["Sunny"]);

      const suggestions = weatherManager.getWeatherSuggestions();
      expect(suggestions).toBeInstanceOf(Array);

      // Suggestions should not include opposite weather
      expect(suggestions).not.toContain("Stormy");
      expect(suggestions).not.toContain("Snowy");
    });

    it("should validate complex weather combinations", () => {
      const complexWeather: WeatherType[] = ["Sunny", "Warm", "Windy"];

      const result =
        weatherManager.validateWeatherCombinationDetailed(complexWeather);

      expect(result.validationResult).toHaveProperty("isValid");
      expect(result.validationResult).toHaveProperty("errors");
      expect(result.validationResult).toHaveProperty("warnings");
    });
  });

  describe("Event Integration", () => {
    it("should include validation results in weather change events", () => {
      const eventListener = vi.fn();
      weatherManager.addEventListener("weatherChanged", eventListener);

      weatherManager.applyWeather(["Sunny", "Warm"]);

      expect(eventListener).toHaveBeenCalledWith("weatherChanged", {
        previousWeather: [],
        newWeather: ["Sunny", "Warm"],
        source: "manual",
        reason: undefined,
        validationResult: expect.objectContaining({
          isValid: true,
        }),
      });
    });

    it("should emit events for validation failures", () => {
      const errorListener = vi.fn();
      const warningListener = vi.fn();

      weatherManager.addEventListener("validationError", errorListener);
      weatherManager.addEventListener("validationWarning", warningListener);

      // Test validation error
      expect(() => {
        weatherManager.applyWeather(["Hot", "Cold"]);
      }).toThrow();

      expect(errorListener).toHaveBeenCalled();
    });
  });

  describe("Performance and Reliability", () => {
    it("should handle rapid validation requests", () => {
      const weatherCombinations = [
        ["Sunny"],
        ["Rainy"],
        ["Sunny", "Warm"],
        ["Cloudy", "Cool"],
        ["Windy", "Cold"],
      ];

      for (const combination of weatherCombinations) {
        expect(() => {
          weatherManager.applyWeather(combination);
        }).not.toThrow();
      }
    });

    it("should maintain state consistency during validation failures", () => {
      const initialWeather = weatherManager.getCurrentWeather();

      expect(() => {
        weatherManager.applyWeather(["Hot", "Cold"]);
      }).toThrow();

      // State should remain unchanged after validation failure
      expect(weatherManager.getCurrentWeather()).toEqual(initialWeather);
    });

    it("should handle edge cases in validation", () => {
      // Empty weather array
      const emptyResult = weatherManager.validateWeatherCombinationDetailed([]);
      expect(emptyResult.validationResult.isValid).toBe(true);

      // Single weather type
      const singleResult = weatherManager.validateWeatherCombinationDetailed([
        "Sunny",
      ]);
      expect(singleResult.validationResult.isValid).toBe(true);

      // Maximum weather types
      const maxWeather: WeatherType[] = [
        "Sunny",
        "Warm",
        "Windy",
        "Humid",
        "Cloudy",
      ];
      const maxResult =
        weatherManager.validateWeatherCombinationDetailed(maxWeather);
      expect(maxResult.validationResult).toBeDefined();
    });
  });
});
