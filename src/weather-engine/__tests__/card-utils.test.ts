/**
 * Tests for weather card utilities
 */

import {
  calculateCardDuration,
  calculateCumulativeEffects,
  isCardExpired,
  updateCardDuration,
  validateCardPlayConditions,
  canCardsStack,
  createActiveCard,
  filterExpiredCards,
  getCardWeatherOptions,
} from "../utils/card-utils";
import {
  WeatherCard,
  ActiveCard,
  CardPlayCondition,
  ElementType,
  WeatherType,
  SeasonType,
} from "../types";

describe("Card Utils", () => {
  const mockCard: WeatherCard = {
    id: "test-card-1",
    type: "Weather",
    name: "Sunny Day",
    description: "Brings sunny weather",
    rarity: "Common",
    cost: 2,
    weather: "Sunny",
    effect: { Fire: 10, Ice: -5, Lightning: 0 },
    duration: 3,
    stackable: true,
    unique: false,
  };

  const mockBreakCard: WeatherCard = {
    id: "break-card-1",
    type: "BreakWeather",
    name: "Clear Skies",
    description: "Removes all weather",
    rarity: "Common",
    cost: 1,
    breaksWeather: true,
    stackable: false,
    unique: false,
  };

  describe("calculateCardDuration", () => {
    it("should return the card's duration", () => {
      expect(calculateCardDuration(mockCard, 1)).toBe(3);
    });

    it("should return -1 for permanent cards", () => {
      const permanentCard = { ...mockCard, duration: 0 };
      expect(calculateCardDuration(permanentCard, 1)).toBe(-1);
    });

    it("should return -1 for cards without duration", () => {
      const { duration, ...cardWithoutDuration } = mockCard;
      expect(calculateCardDuration(cardWithoutDuration as WeatherCard, 1)).toBe(
        -1
      );
    });
  });

  describe("calculateCumulativeEffects", () => {
    it("should calculate effects from single card", () => {
      const activeCard: ActiveCard = {
        card: mockCard,
        playedTurn: 1,
        remainingDuration: 3,
        effectsApplied: mockCard.effect!,
      };

      const effects = calculateCumulativeEffects([activeCard]);
      expect(effects).toEqual({
        Fire: 10,
        Ice: -5,
        Lightning: 0,
      });
    });

    it("should calculate cumulative effects from multiple cards", () => {
      const card2: WeatherCard = {
        ...mockCard,
        id: "test-card-2",
        effect: { Fire: 5, Ice: 10, Lightning: -3 },
      };

      const activeCards: ActiveCard[] = [
        {
          card: mockCard,
          playedTurn: 1,
          remainingDuration: 3,
          effectsApplied: mockCard.effect!,
        },
        {
          card: card2,
          playedTurn: 2,
          remainingDuration: 2,
          effectsApplied: card2.effect!,
        },
      ];

      const effects = calculateCumulativeEffects(activeCards);
      expect(effects).toEqual({
        Fire: 15,
        Ice: 5,
        Lightning: -3,
      });
    });

    it("should apply effect limits (-40 to +40)", () => {
      const highEffectCard: WeatherCard = {
        ...mockCard,
        effect: { Fire: 50, Ice: -60, Lightning: 25 },
      };

      const activeCard: ActiveCard = {
        card: highEffectCard,
        playedTurn: 1,
        remainingDuration: 3,
        effectsApplied: highEffectCard.effect!,
      };

      const effects = calculateCumulativeEffects([activeCard]);
      expect(effects).toEqual({
        Fire: 40,
        Ice: -40,
        Lightning: 25,
      });
    });
  });

  describe("isCardExpired", () => {
    it("should return false for permanent cards", () => {
      const permanentCard: ActiveCard = {
        card: { ...mockCard, duration: 0 },
        playedTurn: 1,
        remainingDuration: -1,
      };

      expect(isCardExpired(permanentCard, 5)).toBe(false);
    });

    it("should return true when duration is exhausted", () => {
      const expiredCard: ActiveCard = {
        card: mockCard,
        playedTurn: 1,
        remainingDuration: 0,
      };

      expect(isCardExpired(expiredCard, 5)).toBe(true);
    });

    it("should check expiration date if present", () => {
      const pastDate = new Date(Date.now() - 1000);
      const expiredCard: ActiveCard = {
        card: { ...mockCard, expiresAt: pastDate },
        playedTurn: 1,
        remainingDuration: 2,
      };

      expect(isCardExpired(expiredCard, 2)).toBe(true);
    });
  });

  describe("updateCardDuration", () => {
    it("should decrease duration by 1", () => {
      const activeCard: ActiveCard = {
        card: mockCard,
        playedTurn: 1,
        remainingDuration: 3,
      };

      const updated = updateCardDuration(activeCard);
      expect(updated.remainingDuration).toBe(2);
    });

    it("should not go below 0", () => {
      const activeCard: ActiveCard = {
        card: mockCard,
        playedTurn: 1,
        remainingDuration: 0,
      };

      const updated = updateCardDuration(activeCard);
      expect(updated.remainingDuration).toBe(0);
    });

    it("should not change permanent cards", () => {
      const permanentCard: ActiveCard = {
        card: { ...mockCard, duration: 0 },
        playedTurn: 1,
        remainingDuration: -1,
      };

      const updated = updateCardDuration(permanentCard);
      expect(updated.remainingDuration).toBe(-1);
    });
  });

  describe("validateCardPlayConditions", () => {
    it("should return valid for cards without conditions", () => {
      const result = validateCardPlayConditions(
        mockCard,
        ["Sunny"],
        1,
        "Summer",
        { Fire: 0, Ice: 0, Lightning: 0 }
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate weather conditions", () => {
      const cardWithConditions: WeatherCard = {
        ...mockCard,
        playConditions: [
          {
            type: "weather",
            condition: "requires",
            value: "Rainy",
            description: "Requires rainy weather",
          },
        ],
      };

      const result = validateCardPlayConditions(
        cardWithConditions,
        ["Sunny"],
        1,
        "Summer",
        { Fire: 0, Ice: 0, Lightning: 0 }
      );

      expect(result.valid).toBe(false);
      expect(result.warnings).toContain(
        "Weather condition not met: Requires rainy weather"
      );
    });

    it("should validate turn conditions", () => {
      const cardWithConditions: WeatherCard = {
        ...mockCard,
        playConditions: [
          {
            type: "turn",
            condition: "min_turn",
            value: 5,
            description: "Can only be played after turn 5",
          },
        ],
      };

      const result = validateCardPlayConditions(
        cardWithConditions,
        ["Sunny"],
        3,
        "Summer",
        { Fire: 0, Ice: 0, Lightning: 0 }
      );

      expect(result.valid).toBe(false);
      expect(result.warnings).toContain(
        "Turn condition not met: Can only be played after turn 5"
      );
    });
  });

  describe("canCardsStack", () => {
    it("should allow stackable cards to stack", () => {
      const card1 = { ...mockCard, stackable: true };
      const card2 = { ...mockCard, id: "different-id", stackable: true };

      expect(canCardsStack(card1, card2)).toBe(true);
    });

    it("should not allow unique cards to stack with themselves", () => {
      const card1 = { ...mockCard, unique: true, stackable: true };
      const card2 = { ...mockCard, unique: true, stackable: true };

      expect(canCardsStack(card1, card2)).toBe(false);
    });

    it("should not allow non-stackable cards to stack", () => {
      const card1 = { ...mockCard, stackable: false };
      const card2 = { ...mockCard, id: "different-id", stackable: true };

      expect(canCardsStack(card1, card2)).toBe(false);
    });

    it("should not allow break weather cards to stack", () => {
      const card1 = { ...mockBreakCard, stackable: true };
      const card2 = { ...mockCard, stackable: true };

      expect(canCardsStack(card1, card2)).toBe(false);
    });
  });

  describe("createActiveCard", () => {
    it("should create active card with correct properties", () => {
      const activeCard = createActiveCard(mockCard, 1, "player1");

      expect(activeCard.card).toBe(mockCard);
      expect(activeCard.playedTurn).toBe(1);
      expect(activeCard.remainingDuration).toBe(3);
      expect(activeCard.playerId).toBe("player1");
      expect(activeCard.effectsApplied).toEqual(mockCard.effect);
    });

    it("should handle permanent cards", () => {
      const permanentCard = { ...mockCard, duration: 0 };
      const activeCard = createActiveCard(permanentCard, 1);

      expect(activeCard.remainingDuration).toBe(-1);
    });
  });

  describe("filterExpiredCards", () => {
    it("should remove expired cards", () => {
      const activeCards: ActiveCard[] = [
        {
          card: mockCard,
          playedTurn: 1,
          remainingDuration: 2,
        },
        {
          card: { ...mockCard, id: "expired" },
          playedTurn: 1,
          remainingDuration: 0,
        },
      ];

      const filtered = filterExpiredCards(activeCards, 5);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].card.id).toBe("test-card-1");
    });

    it("should keep permanent cards", () => {
      const activeCards: ActiveCard[] = [
        {
          card: { ...mockCard, duration: 0 },
          playedTurn: 1,
          remainingDuration: -1,
        },
      ];

      const filtered = filterExpiredCards(activeCards, 10);
      expect(filtered).toHaveLength(1);
    });
  });

  describe("getCardWeatherOptions", () => {
    it("should return single weather option", () => {
      const options = getCardWeatherOptions(mockCard);
      expect(options).toEqual(["Sunny"]);
    });

    it("should return multiple weather options", () => {
      const multiWeatherCard: WeatherCard = {
        ...mockCard,
        weather: "Sunny",
        weatherOptions: ["Cloudy", "Warm"],
      };

      const options = getCardWeatherOptions(multiWeatherCard);
      expect(options).toEqual(["Sunny", "Cloudy", "Warm"]);
    });

    it("should remove duplicates", () => {
      const duplicateCard: WeatherCard = {
        ...mockCard,
        weather: "Sunny",
        weatherOptions: ["Sunny", "Cloudy"],
      };

      const options = getCardWeatherOptions(duplicateCard);
      expect(options).toEqual(["Sunny", "Cloudy"]);
    });

    it("should return empty array for cards without weather", () => {
      const noWeatherCard: WeatherCard = {
        ...mockBreakCard,
      };

      const options = getCardWeatherOptions(noWeatherCard);
      expect(options).toEqual([]);
    });
  });
});
