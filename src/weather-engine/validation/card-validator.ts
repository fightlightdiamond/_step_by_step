/**
 * Weather card validation system
 */

import {
  WeatherCard,
  ActiveCard,
  PlayerHand,
  CardValidationResult,
  CardValidationError,
  WeatherType,
  SeasonType,
  ElementType,
} from "../types";
import { validateCardPlayConditions } from "../utils/card-utils";

/**
 * Card validator class for comprehensive card play validation
 */
export class CardValidator {
  /**
   * Validate if a card can be played
   */
  public validateCardPlay(
    card: WeatherCard,
    playerHand: PlayerHand,
    activeCards: ActiveCard[],
    currentWeather: WeatherType[],
    currentTurn: number,
    currentSeason: SeasonType,
    elementalModifiers: Partial<Record<ElementType, number>>
  ): CardValidationResult {
    const errors: CardValidationError[] = [];
    const warnings: string[] = [];

    // Basic card validation
    if (!this.isValidCard(card)) {
      errors.push("INVALID_CARD");
    }

    // Check if card is in player's hand
    if (!this.isCardInHand(card, playerHand)) {
      errors.push("INVALID_CARD");
      warnings.push("Card not found in player's hand");
    }

    // Check if card has expired
    if (this.isCardExpired(card)) {
      errors.push("CARD_EXPIRED");
    }

    // Check play limits
    const playLimitResult = this.validatePlayLimits(
      card,
      playerHand,
      currentTurn
    );
    errors.push(...playLimitResult.errors);
    warnings.push(...playLimitResult.warnings);

    // Check unique card constraints
    const uniqueResult = this.validateUniqueConstraints(card, activeCards);
    errors.push(...uniqueResult.errors);
    warnings.push(...uniqueResult.warnings);

    // Check play conditions
    const conditionResult = validateCardPlayConditions(
      card,
      currentWeather,
      currentTurn,
      currentSeason,
      elementalModifiers
    );
    errors.push(...conditionResult.errors);
    warnings.push(...conditionResult.warnings);

    // Check weather combination validity
    const weatherResult = this.validateWeatherCombination(card, currentWeather);
    errors.push(...weatherResult.errors);
    warnings.push(...weatherResult.warnings);

    return {
      valid: errors.length === 0,
      errors: [...new Set(errors)], // Remove duplicates
      warnings: [...new Set(warnings)], // Remove duplicates
    };
  }

  /**
   * Validate basic card structure and properties
   */
  private isValidCard(card: WeatherCard): boolean {
    if (!card || !card.id || !card.name || !card.type) {
      return false;
    }

    // Validate card type specific requirements
    switch (card.type) {
      case "Weather":
        return !!(card.weather || card.weatherOptions);
      case "BreakWeather":
        return card.breaksWeather === true;
      case "WeatherBuff":
      case "WeatherNerf":
        return !!card.effect;
      default:
        return false;
    }
  }

  /**
   * Check if card is in player's hand
   */
  private isCardInHand(card: WeatherCard, playerHand: PlayerHand): boolean {
    return playerHand.cards.some((handCard) => handCard.id === card.id);
  }

  /**
   * Check if card has expired
   */
  private isCardExpired(card: WeatherCard): boolean {
    if (card.expiresAt) {
      return new Date() > card.expiresAt;
    }
    return false;
  }

  /**
   * Validate play limits (per turn and per game)
   */
  private validatePlayLimits(
    card: WeatherCard,
    playerHand: PlayerHand,
    currentTurn: number
  ): CardValidationResult {
    const errors: CardValidationError[] = [];
    const warnings: string[] = [];

    // Check per-turn limit
    if (card.maxPlaysPerTurn !== undefined) {
      const playsThisTurn = this.countCardPlaysThisTurn(card, playerHand);
      if (playsThisTurn >= card.maxPlaysPerTurn) {
        errors.push("MAX_PLAYS_EXCEEDED");
        warnings.push(
          `Card can only be played ${card.maxPlaysPerTurn} times per turn`
        );
      }
    }

    // Check per-game limit
    if (card.maxPlaysPerGame !== undefined) {
      const playsThisGame = playerHand.cardsPlayedThisGame.get(card.id) || 0;
      if (playsThisGame >= card.maxPlaysPerGame) {
        errors.push("MAX_PLAYS_EXCEEDED");
        warnings.push(
          `Card can only be played ${card.maxPlaysPerGame} times per game`
        );
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate unique card constraints
   */
  private validateUniqueConstraints(
    card: WeatherCard,
    activeCards: ActiveCard[]
  ): CardValidationResult {
    const errors: CardValidationError[] = [];
    const warnings: string[] = [];

    if (card.unique) {
      const duplicateActive = activeCards.some(
        (activeCard) => activeCard.card.id === card.id
      );
      if (duplicateActive) {
        errors.push("DUPLICATE_UNIQUE_CARD");
        warnings.push("This unique card is already active");
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate weather combination after card play
   */
  private validateWeatherCombination(
    card: WeatherCard,
    currentWeather: WeatherType[]
  ): CardValidationResult {
    const errors: CardValidationError[] = [];
    const warnings: string[] = [];

    // If card breaks weather, no validation needed
    if (card.breaksWeather) {
      return { valid: true, errors, warnings };
    }

    // If card adds weather, check compatibility
    if (card.weather) {
      const newWeather = [...currentWeather, card.weather];
      if (!this.isValidWeatherCombination(newWeather)) {
        errors.push("INVALID_WEATHER_COMBINATION");
        warnings.push(
          `Weather ${card.weather} is incompatible with current weather`
        );
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Check if weather combination is logically valid
   */
  private isValidWeatherCombination(weather: WeatherType[]): boolean {
    const opposites: [WeatherType, WeatherType][] = [
      ["Hot", "Cold"],
      ["Sunny", "Snowy"],
      ["Sunny", "Stormy"],
      ["Foggy", "Windy"],
    ];

    for (const [weather1, weather2] of opposites) {
      if (weather.includes(weather1) && weather.includes(weather2)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Count how many times a card has been played this turn
   */
  private countCardPlaysThisTurn(
    card: WeatherCard,
    playerHand: PlayerHand
  ): number {
    // This would typically be tracked in the game state
    // For now, we'll use the cardsPlayedThisTurn counter
    return playerHand.cardsPlayedThisTurn;
  }

  /**
   * Validate card deck composition
   */
  public validateDeck(cards: WeatherCard[]): CardValidationResult {
    const errors: CardValidationError[] = [];
    const warnings: string[] = [];

    // Check for duplicate unique cards
    const uniqueCards = cards.filter((card) => card.unique);
    const uniqueIds = new Set();

    for (const card of uniqueCards) {
      if (uniqueIds.has(card.id)) {
        errors.push("DUPLICATE_UNIQUE_CARD");
        warnings.push(`Duplicate unique card found: ${card.name}`);
      }
      uniqueIds.add(card.id);
    }

    // Validate individual cards
    for (const card of cards) {
      if (!this.isValidCard(card)) {
        errors.push("INVALID_CARD");
        warnings.push(`Invalid card: ${card.name || card.id}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: [...new Set(errors)],
      warnings: [...new Set(warnings)],
    };
  }

  /**
   * Validate hand size constraints
   */
  public validateHandSize(playerHand: PlayerHand): CardValidationResult {
    const errors: CardValidationError[] = [];
    const warnings: string[] = [];

    if (playerHand.cards.length > playerHand.maxHandSize) {
      errors.push("HAND_SIZE_EXCEEDED");
      warnings.push(
        `Hand size (${playerHand.cards.length}) exceeds maximum (${playerHand.maxHandSize})`
      );
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}
