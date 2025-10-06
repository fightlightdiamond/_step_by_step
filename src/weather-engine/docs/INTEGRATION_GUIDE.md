# Weather Engine Integration Guide

## Table of Contents

- [Quick Start](#quick-start)
- [Basic Integration](#basic-integration)
- [Advanced Integration](#advanced-integration)
- [Game Loop Integration](#game-loop-integration)
- [UI Integration](#ui-integration)
- [Custom Game Modes](#custom-game-modes)
- [Performance Optimization](#performance-optimization)
- [Best Practices](#best-practices)

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Import the weather engine
import { WeatherEngine } from '@/weather-engine';
```

### Basic Setup

```typescript
import {
  WeatherManager,
  SeasonManager,
  WeatherCardManager,
  GameModeManager,
} from "@/weather-engine";

// Initialize core components
const weatherManager = new WeatherManager();
const seasonManager = new SeasonManager();
const cardManager = new WeatherCardManager();
const gameModeManager = new GameModeManager();

// Set up a basic game
gameModeManager.setGameMode("12-Month Campaign");
```

## Basic Integration

### 1. Initialize Weather System

```typescript
class GameEngine {
  private weatherManager: WeatherManager;
  private seasonManager: SeasonManager;
  private cardManager: WeatherCardManager;
  private gameModeManager: GameModeManager;

  constructor() {
    this.weatherManager = new WeatherManager();
    this.seasonManager = new SeasonManager();
    this.cardManager = new WeatherCardManager();
    this.gameModeManager = new GameModeManager();

    // Set default game mode
    this.gameModeManager.setGameMode("12-Month Campaign");
  }

  async initialize() {
    // Load configuration
    await this.weatherManager.loadConfig();

    // Set initial weather for month 1
    const initialWeather = this.seasonManager.getWeatherForMonth(1);
    this.weatherManager.applyWeather([initialWeather]);
  }
}
```

### 2. Turn-Based Weather Updates

```typescript
class TurnManager {
  private currentTurn: number = 1;
  private weatherManager: WeatherManager;
  private seasonManager: SeasonManager;
  private gameModeManager: GameModeManager;

  processTurn() {
    // Update weather based on game mode
    const newWeather = this.gameModeManager.processWeatherForTurn(
      this.currentTurn
    );

    if (newWeather.length > 0) {
      this.weatherManager.applyWeather(newWeather);
    }

    // Process card expirations
    this.cardManager.expireCards();

    this.currentTurn++;
  }

  getCurrentMonth(): number {
    return ((this.currentTurn - 1) % 12) + 1;
  }
}
```

### 3. Combat Integration

```typescript
class CombatSystem {
  private weatherManager: WeatherManager;

  calculateDamage(baseDamage: number, elementType: ElementType): number {
    // Get current weather modifiers
    const modifiers = this.weatherManager.calculateElementalModifiers();
    const weatherModifier = modifiers[elementType] || 0;

    // Apply weather modifier (percentage-based)
    const modifiedDamage = baseDamage * (1 + weatherModifier / 100);

    return Math.round(modifiedDamage);
  }

  // Example usage
  performAttack(attacker: Player, target: Player, spell: Spell) {
    const baseDamage = spell.baseDamage;
    const finalDamage = this.calculateDamage(baseDamage, spell.elementType);

    target.takeDamage(finalDamage);

    // Log weather effect
    const modifiers = this.weatherManager.calculateElementalModifiers();
    const modifier = modifiers[spell.elementType];

    if (modifier !== 0) {
      console.log(
        `Weather modified ${spell.elementType} damage by ${modifier}%`
      );
    }
  }
}
```

## Advanced Integration

### 1. Weather Card System

```typescript
class CardSystem {
  private cardManager: WeatherCardManager;
  private weatherManager: WeatherManager;

  playWeatherCard(player: Player, card: WeatherCard): boolean {
    try {
      // Validate card play
      const currentWeather = this.weatherManager.getCurrentWeather();

      if (!this.cardManager.validateCardPlay(card, currentWeather)) {
        throw new Error("Invalid card play");
      }

      // Play the card
      const newWeather = this.cardManager.playCard(card, currentWeather);

      // Apply new weather
      if (card.type === "BreakWeather") {
        this.weatherManager.resetWeather();
      } else if (card.weather) {
        this.weatherManager.applyWeather([card.weather]);
      }

      // Remove card from player's hand
      player.removeCardFromHand(card);

      // Emit event
      this.emitEvent("cardPlayed", { player, card, newWeather });

      return true;
    } catch (error) {
      console.error("Failed to play weather card:", error);
      return false;
    }
  }

  // Create custom weather cards
  createCustomCard(data: Partial<WeatherCard>): WeatherCard {
    return {
      id: generateId(),
      type: "Weather",
      name: data.name || "Custom Weather Card",
      description: data.description || "A custom weather effect",
      weather: data.weather,
      effect: data.effect,
      duration: data.duration || 1,
      cost: data.cost || 1,
      ...data,
    };
  }
}
```

### 2. Event System Integration

```typescript
class WeatherEventSystem {
  private eventEmitter = new EventEmitter();
  private weatherManager: WeatherManager;

  constructor(weatherManager: WeatherManager) {
    this.weatherManager = weatherManager;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for weather changes
    this.weatherManager.on("weatherChanged", (oldWeather, newWeather) => {
      this.handleWeatherChange(oldWeather, newWeather);
    });

    // Listen for season changes
    this.weatherManager.on("seasonChanged", (oldSeason, newSeason) => {
      this.handleSeasonChange(oldSeason, newSeason);
    });
  }

  private handleWeatherChange(
    oldWeather: WeatherType[],
    newWeather: WeatherType[]
  ) {
    // Update UI
    this.updateWeatherUI(newWeather);

    // Play weather transition effects
    this.playWeatherTransition(oldWeather, newWeather);

    // Update background music
    this.updateBackgroundMusic(newWeather);

    // Notify other systems
    this.eventEmitter.emit("gameWeatherChanged", { oldWeather, newWeather });
  }

  private handleSeasonChange(oldSeason: SeasonType, newSeason: SeasonType) {
    // Update seasonal UI elements
    this.updateSeasonalTheme(newSeason);

    // Trigger seasonal events
    this.triggerSeasonalEvents(newSeason);
  }
}
```

## Game Loop Integration

### Complete Game Loop Example

```typescript
class WeatherGame {
  private weatherManager: WeatherManager;
  private seasonManager: SeasonManager;
  private cardManager: WeatherCardManager;
  private gameModeManager: GameModeManager;
  private turnManager: TurnManager;
  private combatSystem: CombatSystem;
  private uiManager: UIManager;

  async startGame(gameMode: string) {
    // Initialize systems
    await this.initialize();

    // Set game mode
    this.gameModeManager.setGameMode(gameMode);

    // Start game loop
    this.gameLoop();
  }

  private async gameLoop() {
    while (!this.isGameOver()) {
      // Start turn
      await this.startTurn();

      // Player actions phase
      await this.playerActionsPhase();

      // Combat phase
      await this.combatPhase();

      // End turn
      await this.endTurn();

      // Update weather for next turn
      this.updateWeatherForNextTurn();
    }

    this.endGame();
  }

  private async startTurn() {
    const currentTurn = this.turnManager.getCurrentTurn();
    const currentMonth = this.turnManager.getCurrentMonth();

    // Update weather based on game mode
    const newWeather = this.gameModeManager.processWeatherForTurn(currentTurn);

    if (newWeather.length > 0) {
      this.weatherManager.applyWeather(newWeather);
    }

    // Update UI
    this.uiManager.updateTurnInfo(currentTurn, currentMonth);
    this.uiManager.updateWeatherDisplay(
      this.weatherManager.getCurrentWeather()
    );

    // Process card effects
    this.cardManager.expireCards();
  }

  private async playerActionsPhase() {
    for (const player of this.players) {
      await this.processPlayerTurn(player);
    }
  }

  private async processPlayerTurn(player: Player) {
    // Allow player to play weather cards
    const weatherCard = await player.selectWeatherCard();

    if (weatherCard) {
      const success = this.cardSystem.playWeatherCard(player, weatherCard);

      if (success) {
        // Update UI to show weather change
        this.uiManager.showWeatherCardEffect(weatherCard);
      }
    }

    // Allow other actions (spells, abilities, etc.)
    const action = await player.selectAction();
    await this.processAction(player, action);
  }

  private async combatPhase() {
    // Process all combat actions with weather effects
    for (const action of this.combatActions) {
      if (action.type === "spell") {
        const damage = this.combatSystem.calculateDamage(
          action.baseDamage,
          action.elementType
        );

        action.target.takeDamage(damage);

        // Show weather effect in UI
        this.uiManager.showDamageWithWeatherEffect(action, damage);
      }
    }
  }
}
```

## UI Integration

### React Component Integration

```typescript
// Weather Display Component
import React, { useEffect, useState } from "react";
import { WeatherManager, WeatherType, ElementType } from "@/weather-engine";

interface WeatherDisplayProps {
  weatherManager: WeatherManager;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  weatherManager,
}) => {
  const [currentWeather, setCurrentWeather] = useState<WeatherType[]>([]);
  const [elementalModifiers, setElementalModifiers] = useState<
    Record<ElementType, number>
  >({});

  useEffect(() => {
    const updateWeatherDisplay = () => {
      setCurrentWeather(weatherManager.getCurrentWeather());
      setElementalModifiers(weatherManager.calculateElementalModifiers());
    };

    // Initial update
    updateWeatherDisplay();

    // Listen for weather changes
    weatherManager.on("weatherChanged", updateWeatherDisplay);

    return () => {
      weatherManager.off("weatherChanged", updateWeatherDisplay);
    };
  }, [weatherManager]);

  return (
    <div className="weather-display">
      <h3>Current Weather</h3>
      <div className="weather-types">
        {currentWeather.map((weather) => (
          <span
            key={weather}
            className={`weather-badge weather-${weather.toLowerCase()}`}
          >
            {weather}
          </span>
        ))}
      </div>

      <h4>Elemental Modifiers</h4>
      <div className="elemental-modifiers">
        {Object.entries(elementalModifiers).map(([element, modifier]) => (
          <div key={element} className="modifier">
            <span className={`element element-${element.toLowerCase()}`}>
              {element}
            </span>
            <span
              className={`modifier-value ${
                modifier > 0
                  ? "positive"
                  : modifier < 0
                  ? "negative"
                  : "neutral"
              }`}
            >
              {modifier > 0 ? "+" : ""}
              {modifier}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Weather Card Hand Component

```typescript
interface WeatherCardHandProps {
  cards: WeatherCard[];
  onCardPlay: (card: WeatherCard) => void;
  canPlayCards: boolean;
}

export const WeatherCardHand: React.FC<WeatherCardHandProps> = ({
  cards,
  onCardPlay,
  canPlayCards,
}) => {
  return (
    <div className="weather-card-hand">
      <h3>Weather Cards</h3>
      <div className="cards">
        {cards.map((card) => (
          <WeatherCardComponent
            key={card.id}
            card={card}
            onClick={() => onCardPlay(card)}
            disabled={!canPlayCards}
          />
        ))}
      </div>
    </div>
  );
};

const WeatherCardComponent: React.FC<{
  card: WeatherCard;
  onClick: () => void;
  disabled: boolean;
}> = ({ card, onClick, disabled }) => {
  return (
    <div
      className={`weather-card ${disabled ? "disabled" : ""}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="card-name">{card.name}</div>
      <div className="card-description">{card.description}</div>
      {card.weather && (
        <div className="card-weather">Weather: {card.weather}</div>
      )}
      {card.cost && <div className="card-cost">Cost: {card.cost}</div>}
    </div>
  );
};
```

## Custom Game Modes

### Creating Custom Game Modes

```typescript
import { GameMode, WeatherRules } from "@/weather-engine/types";

// Define custom weather rules
const customWeatherRules: WeatherRules = {
  weatherChangeFrequency: 2, // Change every 2 turns
  allowPlayerWeatherControl: true,
  allowWeatherMixing: true,
  maxWeatherTypes: 3,
  weatherSource: "player-controlled",
};

// Create custom game mode
const customGameMode: GameMode = {
  name: "Weather Mastery",
  description: "Players have full control over weather with enhanced mixing",
  weatherRules: customWeatherRules,
  turnLimit: 20,
  specialRules: [
    {
      name: "Enhanced Weather Mixing",
      description: "Players can mix up to 3 weather types",
      effect: "maxWeatherTypes: 3",
    },
    {
      name: "Weather Mastery Bonus",
      description: "Weather effects are 50% stronger",
      effect: "weatherEffectMultiplier: 1.5",
    },
  ],
};

// Register the custom game mode
gameModeManager.registerGameMode(customGameMode);
```

### Custom Weather Types

```typescript
// Define custom weather type
const volcanicWeather: WeatherType = "Volcanic";

// Define effects for custom weather
const volcanicEffect: WeatherEffect = {
  Fire: 30,
  Ice: -20,
  Lightning: 10,
};

// Register custom weather
weatherManager.registerCustomWeather(volcanicWeather, volcanicEffect);

// Create compatibility rules
weatherManager.setWeatherCompatibility(volcanicWeather, ["Hot", "Stormy"]);
weatherManager.setWeatherIncompatibility(volcanicWeather, ["Cold", "Snowy"]);
```

## Performance Optimization

### Caching Strategies

```typescript
class OptimizedWeatherManager extends WeatherManager {
  private effectCache = new Map<string, Record<ElementType, number>>();
  private validationCache = new Map<string, boolean>();

  calculateElementalModifiers(): Record<ElementType, number> {
    const cacheKey = this.getCurrentWeather().sort().join(",");

    if (this.effectCache.has(cacheKey)) {
      return this.effectCache.get(cacheKey)!;
    }

    const modifiers = super.calculateElementalModifiers();
    this.effectCache.set(cacheKey, modifiers);

    return modifiers;
  }

  validateWeatherMix(weather: WeatherType[]): boolean {
    const cacheKey = weather.sort().join(",");

    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    const isValid = super.validateWeatherMix(weather);
    this.validationCache.set(cacheKey, isValid);

    return isValid;
  }

  clearCache(): void {
    this.effectCache.clear();
    this.validationCache.clear();
  }
}
```

### Batch Operations

```typescript
class BatchWeatherOperations {
  private weatherManager: WeatherManager;
  private pendingOperations: WeatherOperation[] = [];

  queueWeatherChange(weather: WeatherType[]) {
    this.pendingOperations.push({
      type: "weatherChange",
      data: weather,
    });
  }

  queueCardPlay(card: WeatherCard) {
    this.pendingOperations.push({
      type: "cardPlay",
      data: card,
    });
  }

  processBatch(): void {
    // Process all operations in a single batch
    for (const operation of this.pendingOperations) {
      switch (operation.type) {
        case "weatherChange":
          this.weatherManager.applyWeather(operation.data);
          break;
        case "cardPlay":
          this.cardManager.playCard(
            operation.data,
            this.weatherManager.getCurrentWeather()
          );
          break;
      }
    }

    this.pendingOperations = [];
  }
}
```

## Best Practices

### 1. Error Handling

```typescript
class SafeWeatherManager {
  private weatherManager: WeatherManager;

  async safeWeatherChange(weather: WeatherType[]): Promise<boolean> {
    try {
      // Validate before applying
      if (!this.weatherManager.validateWeatherMix(weather)) {
        console.warn("Invalid weather combination attempted:", weather);
        return false;
      }

      this.weatherManager.applyWeather(weather);
      return true;
    } catch (error) {
      console.error("Weather change failed:", error);

      // Attempt recovery
      this.weatherManager.resetWeather();
      return false;
    }
  }
}
```

### 2. State Management

```typescript
class WeatherStateManager {
  private weatherManager: WeatherManager;
  private stateHistory: WeatherState[] = [];

  saveState(): void {
    const currentState = this.weatherManager.getWeatherState();
    this.stateHistory.push({ ...currentState });

    // Keep only last 10 states
    if (this.stateHistory.length > 10) {
      this.stateHistory.shift();
    }
  }

  restoreState(stepsBack: number = 1): boolean {
    const targetIndex = this.stateHistory.length - stepsBack - 1;

    if (targetIndex >= 0 && targetIndex < this.stateHistory.length) {
      const targetState = this.stateHistory[targetIndex];
      this.weatherManager.restoreState(targetState);
      return true;
    }

    return false;
  }
}
```

### 3. Configuration Management

```typescript
class ConfigurationManager {
  private config: WeatherConfig;
  private configWatcher: FileWatcher;

  async initialize() {
    // Load initial configuration
    this.config = await this.loadConfig();

    // Watch for configuration changes in development
    if (process.env.NODE_ENV === "development") {
      this.configWatcher = new FileWatcher("./weather-config.json");
      this.configWatcher.on("change", () => this.reloadConfig());
    }
  }

  private async reloadConfig() {
    try {
      const newConfig = await this.loadConfig();
      this.validateConfig(newConfig);
      this.config = newConfig;

      // Notify systems of config change
      this.emit("configReloaded", newConfig);
    } catch (error) {
      console.error("Failed to reload configuration:", error);
    }
  }
}
```

### 4. Testing Integration

```typescript
// Test utilities for integration testing
export class WeatherTestUtils {
  static createMockWeatherManager(): WeatherManager {
    const manager = new WeatherManager();
    // Set up test configuration
    manager.loadConfig("./test-weather-config.json");
    return manager;
  }

  static createTestGameState(): GameState {
    return {
      currentTurn: 1,
      currentMonth: 1,
      weatherState: {
        currentWeather: ["Sunny"],
        turn: 1,
        month: 1,
        season: "Spring",
        activeCards: [],
      },
      playerStates: [],
      gameMode: "12-Month Campaign",
      turnHistory: [],
    };
  }

  static simulateGameTurns(
    manager: WeatherManager,
    turns: number
  ): WeatherType[][] {
    const weatherHistory: WeatherType[][] = [];

    for (let i = 1; i <= turns; i++) {
      const weather = manager.processWeatherForTurn(i);
      weatherHistory.push([...weather]);
    }

    return weatherHistory;
  }
}
```

This integration guide provides comprehensive examples for integrating the weather engine into your game. Start with the basic integration and gradually add more advanced features as needed.
