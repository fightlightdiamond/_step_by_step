# Weather Engine Examples

This directory contains comprehensive examples and demonstrations of the Weather Engine functionality. These examples serve as both learning resources and practical implementations you can use as starting points for your own projects.

## 📁 Example Files

### 🎮 [sample-game.ts](./sample-game.ts)

A complete turn-based game implementation showcasing:

- Full weather system integration
- AI player behavior with weather considerations
- Combat system with weather-modified damage
- Weather card gameplay mechanics
- 12-month campaign progression

**Key Features:**

- 3-player AI game simulation
- Weather-based damage calculations
- Strategic weather card usage
- Seasonal weather progression
- Complete game statistics

### 🎯 [interactive-demo.ts](./interactive-demo.ts)

An interactive demonstration system for exploring weather effects:

- Real-time weather effect calculations
- Weather compatibility testing
- Seasonal weather pattern exploration
- Weather card system demonstration
- Game mode comparisons

**Key Features:**

- Command-line interface simulation
- Weather effect visualization
- Compatibility matrix exploration
- Performance comparison tools
- Educational demonstrations

### 🎲 [custom-game-modes.ts](./custom-game-modes.ts)

Examples of custom game modes with unique weather mechanics:

- **Elemental Mastery**: Enhanced effects and strategic combinations
- **Chaos Storm**: Unpredictable weather with maximum chaos
- **Seasonal Conquest**: Season-locked weather patterns
- **Weather Duel**: Fast-paced 1v1 weather battles
- **Eternal Weather**: Long-term strategic gameplay

**Key Features:**

- Custom weather rules implementation
- Special mechanics and bonuses
- Extended game mode manager
- Unique gameplay experiences

### 🔧 [extension-tutorial.ts](./extension-tutorial.ts)

Comprehensive tutorial for extending the weather system:

- Creating custom weather types
- Implementing dynamic weather effects
- Building custom weather cards
- Advanced game mechanics
- Custom game mode creation

**Key Features:**

- Step-by-step tutorials
- Code examples and explanations
- Best practices guidance
- Advanced customization techniques

## 🚀 Quick Start

### Run All Examples

```bash
# Install dependencies
npm install

# Run all examples in sequence
npm run examples

# Or run individual examples
npm run example:sample-game
npm run example:interactive-demo
npm run example:custom-modes
npm run example:tutorial
```

### Basic Usage

```typescript
import { runSampleGame } from "./examples/sample-game";
import { runInteractiveDemo } from "./examples/interactive-demo";

// Run a complete game simulation
await runSampleGame();

// Explore weather effects interactively
await runInteractiveDemo();
```

## 📚 Learning Path

### 1. Start with the Sample Game

Begin with `sample-game.ts` to see a complete implementation:

```typescript
import { WeatherBasedGame } from "./examples/sample-game";

const game = new WeatherBasedGame();
await game.initialize(["Player1", "Player2"], "12-Month Campaign");
const winner = await game.playGame();
```

### 2. Explore Weather Effects

Use the interactive demo to understand weather mechanics:

```typescript
import { InteractiveWeatherDemo } from "./examples/interactive-demo";

const demo = new InteractiveWeatherDemo();
await demo.initialize();

// Try different weather combinations
demo.applyWeather(["Sunny", "Hot"]);
demo.demonstrateSeasonalWeather();
demo.compareWeatherEffects([["Sunny"], ["Hot"], ["Sunny", "Hot"]]);
```

### 3. Experiment with Custom Game Modes

Try the custom game modes to see advanced features:

```typescript
import { CustomGameModeManager } from "./examples/custom-game-modes";

const manager = new CustomGameModeManager();
manager.setGameMode("Elemental Mastery");
manager.demonstrateCustomModes();
```

### 4. Learn to Extend the System

Follow the extension tutorial to create your own content:

```typescript
import { runExtensionTutorial } from "./examples/extension-tutorial";

// Complete step-by-step tutorial
await runExtensionTutorial();
```

## 🎯 Example Scenarios

### Scenario 1: Basic Weather Integration

Perfect for learning the fundamentals:

```typescript
import { WeatherManager, SeasonManager } from "../index";

const weatherManager = new WeatherManager();
const seasonManager = new SeasonManager();

await weatherManager.loadConfig();

// Apply seasonal weather
const month = 6; // June
const weather = seasonManager.getWeatherForMonth(month);
weatherManager.applyWeather([weather]);

// Calculate damage with weather effects
const modifiers = weatherManager.calculateElementalModifiers();
const baseDamage = 100;
const fireDamage = baseDamage * (1 + modifiers.Fire / 100);
```

### Scenario 2: Weather Card System

Learn to implement weather cards:

```typescript
import { WeatherCardManager, WeatherCard } from "../index";

const cardManager = new WeatherCardManager();

const sunnyCard: WeatherCard = {
  id: "sunny-1",
  type: "Weather",
  name: "Sunny Day",
  description: "Changes weather to sunny",
  weather: "Sunny",
  cost: 2,
};

// Play the card
const currentWeather = weatherManager.getCurrentWeather();
if (cardManager.validateCardPlay(sunnyCard, currentWeather)) {
  const newWeather = cardManager.playCard(sunnyCard, currentWeather);
  weatherManager.applyWeather(newWeather);
}
```

### Scenario 3: Custom Game Mode

Create your own game mode:

```typescript
import { GameMode, GameModeManager } from "../index";

const customMode: GameMode = {
  name: "My Custom Mode",
  description: "A unique weather experience",
  weatherRules: {
    weatherChangeFrequency: 2,
    allowPlayerWeatherControl: true,
    allowWeatherMixing: true,
    maxWeatherTypes: 3,
    weatherSource: "seasonal",
  },
  turnLimit: 15,
  specialRules: [
    {
      name: "Custom Mechanic",
      description: "Special weather interactions",
      effect: "customBonus: 25",
    },
  ],
};

const gameModeManager = new GameModeManager();
gameModeManager.registerGameMode(customMode);
gameModeManager.setGameMode("My Custom Mode");
```

## 🔧 Configuration Examples

### Balanced Configuration

```json
{
  "weatherEffects": {
    "Sunny": { "Fire": 15, "Ice": -10, "Lightning": -5 },
    "Rainy": { "Fire": -15, "Ice": 5, "Lightning": 10 },
    "Stormy": { "Fire": -10, "Ice": 0, "Lightning": 20 }
  },
  "seasonalPools": {
    "Summer": {
      "weights": {
        "Sunny": 0.4,
        "Hot": 0.3,
        "Warm": 0.2,
        "Humid": 0.1
      }
    }
  }
}
```

### Extreme Configuration

```json
{
  "weatherEffects": {
    "Sunny": { "Fire": 30, "Ice": -20, "Lightning": -10 },
    "Stormy": { "Fire": -25, "Ice": 0, "Lightning": 40 }
  },
  "limits": {
    "weatherEffects": { "min": -50, "max": 50 },
    "maxWeatherTypes": 5
  }
}
```

## 🎮 Game Integration Examples

### React Component Integration

```typescript
import React, { useEffect, useState } from "react";
import { WeatherManager } from "../index";

const WeatherGameComponent = () => {
  const [weatherManager] = useState(() => new WeatherManager());
  const [currentWeather, setCurrentWeather] = useState([]);
  const [modifiers, setModifiers] = useState({});

  useEffect(() => {
    const initializeWeather = async () => {
      await weatherManager.loadConfig();
      weatherManager.applyWeather(["Sunny"]);

      setCurrentWeather(weatherManager.getCurrentWeather());
      setModifiers(weatherManager.calculateElementalModifiers());
    };

    initializeWeather();

    const handleWeatherChange = () => {
      setCurrentWeather(weatherManager.getCurrentWeather());
      setModifiers(weatherManager.calculateElementalModifiers());
    };

    weatherManager.on("weatherChanged", handleWeatherChange);
    return () => weatherManager.off("weatherChanged", handleWeatherChange);
  }, [weatherManager]);

  return (
    <div>
      <h3>Current Weather: {currentWeather.join(", ")}</h3>
      <div>Fire: {modifiers.Fire}%</div>
      <div>Ice: {modifiers.Ice}%</div>
      <div>Lightning: {modifiers.Lightning}%</div>
    </div>
  );
};
```

### Game Loop Integration

```typescript
class GameEngine {
  private weatherManager: WeatherManager;
  private currentTurn: number = 1;

  async processTurn() {
    // Update weather based on turn
    if (this.currentTurn % 2 === 1) {
      // Every other turn
      const newWeather = this.determineWeatherForTurn(this.currentTurn);
      this.weatherManager.applyWeather(newWeather);
    }

    // Process player actions with weather effects
    await this.processPlayerActions();

    // Advance turn
    this.currentTurn++;
  }

  private calculateDamageWithWeather(
    baseDamage: number,
    element: ElementType
  ): number {
    const modifiers = this.weatherManager.calculateElementalModifiers();
    const weatherModifier = modifiers[element] || 0;
    return Math.round(baseDamage * (1 + weatherModifier / 100));
  }
}
```

## 🧪 Testing Examples

### Unit Testing

```typescript
import { WeatherManager } from "../index";

describe("Weather System", () => {
  let weatherManager: WeatherManager;

  beforeEach(async () => {
    weatherManager = new WeatherManager();
    await weatherManager.loadConfig();
  });

  test("should apply weather effects correctly", () => {
    weatherManager.applyWeather(["Sunny"]);
    const modifiers = weatherManager.calculateElementalModifiers();

    expect(modifiers.Fire).toBeGreaterThan(0);
    expect(modifiers.Ice).toBeLessThan(0);
  });

  test("should validate weather combinations", () => {
    expect(weatherManager.validateWeatherMix(["Hot", "Cold"])).toBe(false);
    expect(weatherManager.validateWeatherMix(["Sunny", "Hot"])).toBe(true);
  });
});
```

### Integration Testing

```typescript
import { WeatherTestUtils } from "../testing";

describe("Weather Game Integration", () => {
  test("should simulate complete game", async () => {
    const weatherManager = WeatherTestUtils.createMockWeatherManager();
    const gameState = WeatherTestUtils.createTestGameState();

    const weatherHistory = WeatherTestUtils.simulateGameTurns(
      weatherManager,
      12
    );

    expect(weatherHistory).toHaveLength(12);
    expect(weatherHistory.every((weather) => weather.length > 0)).toBe(true);
  });
});
```

## 📊 Performance Examples

### Optimization Techniques

```typescript
// Enable caching for better performance
weatherManager.enableCaching({
  maxCacheSize: 1000,
  enableEffectCache: true,
  enableValidationCache: true,
});

// Use batch operations for multiple weather changes
const weatherOperations = [["Sunny"], ["Hot"], ["Windy"]];
weatherManager.processBatch(weatherOperations);

// Monitor performance
const performanceMetrics = weatherManager.getPerformanceMetrics();
console.log(
  "Average calculation time:",
  performanceMetrics.averageCalculationTime
);
```

### Memory Management

```typescript
// Enable automatic cleanup
weatherManager.enableMemoryManagement({
  maxHistorySize: 50,
  pruneInterval: 1000,
  enableGarbageCollection: true,
});

// Manual cleanup when needed
weatherManager.clearHistory();
weatherManager.clearCache();
```

## 🎨 Visual Integration Examples

### Weather Effect Animations

```typescript
// Trigger visual effects based on weather changes
weatherManager.on("weatherChanged", (oldWeather, newWeather) => {
  // Play transition animation
  playWeatherTransition(oldWeather, newWeather);

  // Update background effects
  updateBackgroundEffects(newWeather);

  // Show weather change notification
  showWeatherNotification(newWeather);
});

function playWeatherTransition(from: WeatherType[], to: WeatherType[]) {
  // Implementation for weather transition effects
  const transitionType = determineTransitionType(from, to);
  animationEngine.playTransition(transitionType);
}
```

### UI Component Examples

```typescript
// Weather status display
const WeatherStatusDisplay = ({ weatherManager }) => {
  const [weather, setWeather] = useState([]);
  const [effects, setEffects] = useState({});

  useEffect(() => {
    const updateDisplay = () => {
      setWeather(weatherManager.getCurrentWeather());
      setEffects(weatherManager.calculateElementalModifiers());
    };

    weatherManager.on("weatherChanged", updateDisplay);
    updateDisplay();

    return () => weatherManager.off("weatherChanged", updateDisplay);
  }, [weatherManager]);

  return (
    <div className="weather-status">
      {weather.map((w) => (
        <WeatherIcon key={w} type={w} />
      ))}
      <ElementalEffects effects={effects} />
    </div>
  );
};
```

## 🔗 Related Resources

- [API Documentation](../docs/API.md) - Complete API reference
- [Integration Guide](../docs/INTEGRATION_GUIDE.md) - Detailed integration instructions
- [Configuration Reference](../docs/CONFIGURATION.md) - Configuration options
- [Troubleshooting Guide](../docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🤝 Contributing

To add new examples:

1. Create your example file in this directory
2. Follow the existing naming convention
3. Include comprehensive comments and documentation
4. Add your example to the index.ts exports
5. Update this README with your example description

## 📝 License

These examples are provided under the same license as the Weather Engine project.
