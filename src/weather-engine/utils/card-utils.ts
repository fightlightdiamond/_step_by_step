/**
 * Weather card utility functions
 */

import {
  WeatherCard,
  ActiveCard,
  CardPlayResult,
  CardValidationResult,
  CardValidationError,
  CardPlayCondition,
  ElementType,
  WeatherType,
  SeasonType,
} from "../types";

/**
 * Calculate the effective duration for a card
 */
export function calculateCardDuration(
  card: WeatherCard,
  currentTurn: number
): number {
  if (card.duration === undefined || card.duration === 0) {
    return -1; // Permanent until overridden
  }
  return card.duration;
}

/**
 * Calculate cumulative effects from multiple active cards
 */
export function calculateCumulativeEffects(
  activeCards: ActiveCard[]
): Partial<Record<ElementType, number>> {
  const effects: Partial<Record<ElementType, number>> = {
    Fire: 0,
    Ice: 0,
    Lightning: 0,
  };

  for (const activeCard of activeCards) {
    if (activeCard.card.effect) {
      for (const [element, modifier] of Object.entries(
        activeCard.card.effect
      )) {
        const elementType = element as ElementType;
        effects[elementType] = (effects[elementType] || 0) + modifier;
      }
    }
  }

  // Apply effect limits (-40 to +40)
  for (const element of Object.keys(effects) as ElementType[]) {
    effects[element] = Math.max(-40, Math.min(40, effects[element] || 0));
  }

  return effects;
}

/**
 * Check if a card has expired
 */
export function isCardExpired(
  activeCard: ActiveCard,
  currentTurn: number
): boolean {
  if (
    activeCard.card.duration === undefined ||
    activeCard.card.duration === 0
  ) {
    return false; // Permanent cards don't expire
  }

  if (activeCard.card.expiresAt) {
    return new Date() > activeCard.card.expiresAt;
  }

  return activeCard.remainingDuration <= 0;
}

/**
 * Update card duration for a new turn
 */
export function updateCardDuration(activeCard: ActiveCard): ActiveCard {
  if (
    activeCard.card.duration === undefined ||
    activeCard.card.duration === 0
  ) {
    return activeCard; // Permanent cards don't change
  }

  return {
    ...activeCard,
    remainingDuration: Math.max(0, activeCard.remainingDuration - 1),
  };
}

/**
 * Validate card play conditions
 */
export function validateCardPlayConditions(
  card: WeatherCard,
  currentWeather: WeatherType[],
  currentTurn: number,
  currentSeason: SeasonType,
  elementalModifiers: Partial<Record<ElementType, number>>
): CardValidationResult {
  const errors: CardValidationError[] = [];
  const warnings: string[] = [];

  if (!card.playConditions) {
    return { valid: true, errors, warnings };
  }

  for (const condition of card.playConditions) {
    switch (condition.type) {
      case "weather":
        if (!validateWeatherCondition(condition, currentWeather)) {
          errors.push("PLAY_CONDITION_NOT_MET");
          warnings.push(`Weather condition not met: ${condition.description}`);
        }
        break;

      case "turn":
        if (!validateTurnCondition(condition, currentTurn)) {
          errors.push("PLAY_CONDITION_NOT_MET");
          warnings.push(`Turn condition not met: ${condition.description}`);
        }
        break;

      case "season":
        if (!validateSeasonCondition(condition, currentSeason)) {
          errors.push("PLAY_CONDITION_NOT_MET");
          warnings.push(`Season condition not met: ${condition.description}`);
        }
        break;

      case "element":
        if (!validateElementCondition(condition, elementalModifiers)) {
          errors.push("PLAY_CONDITION_NOT_MET");
          warnings.push(`Element condition not met: ${condition.description}`);
        }
        break;

      case "custom":
        // Custom conditions would be handled by game-specific logic
        warnings.push(`Custom condition: ${condition.description}`);
        break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate weather-based play condition
 */
function validateWeatherCondition(
  condition: CardPlayCondition,
  currentWeather: WeatherType[]
): boolean {
  switch (condition.condition) {
    case "requires":
      return currentWeather.includes(condition.value as WeatherType);
    case "excludes":
      return !currentWeather.includes(condition.value as WeatherType);
    case "any_of":
      return (condition.value as WeatherType[]).some((weather) =>
        currentWeather.includes(weather)
      );
    case "none_of":
      return !(condition.value as WeatherType[]).some((weather) =>
        currentWeather.includes(weather)
      );
    default:
      return true;
  }
}

/**
 * Validate turn-based play condition
 */
function validateTurnCondition(
  condition: CardPlayCondition,
  currentTurn: number
): boolean {
  switch (condition.condition) {
    case "min_turn":
      return currentTurn >= condition.value;
    case "max_turn":
      return currentTurn <= condition.value;
    case "exact_turn":
      return currentTurn === condition.value;
    case "turn_multiple":
      return currentTurn % condition.value === 0;
    default:
      return true;
  }
}

/**
 * Validate season-based play condition
 */
function validateSeasonCondition(
  condition: CardPlayCondition,
  currentSeason: SeasonType
): boolean {
  switch (condition.condition) {
    case "requires":
      return currentSeason === condition.value;
    case "excludes":
      return currentSeason !== condition.value;
    case "any_of":
      return (condition.value as SeasonType[]).includes(currentSeason);
    case "none_of":
      return !(condition.value as SeasonType[]).includes(currentSeason);
    default:
      return true;
  }
}

/**
 * Validate element-based play condition
 */
function validateElementCondition(
  condition: CardPlayCondition,
  elementalModifiers: Partial<Record<ElementType, number>>
): boolean {
  const element = condition.value.element as ElementType;
  const currentModifier = elementalModifiers[element] || 0;

  switch (condition.condition) {
    case "min_modifier":
      return currentModifier >= condition.value.threshold;
    case "max_modifier":
      return currentModifier <= condition.value.threshold;
    case "exact_modifier":
      return currentModifier === condition.value.threshold;
    default:
      return true;
  }
}

/**
 * Check if two cards can stack together
 */
export function canCardsStack(card1: WeatherCard, card2: WeatherCard): boolean {
  // Unique cards cannot stack with themselves
  if (card1.unique && card1.id === card2.id) {
    return false;
  }

  // Both cards must be stackable
  if (!card1.stackable || !card2.stackable) {
    return false;
  }

  // Break weather cards don't stack
  if (card1.breaksWeather || card2.breaksWeather) {
    return false;
  }

  return true;
}

/**
 * Create a new active card from a weather card
 */
export function createActiveCard(
  card: WeatherCard,
  playedTurn: number,
  playerId?: string
): ActiveCard {
  const duration = calculateCardDuration(card, playedTurn);

  return {
    card,
    playedTurn,
    remainingDuration: duration,
    playerId,
    effectsApplied: card.effect || {},
  };
}

/**
 * Filter expired cards from active cards list
 */
export function filterExpiredCards(
  activeCards: ActiveCard[],
  currentTurn: number
): ActiveCard[] {
  return activeCards.filter(
    (activeCard) => !isCardExpired(activeCard, currentTurn)
  );
}

/**
 * Get all unique weather types that can be applied by a card
 */
export function getCardWeatherOptions(card: WeatherCard): WeatherType[] {
  const options: WeatherType[] = [];

  if (card.weather) {
    options.push(card.weather);
  }

  if (card.weatherOptions) {
    options.push(...card.weatherOptions);
  }

  return [...new Set(options)]; // Remove duplicates
}
