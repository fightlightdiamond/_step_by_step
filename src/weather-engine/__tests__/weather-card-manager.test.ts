/**
 * Tests for weather card manager
 */

import { WeatherCardManager } from "../manager/weather-card-manager";
import {
  WeatherCard,
  PlayerHand,
  WeatherType,
  SeasonType,
  ElementType,
} from "../types";

describe("WeatherCardManager", () => {
  let manager: WeatherCardManager;

  const mockWeatherCard: WeatherCard = {
    id: "sunny-card",
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

  const mockBuffCard: WeatherCard = {
    id: "buff-card",
    type: "WeatherBuff",
    name: "Fire Boost",
    description: "Boosts fire damage",
    rarity: "Uncommon",
    cost: 3,
    effect: { Fire: 15 },
    duration: 2,
    stackable: true,
    unique: false,
  };

  const createMockPlayerHand = (): PlayerHand => ({
    playerId: "player1",
    cards: [mockWeatherCard, mockBreakCard, mockBuffCard],
    maxHandSize: 7,
    cardsPlayedThisTurn: 0,
    cardsPlayedThisGame: new Map(),
  });

  beforeEach(() => {
    manager = new WeatherCardManager();
  });

  describe("playCard", () => {
    it("should successfully play a valid weather card", () => {
      const currentWeather: WeatherType[] = ["Cloudy"];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      const result = manager.playCard(
        mockWeatherCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      expect(result.valid).toBe(true);
      expect(result.weatherChange).toEqual(["Cloudy", "Sunny"]);
      expect(result.effectModifiers).toEqual({
        Fire: 10,
        Ice: -5,
        Lightning: 0,
      });
    });

    it("should handle break weather cards", () => {
      const currentWeather: WeatherType[] = ["Stormy", "Windy"];
      const currentSeason: SeasonType = "Winter";
      const elementalModifiers = { Fire: 5, Ice: 10, Lightning: -3 };

      const result = manager.playCard(
        mockBreakCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      expect(result.valid).toBe(true);
      expect(result.weatherChange).toEqual([]); // Weather cleared
      expect(result.effectModifiers).toEqual({
        Fire: 5,
        Ice: 10,
        Lightning: -3,
      }); // No effect change
    });

    it("should handle buff cards with effects", () => {
      const currentWeather: WeatherType[] = ["Sunny"];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 5, Ice: 0, Lightning: 0 };

      const result = manager.playCard(
        mockBuffCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      expect(result.valid).toBe(true);
      expect(result.weatherChange).toEqual(["Sunny"]); // No weather change
      expect(result.effectModifiers).toEqual({
        Fire: 20,
        Ice: 0,
        Lightning: 0,
      }); // Fire boosted
    });

    it("should reject invalid card plays", () => {
      const invalidCard: WeatherCard = {
        ...mockWeatherCard,
        id: "not-in-hand",
      };

      const currentWeather: WeatherType[] = ["Cloudy"];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      const result = manager.playCard(
        invalidCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toContain("INVALID_CARD");
    });

    it("should update player hand after playing card", () => {
      const handCopy = createMockPlayerHand();

      const currentWeather: WeatherType[] = ["Cloudy"];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      manager.playCard(
        mockWeatherCard,
        handCopy,
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      expect(handCopy.cards).toHaveLength(2); // Card removed from hand
      expect(handCopy.cardsPlayedThisTurn).toBe(1);
      expect(handCopy.cardsPlayedThisGame.get("sunny-card")).toBe(1);
    });
  });

  describe("active card management", () => {
    it("should track active cards", () => {
      const currentWeather: WeatherType[] = [];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      manager.playCard(
        mockWeatherCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      const activeCards = manager.getActiveCards();
      expect(activeCards).toHaveLength(1);
      expect(activeCards[0].card.id).toBe("sunny-card");
      expect(activeCards[0].remainingDuration).toBe(3);
    });

    it("should calculate cumulative effects", () => {
      const currentWeather: WeatherType[] = [];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      // Play weather card
      manager.playCard(
        mockWeatherCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      // Play buff card
      manager.playCard(
        mockBuffCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      const effects = manager.getCumulativeEffects();
      expect(effects).toEqual({
        Fire: 25, // 10 + 15
        Ice: -5,
        Lightning: 0,
      });
    });

    it("should remove expired cards", () => {
      const currentWeather: WeatherType[] = [];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      // Play a card with duration 2
      manager.playCard(
        mockBuffCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      expect(manager.getActiveCards()).toHaveLength(1);

      // Advance 2 turns
      manager.advanceTurn();
      expect(manager.getActiveCards()).toHaveLength(1);
      expect(manager.getActiveCards()[0].remainingDuration).toBe(1);

      manager.advanceTurn();
      expect(manager.getActiveCards()).toHaveLength(0); // Card expired
    });

    it("should handle unique cards", () => {
      const uniqueCard: WeatherCard = {
        ...mockWeatherCard,
        unique: true,
      };

      const handWithUniqueCard = (): PlayerHand => ({
        playerId: "player1",
        cards: [uniqueCard],
        maxHandSize: 7,
        cardsPlayedThisTurn: 0,
        cardsPlayedThisGame: new Map(),
      });

      const currentWeather: WeatherType[] = [];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      // Play first copy
      manager.playCard(
        uniqueCard,
        handWithUniqueCard(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      expect(manager.getActiveCards()).toHaveLength(1);

      // Try to play second copy - should replace the first
      manager.playCard(
        uniqueCard,
        handWithUniqueCard(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      expect(manager.getActiveCards()).toHaveLength(1); // Still only one active
    });
  });

  describe("turn management", () => {
    it("should track current turn", () => {
      expect(manager.getCurrentTurn()).toBe(1);

      manager.advanceTurn();
      expect(manager.getCurrentTurn()).toBe(2);

      manager.setCurrentTurn(5);
      expect(manager.getCurrentTurn()).toBe(5);
    });

    it("should process turn end correctly", () => {
      const currentWeather: WeatherType[] = [];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      // Play a card with duration 1
      const shortCard: WeatherCard = {
        ...mockBuffCard,
        duration: 1,
      };

      manager.playCard(
        shortCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      expect(manager.getActiveCards()).toHaveLength(1);

      manager.processTurnEnd();
      expect(manager.getActiveCards()).toHaveLength(0); // Card expired
    });
  });

  describe("play history", () => {
    it("should record play history", () => {
      const currentWeather: WeatherType[] = ["Cloudy"];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      manager.playCard(
        mockWeatherCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      const history = manager.getPlayHistory();
      expect(history).toHaveLength(1);
      expect(history[0].cardId).toBe("sunny-card");
      expect(history[0].playerId).toBe("player1");
      expect(history[0].turn).toBe(1);
      expect(history[0].weatherBefore).toEqual(["Cloudy"]);
      expect(history[0].weatherAfter).toEqual(["Cloudy", "Sunny"]);
    });

    it("should filter history by player", () => {
      const currentWeather: WeatherType[] = [];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      manager.playCard(
        mockWeatherCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      manager.playCard(
        mockBuffCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player2"
      );

      const player1History = manager.getPlayerPlayHistory("player1");
      expect(player1History).toHaveLength(1);
      expect(player1History[0].playerId).toBe("player1");

      const player2History = manager.getPlayerPlayHistory("player2");
      expect(player2History).toHaveLength(1);
      expect(player2History[0].playerId).toBe("player2");
    });
  });

  describe("utility methods", () => {
    it("should check if card is active", () => {
      expect(manager.isCardActive("sunny-card")).toBe(false);

      const currentWeather: WeatherType[] = [];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      manager.playCard(
        mockWeatherCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      expect(manager.isCardActive("sunny-card")).toBe(true);
    });

    it("should get active card by ID", () => {
      const currentWeather: WeatherType[] = [];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      manager.playCard(
        mockWeatherCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      const activeCard = manager.getActiveCard("sunny-card");
      expect(activeCard).toBeDefined();
      expect(activeCard!.card.id).toBe("sunny-card");

      const nonExistentCard = manager.getActiveCard("non-existent");
      expect(nonExistentCard).toBeUndefined();
    });

    it("should force expire cards", () => {
      const currentWeather: WeatherType[] = [];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      manager.playCard(
        mockWeatherCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      expect(manager.isCardActive("sunny-card")).toBe(true);

      const expired = manager.expireCard("sunny-card");
      expect(expired).toBe(true);
      expect(manager.isCardActive("sunny-card")).toBe(false);
    });

    it("should get expiring cards", () => {
      const currentWeather: WeatherType[] = [];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      // Play card with duration 2
      manager.playCard(
        mockBuffCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      expect(manager.getExpiringCards()).toHaveLength(0);

      // Advance one turn - card should have 1 turn left
      manager.advanceTurn();
      expect(manager.getExpiringCards()).toHaveLength(1);
    });

    it("should provide card statistics", () => {
      const currentWeather: WeatherType[] = [];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      // Play same card twice
      manager.playCard(
        mockWeatherCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      manager.advanceTurn();

      manager.playCard(
        mockWeatherCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      const stats = manager.getCardStatistics();
      expect(stats.totalCardsPlayed).toBe(2);
      expect(stats.uniqueCardsPlayed).toBe(1);
      expect(stats.mostPlayedCard).toBe("sunny-card");
      expect(stats.averageCardsPerTurn).toBe(1); // 2 cards / 2 turns
    });

    it("should reset manager state", () => {
      const currentWeather: WeatherType[] = [];
      const currentSeason: SeasonType = "Summer";
      const elementalModifiers = { Fire: 0, Ice: 0, Lightning: 0 };

      manager.playCard(
        mockWeatherCard,
        createMockPlayerHand(),
        currentWeather,
        currentSeason,
        elementalModifiers,
        "player1"
      );

      manager.advanceTurn();

      expect(manager.getActiveCards()).toHaveLength(1);
      expect(manager.getPlayHistory()).toHaveLength(1);
      expect(manager.getCurrentTurn()).toBe(2);

      manager.reset();

      expect(manager.getActiveCards()).toHaveLength(0);
      expect(manager.getPlayHistory()).toHaveLength(0);
      expect(manager.getCurrentTurn()).toBe(1);
    });
  });
});
