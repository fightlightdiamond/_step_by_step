# Weather Engine Extensions

The Weather Engine Extensions system provides a powerful plugin architecture that allows developers to extend the weather engine with custom weather types, game modes, and weather cards.

## Table of Contents

- [Overview](#overview)
- [Plugin System](#plugin-system)
- [Extension Points](#extension-points)
- [Creating Plugins](#creating-plugins)
- [Examples](#examples)
- [API Reference](#api-reference)

## Overview

The extension system is built around three main concepts:

1. **Plugins**: Self-contained modules that extend the weather engine
2. **Extension Points**: Specific areas where plugins can add functionality
3. **Plugin Registry**: Central system for managing plugin lifecycle

### Key Features

- **Custom Weather Types**: Add new weather conditions with unique effects
- **Custom Game Modes**: Create new gameplay mechanics and rules
- **Custom Weather Cards**: Design special cards with unique abilities
- **Event System**: React to weather changes and game events
- **Hot-swappable**: Activate and deactivate plugins at runtime
- **Type-safe**: Full TypeScript support with comprehensive type definitions

## Plugin System

### Basic Plugin Structure

```typescript
import { WeatherEnginePlugin, PluginContext } from "./plugin-system";

export class MyPlugin implements WeatherEnginePlugin {
  public readonly name = "my-plugin";
  public readonly version = "1.0.0";
  public readonly description = "My custom weather plugin";
  public readonly author = "Your Name";

  // Plugin lifecycle hooks
  public async initialize(context: PluginContext): Promise<void> {
    console.log("Plugin initializing...");
  }

  public async activate(context: PluginContext): Promise<void> {
    console.log("Plugin activated!");
  }

  public async deactivate(context: PluginContext): Promise<void> {
    console.log("Plugin deactivated");
  }

  // Event handlers
  public onWeatherChange(
    oldWeather: WeatherType[],
    newWeather: WeatherType[]
  ): void {
    console.log(`Weather changed from ${oldWeather} to ${newWeather}`);
  }
}
```

### Plugin Registration and Loading

```typescript
import { pluginLoader } from "./plugin-loader";

// Register a plugin instance
const myPlugin = new MyPlugin();
pluginLoader.registerPlugin(myPlugin);

// Load from factory function
pluginLoader.loadPlugin(() => new MyPlugin());

// Activate plugin
await pluginLoader.activatePlugin("my-plugin");

// Load all configured plugins
await pluginLoader.loadAllPlugins();
```

## Extension Points

### Custom Weather Types

Add new weather conditions with custom effects and behaviors:

```typescript
export const weatherTypes: CustomWeatherTypeDefinition[] = [
  {
    name: "Blizzard",
    displayName: "Blizzard",
    description: "A severe snowstorm with high winds",
    effects: {
      Fire: -30,
      Ice: 25,
      Lightning: -15,
    },
    compatibleWith: ["Cold", "Snowy", "Windy"],
    oppositeOf: ["Hot", "Sunny"],
    icon: "❄️",
    color: "#E0E6FF",

    // Custom validation logic
    validate: (weather: WeatherType[]) => {
      return !weather.includes("Hot");
    },

    // Dynamic effect calculation
    calculateEffects: (baseEffects, context) => {
      const multiplier = context.turn > 5 ? 1.5 : 1.0;
      return {
        Fire: Math.round(baseEffects.Fire * multiplier),
        Ice: Math.round(baseEffects.Ice * multiplier),
        Lightning: baseEffects.Lightning,
      };
    },
  },
];
```

### Custom Game Modes

Create new gameplay mechanics and rules:

```typescript
export const gameModes: CustomGameModeDefinition[] = [
  {
    name: "WeatherRoulette",
    displayName: "Weather Roulette",
    description: "Random weather changes every turn",
    rules: {
      weatherChangeFrequency: 1,
      allowPlayerWeatherControl: false,
      allowWeatherMixing: true,
      maxWeatherTypes: 3,
      weatherSource: "custom",
    },

    onStart: (context: GameModeContext) => {
      console.log("Weather Roulette started!");
      context.gameState.rouletteWheel = initializeRoulette();
    },

    generateWeather: (turn: number, context: GameModeContext) => {
      return spinRoulette(context.gameState.rouletteWheel);
    },

    validateAction: (action: any, context: GameModeContext) => {
      // Custom validation logic
      return action.type !== "changeWeather";
    },
  },
];
```

### Custom Weather Cards

Design special cards with unique abilities:

```typescript
export const weatherCards: CustomWeatherCardDefinition[] = [
  {
    id: "lightning-storm",
    name: "Lightning Storm",
    description: "Summon a powerful electrical storm",
    type: "Weather",
    weather: "Stormy",
    cost: 4,
    rarity: "epic",
    duration: 3,
    artwork: "⚡",
    flavorText: "The sky crackles with raw power",

    canPlay: (context: CardPlayContext) => {
      // Can only play if no other storm is active
      return !context.currentWeather.includes("Stormy");
    },

    onPlay: (context: CardPlayContext) => {
      console.log("Lightning Storm unleashed!");
      // Custom card effects
    },

    onExpire: (context: CardPlayContext) => {
      console.log("The storm subsides...");
    },
  },
];
```

## Creating Plugins

### Step 1: Define Your Plugin

Create a new TypeScript file for your plugin:

```typescript
// my-weather-plugin.ts
import {
  WeatherEnginePlugin,
  PluginContext,
  CustomWeatherTypeDefinition,
} from "../plugin-system";

export class MyWeatherPlugin implements WeatherEnginePlugin {
  public readonly name = "my-weather-plugin";
  public readonly version = "1.0.0";
  public readonly description = "Adds custom weather effects";

  public readonly weatherTypes: CustomWeatherTypeDefinition[] = [
    // Your custom weather types here
  ];

  public async activate(context: PluginContext): Promise<void> {
    // Plugin activation logic
  }
}

export function createMyWeatherPlugin(): MyWeatherPlugin {
  return new MyWeatherPlugin();
}
```

### Step 2: Register Your Plugin

```typescript
import { pluginLoader } from "../plugin-loader";
import { createMyWeatherPlugin } from "./my-weather-plugin";

// Register the plugin
pluginLoader.loadPlugin(createMyWeatherPlugin);

// Or register with configuration
pluginLoader.loadPluginConfig([
  {
    name: "my-weather-plugin",
    enabled: true,
    autoActivate: true,
    config: {
      customSetting: "value",
    },
  },
]);
```

### Step 3: Use Extension Points

Access your custom extensions through the extension manager:

```typescript
import { extensionManager } from "../extension-points";

// Check if custom weather type is available
const isValid =
  extensionManager.weatherTypes.isValidWeatherType("MyCustomWeather");

// Get effects for custom weather
const effects = extensionManager.weatherTypes.getWeatherEffects(
  "MyCustomWeather",
  context
);

// Execute custom game mode logic
extensionManager.gameModes.executeGameModeHook(
  "MyCustomMode",
  "onStart",
  context
);
```

## Examples

The extension system includes several example plugins to demonstrate different capabilities:

### Volcanic Weather Plugin

Adds volcanic weather types like Ash Storm, Lava Rain, and Volcanic Winter:

```typescript
import { createVolcanicWeatherPlugin } from "./examples/volcanic-weather-plugin";
import { pluginLoader } from "./plugin-loader";

pluginLoader.loadPlugin(createVolcanicWeatherPlugin);
await pluginLoader.activatePlugin("volcanic-weather");
```

### Time Manipulation Plugin

Adds time-based game modes and weather manipulation cards:

```typescript
import { createTimeManipulationPlugin } from "./examples/time-manipulation-plugin";
import { pluginLoader } from "./plugin-loader";

pluginLoader.loadPlugin(createTimeManipulationPlugin);
await pluginLoader.activatePlugin("time-manipulation");
```

## API Reference

### Core Interfaces

#### WeatherEnginePlugin

The main plugin interface that all plugins must implement:

```typescript
interface WeatherEnginePlugin {
  name: string;
  version: string;
  description: string;
  author?: string;

  // Lifecycle hooks
  initialize?(context: PluginContext): Promise<void> | void;
  activate?(context: PluginContext): Promise<void> | void;
  deactivate?(context: PluginContext): Promise<void> | void;

  // Extensions
  weatherTypes?: CustomWeatherTypeDefinition[];
  gameModes?: CustomGameModeDefinition[];
  weatherCards?: CustomWeatherCardDefinition[];

  // Event handlers
  onWeatherChange?(oldWeather: WeatherType[], newWeather: WeatherType[]): void;
  onGameModeChange?(oldMode: string, newMode: string): void;
  onCardPlayed?(card: WeatherCard): void;
}
```

#### PluginContext

Context object provided to plugins during lifecycle events:

```typescript
interface PluginContext {
  registerWeatherType(definition: CustomWeatherTypeDefinition): void;
  registerGameMode(definition: CustomGameModeDefinition): void;
  registerWeatherCard(definition: CustomWeatherCardDefinition): void;

  getWeatherManager(): any;
  getConfigManager(): any;

  emit(event: string, ...args: any[]): void;
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
}
```

### Extension Definitions

#### CustomWeatherTypeDefinition

```typescript
interface CustomWeatherTypeDefinition {
  name: string;
  displayName: string;
  description: string;
  effects: WeatherEffect;
  compatibleWith: string[];
  oppositeOf?: string[];
  icon?: string;
  color?: string;

  validate?(weather: WeatherType[]): boolean;
  calculateEffects?(
    baseEffects: WeatherEffect,
    context: EffectContext
  ): WeatherEffect;
}
```

#### CustomGameModeDefinition

```typescript
interface CustomGameModeDefinition {
  name: string;
  displayName: string;
  description: string;
  rules: CustomGameModeRules;

  onStart?(context: GameModeContext): void;
  onTurnStart?(turn: number, context: GameModeContext): void;
  onTurnEnd?(turn: number, context: GameModeContext): void;
  onEnd?(context: GameModeContext): void;

  generateWeather?(turn: number, context: GameModeContext): WeatherType[];
  validateAction?(action: any, context: GameModeContext): boolean;
}
```

#### CustomWeatherCardDefinition

```typescript
interface CustomWeatherCardDefinition {
  id: string;
  name: string;
  description: string;
  type: string;
  cost?: number;
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";

  weather?: WeatherType;
  effects?: Partial<Record<ElementType, number>>;
  duration?: number;

  canPlay?(context: CardPlayContext): boolean;
  onPlay?(context: CardPlayContext): void;
  onExpire?(context: CardPlayContext): void;

  artwork?: string;
  flavorText?: string;
}
```

### Plugin Management

#### PluginRegistry

Central registry for managing plugins:

```typescript
class PluginRegistry {
  registerPlugin(plugin: WeatherEnginePlugin): void;
  activatePlugin(pluginName: string): Promise<void>;
  deactivatePlugin(pluginName: string): Promise<void>;

  getPlugins(): WeatherEnginePlugin[];
  getActivePlugins(): WeatherEnginePlugin[];

  getCustomWeatherTypes(): CustomWeatherTypeDefinition[];
  getCustomGameModes(): CustomGameModeDefinition[];
  getCustomWeatherCards(): CustomWeatherCardDefinition[];

  emit(event: string, ...args: any[]): void;
}
```

#### PluginLoader

High-level plugin management:

```typescript
class PluginLoader {
  loadPluginConfig(configs: PluginLoadConfig[]): void;
  registerPlugin(plugin: WeatherEnginePlugin): void;
  loadPlugin(pluginFactory: () => WeatherEnginePlugin): void;

  activatePlugin(pluginName: string): Promise<void>;
  deactivatePlugin(pluginName: string): Promise<void>;
  loadAllPlugins(): Promise<void>;

  getPluginStatus(): PluginStatus[];
  getExtensionStats(): ExtensionStats;

  initialize(): void;
  shutdown(): Promise<void>;
}
```

### Extension Points

#### ExtensionManager

Main interface for accessing extended functionality:

```typescript
class ExtensionManager {
  readonly weatherTypes: WeatherTypeExtensions;
  readonly gameModes: GameModeExtensions;
  readonly weatherCards: WeatherCardExtensions;

  initialize(): void;
  getExtensionStats(): ExtensionStats;
}
```

## Best Practices

### Plugin Development

1. **Follow naming conventions**: Use kebab-case for plugin names
2. **Provide comprehensive metadata**: Include version, description, and author
3. **Handle errors gracefully**: Don't let plugin errors crash the main system
4. **Use semantic versioning**: Follow semver for plugin versions
5. **Document your extensions**: Provide clear descriptions for custom types

### Performance Considerations

1. **Lazy initialization**: Only initialize resources when needed
2. **Efficient event handlers**: Keep event handlers lightweight
3. **Memory management**: Clean up resources in deactivate hooks
4. **Avoid blocking operations**: Use async/await for heavy operations

### Testing

1. **Unit test your plugins**: Test individual plugin functionality
2. **Integration testing**: Test plugin interactions with the main system
3. **Mock dependencies**: Use mocks for external dependencies
4. **Test error scenarios**: Ensure graceful error handling

## Troubleshooting

### Common Issues

1. **Plugin not loading**: Check plugin name and configuration
2. **Extension not working**: Verify plugin is activated
3. **Type errors**: Ensure proper TypeScript types are used
4. **Event handlers not called**: Check event names and registration

### Debugging

1. **Enable debug logging**: Use console.log for debugging
2. **Check plugin status**: Use `getPluginStatus()` to verify state
3. **Inspect extension stats**: Use `getExtensionStats()` for overview
4. **Test in isolation**: Test plugins independently first

For more examples and advanced usage, see the example plugins in the `examples/` directory.
