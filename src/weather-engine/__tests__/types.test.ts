/**
 * Tests for weather engine types and basic functionality
 */

import { describe, it, expect } from "vitest";
import {
  WeatherType,
  ElementType,
  SeasonType,
  WeatherEffect,
  WeatherState,
  WeatherCard,
  WEATHER_TYPES,
  ELEMENT_TYPES,
  SEASON_TYPES,
  MONTH_TO_SEASON,
  isValidWeatherType,
  isValidElementType,
  isValidSeasonType,
  getSeasonForMonth,
  areOppositeWeatherTypes,
  hasOppositeWeatherTypes,
  clampWeatherEffect,
  createEmptyWeatherEffect,
  addWeatherEffects,
  isValidWeatherEffect,
  generateId,
} from "../index";

describe("Weather Engine Types", () => {
  describe("Type Guards", () => {
    it("should validate weather types correctly", () => {
      expect(isValidWeatherType("Sunny")).toBe(true);
      expect(isValidWeatherType("Rainy")).toBe(true);
      expect(isValidWeatherType("InvalidWeather")).toBe(false);
    });

    it("should validate element types correctly", () => {
      expect(isValidElementType("Fire")).toBe(true);
      expect(isValidElementType("Ice")).toBe(true);
      expect(isValidElementType("Lightning")).toBe(true);
      expect(isValidElementType("InvalidElement")).toBe(false);
    });

    it("should validate season types correctly", () => {
      expect(isValidSeasonType("Spring")).toBe(true);
      expect(isValidSeasonType("Summer")).toBe(true);
      expect(isValidSeasonType("Autumn")).toBe(true);
      expect(isValidSeasonType("Winter")).toBe(true);
      expect(isValidSeasonType("InvalidSeason")).toBe(false);
    });
  });

  describe("Season Utilities", () => {
    it("should return correct season for each month", () => {
      expect(getSeasonForMonth(1)).toBe("Winter");
      expect(getSeasonForMonth(3)).toBe("Spring");
      expect(getSeasonForMonth(6)).toBe("Summer");
      expect(getSeasonForMonth(9)).toBe("Autumn");
      expect(getSeasonForMonth(12)).toBe("Winter");
    });

    it("should throw error for invalid months", () => {
      expect(() => getSeasonForMonth(0)).toThrow();
      expect(() => getSeasonForMonth(13)).toThrow();
    });
  });

  describe("Weather Validation", () => {
    it("should detect opposite weather types", () => {
      expect(areOppositeWeatherTypes("Hot", "Cold")).toBe(true);
      expect(areOppositeWeatherTypes("Sunny", "Snowy")).toBe(true);
      expect(areOppositeWeatherTypes("Sunny", "Rainy")).toBe(false);
    });

    it("should detect opposite weather types in arrays", () => {
      expect(hasOppositeWeatherTypes(["Hot", "Cold"])).toBe(true);
      expect(hasOppositeWeatherTypes(["Sunny", "Rainy", "Windy"])).toBe(false);
      expect(hasOppositeWeatherTypes(["Sunny", "Rainy", "Snowy"])).toBe(true);
    });
  });

  describe("Weather Effects", () => {
    it("should clamp weather effect values", () => {
      expect(clampWeatherEffect(50)).toBe(40);
      expect(clampWeatherEffect(-50)).toBe(-40);
      expect(clampWeatherEffect(20)).toBe(20);
    });

    it("should create empty weather effect", () => {
      const effect = createEmptyWeatherEffect();
      expect(effect.Fire).toBe(0);
      expect(effect.Ice).toBe(0);
      expect(effect.Lightning).toBe(0);
    });

    it("should add weather effects correctly", () => {
      const effect1: WeatherEffect = { Fire: 10, Ice: -5, Lightning: 15 };
      const effect2: WeatherEffect = { Fire: 5, Ice: 10, Lightning: -10 };
      const result = addWeatherEffects(effect1, effect2);

      expect(result.Fire).toBe(15);
      expect(result.Ice).toBe(5);
      expect(result.Lightning).toBe(5);
    });

    it("should clamp when adding weather effects", () => {
      const effect1: WeatherEffect = { Fire: 30, Ice: -30, Lightning: 0 };
      const effect2: WeatherEffect = { Fire: 20, Ice: -20, Lightning: 0 };
      const result = addWeatherEffects(effect1, effect2);

      expect(result.Fire).toBe(40); // Clamped to max
      expect(result.Ice).toBe(-40); // Clamped to min
    });

    it("should validate weather effects", () => {
      expect(isValidWeatherEffect({ Fire: 20, Ice: -10, Lightning: 5 })).toBe(
        true
      );
      expect(isValidWeatherEffect({ Fire: 50, Ice: 0, Lightning: 0 })).toBe(
        false
      );
      expect(isValidWeatherEffect({ Fire: 0, Ice: -50, Lightning: 0 })).toBe(
        false
      );
    });
  });

  describe("ID Generation", () => {
    it("should generate unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toMatch(/^weather_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^weather_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe("Constants", () => {
    it("should have correct number of weather types", () => {
      expect(WEATHER_TYPES).toHaveLength(12);
      expect(WEATHER_TYPES).toContain("Sunny");
      expect(WEATHER_TYPES).toContain("Humid");
    });

    it("should have correct number of element types", () => {
      expect(ELEMENT_TYPES).toHaveLength(3);
      expect(ELEMENT_TYPES).toContain("Fire");
      expect(ELEMENT_TYPES).toContain("Ice");
      expect(ELEMENT_TYPES).toContain("Lightning");
    });

    it("should have correct number of season types", () => {
      expect(SEASON_TYPES).toHaveLength(4);
      expect(SEASON_TYPES).toContain("Spring");
      expect(SEASON_TYPES).toContain("Summer");
      expect(SEASON_TYPES).toContain("Autumn");
      expect(SEASON_TYPES).toContain("Winter");
    });

    it("should have month to season mapping for all 12 months", () => {
      expect(Object.keys(MONTH_TO_SEASON)).toHaveLength(12);
      for (let month = 1; month <= 12; month++) {
        expect(MONTH_TO_SEASON[month]).toBeDefined();
      }
    });
  });
});
