/**
 * Game Mode Manager - Handles different game modes and their weather rules
 */

import {
  GameMode,
  WeatherRules,
  WeatherType,
  SeasonType,
  SpecialRule,
} from "../types";
import { WeatherManager } from "./weather-manager";
import { SeasonManager } from "./season-manager";
import { ALL_GAME_MODES, getGameModeByName } from "./game-modes";

/**
 * Game action types for validation
 */
export interface GameAction {
  type: "weather_change" | "card_play" | "turn_advance";
  data: any;
}

/**
 * Game state interface for mode management
 */
export interface GameState {
  currentTurn: number;
  currentMonth: number;
  gameMode: string;
  weatherHistory: WeatherType[][];
  predeterminedWeather?: WeatherType[][];
  forcedSeason?: SeasonType;
  weatherVisible?: boolean;
  weatherIntensity?: number;
  weatherStorm?: boolean;
  rapidWeatherChanges?: boolean;
  turnTimeLimit?: number;
  elementalMasteryTracking?: boolean;
}

/**
 * Manages different game modes and their weather behavior
 */
export class GameModeManager {
  private availableModes: Map<string, GameMode>;
  private currentMode: GameMode | null;
  private weatherManager: WeatherManager;
  private seasonManager: SeasonManager;

  constructor(weatherManager: WeatherManager, seasonManager: SeasonManager) {
    this.availableModes = new Map();
    this.currentMode = null;
    this.weatherManager = weatherManager;
    this.seasonManager = seasonManager;
    this.initializeDefaultModes();
  }

  /**
   * Initialize default game modes
   */
  private initializeDefaultModes(): void {
    // Register all predefined game modes
    for (const mode of ALL_GAME_MODES) {
      this.registerGameMode(mode);
    }

    // Set default mode to 12-month campaign
    this.setGameMode("12-month-campaign");
  }

  /**
   * Register a new game mode
   */
  public registerGameMode(mode: GameMode): void {
    this.availableModes.set(mode.name, mode);
  }

  /**
   * Set the current game mode
   */
  public setGameMode(modeName: string): void {
    const mode = this.availableModes.get(modeName);
    if (!mode) {
      throw new Error(`Game mode '${modeName}' not found`);
    }
    this.currentMode = mode;
  }

  /**
   * Get the current game mode
   */
  public getCurrentMode(): GameMode | null {
    return this.currentMode;
  }

  /**
   * Get all available game modes
   */
  public getAvailableModes(): GameMode[] {
    return Array.from(this.availableModes.values());
  }

  /**
   * Process weather for the current turn based on game mode rules
   */
  public processWeatherForTurn(gameState: GameState): WeatherType[] {
    if (!this.currentMode) {
      throw new Error("No game mode set");
    }

    const { weatherRules } = this.currentMode;
    const { currentTurn, currentMonth } = gameState;

    // Check if weather should change this turn
    if (currentTurn % weatherRules.weatherChangeFrequency !== 0) {
      return this.weatherManager.getCurrentWeather();
    }

    let newWeather: WeatherType[] = [];

    switch (weatherRules.weatherSource) {
      case "seasonal":
        // Check if this is a seasonal event mode with forced season
        if (gameState.forcedSeason) {
          newWeather = [
            this.seasonManager.getWeatherForSeason(gameState.forcedSeason),
          ];
        } else {
          newWeather = [this.seasonManager.getWeatherForMonth(currentMonth)];
        }
        break;

      case "random":
        newWeather = this.generateRandomWeather(weatherRules);
        break;

      case "predetermined":
        newWeather = this.getPredeterminedWeather(gameState);
        break;

      case "player-controlled":
        // Weather is controlled by player actions, return current weather
        newWeather = this.weatherManager.getCurrentWeather();
        break;

      default:
        throw new Error(
          `Unknown weather source: ${weatherRules.weatherSource}`
        );
    }

    // Apply weather mixing rules
    if (!weatherRules.allowWeatherMixing && newWeather.length > 1) {
      newWeather = [newWeather[0]];
    }

    // Limit number of weather types
    if (newWeather.length > weatherRules.maxWeatherTypes) {
      newWeather = newWeather.slice(0, weatherRules.maxWeatherTypes);
    }

    return newWeather;
  }

  /**
   * Validate if a game action is allowed under current mode rules
   */
  public validateModeRules(action: GameAction): boolean {
    if (!this.currentMode) {
      return true; // No mode restrictions
    }

    const { weatherRules } = this.currentMode;

    switch (action.type) {
      case "weather_change":
        return weatherRules.allowPlayerWeatherControl;

      case "card_play":
        // Weather cards are only allowed if player weather control is enabled
        if (
          action.data.cardType === "Weather" ||
          action.data.cardType === "BreakWeather"
        ) {
          return weatherRules.allowPlayerWeatherControl;
        }
        return true;

      case "turn_advance":
        return true; // Turn advancement is always allowed

      default:
        return true;
    }
  }

  /**
   * Apply special rules for the current game mode
   */
  public applySpecialRules(gameState: GameState): void {
    if (!this.currentMode || !this.currentMode.specialRules) {
      return;
    }

    for (const rule of this.currentMode.specialRules) {
      rule.effect(gameState);
    }
  }

  /**
   * Check if the game should end based on mode rules
   */
  public shouldGameEnd(gameState: GameState): boolean {
    if (!this.currentMode) {
      return false;
    }

    return gameState.currentTurn >= this.currentMode.turnLimit;
  }

  /**
   * Generate random weather based on rules
   */
  private generateRandomWeather(rules: WeatherRules): WeatherType[] {
    const allWeatherTypes: WeatherType[] = [
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

    const weatherCount = Math.min(
      Math.floor(Math.random() * rules.maxWeatherTypes) + 1,
      rules.maxWeatherTypes
    );

    const selectedWeather: WeatherType[] = [];
    const availableWeather = [...allWeatherTypes];

    for (let i = 0; i < weatherCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableWeather.length);
      selectedWeather.push(availableWeather[randomIndex]);
      availableWeather.splice(randomIndex, 1);
    }

    return selectedWeather;
  }

  /**
   * Get predetermined weather for the current turn
   */
  private getPredeterminedWeather(gameState: GameState): WeatherType[] {
    if (!gameState.predeterminedWeather) {
      throw new Error("Predetermined weather not available for forecast mode");
    }

    const turnIndex = gameState.currentTurn - 1;
    if (turnIndex >= gameState.predeterminedWeather.length) {
      throw new Error("No predetermined weather available for this turn");
    }

    return gameState.predeterminedWeather[turnIndex];
  }

  /**
   * Generate a predetermined weather schedule for forecast mode
   */
  public generateWeatherSchedule(
    turns: number,
    season?: SeasonType
  ): WeatherType[][] {
    const schedule: WeatherType[][] = [];

    for (let turn = 1; turn <= turns; turn++) {
      const month = ((turn - 1) % 12) + 1;
      let weather: WeatherType[];

      if (season) {
        // Use specific season weather
        weather = [this.seasonManager.getWeatherForSeason(season)];
      } else {
        // Use seasonal weather based on month
        weather = [this.seasonManager.getWeatherForMonth(month)];
      }

      schedule.push(weather);
    }

    return schedule;
  }

  /**
   * Get weather rules for the current mode
   */
  public getCurrentWeatherRules(): WeatherRules | null {
    return this.currentMode?.weatherRules || null;
  }

  /**
   * Reset the game mode manager
   */
  public reset(): void {
    this.currentMode = null;
  }
}
