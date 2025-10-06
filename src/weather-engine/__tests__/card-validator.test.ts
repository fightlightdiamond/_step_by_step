/**
 * Tests for weather card validator
 */

import { CardValidator } from "../validation/card-validator";
import {
  WeatherCard,
  ActiveCard,
  PlayerHand,
  WeatherType,
  SeasonType,
  ElementType,
} from "../types";

describe("CardValidator", () => {
  let validator: CardValidator;

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

  const mockPlayerHand: PlayerHand = {
    playerId: "player1",
    cards: [mockCard],
    maxHandSize: 7,
    cardsPlayedThisTurn: 0,
    cardsPlayedThisGame: new Map(),
  };

  const mockActiveCards: ActiveCard[] = [];
  const mockCurrentWeather: WeatherType[] = ["Cloudy"];
  const mockCurrentTurn = 1;
  const mockCurrentSeason: SeasonType = "Summer";
  const mockElementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

  beforeEach(() => {
    validator = new CardValidator();
  });

  describe("validateCardPlay", () => {
    it("should validate a basic valid card play", () => {
      const result = validator.validateCardPlay(
        mockCard,
        mockPlayerHand,
        mockActiveCards,
        mockCurrentWeather,
        mockCurrentTurn,
        mockCurrentSeason,
        mockElementalModifiers
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid card structure", () => {
      const invalidCard = {
        ...mockCard,
        id: "", // Invalid empty ID
      };

      const result = validator.validateCardPlay(
        invalidCard,
        mockPlayerHand,
        mockActiveCards,
        mockCurrentWeather,
        mockCurrentTurn,
        mockCurrentSeason,
        mockElementalModifiers
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("INVALID_CARD");
    });

    it("should reject card not in hand", () => {
      const cardNotInHand: WeatherCard = {
        ...mockCard,
        id: "not-in-hand",
      };

      const result = validator.validateCardPlay(
        cardNotInHand,
        mockPlayerHand,
        mockActiveCards,
        mockCurrentWeather,
        mockCurrentTurn,
        mockCurrentSeason,
        mockElementalModifiers
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("INVALID_CARD");
    });

    it("should reject expired cards", () => {
      const expiredCard: WeatherCard = {
        ...mockCard,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      };

      const handWithExpiredCard: PlayerHand = {
        ...mockPlayerHand,
        cards: [expiredCard],
      };

      const result = validator.validateCardPlay(
        expiredCard,
        handWithExpiredCard,
        mockActiveCards,
        mockCurrentWeather,
        mockCurrentTurn,
        mockCurrentSeason,
        mockElementalModifiers
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("CARD_EXPIRED");
    });

    it("should enforce per-turn play limits", () => {
      const limitedCard: WeatherCard = {
        ...mockCard,
        maxPlaysPerTurn: 1,
      };

      const handWithLimitedCard: PlayerHand = {
        ...mockPlayerHand,
        cards: [limitedCard],
        cardsPlayedThisTurn: 1, // Already played once this turn
      };

      const result = validator.validateCardPlay(
        limitedCard,
        handWithLimitedCard,
        mockActiveCards,
        mockCurrentWeather,
        mockCurrentTurn,
        mockCurrentSeason,
        mockElementalModifiers
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("MAX_PLAYS_EXCEEDED");
    });

    it("should enforce per-game play limits", () => {
      const limitedCard: WeatherCard = {
        ...mockCard,
        maxPlaysPerGame: 2,
      };

      const handWithLimitedCard: PlayerHand = {
        ...mockPlayerHand,
        cards: [limitedCard],
        cardsPlayedThisGame: new Map([["test-card-1", 2]]), // Already played twice
      };

      const result = validator.validateCardPlay(
        limitedCard,
        handWithLimitedCard,
        mockActiveCards,
        mockCurrentWeather,
        mockCurrentTurn,
        mockCurrentSeason,
        mockElementalModifiers
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("MAX_PLAYS_EXCEEDED");
    });

    it("should enforce unique card constraints", () => {
      const uniqueCard: WeatherCard = {
        ...mockCard,
        unique: true,
      };

      const activeUniqueCard: ActiveCard = {
        card: uniqueCard,
        playedTurn: 1,
        remainingDuration: 2,
      };

      const handWithUniqueCard: PlayerHand = {
        ...mockPlayerHand,
        cards: [uniqueCard],
      };

      const result = validator.validateCardPlay(
        uniqueCard,
        handWithUniqueCard,
        [activeUniqueCard],
        mockCurrentWeather,
        mockCurrentTurn,
        mockCurrentSeason,
        mockElementalModifiers
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("DUPLICATE_UNIQUE_CARD");
    });

    it("should validate weather combinations", () => {
      const hotCard: WeatherCard = {
        ...mockCard,
        weather: "Hot",
      };

      const handWithHotCard: PlayerHand = {
        ...mockPlayerHand,
        cards: [hotCard],
      };

      const coldWeather: WeatherType[] = ["Cold"]; // Opposite of Hot

      const result = validator.validateCardPlay(
        hotCard,
        handWithHotCard,
        mockActiveCards,
        coldWeather,
        mockCurrentTurn,
        mockCurrentSeason,
        mockElementalModifiers
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("INVALID_WEATHER_COMBINATION");
    });

    it("should allow break weather cards regardless of current weather", () => {
      const breakCard: WeatherCard = {
        id: "break-card",
        type: "BreakWeather",
        name: "Clear Skies",
        description: "Removes all weather",
        rarity: "Common",
        cost: 1,
        breaksWeather: true,
        stackable: false,
        unique: false,
      };

      const handWithBreakCard: PlayerHand = {
        ...mockPlayerHand,
        cards: [breakCard],
      };

      const result = validator.validateCardPlay(
        breakCard,
        handWithBreakCard,
        mockActiveCards,
        ["Hot", "Cold"], // Conflicting weather
        mockCurrentTurn,
        mockCurrentSeason,
        mockElementalModifiers
      );

      expect(result.valid).toBe(true);
    });
  });

  describe("validateDeck", () => {
    it("should validate a valid deck", () => {
      const validDeck = [
        mockCard,
        { ...mockCard, id: "card-2", name: "Rainy Day", weather: "Rainy" },
      ];

      const result = validator.validateDeck(validDeck);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject deck with duplicate unique cards", () => {
      const uniqueCard: WeatherCard = {
        ...mockCard,
        unique: true,
      };

      const invalidDeck = [uniqueCard, uniqueCard];

      const result = validator.validateDeck(invalidDeck);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("DUPLICATE_UNIQUE_CARD");
    });

    it("should reject deck with invalid cards", () => {
      const invalidCard = {
        ...mockCard,
        type: "Weather" as const,
        weather: undefined, // Weather cards must have weather
      };

      const invalidDeck = [invalidCard];

      const result = validator.validateDeck(invalidDeck);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("INVALID_CARD");
    });
  });

  describe("validateHandSize", () => {
    it("should validate normal hand size", () => {
      const result = validator.validateHandSize(mockPlayerHand);
      expect(result.valid).toBe(true);
    });

    it("should reject oversized hand", () => {
      const oversizedHand: PlayerHand = {
        ...mockPlayerHand,
        cards: new Array(10).fill(mockCard), // 10 cards > maxHandSize of 7
        maxHandSize: 7,
      };

      const result = validator.validateHandSize(oversizedHand);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("HAND_SIZE_EXCEEDED");
    });
  });

  describe("card type validation", () => {
    it("should validate Weather cards require weather property", () => {
      const weatherCard: WeatherCard = {
        id: "weather-1",
        type: "Weather",
        name: "Test Weather",
        description: "Test",
        rarity: "Common",
        cost: 1,
        weather: "Sunny",
        stackable: true,
        unique: false,
      };

      const handWithWeatherCard: PlayerHand = {
        ...mockPlayerHand,
        cards: [weatherCard],
      };

      const result = validator.validateCardPlay(
        weatherCard,
        handWithWeatherCard,
        mockActiveCards,
        mockCurrentWeather,
        mockCurrentTurn,
        mockCurrentSeason,
        mockElementalModifiers
      );

      expect(result.valid).toBe(true);
    });

    it("should validate BreakWeather cards require breaksWeather flag", () => {
      const breakCard: WeatherCard = {
        id: "break-1",
        type: "BreakWeather",
        name: "Clear Skies",
        description: "Removes weather",
        rarity: "Common",
        cost: 1,
        breaksWeather: true,
        stackable: false,
        unique: false,
      };

      const handWithBreakCard: PlayerHand = {
        ...mockPlayerHand,
        cards: [breakCard],
      };

      const result = validator.validateCardPlay(
        breakCard,
        handWithBreakCard,
        mockActiveCards,
        mockCurrentWeather,
        mockCurrentTurn,
        mockCurrentSeason,
        mockElementalModifiers
      );

      expect(result.valid).toBe(true);
    });

    it("should validate WeatherBuff cards require effect property", () => {
      const buffCard: WeatherCard = {
        id: "buff-1",
        type: "WeatherBuff",
        name: "Fire Boost",
        description: "Boosts fire damage",
        rarity: "Common",
        cost: 2,
        effect: { Fire: 15 },
        stackable: true,
        unique: false,
      };

      const handWithBuffCard: PlayerHand = {
        ...mockPlayerHand,
        cards: [buffCard],
      };

      const result = validator.validateCardPlay(
        buffCard,
        handWithBuffCard,
        mockActiveCards,
        mockCurrentWeather,
        mockCurrentTurn,
        mockCurrentSeason,
        mockElementalModifiers
      );

      expect(result.valid).toBe(true);
    });
  });
});
