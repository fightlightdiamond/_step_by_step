/**
 * Plugin system for weather engine extensibility
 */

import {
  WeatherType,
  ElementType,
  WeatherEffect,
  WeatherCard,
  GameMode,
} from "../types";

/**
 * Plugin interface for weather engine extensions
 */
export interface WeatherEnginePlugin {
  name: string;
  version: string;
  description: string;
  author?: string;

  // Plugin lifecycle hooks
  initialize?(context: PluginContext): Promise<void> | void;
  activate?(context: PluginContext): Promise<void> | void;
  deactivate?(context: PluginContext): Promise<void> | void;

  // Extension points
  weatherTypes?: CustomWeatherTypeDefinition[];
  gameModes?: CustomGameModeDefinition[];
  weatherCards?: CustomWeatherCardDefinition[];

  // Event handlers
  onWeatherChange?(oldWeather: WeatherType[], newWeather: WeatherType[]): void;
  onGameModeChange?(oldMode: string, newMode: string): void;
  onCardPlayed?(card: WeatherCard): void;
}

/**
 * Plugin context provided to plugins
 */
export interface PluginContext {
  registerWeatherType(definition: CustomWeatherTypeDefinition): void;
  registerGameMode(definition: CustomGameModeDefinition): void;
  registerWeatherCard(definition: CustomWeatherCardDefinition): void;

  getWeatherManager(): any; // WeatherManager instance
  getConfigManager(): any; // WeatherConfigManager instance

  emit(event: string, ...args: any[]): void;
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
}

/**
 * Custom weather type definition
 */
export interface CustomWeatherTypeDefinition {
  name: string;
  displayName: string;
  description: string;
  effects: WeatherEffect;
  compatibleWith: string[];
  oppositeOf?: string[];
  icon?: string;
  color?: string;

  // Custom validation logic
  validate?(weather: WeatherType[]): boolean;

  // Custom effect calculation
  calculateEffects?(
    baseEffects: WeatherEffect,
    context: EffectContext
  ): WeatherEffect;
}

/**
 * Custom game mode definition
 */
export interface CustomGameModeDefinition {
  name: string;
  displayName: string;
  description: string;
  rules: CustomGameModeRules;

  // Game mode lifecycle
  onStart?(context: GameModeContext): void;
  onTurnStart?(turn: number, context: GameModeContext): void;
  onTurnEnd?(turn: number, context: GameModeContext): void;
  onEnd?(context: GameModeContext): void;

  // Weather generation
  generateWeather?(turn: number, context: GameModeContext): WeatherType[];

  // Validation
  validateAction?(action: any, context: GameModeContext): boolean;
}

/**
 * Custom weather card definition
 */
export interface CustomWeatherCardDefinition {
  id: string;
  name: string;
  description: string;
  type: string;
  cost?: number;
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";

  // Card effects
  weather?: WeatherType;
  effects?: Partial<Record<ElementType, number>>;
  duration?: number;

  // Custom logic
  canPlay?(context: CardPlayContext): boolean;
  onPlay?(context: CardPlayContext): void;
  onExpire?(context: CardPlayContext): void;

  // Visual
  artwork?: string;
  flavorText?: string;
}

/**
 * Effect calculation context
 */
export interface EffectContext {
  currentWeather: WeatherType[];
  activeCards: WeatherCard[];
  turn: number;
  gameMode: string;
}

/**
 * Game mode context
 */
export interface GameModeContext {
  currentTurn: number;
  maxTurns: number;
  weatherHistory: WeatherType[][];
  playerStates: any[];
  gameState: any;
}

/**
 * Card play context
 */
export interface CardPlayContext {
  card: WeatherCard;
  currentWeather: WeatherType[];
  playerId: string;
  turn: number;
  gameMode: string;
}

/**
 * Custom game mode rules
 */
export interface CustomGameModeRules {
  maxTurns?: number;
  weatherChangeFrequency: number;
  allowPlayerWeatherControl: boolean;
  allowWeatherMixing: boolean;
  maxWeatherTypes: number;
  weatherSource:
    | "seasonal"
    | "random"
    | "predetermined"
    | "player-controlled"
    | "custom";

  // Custom rules
  customRules?: Record<string, any>;
}

/**
 * Plugin registry for managing loaded plugins
 */
export class PluginRegistry {
  private plugins: Map<string, WeatherEnginePlugin> = new Map();
  private activePlugins: Set<string> = new Set();
  private eventHandlers: Map<string, Set<(...args: any[]) => void>> = new Map();

  // Extension registries
  private customWeatherTypes: Map<string, CustomWeatherTypeDefinition> =
    new Map();
  private customGameModes: Map<string, CustomGameModeDefinition> = new Map();
  private customWeatherCards: Map<string, CustomWeatherCardDefinition> =
    new Map();

  /**
   * Register a plugin
   */
  public registerPlugin(plugin: WeatherEnginePlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }

    this.plugins.set(plugin.name, plugin);
    console.log(`Plugin ${plugin.name} v${plugin.version} registered`);
  }

  /**
   * Activate a plugin
   */
  public async activatePlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    if (this.activePlugins.has(pluginName)) {
      console.warn(`Plugin ${pluginName} is already active`);
      return;
    }

    const context = this.createPluginContext();

    // Initialize plugin if needed
    if (plugin.initialize) {
      await plugin.initialize(context);
    }

    // Register extensions
    if (plugin.weatherTypes) {
      plugin.weatherTypes.forEach((def) => this.registerWeatherType(def));
    }
    if (plugin.gameModes) {
      plugin.gameModes.forEach((def) => this.registerGameMode(def));
    }
    if (plugin.weatherCards) {
      plugin.weatherCards.forEach((def) => this.registerWeatherCard(def));
    }

    // Activate plugin
    if (plugin.activate) {
      await plugin.activate(context);
    }

    this.activePlugins.add(pluginName);
    console.log(`Plugin ${pluginName} activated`);
  }

  /**
   * Deactivate a plugin
   */
  public async deactivatePlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    if (!this.activePlugins.has(pluginName)) {
      console.warn(`Plugin ${pluginName} is not active`);
      return;
    }

    const context = this.createPluginContext();

    // Deactivate plugin
    if (plugin.deactivate) {
      await plugin.deactivate(context);
    }

    // Unregister extensions
    if (plugin.weatherTypes) {
      plugin.weatherTypes.forEach((def) =>
        this.customWeatherTypes.delete(def.name)
      );
    }
    if (plugin.gameModes) {
      plugin.gameModes.forEach((def) => this.customGameModes.delete(def.name));
    }
    if (plugin.weatherCards) {
      plugin.weatherCards.forEach((def) =>
        this.customWeatherCards.delete(def.id)
      );
    }

    this.activePlugins.delete(pluginName);
    console.log(`Plugin ${pluginName} deactivated`);
  }

  /**
   * Get all registered plugins
   */
  public getPlugins(): WeatherEnginePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get active plugins
   */
  public getActivePlugins(): WeatherEnginePlugin[] {
    return Array.from(this.activePlugins)
      .map((name) => this.plugins.get(name))
      .filter((plugin) => plugin !== undefined) as WeatherEnginePlugin[];
  }

  /**
   * Get custom weather types
   */
  public getCustomWeatherTypes(): CustomWeatherTypeDefinition[] {
    return Array.from(this.customWeatherTypes.values());
  }

  /**
   * Get custom game modes
   */
  public getCustomGameModes(): CustomGameModeDefinition[] {
    return Array.from(this.customGameModes.values());
  }

  /**
   * Get custom weather cards
   */
  public getCustomWeatherCards(): CustomWeatherCardDefinition[] {
    return Array.from(this.customWeatherCards.values());
  }

  /**
   * Emit event to all active plugins
   */
  public emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }

    // Also call plugin-specific event handlers
    this.getActivePlugins().forEach((plugin) => {
      try {
        switch (event) {
          case "weatherChange":
            if (plugin.onWeatherChange) {
              plugin.onWeatherChange(args[0], args[1]);
            }
            break;
          case "gameModeChange":
            if (plugin.onGameModeChange) {
              plugin.onGameModeChange(args[0], args[1]);
            }
            break;
          case "cardPlayed":
            if (plugin.onCardPlayed) {
              plugin.onCardPlayed(args[0]);
            }
            break;
        }
      } catch (error) {
        console.error(
          `Error in plugin ${plugin.name} event handler for ${event}:`,
          error
        );
      }
    });
  }

  /**
   * Register weather type
   */
  private registerWeatherType(definition: CustomWeatherTypeDefinition): void {
    if (this.customWeatherTypes.has(definition.name)) {
      throw new Error(`Weather type ${definition.name} is already registered`);
    }
    this.customWeatherTypes.set(definition.name, definition);
  }

  /**
   * Register game mode
   */
  private registerGameMode(definition: CustomGameModeDefinition): void {
    if (this.customGameModes.has(definition.name)) {
      throw new Error(`Game mode ${definition.name} is already registered`);
    }
    this.customGameModes.set(definition.name, definition);
  }

  /**
   * Register weather card
   */
  private registerWeatherCard(definition: CustomWeatherCardDefinition): void {
    if (this.customWeatherCards.has(definition.id)) {
      throw new Error(`Weather card ${definition.id} is already registered`);
    }
    this.customWeatherCards.set(definition.id, definition);
  }

  /**
   * Create plugin context
   */
  private createPluginContext(): PluginContext {
    return {
      registerWeatherType: (def) => this.registerWeatherType(def),
      registerGameMode: (def) => this.registerGameMode(def),
      registerWeatherCard: (def) => this.registerWeatherCard(def),

      getWeatherManager: () => null, // Will be injected by the main system
      getConfigManager: () => null, // Will be injected by the main system

      emit: (event, ...args) => this.emit(event, ...args),
      on: (event, handler) => {
        if (!this.eventHandlers.has(event)) {
          this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)!.add(handler);
      },
      off: (event, handler) => {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
          handlers.delete(handler);
        }
      },
    };
  }
}

/**
 * Global plugin registry instance
 */
export const pluginRegistry = new PluginRegistry();
