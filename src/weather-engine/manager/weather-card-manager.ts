/**
 * Weather Card Manager - Handles card state management and effects
 */

import {
  WeatherCard,
  ActiveCard,
  PlayerHand,
  CardPlayResult,
  CardValidationResult,
  CardPlayHistory,
  WeatherType,
  ElementType,
  SeasonType,
} from "../types";
import { CardValidator } from "../validation/card-validator";
import {
  calculateCumulativeEffects,
  createActiveCard,
  filterExpiredCards,
  updateCardDuration,
  getCardWeatherOptions,
} from "../utils/card-utils";

/**
 * Weather Card Manager class for comprehensive card management
 */
export class WeatherCardManager {
  private activeCards: ActiveCard[] = [];
  private playHistory: CardPlayHistory[] = [];
  private validator: CardValidator;
  private currentTurn: number = 1;

  constructor() {
    this.validator = new CardValidator();
  }

  /**
   * Play a weather card
   */
  public playCard(
    card: WeatherCard,
    playerHand: PlayerHand,
    currentWeather: WeatherType[],
    currentSeason: SeasonType,
    elementalModifiers: Partial<Record<ElementType, number>>,
    playerId?: string
  ): CardPlayResult {
    // Validate card play
    const validationResult = this.validator.validateCardPlay(
      card,
      playerHand,
      this.activeCards,
      currentWeather,
      this.currentTurn,
      currentSeason,
      elementalModifiers
    );

    if (!validationResult.valid) {
      return {
        valid: false,
        reason: validationResult.errors.join(", "),
        weatherChange: currentWeather,
        effectModifiers: elementalModifiers,
      };
    }

    // Calculate new weather state
    const newWeather = this.calculateNewWeather(card, currentWeather);

    // Calculate new effect modifiers
    const newEffectModifiers = this.calculateNewEffectModifiers(
      card,
      elementalModifiers
    );

    // Create active card if it has duration or effects
    if (this.shouldCreateActiveCard(card)) {
      const activeCard = createActiveCard(card, this.currentTurn, playerId);
      this.addActiveCard(activeCard);
    }

    // Update player hand
    this.updatePlayerHand(playerHand, card);

    // Record play history
    this.recordCardPlay(
      card,
      playerId || "unknown",
      currentWeather,
      newWeather,
      newEffectModifiers
    );

    return {
      valid: true,
      weatherChange: newWeather,
      effectModifiers: newEffectModifiers,
    };
  }

  /**
   * Get current active cards
   */
  public getActiveCards(): ActiveCard[] {
    return [...this.activeCards];
  }

  /**
   * Get cumulative effects from all active cards
   */
  public getCumulativeEffects(): Partial<Record<ElementType, number>> {
    return calculateCumulativeEffects(this.activeCards);
  }

  /**
   * Process turn end - update durations and expire cards
   */
  public processTurnEnd(): void {
    // Update card durations
    this.activeCards = this.activeCards.map(updateCardDuration);

    // Remove expired cards
    this.activeCards = filterExpiredCards(this.activeCards, this.currentTurn);
  }

  /**
   * Advance to next turn
   */
  public advanceTurn(): void {
    this.currentTurn++;
    this.processTurnEnd();
  }

  /**
   * Get current turn number
   */
  public getCurrentTurn(): number {
    return this.currentTurn;
  }

  /**
   * Set current turn number
   */
  public setCurrentTurn(turn: number): void {
    this.currentTurn = turn;
  }

  /**
   * Clear all active cards
   */
  public clearActiveCards(): void {
    this.activeCards = [];
  }

  /**
   * Remove specific active card
   */
  public removeActiveCard(cardId: string): boolean {
    const initialLength = this.activeCards.length;
    this.activeCards = this.activeCards.filter(
      (activeCard) => activeCard.card.id !== cardId
    );
    return this.activeCards.length < initialLength;
  }

  /**
   * Get play history
   */
  public getPlayHistory(): CardPlayHistory[] {
    return [...this.playHistory];
  }

  /**
   * Clear play history
   */
  public clearPlayHistory(): void {
    this.playHistory = [];
  }

  /**
   * Get cards played by a specific player
   */
  public getPlayerPlayHistory(playerId: string): CardPlayHistory[] {
    return this.playHistory.filter((entry) => entry.playerId === playerId);
  }

  /**
   * Check if a card is currently active
   */
  public isCardActive(cardId: string): boolean {
    return this.activeCards.some((activeCard) => activeCard.card.id === cardId);
  }

  /**
   * Get active card by ID
   */
  public getActiveCard(cardId: string): ActiveCard | undefined {
    return this.activeCards.find((activeCard) => activeCard.card.id === cardId);
  }

  /**
   * Validate if a card can be played
   */
  public validateCardPlay(
    card: WeatherCard,
    playerHand: PlayerHand,
    currentWeather: WeatherType[],
    currentSeason: SeasonType,
    elementalModifiers: Partial<Record<ElementType, number>>
  ): CardValidationResult {
    return this.validator.validateCardPlay(
      card,
      playerHand,
      this.activeCards,
      currentWeather,
      this.currentTurn,
      currentSeason,
      elementalModifiers
    );
  }

  /**
   * Force expire a card
   */
  public expireCard(cardId: string): boolean {
    const cardIndex = this.activeCards.findIndex(
      (activeCard) => activeCard.card.id === cardId
    );

    if (cardIndex !== -1) {
      this.activeCards.splice(cardIndex, 1);
      return true;
    }

    return false;
  }

  /**
   * Get cards that will expire next turn
   */
  public getExpiringCards(): ActiveCard[] {
    return this.activeCards.filter(
      (activeCard) => activeCard.remainingDuration === 1
    );
  }

  /**
   * Reset manager state
   */
  public reset(): void {
    this.activeCards = [];
    this.playHistory = [];
    this.currentTurn = 1;
  }

  /**
   * Calculate new weather state after playing a card
   */
  private calculateNewWeather(
    card: WeatherCard,
    currentWeather: WeatherType[]
  ): WeatherType[] {
    if (card.breaksWeather) {
      return []; // Clear all weather
    }

    if (card.weather) {
      return [...currentWeather, card.weather];
    }

    return currentWeather; // No weather change
  }

  /**
   * Calculate new effect modifiers after playing a card
   */
  private calculateNewEffectModifiers(
    card: WeatherCard,
    currentModifiers: Partial<Record<ElementType, number>>
  ): Partial<Record<ElementType, number>> {
    if (!card.effect) {
      return currentModifiers;
    }

    const newModifiers = { ...currentModifiers };

    for (const [element, modifier] of Object.entries(card.effect)) {
      const elementType = element as ElementType;
      newModifiers[elementType] = (newModifiers[elementType] || 0) + modifier;

      // Apply limits (-40 to +40)
      newModifiers[elementType] = Math.max(
        -40,
        Math.min(40, newModifiers[elementType]!)
      );
    }

    return newModifiers;
  }

  /**
   * Check if an active card should be created for this card
   */
  private shouldCreateActiveCard(card: WeatherCard): boolean {
    // Create active card if it has duration (including 0 for permanent) or ongoing effects
    return !!(card.duration !== undefined || card.effect);
  }

  /**
   * Add an active card to the manager
   */
  private addActiveCard(activeCard: ActiveCard): void {
    // Check if this is a unique card that's already active
    if (activeCard.card.unique) {
      this.removeActiveCard(activeCard.card.id);
    }

    this.activeCards.push(activeCard);
  }

  /**
   * Update player hand after playing a card
   */
  private updatePlayerHand(playerHand: PlayerHand, card: WeatherCard): void {
    // Remove card from hand
    const cardIndex = playerHand.cards.findIndex(
      (handCard) => handCard.id === card.id
    );
    if (cardIndex !== -1) {
      playerHand.cards.splice(cardIndex, 1);
    }

    // Update play counters
    playerHand.cardsPlayedThisTurn++;
    const currentGamePlays = playerHand.cardsPlayedThisGame.get(card.id) || 0;
    playerHand.cardsPlayedThisGame.set(card.id, currentGamePlays + 1);
  }

  /**
   * Record a card play in history
   */
  private recordCardPlay(
    card: WeatherCard,
    playerId: string,
    weatherBefore: WeatherType[],
    weatherAfter: WeatherType[],
    effectsApplied: Partial<Record<ElementType, number>>
  ): void {
    const historyEntry: CardPlayHistory = {
      cardId: card.id,
      playerId,
      turn: this.currentTurn,
      weatherBefore: [...weatherBefore],
      weatherAfter: [...weatherAfter],
      effectsApplied: { ...effectsApplied },
      timestamp: new Date(),
    };

    this.playHistory.push(historyEntry);
  }

  /**
   * Get statistics about card usage
   */
  public getCardStatistics(): {
    totalCardsPlayed: number;
    uniqueCardsPlayed: number;
    mostPlayedCard: string | null;
    averageCardsPerTurn: number;
  } {
    const cardCounts = new Map<string, number>();

    for (const entry of this.playHistory) {
      cardCounts.set(entry.cardId, (cardCounts.get(entry.cardId) || 0) + 1);
    }

    let mostPlayedCard: string | null = null;
    let maxPlays = 0;

    for (const [cardId, plays] of cardCounts.entries()) {
      if (plays > maxPlays) {
        maxPlays = plays;
        mostPlayedCard = cardId;
      }
    }

    return {
      totalCardsPlayed: this.playHistory.length,
      uniqueCardsPlayed: cardCounts.size,
      mostPlayedCard,
      averageCardsPerTurn:
        this.currentTurn > 0 ? this.playHistory.length / this.currentTurn : 0,
    };
  }
}
