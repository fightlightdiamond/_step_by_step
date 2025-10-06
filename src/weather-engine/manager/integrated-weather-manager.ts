/**
 * Integrated Weather Manager - Combines weather management with card system
 */

import {
  WeatherType,
  WeatherState,
  WeatherCard,
  ElementType,
  SeasonType,
  PlayerHand,
  CardPlayResult,
  CardValidationResult,
} from "../types";
import { WeatherManager } from "./weather-manager";
import { WeatherCardManager } from "./weather-card-manager";
import { ProcessedWeatherConfig } from "../config";

/**
 * Integrated weather manager that combines weather state with card management
 */
export class IntegratedWeatherManager {
  private weatherManager: WeatherManager;
  private cardManager: WeatherCardManager;

  constructor(
    config: ProcessedWeatherConfig,
    initialState?: Partial<WeatherState>,
    options?: {
      debugMode?: boolean;
      logLevel?: "none" | "error" | "warn" | "info" | "debug";
      maxHistorySize?: number;
    }
  ) {
    this.weatherManager = new WeatherManager(config, initialState, options);
    this.cardManager = new WeatherCardManager();
  }

  /**
   * Play a weather card with full integration
   */
  public playWeatherCard(
    card: WeatherCard,
    playerHand: PlayerHand,
    playerId?: string
  ): CardPlayResult {
    const currentWeather = this.weatherManager.getCurrentWeather();
    const currentSeason = this.getCurrentSeason();
    const elementalModifiers = this.getElementalModifiers();

    // Play the card through the card manager
    const result = this.cardManager.playCard(
      card,
      playerHand,
      currentWeather,
      currentSeason,
      elementalModifiers,
      playerId
    );

    if (result.valid && result.weatherChange) {
      // Apply weather changes to the weather manager
      try {
        this.weatherManager.applyWeather(result.weatherChange, {
          source: "card",
          reason: `Card played: ${card.name}`,
          validateChange: true,
        });
      } catch (error) {
        // If weather manager rejects the change, revert the card play
        // This shouldn't happen if validation is working correctly
        return {
          valid: false,
          reason: `Weather change rejected: ${error.message}`,
          weatherChange: currentWeather,
          effectModifiers: elementalModifiers,
        };
      }
    }

    return result;
  }

  /**
   * Validate if a card can be played
   */
  public validateCardPlay(
    card: WeatherCard,
    playerHand: PlayerHand
  ): CardValidationResult {
    const currentWeather = this.weatherManager.getCurrentWeather();
    const currentSeason = this.getCurrentSeason();
    const elementalModifiers = this.getElementalModifiers();

    return this.cardManager.validateCardPlay(
      card,
      playerHand,
      currentWeather,
      currentSeason,
      elementalModifiers
    );
  }

  /**
   * Play a break weather card
   */
  public playBreakWeatherCard(
    card: WeatherCard,
    playerHand: PlayerHand,
    playerId?: string
  ): CardPlayResult {
    if (!card.breaksWeather) {
      return {
        valid: false,
        reason: "Card is not a break weather card",
        weatherChange: this.weatherManager.getCurrentWeather(),
        effectModifiers: this.getElementalModifiers(),
      };
    }

    const result = this.playWeatherCard(card, playerHand, playerId);

    if (result.valid) {
      // Clear all weather
      this.weatherManager.resetWeather({
        source: "card",
        reason: `Break weather card played: ${card.name}`,
      });
    }

    return result;
  }

  /**
   * Get current elemental modifiers including card effects
   */
  public getElementalModifiers(): Partial<Record<ElementType, number>> {
    // Get base weather effects
    const weatherResult = this.weatherManager.calculateElementalModifiers();
    const weatherModifiers = weatherResult.elementalModifiers;

    // Get card effects
    const cardEffects = this.cardManager.getCumulativeEffects();

    // Combine effects
    const combined: Partial<Record<ElementType, number>> = {
      Fire: (weatherModifiers.Fire || 0) + (cardEffects.Fire || 0),
      Ice: (weatherModifiers.Ice || 0) + (cardEffects.Ice || 0),
      Lightning:
        (weatherModifiers.Lightning || 0) + (cardEffects.Lightning || 0),
    };

    // Apply limits (-40 to +40)
    for (const element of Object.keys(combined) as ElementType[]) {
      combined[element] = Math.max(-40, Math.min(40, combined[element] || 0));
    }

    return combined;
  }

  /**
   * Advance to next turn
   */
  public advanceTurn(): void {
    this.weatherManager.advanceTurn();
    this.cardManager.advanceTurn();
  }

  /**
   * Get current weather state
   */
  public getCurrentWeatherState(): Readonly<WeatherState> {
    const baseState = this.weatherManager.getCurrentWeatherState();
    const activeCards = this.cardManager.getActiveCards();

    return {
      ...baseState,
      activeCards,
    };
  }

  /**
   * Get current weather types
   */
  public getCurrentWeather(): WeatherType[] {
    return this.weatherManager.getCurrentWeather();
  }

  /**
   * Get current season
   */
  public getCurrentSeason(): SeasonType {
    return this.weatherManager.getCurrentSeason();
  }

  /**
   * Get current turn
   */
  public getCurrentTurn(): number {
    return this.weatherManager.getCurrentTurn();
  }

  /**
   * Get current month
   */
  public getCurrentMonth(): number {
    return this.weatherManager.getCurrentMonth();
  }

  /**
   * Get active cards
   */
  public getActiveCards() {
    return this.cardManager.getActiveCards();
  }

  /**
   * Get card play history
   */
  public getCardPlayHistory() {
    return this.cardManager.getPlayHistory();
  }

  /**
   * Check if a card is currently active
   */
  public isCardActive(cardId: string): boolean {
    return this.cardManager.isCardActive(cardId);
  }

  /**
   * Force expire a card
   */
  public expireCard(cardId: string): boolean {
    return this.cardManager.expireCard(cardId);
  }

  /**
   * Get cards that will expire next turn
   */
  public getExpiringCards() {
    return this.cardManager.getExpiringCards();
  }

  /**
   * Reset weather to natural state (removes card effects)
   */
  public resetToNaturalWeather(): void {
    this.cardManager.clearActiveCards();
    this.weatherManager.resetWeather({
      source: "system",
      reason: "Reset to natural weather",
    });
  }

  /**
   * Set weather directly (bypassing cards)
   */
  public setWeather(
    weather: WeatherType[],
    options?: {
      source?: "natural" | "card" | "manual" | "system";
      reason?: string;
    }
  ): void {
    this.weatherManager.applyWeather(weather, {
      validateChange: true,
      triggerEvents: true,
      ...options,
    });
  }

  /**
   * Get weather validation errors for a potential weather combination
   */
  public validateWeatherCombination(weather: WeatherType[]): boolean {
    try {
      const result =
        this.weatherManager.validateWeatherCombinationDetailed(weather);
      return result.validationResult.isValid;
    } catch {
      return false;
    }
  }

  /**
   * Get card statistics
   */
  public getCardStatistics() {
    return this.cardManager.getCardStatistics();
  }

  /**
   * Reset entire system
   */
  public reset(): void {
    this.cardManager.reset();
    this.weatherManager.resetWeather({
      source: "system",
      reason: "System reset",
    });
    // Reset turn to 1
    this.weatherManager.setTurn(1, 1);
  }

  /**
   * Get weather manager instance (for advanced operations)
   */
  public getWeatherManager(): WeatherManager {
    return this.weatherManager;
  }

  /**
   * Get card manager instance (for advanced operations)
   */
  public getCardManager(): WeatherCardManager {
    return this.cardManager;
  }

  /**
   * Process multiple card plays in sequence
   */
  public playCardSequence(
    cardPlays: Array<{
      card: WeatherCard;
      playerHand: PlayerHand;
      playerId?: string;
    }>
  ): Array<CardPlayResult> {
    const results: CardPlayResult[] = [];

    for (const { card, playerHand, playerId } of cardPlays) {
      const result = this.playWeatherCard(card, playerHand, playerId);
      results.push(result);

      // Stop if any card play fails
      if (!result.valid) {
        break;
      }
    }

    return results;
  }

  /**
   * Get weather forecast (if supported by weather manager)
   */
  public getWeatherForecast(turns: number): WeatherType[][] {
    // This would depend on the weather manager's forecast capabilities
    // For now, return current weather repeated
    const currentWeather = this.getCurrentWeather();
    return Array(turns).fill(currentWeather);
  }

  /**
   * Check if weather combination would be valid after playing a card
   */
  public wouldCardPlayBeValid(
    card: WeatherCard,
    playerHand: PlayerHand
  ): boolean {
    const validation = this.validateCardPlay(card, playerHand);
    return validation.valid;
  }

  /**
   * Get all possible weather combinations that could result from playing cards
   */
  public getPossibleWeatherFromCards(cards: WeatherCard[]): WeatherType[][] {
    const currentWeather = this.getCurrentWeather();
    const possibilities: WeatherType[][] = [];

    for (const card of cards) {
      if (card.breaksWeather) {
        possibilities.push([]);
      } else if (card.weather) {
        const newWeather = [...currentWeather, card.weather];
        if (this.validateWeatherCombination(newWeather)) {
          possibilities.push(newWeather);
        }
      }
    }

    return possibilities;
  }
}
