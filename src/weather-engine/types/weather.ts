/**
 * Core weather system types and interfaces
 */

export type WeatherType =
  | "Sunny"
  | "Cloudy"
  | "Rainy"
  | "Windy"
  | "Stormy"
  | "Foggy"
  | "Snowy"
  | "Hot"
  | "Cold"
  | "Warm"
  | "Cool"
  | "Humid";

export type ElementType = "Fire" | "Ice" | "Lightning";

export type SeasonType = "Spring" | "Summer" | "Autumn" | "Winter";

/**
 * Weather effect modifiers for each element type
 * Values range from -40 to +40
 */
export interface WeatherEffect {
  Fire: number;
  Ice: number;
  Lightning: number;
}

/**
 * Current weather state of the game
 */
export interface WeatherState {
  currentWeather: WeatherType[];
  turn: number;
  month: number;
  season: SeasonType;
  activeCards: WeatherCard[];
  weatherHistory?: WeatherType[][];
  elementalModifiers: Record<ElementType, number>;
}

/**
 * Player state in the game
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
  actions: any[];
  timestamp: Date;
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
 * Weather card types
 */
export type CardType =
  | "Weather"
  | "BreakWeather"
  | "WeatherBuff"
  | "WeatherNerf";

/**
 * Weather card interface
 */
export interface WeatherCard {
  id: string;
  type: CardType;
  name: string;
  description: string;
  weather?: WeatherType;
  effect?: Partial<Record<ElementType, number>>;
  duration?: number;
  cost?: number;
}

/**
 * Weather pool for seasonal weather selection
 */
export interface WeatherPool {
  weights: Map<WeatherType, number>;
  totalWeight: number;
}

/**
 * Game mode weather rules
 */
export interface WeatherRules {
  weatherChangeFrequency: number; // Every N turns
  allowPlayerWeatherControl: boolean;
  allowWeatherMixing: boolean;
  maxWeatherTypes: number;
  weatherSource: "seasonal" | "random" | "predetermined" | "player-controlled";
}

/**
 * Special rules for game modes
 */
export interface SpecialRule {
  name: string;
  description: string;
  effect: (gameState: any) => void;
}

/**
 * Game mode configuration
 */
export interface GameMode {
  name: string;
  description: string;
  weatherRules: WeatherRules;
  turnLimit: number;
  specialRules?: SpecialRule[];
}
