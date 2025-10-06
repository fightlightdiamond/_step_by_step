/**
 * Weather system constants
 */

import { WeatherType, ElementType, SeasonType } from "../types";

/**
 * All available weather types
 */
export const WEATHER_TYPES: readonly WeatherType[] = [
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
] as const;

/**
 * All available element types
 */
export const ELEMENT_TYPES: readonly ElementType[] = [
  "Fire",
  "Ice",
  "Lightning",
] as const;

/**
 * All available season types
 */
export const SEASON_TYPES: readonly SeasonType[] = [
  "Spring",
  "Summer",
  "Autumn",
  "Winter",
] as const;

/**
 * Weather effect limits
 */
export const WEATHER_EFFECT_LIMITS = {
  MIN: -40,
  MAX: 40,
} as const;

/**
 * Month to season mapping
 */
export const MONTH_TO_SEASON: Record<number, SeasonType> = {
  1: "Winter", // January
  2: "Winter", // February
  3: "Spring", // March
  4: "Spring", // April
  5: "Spring", // May
  6: "Summer", // June
  7: "Summer", // July
  8: "Summer", // August
  9: "Autumn", // September
  10: "Autumn", // October
  11: "Autumn", // November
  12: "Winter", // December
} as const;

/**
 * Opposite weather pairs that cannot coexist
 */
export const OPPOSITE_WEATHER_PAIRS: readonly [WeatherType, WeatherType][] = [
  ["Hot", "Cold"],
  ["Sunny", "Snowy"],
  ["Sunny", "Stormy"],
  ["Hot", "Snowy"],
  ["Cold", "Humid"],
] as const;

/**
 * Maximum number of weather types that can be active simultaneously
 */
export const MAX_ACTIVE_WEATHER_TYPES = 5;

/**
 * Default game configuration values
 */
export const DEFAULT_GAME_CONFIG = {
  TURNS_PER_GAME: 12,
  CARDS_PER_TURN: 1,
  MAX_HAND_SIZE: 7,
  STARTING_MONTH: 1,
} as const;
