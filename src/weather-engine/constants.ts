/**
 * Constants for the Weather Engine
 */

import { WeatherType, ElementType } from "./types";

/**
 * All available weather types
 */
export const WEATHER_TYPES: WeatherType[] = [
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

/**
 * All available element types
 */
export const ELEMENT_TYPES: ElementType[] = ["Fire", "Ice", "Lightning"];

/**
 * Weather effect limits
 */
export const WEATHER_EFFECT_LIMITS = {
  MIN: -40,
  MAX: 40,
} as const;

/**
 * Default weather effects for each weather type
 */
export const DEFAULT_WEATHER_EFFECTS = {
  Sunny: { Fire: 20, Ice: -10, Lightning: -5 },
  Cloudy: { Fire: -5, Ice: 0, Lightning: 5 },
  Rainy: { Fire: -20, Ice: 5, Lightning: 15 },
  Windy: { Fire: 5, Ice: 5, Lightning: 10 },
  Stormy: { Fire: -15, Ice: 0, Lightning: 25 },
  Foggy: { Fire: -5, Ice: 10, Lightning: -15 },
  Snowy: { Fire: -25, Ice: 20, Lightning: -10 },
  Hot: { Fire: 30, Ice: -20, Lightning: 0 },
  Cold: { Fire: -20, Ice: 25, Lightning: -5 },
  Warm: { Fire: 10, Ice: -5, Lightning: 0 },
  Cool: { Fire: -5, Ice: 10, Lightning: 0 },
  Humid: { Fire: -10, Ice: -5, Lightning: 20 },
} as const;

/**
 * Weather compatibility matrix
 */
export const WEATHER_COMPATIBILITY = {
  Sunny: ["Hot", "Warm", "Windy"],
  Cloudy: ["Rainy", "Cool", "Windy", "Foggy"],
  Rainy: ["Cloudy", "Cool", "Windy", "Stormy", "Humid"],
  Windy: ["Sunny", "Cloudy", "Rainy", "Stormy", "Cold", "Snowy"],
  Stormy: ["Rainy", "Windy", "Cloudy", "Humid"],
  Foggy: ["Cloudy", "Cold", "Cool", "Humid"],
  Snowy: ["Cold", "Windy", "Foggy"],
  Hot: ["Sunny", "Warm", "Humid"],
  Cold: ["Snowy", "Foggy", "Windy", "Cool"],
  Warm: ["Sunny", "Hot", "Humid"],
  Cool: ["Cloudy", "Foggy", "Cold"],
  Humid: ["Rainy", "Stormy", "Hot", "Warm", "Foggy"],
} as const;

/**
 * Opposite weather pairs that cannot coexist
 */
export const OPPOSITE_WEATHER_PAIRS: [WeatherType, WeatherType][] = [
  ["Hot", "Cold"],
  ["Sunny", "Snowy"],
  ["Sunny", "Stormy"],
  ["Hot", "Foggy"],
  ["Snowy", "Humid"],
];

/**
 * Seasonal weather pools
 */
export const SEASONAL_WEATHER_POOLS = {
  Spring: {
    weights: {
      Rainy: 0.25,
      Cloudy: 0.2,
      Windy: 0.15,
      Warm: 0.15,
      Sunny: 0.1,
      Cool: 0.1,
      Foggy: 0.05,
    },
  },
  Summer: {
    weights: {
      Sunny: 0.3,
      Hot: 0.25,
      Warm: 0.15,
      Humid: 0.1,
      Cloudy: 0.1,
      Windy: 0.05,
      Stormy: 0.05,
    },
  },
  Autumn: {
    weights: {
      Cloudy: 0.25,
      Windy: 0.2,
      Rainy: 0.15,
      Cool: 0.15,
      Foggy: 0.1,
      Stormy: 0.1,
      Sunny: 0.05,
    },
  },
  Winter: {
    weights: {
      Cold: 0.25,
      Snowy: 0.25,
      Foggy: 0.15,
      Windy: 0.15,
      Cloudy: 0.1,
      Stormy: 0.1,
    },
  },
} as const;

/**
 * Month to season mapping
 */
export const MONTH_TO_SEASON = {
  1: "Winter",
  2: "Winter",
  3: "Spring",
  4: "Spring",
  5: "Spring",
  6: "Summer",
  7: "Summer",
  8: "Summer",
  9: "Autumn",
  10: "Autumn",
  11: "Autumn",
  12: "Winter",
} as const;

/**
 * Game mode configurations
 */
export const GAME_MODES = {
  "12-Month Campaign": {
    name: "12-Month Campaign",
    description: "Progress through 12 months with seasonal weather changes",
    weatherRules: {
      weatherChangeFrequency: 1,
      allowPlayerWeatherControl: true,
      allowWeatherMixing: false,
      maxWeatherTypes: 1,
      weatherSource: "seasonal" as const,
    },
    turnLimit: 12,
    specialRules: [],
  },
  "Weather Chaos": {
    name: "Weather Chaos",
    description: "Random weather mixing creates unpredictable conditions",
    weatherRules: {
      weatherChangeFrequency: 1,
      allowPlayerWeatherControl: true,
      allowWeatherMixing: true,
      maxWeatherTypes: 5,
      weatherSource: "random" as const,
    },
    turnLimit: 20,
    specialRules: [
      {
        name: "Chaos Mixing",
        description: "2-5 random weather types active each turn",
        effect: "randomWeatherCount: [2, 5]",
      },
    ],
  },
  "Seasonal Event": {
    name: "Seasonal Event",
    description: "Weather restricted to one specific season",
    weatherRules: {
      weatherChangeFrequency: 2,
      allowPlayerWeatherControl: true,
      allowWeatherMixing: false,
      maxWeatherTypes: 1,
      weatherSource: "seasonal" as const,
    },
    turnLimit: 15,
    specialRules: [
      {
        name: "Season Lock",
        description: "All weather comes from selected season",
        effect: "seasonLock: true",
      },
    ],
  },
} as const;

/**
 * Card type configurations
 */
export const CARD_TYPES = {
  Weather: "Weather",
  BreakWeather: "BreakWeather",
  WeatherBuff: "WeatherBuff",
  WeatherNerf: "WeatherNerf",
} as const;

/**
 * Card rarity levels
 */
export const CARD_RARITIES = {
  Common: "common",
  Uncommon: "uncommon",
  Rare: "rare",
  Epic: "epic",
  Legendary: "legendary",
} as const;

/**
 * Maximum values for various game elements
 */
export const LIMITS = {
  MAX_WEATHER_TYPES: 5,
  MAX_CARD_DURATION: 10,
  MAX_CARD_COST: 10,
  MAX_HAND_SIZE: 10,
  MAX_ACTIVE_CARDS: 5,
} as const;
