/**
 * Tests for card-weather integration
 */

import { IntegratedWeatherManager } from "../manager/integrated-weather-manager";
import { WeatherConfigLoader } from "../config/config-loader";
import { WeatherCard, PlayerHand, WeatherType, ElementType } from "../types";
import defaultWeatherConfig from "../config/weather-effects.json";

describe("Card-Weather Integration", () => {
  let manager: IntegratedWeatherManager;
  let config: unknown;

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
    const configLoader = WeatherConfigLoader.getInstance();
    config = configLoader.loadFromData(defaultWeatherConfig);
    manager = new IntegratedWeatherManager(config);
  });

  describe("weather card integration", () => {
    it("should play weather cards and update weather state", () => {
      const playerHand = createMockPlayerHand();
      const initialWeather = manager.getCurrentWeather();

      const result = manager.playWeatherCard(
        mockWeatherCard,
        playerHand,
        "player1"
      );

      expect(result.valid).toBe(true);
      expect(result.weatherChange).toEqual([...initialWeather, "Sunny"]);
      expect(manager.getCurrentWeather()).toContain("Sunny");
    });

    it("should handle break weather cards", () => {
      const playerHand = createMockPlayerHand();

      // First set some weather
      manager.setWeather(["Stormy", "Windy"]);
      expect(manager.getCurrentWeather()).toEqual(["Stormy", "Windy"]);

      // Play break weather card
      const result = manager.playBreakWeatherCard(
        mockBreakCard,
        playerHand,
        "player1"
      );

      expect(result.valid).toBe(true);
      expect(manager.getCurrentWeather()).toEqual([]);
    });

    it("should reject non-break cards in playBreakWeatherCard", () => {
      const playerHand = createMockPlayerHand();

      const result = manager.playBreakWeatherCard(
        mockWeatherCard,
        playerHand,
        "player1"
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toContain("not a break weather card");
    });

    it("should combine weather and card effects", () => {
      const playerHand = createMockPlayerHand();

      // Set initial weather that affects elements
      manager.setWeather(["Hot"]); // Assuming Hot gives Fire bonus

      // Play a card with Fire effect
      manager.playWeatherCard(mockBuffCard, playerHand, "player1");

      const modifiers = manager.getElementalModifiers();

      // Should have both weather and card effects
      expect(modifiers.Fire).toBeGreaterThan(15); // Card effect + weather effect
    });

    it("should validate card plays against current weather", () => {
      const playerHand = createMockPlayerHand();

      // Set conflicting weather
      manager.setWeather(["Cold"]);

      // Try to play a hot weather card (should be validated)
      const hotCard: WeatherCard = {
        ...mockWeatherCard,
        weather: "Hot",
      };

      const validation = manager.validateCardPlay(hotCard, playerHand);

      // This should fail due to Hot/Cold conflict
      expect(validation.valid).toBe(false);
    });

    it("should track active cards in weather state", () => {
      const playerHand = createMockPlayerHand();

      manager.playWeatherCard(mockWeatherCard, playerHand, "player1");

      const weatherState = manager.getCurrentWeatherState();
      expect(weatherState.activeCards).toHaveLength(1);
      expect(weatherState.activeCards[0].card.id).toBe("sunny-card");
    });
  });

  describe("turn management integration", () => {
    it("should advance both weather and card systems", () => {
      const playerHand = createMockPlayerHand();

      // Play a card with duration
      manager.playWeatherCard(mockBuffCard, playerHand, "player1");

      expect(manager.getActiveCards()).toHaveLength(1);
      expect(manager.getCurrentTurn()).toBe(1);

      // Advance turn
      manager.advanceTurn();

      expect(manager.getCurrentTurn()).toBe(2);
      expect(manager.getActiveCards()[0].remainingDuration).toBe(1); // Duration decreased
    });

    it("should expire cards and update effects", () => {
      const playerHand = createMockPlayerHand();

      // Play a card with duration 1
      const shortCard: WeatherCard = {
        ...mockBuffCard,
        duration: 1,
      };

      manager.playWeatherCard(shortCard, playerHand, "player1");
      expect(manager.getActiveCards()).toHaveLength(1);

      // Advance turn - card should expire
      manager.advanceTurn();
      expect(manager.getActiveCards()).toHaveLength(0);
    });
  });

  describe("weather validation integration", () => {
    it("should prevent invalid weather combinations from cards", () => {
      const playerHand = createMockPlayerHand();

      // Set up conflicting weather
      manager.setWeather(["Cold"]);

      const hotCard: WeatherCard = {
        ...mockWeatherCard,
        weather: "Hot",
      };

      const handWithHotCard: PlayerHand = {
        ...playerHand,
        cards: [hotCard],
      };

      const result = manager.playWeatherCard(
        hotCard,
        handWithHotCard,
        "player1"
      );
      expect(result.valid).toBe(false);
    });

    it("should validate weather combinations", () => {
      expect(manager.validateWeatherCombination(["Sunny", "Warm"])).toBe(true);
      expect(manager.validateWeatherCombination(["Hot", "Cold"])).toBe(false);
    });

    it("should check if card play would be valid", () => {
      const playerHand = createMockPlayerHand();

      expect(manager.wouldCardPlayBeValid(mockWeatherCard, playerHand)).toBe(
        true
      );

      // Set conflicting weather
      manager.setWeather(["Snowy"]);

      const sunnyCard: WeatherCard = {
        ...mockWeatherCard,
        weather: "Sunny",
      };

      expect(manager.wouldCardPlayBeValid(sunnyCard, playerHand)).toBe(false);
    });
  });

  describe("effect calculation integration", () => {
    it("should apply effect limits to combined modifiers", () => {
      const playerHand = createMockPlayerHand();

      // Create cards with high effects
      const highFireCard1: WeatherCard = {
        ...mockBuffCard,
        id: "high-fire-1",
        effect: { Fire: 30 },
      };

      const highFireCard2: WeatherCard = {
        ...mockBuffCard,
        id: "high-fire-2",
        effect: { Fire: 25 },
      };

      const handWithHighCards: PlayerHand = {
        ...playerHand,
        cards: [highFireCard1, highFireCard2],
      };

      // Play both cards
      manager.playWeatherCard(highFireCard1, handWithHighCards, "player1");
      manager.playWeatherCard(highFireCard2, handWithHighCards, "player1");

      const modifiers = manager.getElementalModifiers();

      // Should be capped at 40
      expect(modifiers.Fire).toBe(40);
    });

    it("should handle negative effects correctly", () => {
      const playerHand = createMockPlayerHand();

      const negativeCard: WeatherCard = {
        ...mockBuffCard,
        effect: { Fire: -20, Ice: 10 },
      };

      const handWithNegativeCard: PlayerHand = {
        ...playerHand,
        cards: [negativeCard],
      };

      manager.playWeatherCard(negativeCard, handWithNegativeCard, "player1");

      const modifiers = manager.getElementalModifiers();
      expect(modifiers.Fire).toBeLessThanOrEqual(0);
      expect(modifiers.Ice).toBeGreaterThanOrEqual(0);
    });
  });

  describe("card sequence and batch operations", () => {
    it("should play card sequences", () => {
      const playerHand1 = createMockPlayerHand();
      const playerHand2 = createMockPlayerHand();

      const cardPlays = [
        { card: mockWeatherCard, playerHand: playerHand1, playerId: "player1" },
        { card: mockBuffCard, playerHand: playerHand2, playerId: "player2" },
      ];

      const results = manager.playCardSequence(cardPlays);

      expect(results).toHaveLength(2);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(true);
      expect(manager.getActiveCards()).toHaveLength(2);
    });

    it("should stop sequence on invalid card", () => {
      const playerHand = createMockPlayerHand();

      const invalidCard: WeatherCard = {
        ...mockWeatherCard,
        id: "not-in-hand",
      };

      const cardPlays = [
        { card: mockWeatherCard, playerHand, playerId: "player1" },
        { card: invalidCard, playerHand, playerId: "player1" },
        { card: mockBuffCard, playerHand, playerId: "player1" },
      ];

      const results = manager.playCardSequence(cardPlays);

      expect(results).toHaveLength(2); // Stopped after invalid card
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(false);
    });

    it("should get possible weather combinations from cards", () => {
      const cards = [mockWeatherCard, mockBreakCard];
      const possibilities = manager.getPossibleWeatherFromCards(cards);

      expect(possibilities).toHaveLength(2);
      expect(possibilities[0]).toContain("Sunny"); // From weather card
      expect(possibilities[1]).toEqual([]); // From break card
    });
  });

  describe("system reset and state management", () => {
    it("should reset to natural weather", () => {
      const playerHand = createMockPlayerHand();

      // Play some cards and set weather
      manager.playWeatherCard(mockWeatherCard, playerHand, "player1");
      manager.playWeatherCard(mockBuffCard, playerHand, "player1");
      manager.setWeather(["Stormy", "Windy"]);

      expect(manager.getActiveCards()).toHaveLength(2);
      expect(manager.getCurrentWeather()).toEqual(["Stormy", "Windy"]);

      // Reset to natural weather
      manager.resetToNaturalWeather();

      expect(manager.getActiveCards()).toHaveLength(0);
      expect(manager.getCurrentWeather()).toEqual([]); // Natural state
    });

    it("should reset entire system", () => {
      const playerHand = createMockPlayerHand();

      // Set up some state
      manager.playWeatherCard(mockWeatherCard, playerHand, "player1");
      manager.advanceTurn();
      manager.advanceTurn();

      expect(manager.getCurrentTurn()).toBe(3);
      expect(manager.getCardPlayHistory()).toHaveLength(1);

      // Reset everything
      manager.reset();

      expect(manager.getCurrentTurn()).toBe(1);
      expect(manager.getActiveCards()).toHaveLength(0);
      expect(manager.getCardPlayHistory()).toHaveLength(0);
    });
  });

  describe("statistics and monitoring", () => {
    it("should provide card statistics", () => {
      // Play some cards
      manager.playWeatherCard(
        mockWeatherCard,
        createMockPlayerHand(),
        "player1"
      );
      manager.advanceTurn();
      manager.playWeatherCard(
        mockWeatherCard,
        createMockPlayerHand(),
        "player1"
      );

      const stats = manager.getCardStatistics();
      expect(stats.totalCardsPlayed).toBe(2);
      expect(stats.uniqueCardsPlayed).toBe(1);
      expect(stats.mostPlayedCard).toBe("sunny-card");
    });

    it("should track expiring cards", () => {
      const playerHand = createMockPlayerHand();

      // Play card with duration 2
      manager.playWeatherCard(mockBuffCard, playerHand, "player1");

      expect(manager.getExpiringCards()).toHaveLength(0);

      // Advance one turn
      manager.advanceTurn();
      expect(manager.getExpiringCards()).toHaveLength(1);
    });

    it("should provide access to underlying managers", () => {
      const weatherManager = manager.getWeatherManager();
      const cardManager = manager.getCardManager();

      expect(weatherManager).toBeDefined();
      expect(cardManager).toBeDefined();
      expect(typeof weatherManager.getCurrentWeather).toBe("function");
      expect(typeof cardManager.getActiveCards).toBe("function");
    });
  });
});
