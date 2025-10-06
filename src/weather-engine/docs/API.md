# Weather Engine API Documentation

## Table of Contents

- [Core Classes](#core-classes)
- [Weather Manager](#weather-manager)
- [Season Manager](#season-manager)
- [Weather Card Manager](#weather-card-manager)
- [Game Mode Manager](#game-mode-manager)
- [Configuration System](#configuration-system)
- [Utility Functions](#utility-functions)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)

## Core Classes

### WeatherManager

The central class for managing weather state and effects.

```typescript
import { WeatherManager } from "@/weather-engine/manager/weather-manager";

const weatherManager = new WeatherManager();
```

#### Methods

##### `applyWeather(weather: WeatherType[]): void`

Applies one or more weather types to the current state.

```typescript
weatherManager.applyWeather(["Sunny", "Hot"]);
```

**Parameters:**

- `weather`: Array of weather types to apply

**Throws:**

- `WeatherValidationError`: If weather combination is invalid

##### `validateWeatherMix(weather: WeatherType[]): boolean`

Validates if a weather combination is logically possible.

```typescript
const isValid = weatherManager.validateWeatherMix(["Sunny", "Hot"]); // true
const isInvalid = weatherManager.validateWeatherMix(["Hot", "Cold"]); // false
```

##### `calculateElementalModifiers(): Record<ElementType, number>`

Calculates current elemental damage modifiers based on active weather.

```typescript
const modifiers = weatherManager.calculateElementalModifiers();
// Returns: { Fire: 20, Ice: -10, Lightning: 5 }
```

##### `resetWeather(): void`

Resets weather to neutral state.

```typescript
weatherManager.resetWeather();
```

##### `getCurrentWeather(): WeatherType[]`

Gets currently active weather types.

```typescript
const currentWeather = weatherManager.getCurrentWeather();
```

##### `getWeatherState(): WeatherState`

Gets complete weather state including turn and season information.

```typescript
const state = weatherManager.getWeatherState();
```

### SeasonManager

Manages seasonal weather patterns and monthly weather selection.

```typescript
import { SeasonManager } from "@/weather-engine/manager/season-manager";

const seasonManager = new SeasonManager();
```

#### Methods

##### `getWeatherForMonth(month: number): WeatherType`

Gets appropriate weather for a specific month using weighted random selection.

```typescript
const weather = seasonManager.getWeatherForMonth(12); // Returns winter weather
```

##### `getSeasonForMonth(month: number): SeasonType`

Determines season for a given month (1-12).

```typescript
const season = seasonManager.getSeasonForMonth(6); // 'Summer'
```

##### `getWeatherPool(season: SeasonType): WeatherType[]`

Gets available weather types for a season.

```typescript
const winterWeather = seasonManager.getWeatherPool("Winter");
// Returns: ['Cold', 'Snowy', 'Foggy', 'Windy', 'Cloudy', 'Stormy']
```

##### `updateSeasonalWeights(season: SeasonType, weights: Record<WeatherType, number>): void`

Updates probability weights for seasonal weather selection.

```typescript
seasonManager.updateSeasonalWeights("Winter", {
  Cold: 0.3,
  Snowy: 0.3,
  Foggy: 0.2,
  Windy: 0.2,
});
```

### WeatherCardManager

Manages weather cards and their effects on the game state.

```typescript
import { WeatherCardManager } from "@/weather-engine/manager/weather-card-manager";

const cardManager = new WeatherCardManager();
```

#### Methods

##### `playCard(card: WeatherCard, currentWeather: WeatherType[]): WeatherType[]`

Plays a weather card and returns the resulting weather state.

```typescript
const sunnyCard: WeatherCard = {
  id: "sunny-1",
  type: "Weather",
  name: "Sunny Day",
  description: "Changes weather to sunny",
  weather: "Sunny",
};

const newWeather = cardManager.playCard(sunnyCard, ["Cloudy"]);
// Returns: ['Sunny']
```

##### `validateCardPlay(card: WeatherCard, currentWeather: WeatherType[]): boolean`

Validates if a card can be played in the current weather state.

```typescript
const canPlay = cardManager.validateCardPlay(sunnyCard, ["Stormy"]);
```

##### `processCardEffects(): Record<ElementType, number>`

Calculates cumulative effects from all active cards.

```typescript
const cardEffects = cardManager.processCardEffects();
```

##### `expireCards(): void`

Removes expired cards from active state.

```typescript
cardManager.expireCards();
```

##### `getActiveCards(): WeatherCard[]`

Gets all currently active weather cards.

```typescript
const activeCards = cardManager.getActiveCards();
```

### GameModeManager

Manages different game modes and their weather rules.

```typescript
import { GameModeManager } from "@/weather-engine/manager/game-mode-manager";

const gameModeManager = new GameModeManager();
```

#### Methods

##### `setGameMode(modeName: string): void`

Sets the current game mode.

```typescript
gameModeManager.setGameMode("12-Month Campaign");
```

##### `processWeatherForTurn(turn: number): WeatherType[]`

Processes weather for a specific turn based on current game mode rules.

```typescript
const weather = gameModeManager.processWeatherForTurn(5);
```

##### `validateModeRules(action: GameAction): boolean`

Validates if an action is allowed under current game mode rules.

```typescript
const isAllowed = gameModeManager.validateModeRules({
  type: "PlayWeatherCard",
  card: sunnyCard,
});
```

##### `getCurrentMode(): GameMode`

Gets the current game mode configuration.

```typescript
const mode = gameModeManager.getCurrentMode();
```

##### `getAvailableModes(): string[]`

Gets list of available game mode names.

```typescript
const modes = gameModeManager.getAvailableModes();
```

## Configuration System

### ConfigManager

Manages weather system configuration loading and validation.

```typescript
import { ConfigManager } from "@/weather-engine/config/config-manager";

const configManager = new ConfigManager();
```

#### Methods

##### `loadConfig(configPath?: string): Promise<WeatherConfig>`

Loads weather configuration from JSON file.

```typescript
const config = await configManager.loadConfig("./custom-weather-config.json");
```

##### `validateConfig(config: WeatherConfig): boolean`

Validates configuration structure and values.

```typescript
const isValid = configManager.validateConfig(config);
```

##### `getDefaultConfig(): WeatherConfig`

Gets default weather configuration.

```typescript
const defaultConfig = configManager.getDefaultConfig();
```

##### `reloadConfig(): Promise<void>`

Reloads configuration from file.

```typescript
await configManager.reloadConfig();
```

## Utility Functions

### Weather Utilities

```typescript
import {
  isValidWeatherType,
  getSeasonForMonth,
  areOppositeWeathers,
  clampWeatherEffect,
  addWeatherEffects,
  createEmptyWeatherEffect,
} from "@/weather-engine/utils/weather-utils";
```

##### `isValidWeatherType(weather: string): weather is WeatherType`

Type guard to check if a string is a valid weather type.

```typescript
const isValid = isValidWeatherType("Sunny"); // true
const isInvalid = isValidWeatherType("Invalid"); // false
```

##### `getSeasonForMonth(month: number): SeasonType`

Gets season for a month (1-12).

```typescript
const season = getSeasonForMonth(3); // 'Spring'
```

##### `areOppositeWeathers(weather1: WeatherType, weather2: WeatherType): boolean`

Checks if two weather types are opposites.

```typescript
const areOpposite = areOppositeWeathers("Hot", "Cold"); // true
```

##### `clampWeatherEffect(value: number): number`

Clamps weather effect value to valid range (-40 to +40).

```typescript
const clamped = clampWeatherEffect(50); // 40
```

##### `addWeatherEffects(effect1: WeatherEffect, effect2: WeatherEffect): WeatherEffect`

Combines two weather effects with clamping.

```typescript
const combined = addWeatherEffects(
  { Fire: 20, Ice: -10, Lightning: 5 },
  { Fire: 15, Ice: 5, Lightning: -15 }
);
// Result: { Fire: 35, Ice: -5, Lightning: -10 }
```

### Card Utilities

```typescript
import {
  createWeatherCard,
  validateCardData,
  calculateCardEffect,
  isCardExpired,
} from "@/weather-engine/utils/card-utils";
```

##### `createWeatherCard(data: Partial<WeatherCard>): WeatherCard`

Creates a weather card with default values.

```typescript
const card = createWeatherCard({
  name: "Sunny Day",
  weather: "Sunny",
});
```

##### `validateCardData(card: WeatherCard): boolean`

Validates weather card data structure.

```typescript
const isValid = validateCardData(card);
```

## Type Definitions

### Core Types

```typescript
// Weather types
type WeatherType =
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

type ElementType = "Fire" | "Ice" | "Lightning";

type SeasonType = "Spring" | "Summer" | "Autumn" | "Winter";

// Weather effects
interface WeatherEffect {
  Fire: number;
  Ice: number;
  Lightning: number;
}

// Weather state
interface WeatherState {
  currentWeather: WeatherType[];
  turn: number;
  month: number;
  season: SeasonType;
  activeCards: WeatherCard[];
}
```

### Card Types

```typescript
type CardType = "Weather" | "BreakWeather" | "WeatherBuff" | "WeatherNerf";

interface WeatherCard {
  id: string;
  type: CardType;
  name: string;
  description: string;
  weather?: WeatherType;
  effect?: Partial<WeatherEffect>;
  duration?: number;
  cost?: number;
}
```

### Game Mode Types

```typescript
interface GameMode {
  name: string;
  description: string;
  weatherRules: WeatherRules;
  turnLimit: number;
  specialRules?: SpecialRule[];
}

interface WeatherRules {
  weatherChangeFrequency: number;
  allowPlayerWeatherControl: boolean;
  allowWeatherMixing: boolean;
  maxWeatherTypes: number;
  weatherSource: "seasonal" | "random" | "predetermined" | "player-controlled";
}
```

## Error Handling

### Error Types

```typescript
import {
  WeatherValidationError,
  CardPlayError,
  ConfigurationError,
  GameStateError,
} from "@/weather-engine/types/errors";
```

##### `WeatherValidationError`

Thrown when invalid weather combinations are attempted.

```typescript
try {
  weatherManager.applyWeather(["Hot", "Cold"]);
} catch (error) {
  if (error instanceof WeatherValidationError) {
    console.log(`Invalid weather: ${error.invalidWeather}`);
    console.log(`Reason: ${error.reason}`);
  }
}
```

##### `CardPlayError`

Thrown when invalid card plays are attempted.

```typescript
try {
  cardManager.playCard(invalidCard, currentWeather);
} catch (error) {
  if (error instanceof CardPlayError) {
    console.log(`Cannot play card ${error.card.name}: ${error.reason}`);
  }
}
```

##### `ConfigurationError`

Thrown when configuration loading or validation fails.

```typescript
try {
  await configManager.loadConfig("invalid-config.json");
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.log(`Configuration error: ${error.message}`);
  }
}
```

## Events and Hooks

### Weather Events

The weather engine emits events for weather changes and card plays:

```typescript
import { WeatherEventEmitter } from "@/weather-engine/events";

const eventEmitter = new WeatherEventEmitter();

// Listen for weather changes
eventEmitter.on("weatherChanged", (oldWeather, newWeather) => {
  console.log(`Weather changed from ${oldWeather} to ${newWeather}`);
});

// Listen for card plays
eventEmitter.on("cardPlayed", (card, player) => {
  console.log(`${player} played ${card.name}`);
});
```

### Available Events

- `weatherChanged`: Weather state changed
- `cardPlayed`: Weather card was played
- `seasonChanged`: Season transition occurred
- `gameModeChanged`: Game mode was switched
- `configReloaded`: Configuration was reloaded

## Performance Considerations

### Caching

The weather engine includes built-in caching for expensive operations:

```typescript
// Weather effect calculations are cached
const modifiers = weatherManager.calculateElementalModifiers(); // Calculated
const modifiers2 = weatherManager.calculateElementalModifiers(); // Cached

// Clear cache when needed
weatherManager.clearCache();
```

### Memory Management

- Weather history is automatically pruned after 100 turns
- Expired cards are automatically removed
- Configuration is lazy-loaded only when needed

### Batch Operations

For performance-critical applications, use batch operations:

```typescript
// Instead of multiple single operations
weatherManager.applyWeather(["Sunny"]);
weatherManager.applyWeather(["Hot"]);

// Use batch operation
weatherManager.applyWeatherBatch([["Sunny"], ["Hot"]]);
```
