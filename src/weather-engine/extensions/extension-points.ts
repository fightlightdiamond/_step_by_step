/**
 * Extension points for integrating plugins with the weather engine
 */

import {
  WeatherType,
  ElementType,
  WeatherEffect,
  WeatherCard,
  GameMode,
} from "../types";
import {
  CustomWeatherTypeDefinition,
  CustomGameModeDefinition,
  CustomWeatherCardDefinition,
  EffectContext,
  GameModeContext,
  CardPlayContext,
  pluginRegistry,
} from "./plugin-system";

/**
 * Extended weather type that includes custom types from plugins
 */
export type ExtendedWeatherType = WeatherType | string;

/**
 * Weather type extension manager
 */
export class WeatherTypeExtensions {
  private static instance: WeatherTypeExtensions;

  private constructor() {}

  public static getInstance(): WeatherTypeExtensions {
    if (!WeatherTypeExtensions.instance) {
      WeatherTypeExtensions.instance = new WeatherTypeExtensions();
    }
    return WeatherTypeExtensions.instance;
  }

  /**
   * Get all available weather types (built-in + custom)
   */
  public getAllWeatherTypes(): string[] {
    const builtInTypes: WeatherType[] = [
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

    const customTypes = pluginRegistry
      .getCustomWeatherTypes()
      .map((def) => def.name);

    return [...builtInTypes, ...customTypes];
  }

  /**
   * Check if a weather type is valid (built-in or custom)
   */
  public isValidWeatherType(weatherType: string): boolean {
    return this.getAllWeatherTypes().includes(weatherType);
  }

  /**
   * Get weather effects for a weather type (including custom types)
   */
  public getWeatherEffects(
    weatherType: string,
    context?: EffectContext
  ): WeatherEffect {
    // Check if it's a custom weather type
    const customType = pluginRegistry
      .getCustomWeatherTypes()
      .find((def) => def.name === weatherType);
    if (customType) {
      let effects = customType.effects;

      // Apply custom effect calculation if provided
      if (customType.calculateEffects && context) {
        effects = customType.calculateEffects(effects, context);
      }

      return effects;
    }

    // Return default effects for built-in types
    // This would normally come from the configuration
    return { Fire: 0, Ice: 0, Lightning: 0 };
  }

  /**
   * Get compatible weather types for a given weather type
   */
  public getCompatibleWeatherTypes(weatherType: string): string[] {
    const customType = pluginRegistry
      .getCustomWeatherTypes()
      .find((def) => def.name === weatherType);
    if (customType) {
      return customType.compatibleWith;
    }

    // Return default compatibility for built-in types
    return [];
  }

  /**
   * Get opposite weather types for a given weather type
   */
  public getOppositeWeatherTypes(weatherType: string): string[] {
    const customType = pluginRegistry
      .getCustomWeatherTypes()
      .find((def) => def.name === weatherType);
    if (customType && customType.oppositeOf) {
      return customType.oppositeOf;
    }

    // Return default opposites for built-in types
    return [];
  }

  /**
   * Validate weather combination including custom validation logic
   */
  public validateWeatherCombination(weather: string[]): boolean {
    // Check each custom weather type's validation logic
    for (const weatherType of weather) {
      const customType = pluginRegistry
        .getCustomWeatherTypes()
        .find((def) => def.name === weatherType);
      if (customType && customType.validate) {
        if (!customType.validate(weather as WeatherType[])) {
          return false;
        }
      }
    }

    return true;
  }
}

/**
 * Game mode extension manager
 */
export class GameModeExtensions {
  private static instance: GameModeExtensions;

  private constructor() {}

  public static getInstance(): GameModeExtensions {
    if (!GameModeExtensions.instance) {
      GameModeExtensions.instance = new GameModeExtensions();
    }
    return GameModeExtensions.instance;
  }

  /**
   * Get all available game modes (built-in + custom)
   */
  public getAllGameModes(): string[] {
    const builtInModes = [
      "12-Month Campaign",
      "Weather Chaos",
      "Seasonal Event",
      "Forecast Mode",
      "Weather Survival",
    ];

    const customModes = pluginRegistry
      .getCustomGameModes()
      .map((def) => def.name);

    return [...builtInModes, ...customModes];
  }

  /**
   * Check if a game mode is valid (built-in or custom)
   */
  public isValidGameMode(gameMode: string): boolean {
    return this.getAllGameModes().includes(gameMode);
  }

  /**
   * Get game mode definition
   */
  public getGameModeDefinition(
    gameMode: string
  ): CustomGameModeDefinition | null {
    return (
      pluginRegistry
        .getCustomGameModes()
        .find((def) => def.name === gameMode) || null
    );
  }

  /**
   * Execute game mode lifecycle hooks
   */
  public executeGameModeHook(
    gameMode: string,
    hook: "onStart" | "onTurnStart" | "onTurnEnd" | "onEnd",
    context: GameModeContext,
    turn?: number
  ): void {
    const definition = this.getGameModeDefinition(gameMode);
    if (!definition) return;

    try {
      switch (hook) {
        case "onStart":
          if (definition.onStart) {
            definition.onStart(context);
          }
          break;
        case "onTurnStart":
          if (definition.onTurnStart && turn !== undefined) {
            definition.onTurnStart(turn, context);
          }
          break;
        case "onTurnEnd":
          if (definition.onTurnEnd && turn !== undefined) {
            definition.onTurnEnd(turn, context);
          }
          break;
        case "onEnd":
          if (definition.onEnd) {
            definition.onEnd(context);
          }
          break;
      }
    } catch (error) {
      console.error(
        `Error executing ${hook} for game mode ${gameMode}:`,
        error
      );
    }
  }

  /**
   * Generate weather for custom game mode
   */
  public generateWeatherForGameMode(
    gameMode: string,
    turn: number,
    context: GameModeContext
  ): WeatherType[] | null {
    const definition = this.getGameModeDefinition(gameMode);
    if (!definition || !definition.generateWeather) {
      return null;
    }

    try {
      return definition.generateWeather(turn, context);
    } catch (error) {
      console.error(
        `Error generating weather for game mode ${gameMode}:`,
        error
      );
      return null;
    }
  }

  /**
   * Validate action for custom game mode
   */
  public validateActionForGameMode(
    gameMode: string,
    action: any,
    context: GameModeContext
  ): boolean {
    const definition = this.getGameModeDefinition(gameMode);
    if (!definition || !definition.validateAction) {
      return true; // Allow by default
    }

    try {
      return definition.validateAction(action, context);
    } catch (error) {
      console.error(
        `Error validating action for game mode ${gameMode}:`,
        error
      );
      return false;
    }
  }
}

/**
 * Weather card extension manager
 */
export class WeatherCardExtensions {
  private static instance: WeatherCardExtensions;

  private constructor() {}

  public static getInstance(): WeatherCardExtensions {
    if (!WeatherCardExtensions.instance) {
      WeatherCardExtensions.instance = new WeatherCardExtensions();
    }
    return WeatherCardExtensions.instance;
  }

  /**
   * Get all available weather cards (built-in + custom)
   */
  public getAllWeatherCards(): WeatherCard[] {
    const customCards = pluginRegistry.getCustomWeatherCards();

    // Convert custom card definitions to WeatherCard objects
    return customCards.map((def) => ({
      id: def.id,
      type: def.type as any,
      name: def.name,
      description: def.description,
      weather: def.weather,
      effect: def.effects,
      duration: def.duration,
      cost: def.cost,
    }));
  }

  /**
   * Get custom card definition
   */
  public getCustomCardDefinition(
    cardId: string
  ): CustomWeatherCardDefinition | null {
    return (
      pluginRegistry.getCustomWeatherCards().find((def) => def.id === cardId) ||
      null
    );
  }

  /**
   * Check if a card can be played
   */
  public canPlayCard(cardId: string, context: CardPlayContext): boolean {
    const definition = this.getCustomCardDefinition(cardId);
    if (!definition || !definition.canPlay) {
      return true; // Allow by default
    }

    try {
      return definition.canPlay(context);
    } catch (error) {
      console.error(`Error checking if card ${cardId} can be played:`, error);
      return false;
    }
  }

  /**
   * Execute card play logic
   */
  public executeCardPlay(cardId: string, context: CardPlayContext): void {
    const definition = this.getCustomCardDefinition(cardId);
    if (!definition || !definition.onPlay) {
      return;
    }

    try {
      definition.onPlay(context);
    } catch (error) {
      console.error(`Error executing play logic for card ${cardId}:`, error);
    }
  }

  /**
   * Execute card expiration logic
   */
  public executeCardExpiration(cardId: string, context: CardPlayContext): void {
    const definition = this.getCustomCardDefinition(cardId);
    if (!definition || !definition.onExpire) {
      return;
    }

    try {
      definition.onExpire(context);
    } catch (error) {
      console.error(
        `Error executing expiration logic for card ${cardId}:`,
        error
      );
    }
  }

  /**
   * Get cards by rarity
   */
  public getCardsByRarity(
    rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  ): WeatherCard[] {
    const customCards = pluginRegistry
      .getCustomWeatherCards()
      .filter((def) => def.rarity === rarity);

    return customCards.map((def) => ({
      id: def.id,
      type: def.type as any,
      name: def.name,
      description: def.description,
      weather: def.weather,
      effect: def.effects,
      duration: def.duration,
      cost: def.cost,
    }));
  }
}

/**
 * Main extension manager that coordinates all extension points
 */
export class ExtensionManager {
  private static instance: ExtensionManager;

  public readonly weatherTypes: WeatherTypeExtensions;
  public readonly gameModes: GameModeExtensions;
  public readonly weatherCards: WeatherCardExtensions;

  private constructor() {
    this.weatherTypes = WeatherTypeExtensions.getInstance();
    this.gameModes = GameModeExtensions.getInstance();
    this.weatherCards = WeatherCardExtensions.getInstance();
  }

  public static getInstance(): ExtensionManager {
    if (!ExtensionManager.instance) {
      ExtensionManager.instance = new ExtensionManager();
    }
    return ExtensionManager.instance;
  }

  /**
   * Initialize extension system
   */
  public initialize(): void {
    console.log("Extension system initialized");
  }

  /**
   * Get extension statistics
   */
  public getExtensionStats(): {
    customWeatherTypes: number;
    customGameModes: number;
    customWeatherCards: number;
    activePlugins: number;
  } {
    return {
      customWeatherTypes: pluginRegistry.getCustomWeatherTypes().length,
      customGameModes: pluginRegistry.getCustomGameModes().length,
      customWeatherCards: pluginRegistry.getCustomWeatherCards().length,
      activePlugins: pluginRegistry.getActivePlugins().length,
    };
  }
}

/**
 * Global extension manager instance
 */
export const extensionManager = ExtensionManager.getInstance();
