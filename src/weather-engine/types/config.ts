/**
 * Configuration types for the weather engine
 */

import {
  WeatherType,
  WeatherEffect,
  SeasonType,
  WeatherPool,
  WeatherCard,
  ElementType,
  WeatherState,
} from "./weather";

/**
 * Main weather configuration interface
 */
export interface WeatherConfig {
  weatherEffects: Record<WeatherType, WeatherEffect>;
  compatibilityMatrix: Record<WeatherType, WeatherType[]>;
  seasonalPools: Record<SeasonType, WeatherPool>;
  monthlyMappings: Record<number, SeasonType>;
  oppositeWeatherPairs: [WeatherType, WeatherType][];
  effectLimits: {
    min: number; // -40
    max: number; // +40
  };
}

/**
 * Player state interface
 */
export interface PlayerState {
  playerId: string;
  hand: WeatherCard[];
  playedCards: WeatherCard[];
  elementalAffinities: Record<ElementType, number>;
}

/**
 * Turn record for game history
 */
export interface TurnRecord {
  turn: number;
  weather: WeatherType[];
  cardsPlayed: WeatherCard[];
  elementalModifiers: Record<ElementType, number>;
}

/**
 * Complete game state
 */
export interface GameState {
  currentTurn: number;
  currentMonth: number;
  weatherState: WeatherState;
  playerStates: PlayerState[];
  gameMode: string;
  turnHistory: TurnRecord[];
}

/**
 * Localization support for weather system
 */
export interface WeatherLocalization {
  weatherNames: Record<WeatherType, string>;
  weatherDescriptions: Record<WeatherType, string>;
  cardNames: Record<string, string>;
  modeNames: Record<string, string>;
}

// Re-export types from weather.ts for convenience
export type {
  WeatherType,
  ElementType,
  SeasonType,
  WeatherEffect,
  WeatherState,
  WeatherCard,
  CardType,
  WeatherPool,
  WeatherRules,
  GameMode,
  SpecialRule,
} from "./weather";
