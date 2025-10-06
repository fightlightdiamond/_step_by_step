/**
 * Weather card system types and interfaces
 */

import { WeatherType, ElementType } from "./weather";

/**
 * Weather card types
 */
export type CardType =
  | "Weather"
  | "BreakWeather"
  | "WeatherBuff"
  | "WeatherNerf";

/**
 * Card rarity levels
 */
export type CardRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

/**
 * Card play validation result
 */
export interface CardPlayResult {
  valid: boolean;
  reason?: string;
  weatherChange?: WeatherType[];
  effectModifiers?: Partial<Record<ElementType, number>>;
}

/**
 * Weather card interface with comprehensive properties
 */
export interface WeatherCard {
  id: string;
  type: CardType;
  name: string;
  description: string;
  rarity: CardRarity;
  cost: number;

  // Weather-specific properties
  weather?: WeatherType;
  weatherOptions?: WeatherType[]; // For cards that can choose from multiple weather types

  // Effect properties
  effect?: Partial<Record<ElementType, number>>;
  duration?: number; // Number of turns the effect lasts (0 = permanent until overridden)

  // Card behavior flags
  breaksWeather?: boolean; // If true, removes all current weather
  stackable?: boolean; // If true, can stack with other cards
  unique?: boolean; // If true, only one can be active at a time

  // Play restrictions
  playConditions?: CardPlayCondition[];
  maxPlaysPerTurn?: number;
  maxPlaysPerGame?: number;

  // Metadata
  createdAt?: Date;
  playedAt?: Date;
  expiresAt?: Date;
}

/**
 * Conditions that must be met to play a card
 */
export interface CardPlayCondition {
  type: "weather" | "turn" | "season" | "element" | "custom";
  condition: string;
  value: any;
  description: string;
}

/**
 * Active card state tracking
 */
export interface ActiveCard {
  card: WeatherCard;
  playedTurn: number;
  remainingDuration: number;
  playerId?: string;
  effectsApplied: Partial<Record<ElementType, number>>;
}

/**
 * Card deck configuration
 */
export interface CardDeck {
  id: string;
  name: string;
  description: string;
  cards: WeatherCard[];
  maxSize: number;
  allowDuplicates: boolean;
}

/**
 * Player's card hand
 */
export interface PlayerHand {
  playerId: string;
  cards: WeatherCard[];
  maxHandSize: number;
  cardsPlayedThisTurn: number;
  cardsPlayedThisGame: Map<string, number>;
}

/**
 * Card play history entry
 */
export interface CardPlayHistory {
  cardId: string;
  playerId: string;
  turn: number;
  weatherBefore: WeatherType[];
  weatherAfter: WeatherType[];
  effectsApplied: Partial<Record<ElementType, number>>;
  timestamp: Date;
}

/**
 * Card validation error types
 */
export type CardValidationError =
  | "INVALID_CARD"
  | "INSUFFICIENT_COST"
  | "PLAY_CONDITION_NOT_MET"
  | "MAX_PLAYS_EXCEEDED"
  | "DUPLICATE_UNIQUE_CARD"
  | "INVALID_WEATHER_COMBINATION"
  | "CARD_EXPIRED"
  | "HAND_SIZE_EXCEEDED";

/**
 * Card validation result
 */
export interface CardValidationResult {
  valid: boolean;
  errors: CardValidationError[];
  warnings: string[];
}
