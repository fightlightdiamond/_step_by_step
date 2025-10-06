/**
 * Weather utility functions
 */

import { WeatherType, ElementType, SeasonType, WeatherEffect } from "../types";
import {
  WEATHER_TYPES,
  ELEMENT_TYPES,
  SEASON_TYPES,
  MONTH_TO_SEASON,
  OPPOSITE_WEATHER_PAIRS,
  WEATHER_EFFECT_LIMITS,
} from "../constants";

/**
 * Check if a weather type is valid
 */
export function isValidWeatherType(weather: string): weather is WeatherType {
  return WEATHER_TYPES.includes(weather as WeatherType);
}

/**
 * Check if an element type is valid
 */
export function isValidElementType(element: string): element is ElementType {
  return ELEMENT_TYPES.includes(element as ElementType);
}

/**
 * Check if a season type is valid
 */
export function isValidSeasonType(season: string): season is SeasonType {
  return SEASON_TYPES.includes(season as SeasonType);
}

/**
 * Get season for a given month (1-12)
 */
export function getSeasonForMonth(month: number): SeasonType {
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Must be between 1 and 12.`);
  }
  return MONTH_TO_SEASON[month];
}

/**
 * Check if two weather types are opposites
 */
export function areOppositeWeatherTypes(
  weather1: WeatherType,
  weather2: WeatherType
): boolean {
  return OPPOSITE_WEATHER_PAIRS.some(
    ([w1, w2]) =>
      (w1 === weather1 && w2 === weather2) ||
      (w1 === weather2 && w2 === weather1)
  );
}

/**
 * Check if a weather combination contains opposite weather types
 */
export function hasOppositeWeatherTypes(weatherTypes: WeatherType[]): boolean {
  for (let i = 0; i < weatherTypes.length; i++) {
    for (let j = i + 1; j < weatherTypes.length; j++) {
      if (areOppositeWeatherTypes(weatherTypes[i], weatherTypes[j])) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Clamp weather effect value to valid range
 */
export function clampWeatherEffect(value: number): number {
  return Math.max(
    WEATHER_EFFECT_LIMITS.MIN,
    Math.min(WEATHER_EFFECT_LIMITS.MAX, value)
  );
}

/**
 * Create an empty weather effect
 */
export function createEmptyWeatherEffect(): WeatherEffect {
  return {
    Fire: 0,
    Ice: 0,
    Lightning: 0,
  };
}

/**
 * Add two weather effects together, clamping the result
 */
export function addWeatherEffects(
  effect1: WeatherEffect,
  effect2: WeatherEffect
): WeatherEffect {
  return {
    Fire: clampWeatherEffect(effect1.Fire + effect2.Fire),
    Ice: clampWeatherEffect(effect1.Ice + effect2.Ice),
    Lightning: clampWeatherEffect(effect1.Lightning + effect2.Lightning),
  };
}

/**
 * Check if a weather effect is within valid bounds
 */
export function isValidWeatherEffect(effect: WeatherEffect): boolean {
  return ELEMENT_TYPES.every((element) => {
    const value = effect[element];
    return (
      value >= WEATHER_EFFECT_LIMITS.MIN && value <= WEATHER_EFFECT_LIMITS.MAX
    );
  });
}

/**
 * Generate a unique ID for weather cards or other entities
 */
export function generateId(): string {
  return `weather_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
