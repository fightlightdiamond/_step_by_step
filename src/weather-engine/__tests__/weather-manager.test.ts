/**
 * WeatherManager unit tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  WeatherManager,
  WeatherManagerError,
  WeatherManagerErrorType,
} from "../manager/weather-manager";
import { WeatherConfigLoader } from "../config/config-loader";
import { WeatherType, WeatherCard, WeatherState } from "../types";
import defaultWeatherConfig from "../config/weather-effects.json";

describe("WeatherManager", () => {
  let weatherManager: WeatherManager;
  let config: any;

  beforeEach(() => {
    const configLoader = WeatherConfigLoader.getInstance();
    config = configLoader.loadFromData(defaultWeatherConfig);
    weatherManager = new WeatherManager(config);
  });

  describe("Initialization", () => {
    it("should initialize with default state", () => {
      const state = weatherManager.getCurrentWeatherState();

      expect(state.currentWeather).toEqual([]);
      expect(state.turn).toBe(1);
      expect(state.month).toBe(1);
      expect(state.season).toBe("Winter");
      expect(state.activeCards).toEqual([]);
    });

    it("should initialize with custom initial state", () => {
      const initialState: Partial<WeatherState> = {
        currentWeather: ["Sunny"],
        turn: 5,
        month: 6,
      };

      const customManager = new WeatherManager(config, initialState);
      const state = customManager.getCurrentWeatherState();

      expect(state.currentWeather).toEqual(["Sunny"]);
      expect(state.turn).toBe(5);
      expect(state.month).toBe(6);
      expect(state.season).toBe("Summer");
    });

    it("should throw error for invalid initial state", () => {
      const invalidState: Partial<WeatherState> = {
        turn: 15, // Invalid turn
      };

      expect(() => new WeatherManager(config, invalidState)).toThrow(
        WeatherManagerError
      );
    });
  });

  describe("Weather Application", () => {
    it("should apply valid weather types", () => {
      const result = weatherManager.applyWeather(["Sunny", "Warm"]);

      expect(result.isValid).toBe(true);
      expect(weatherManager.getCurrentWeather()).toEqual(["Sunny", "Warm"]);
    });

    it("should reject invalid weather combinations", () => {
      expect(() => {
        weatherManager.applyWeather(["Hot", "Cold"]); // Opposite weather types
      }).toThrow(WeatherManagerError);
    });

    it("should allow bypassing validation when requested", () => {
      const result = weatherManager.applyWeather(["Hot", "Cold"], {
        validateChange: false,
      });

      expect(weatherManager.getCurrentWeather()).toEqual(["Hot", "Cold"]);
    });

    it("should emit weather change events", () => {
      const eventListener = vi.fn();
      weatherManager.addEventListener("weatherChanged", eventListener);

      weatherManager.applyWeather(["Sunny"]);

      expect(eventListener).toHaveBeenCalledWith("weatherChanged", {
        previousWeather: [],
        newWeather: ["Sunny"],
        source: "manual",
        reason: undefined,
      });
    });

    it("should not emit events when disabled", () => {
      const eventListener = vi.fn();
      weatherManager.addEventListener("weatherChanged", eventListener);

      weatherManager.applyWeather(["Sunny"], { triggerEvents: false });

      expect(eventListener).not.toHaveBeenCalled();
    });
  });

  describe("Weather Reset", () => {
    it("should reset weather to empty state", () => {
      weatherManager.applyWeather(["Sunny", "Warm"]);
      weatherManager.resetWeather();

      expect(weatherManager.getCurrentWeather()).toEqual([]);
    });

    it("should emit reset events", () => {
      const eventListener = vi.fn();
      weatherManager.addEventListener("weatherReset", eventListener);

      weatherManager.applyWeather(["Sunny"]);
      weatherManager.resetWeather();

      expect(eventListener).toHaveBeenCalledWith("weatherReset", {
        previousWeather: ["Sunny"],
        source: "system",
        reason: "Weather reset",
      });
    });
  });

  describe("Turn Management", () => {
    it("should advance turn correctly", () => {
      weatherManager.advanceTurn();

      expect(weatherManager.getCurrentTurn()).toBe(2);
      expect(weatherManager.getCurrentMonth()).toBe(2);
      expect(weatherManager.getCurrentSeason()).toBe("Winter");
    });

    it("should handle month rollover", () => {
      weatherManager.setTurn(12, 12);
      weatherManager.advanceTurn();

      expect(weatherManager.getCurrentTurn()).toBe(13);
      expect(weatherManager.getCurrentMonth()).toBe(1);
      expect(weatherManager.getCurrentSeason()).toBe("Winter");
    });

    it("should throw error when advancing beyond max turns", () => {
      weatherManager.setTurn(12);

      expect(() => weatherManager.advanceTurn()).toThrow(WeatherManagerError);
    });

    it("should set specific turn and month", () => {
      weatherManager.setTurn(6, 7);

      expect(weatherManager.getCurrentTurn()).toBe(6);
      expect(weatherManager.getCurrentMonth()).toBe(7);
      expect(weatherManager.getCurrentSeason()).toBe("Summer");
    });

    it("should emit turn advance events", () => {
      const eventListener = vi.fn();
      weatherManager.addEventListener("turnAdvanced", eventListener);

      weatherManager.advanceTurn();

      expect(eventListener).toHaveBeenCalledWith("turnAdvanced", {
        turn: 2,
        month: 2,
        season: "Winter",
      });
    });
  });

  describe("Weather Card Management", () => {
    it("should play weather cards", () => {
      const weatherCard: WeatherCard = {
        id: "test-card",
        type: "Weather",
        name: "Sunny Day",
        description: "Makes it sunny",
        weather: "Sunny",
        duration: 2,
      };

      const result = weatherManager.playWeatherCard(weatherCard);

      expect(result.isValid).toBe(true);
      expect(weatherManager.getCurrentWeather()).toContain("Sunny");
      expect(weatherManager.getActiveCards()).toHaveLength(1);
    });

    it("should play break weather cards", () => {
      weatherManager.applyWeather(["Stormy"]);

      const breakCard: WeatherCard = {
        id: "break-card",
        type: "BreakWeather",
        name: "Clear Skies",
        description: "Clears all weather",
      };

      weatherManager.playWeatherCard(breakCard);

      expect(weatherManager.getCurrentWeather()).toEqual([]);
    });

    it("should handle card expirations", () => {
      const weatherCard: WeatherCard = {
        id: "temp-card",
        type: "Weather",
        name: "Temporary Rain",
        description: "Rain for 1 turn",
        weather: "Rainy",
        duration: 1,
      };

      weatherManager.playWeatherCard(weatherCard);
      expect(weatherManager.getActiveCards()).toHaveLength(1);

      weatherManager.advanceTurn();
      expect(weatherManager.getActiveCards()).toHaveLength(0);
    });

    it("should emit card play events", () => {
      const eventListener = vi.fn();
      weatherManager.addEventListener("cardPlayed", eventListener);

      const card: WeatherCard = {
        id: "test-card",
        type: "Weather",
        name: "Test Card",
        description: "Test",
        weather: "Sunny",
      };

      weatherManager.playWeatherCard(card);

      expect(eventListener).toHaveBeenCalledWith("cardPlayed", {
        card,
        effect: "weather_change",
      });
    });
  });

  describe("Damage Calculations", () => {
    it("should calculate elemental modifiers", () => {
      weatherManager.applyWeather(["Sunny", "Hot"]);

      const result = weatherManager.calculateElementalModifiers();

      expect(result.activeWeatherTypes).toEqual(["Sunny", "Hot"]);
      expect(result.elementalModifiers).toHaveProperty("Fire");
      expect(result.elementalModifiers).toHaveProperty("Ice");
      expect(result.elementalModifiers).toHaveProperty("Lightning");
    });

    it("should calculate element-specific damage", () => {
      weatherManager.applyWeather(["Sunny"]);

      const damage = weatherManager.calculateElementDamage("Fire", 100);

      expect(typeof damage).toBe("number");
      expect(damage).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Weather Validation", () => {
    it("should validate current weather", () => {
      weatherManager.applyWeather(["Sunny", "Warm"], { validateChange: false });

      const result = weatherManager.validateCurrentWeather();

      expect(result.isValid).toBe(true);
    });

    it("should provide weather suggestions", () => {
      weatherManager.applyWeather(["Sunny"]);

      const suggestions = weatherManager.getWeatherSuggestions();

      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe("State Persistence", () => {
    it("should create persistence data", () => {
      weatherManager.applyWeather(["Sunny"]);
      weatherManager.setTurn(5);

      const persistenceData = weatherManager.getPersistenceData();

      expect(persistenceData.weatherState.currentWeather).toEqual(["Sunny"]);
      expect(persistenceData.weatherState.turn).toBe(5);
      expect(persistenceData.version).toBe("1.0.0");
      expect(persistenceData.timestamp).toBeGreaterThan(0);
    });

    it("should restore state from persistence data", () => {
      const originalState = weatherManager.getCurrentWeatherState();
      weatherManager.applyWeather(["Stormy"]);
      weatherManager.setTurn(8);

      const persistenceData = weatherManager.getPersistenceData();

      // Create new manager and restore
      const newManager = new WeatherManager(config);
      newManager.restoreState(persistenceData);

      const restoredState = newManager.getCurrentWeatherState();
      expect(restoredState.currentWeather).toEqual(["Stormy"]);
      expect(restoredState.turn).toBe(8);
    });

    it("should emit restore events", () => {
      const eventListener = vi.fn();
      weatherManager.addEventListener("stateRestored", eventListener);

      const persistenceData = weatherManager.getPersistenceData();
      weatherManager.restoreState(persistenceData);

      expect(eventListener).toHaveBeenCalledWith("stateRestored", {
        persistenceData,
      });
    });
  });

  describe("State History", () => {
    it("should track state history", () => {
      weatherManager.applyWeather(["Sunny"]);
      weatherManager.applyWeather(["Rainy"]);

      const history = weatherManager.getStateHistory();

      expect(history).toHaveLength(2);
      expect(history[0].currentWeather).toEqual([]);
      expect(history[1].currentWeather).toEqual(["Sunny"]);
    });

    it("should undo last change", () => {
      weatherManager.applyWeather(["Sunny"]);
      weatherManager.applyWeather(["Rainy"]);

      const undoResult = weatherManager.undoLastChange();

      expect(undoResult).toBe(true);
      expect(weatherManager.getCurrentWeather()).toEqual(["Sunny"]);
    });

    it("should return false when no history to undo", () => {
      const undoResult = weatherManager.undoLastChange();

      expect(undoResult).toBe(false);
    });

    it("should clear history", () => {
      weatherManager.applyWeather(["Sunny"]);
      weatherManager.clearHistory();

      const history = weatherManager.getStateHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe("Event Management", () => {
    it("should add and remove event listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      weatherManager.addEventListener("weatherChanged", listener1);
      weatherManager.addEventListener("weatherChanged", listener2);

      weatherManager.applyWeather(["Sunny"]);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();

      weatherManager.removeEventListener("weatherChanged", listener1);

      weatherManager.applyWeather(["Rainy"]);

      expect(listener1).toHaveBeenCalledTimes(1); // Not called again
      expect(listener2).toHaveBeenCalledTimes(2); // Called again
    });

    it("should remove all event listeners", () => {
      const listener = vi.fn();

      weatherManager.addEventListener("weatherChanged", listener);
      weatherManager.removeAllEventListeners();

      weatherManager.applyWeather(["Sunny"]);

      expect(listener).not.toHaveBeenCalled();
    });

    it("should handle listener errors gracefully", () => {
      const errorListener = vi.fn(() => {
        throw new Error("Listener error");
      });
      const normalListener = vi.fn();

      weatherManager.addEventListener("weatherChanged", errorListener);
      weatherManager.addEventListener("weatherChanged", normalListener);

      // Should not throw despite error in first listener
      expect(() => weatherManager.applyWeather(["Sunny"])).not.toThrow();
      expect(normalListener).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should throw appropriate errors for invalid operations", () => {
      expect(() => weatherManager.setTurn(0)).toThrow(WeatherManagerError);
      expect(() => weatherManager.setTurn(15)).toThrow(WeatherManagerError);
      expect(() => weatherManager.setTurn(5, 13)).toThrow(WeatherManagerError);
    });

    it("should include error context", () => {
      try {
        weatherManager.applyWeather(["Hot", "Cold"]);
      } catch (error) {
        expect(error).toBeInstanceOf(WeatherManagerError);
        expect((error as WeatherManagerError).errorType).toBe(
          WeatherManagerErrorType.INVALID_WEATHER_COMBINATION
        );
        expect((error as WeatherManagerError).context).toBeDefined();
      }
    });
  });

  describe("Getter Methods", () => {
    it("should return current weather state properties", () => {
      weatherManager.applyWeather(["Sunny", "Warm"]);
      weatherManager.setTurn(6, 7);

      expect(weatherManager.getCurrentWeather()).toEqual(["Sunny", "Warm"]);
      expect(weatherManager.getCurrentTurn()).toBe(6);
      expect(weatherManager.getCurrentMonth()).toBe(7);
      expect(weatherManager.getCurrentSeason()).toBe("Summer");
      expect(weatherManager.getActiveCards()).toEqual([]);
    });

    it("should return read-only copies of state", () => {
      weatherManager.applyWeather(["Sunny"]);

      const weather = weatherManager.getCurrentWeather();
      const state = weatherManager.getCurrentWeatherState();

      // Modifying returned arrays should not affect internal state
      weather.push("Rainy" as WeatherType);
      (state as any).turn = 999;

      expect(weatherManager.getCurrentWeather()).toEqual(["Sunny"]);
      expect(weatherManager.getCurrentTurn()).toBe(1);
    });
  });
});
