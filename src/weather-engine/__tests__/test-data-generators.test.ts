/**
 * Test Data Generators for Weather Scenarios
 * Generates comprehensive test data for various weather scenarios
 */

import { describe, it, expect } from "@jest/globals";
import { WeatherType, WeatherCard, ElementType, SeasonType } from "../types";

/**
 * Weather scenario generator for comprehensive testing
 */
export class WeatherScenarioGenerator {
  private static readonly WEATHER_TYPES: WeatherType[] = [
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

  private static readonly ELEMENT_TYPES: ElementType[] = [
    "Fire",
    "Ice",
    "Lightning",
  ];

  private static readonly SEASON_TYPES: SeasonType[] = [
    "Winter",
    "Spring",
    "Summer",
    "Autumn",
  ];

  /**
   * Generate valid weather combinations
   */
  static generateValidWeatherCombinations(count: number): WeatherType[][] {
    const combinations: WeatherType[][] = [];
    const validPairs = [
      ["Sunny", "Hot"],
      ["Sunny", "Warm"],
      ["Rainy", "Cloudy"],
      ["Rainy", "Cool"],
      ["Cold", "Snowy"],
      ["Cold", "Foggy"],
      ["Windy", "Cloudy"],
      ["Stormy", "Rainy"],
      ["Hot", "Humid"],
      ["Warm", "Sunny"],
    ];

    for (let i = 0; i < count; i++) {
      if (i < this.WEATHER_TYPES.length) {
        // Single weather types
        combinations.push([this.WEATHER_TYPES[i]]);
      } else if (i < this.WEATHER_TYPES.length + validPairs.length) {
        // Valid pairs
        const pairIndex = i - this.WEATHER_TYPES.length;
        combinations.push([...validPairs[pairIndex]]);
      } else {
        // Random valid combinations
        const baseWeather =
          this.WEATHER_TYPES[
            Math.floor(Math.random() * this.WEATHER_TYPES.length)
          ];
        const compatibleWeather = this.getCompatibleWeather(baseWeather);

        if (compatibleWeather.length > 0) {
          const additional =
            compatibleWeather[
              Math.floor(Math.random() * compatibleWeather.length)
            ];
          combinations.push([baseWeather, additional]);
        } else {
          combinations.push([baseWeather]);
        }
      }
    }

    return combinations;
  }

  /**
   * Generate invalid weather combinations for testing validation
   */
  static generateInvalidWeatherCombinations(count: number): WeatherType[][] {
    const combinations: WeatherType[][] = [];
    const invalidPairs = [
      ["Hot", "Cold"],
      ["Sunny", "Snowy"],
      ["Hot", "Snowy"],
      ["Cold", "Humid"],
      ["Sunny", "Stormy"],
    ];

    for (let i = 0; i < count; i++) {
      if (i < invalidPairs.length) {
        combinations.push([...invalidPairs[i]]);
      } else {
        // Generate random invalid combinations
        const weather1 =
          this.WEATHER_TYPES[
            Math.floor(Math.random() * this.WEATHER_TYPES.length)
          ];
        const opposites = this.getOppositeWeather(weather1);

        if (opposites.length > 0) {
          const opposite =
            opposites[Math.floor(Math.random() * opposites.length)];
          combinations.push([weather1, opposite]);
        } else {
          // Fallback to known invalid pair
          combinations.push(["Hot", "Cold"]);
        }
      }
    }

    return combinations;
  }

  /**
   * Generate seasonal weather scenarios
   */
  static generateSeasonalScenarios(count: number): Array<{
    season: SeasonType;
    month: number;
    expectedWeather: WeatherType[];
    description: string;
  }> {
    const scenarios = [];
    const seasonalWeather = {
      Winter: {
        months: [12, 1, 2],
        weather: ["Cold", "Snowy", "Foggy", "Windy"],
        description: "Winter weather patterns",
      },
      Spring: {
        months: [3, 4, 5],
        weather: ["Rainy", "Warm", "Windy", "Cloudy"],
        description: "Spring transition weather",
      },
      Summer: {
        months: [6, 7, 8],
        weather: ["Hot", "Sunny", "Humid", "Warm"],
        description: "Summer heat patterns",
      },
      Autumn: {
        months: [9, 10, 11],
        weather: ["Cool", "Cloudy", "Windy", "Rainy"],
        description: "Autumn cooling patterns",
      },
    };

    for (let i = 0; i < count; i++) {
      const seasons = Object.keys(seasonalWeather) as SeasonType[];
      const season = seasons[i % seasons.length];
      const seasonData = seasonalWeather[season];
      const month =
        seasonData.months[Math.floor(Math.random() * seasonData.months.length)];
      const weatherCount = Math.floor(Math.random() * 3) + 1; // 1-3 weather types
      const expectedWeather = [];

      for (let j = 0; j < weatherCount; j++) {
        const weather =
          seasonData.weather[
            Math.floor(Math.random() * seasonData.weather.length)
          ];
        if (!expectedWeather.includes(weather)) {
          expectedWeather.push(weather);
        }
      }

      scenarios.push({
        season,
        month,
        expectedWeather,
        description: `${seasonData.description} for month ${month}`,
      });
    }

    return scenarios;
  }

  /**
   * Generate weather cards for testing
   */
  static generateWeatherCards(count: number): WeatherCard[] {
    const cards: WeatherCard[] = [];
    const cardTypes = [
      "Weather",
      "BreakWeather",
      "WeatherBuff",
      "WeatherNerf",
    ] as const;

    for (let i = 0; i < count; i++) {
      const cardType = cardTypes[i % cardTypes.length];

      const card: WeatherCard = {
        id: `test-card-${i}`,
        type: cardType,
        name: `Test ${cardType} Card ${i}`,
        description: `Generated test card ${i} of type ${cardType}`,
        cost: Math.floor(Math.random() * 5) + 1,
        duration: Math.floor(Math.random() * 3) + 1,
      };

      if (cardType === "Weather") {
        card.weather =
          this.WEATHER_TYPES[
            Math.floor(Math.random() * this.WEATHER_TYPES.length)
          ];
      }

      if (cardType === "WeatherBuff" || cardType === "WeatherNerf") {
        const element =
          this.ELEMENT_TYPES[
            Math.floor(Math.random() * this.ELEMENT_TYPES.length)
          ];
        const modifier =
          cardType === "WeatherBuff"
            ? Math.floor(Math.random() * 20) + 5
            : -(Math.floor(Math.random() * 20) + 5);

        card.effect = { [element]: modifier };
      }

      cards.push(card);
    }

    return cards;
  }

  /**
   * Generate game scenarios for comprehensive testing
   */
  static generateGameScenarios(count: number): Array<{
    name: string;
    turns: number;
    gameMode: string;
    weatherSequence: WeatherType[][];
    cardPlays: Array<{ turn: number; card: WeatherCard }>;
    expectedOutcomes: Array<{ turn: number; condition: string; expected: any }>;
  }> {
    const scenarios = [];
    const gameModes = [
      "12-month-campaign",
      "weather-chaos",
      "seasonal-event",
      "forecast-mode",
      "weather-survival",
    ];

    for (let i = 0; i < count; i++) {
      const gameMode = gameModes[i % gameModes.length];
      const turns =
        gameMode === "12-month-campaign"
          ? 12
          : Math.floor(Math.random() * 20) + 5;

      const weatherSequence = this.generateValidWeatherCombinations(turns);
      const cards = this.generateWeatherCards(Math.floor(turns / 2));
      const cardPlays = cards.map((card, index) => ({
        turn: Math.floor(Math.random() * turns) + 1,
        card,
      }));

      const expectedOutcomes = [];
      for (let turn = 1; turn <= Math.min(turns, 5); turn++) {
        expectedOutcomes.push({
          turn,
          condition: "weather_applied",
          expected: true,
        });

        if (turn % 3 === 0) {
          expectedOutcomes.push({
            turn,
            condition: "elemental_effects_calculated",
            expected: true,
          });
        }
      }

      scenarios.push({
        name: `${gameMode} scenario ${i}`,
        turns,
        gameMode,
        weatherSequence,
        cardPlays,
        expectedOutcomes,
      });
    }

    return scenarios;
  }

  /**
   * Generate performance test data
   */
  static generatePerformanceTestData(operationCount: number): Array<{
    operation: string;
    data: any;
    expectedMaxTime: number;
  }> {
    const operations = [];

    // Weather application operations
    for (let i = 0; i < operationCount / 4; i++) {
      operations.push({
        operation: "weather_application",
        data: {
          weather: this.generateValidWeatherCombinations(1)[0],
        },
        expectedMaxTime: 5, // 5ms max
      });
    }

    // Elemental calculation operations
    for (let i = 0; i < operationCount / 4; i++) {
      operations.push({
        operation: "elemental_calculation",
        data: {
          weather: this.generateValidWeatherCombinations(1)[0],
        },
        expectedMaxTime: 2, // 2ms max
      });
    }

    // Card play operations
    for (let i = 0; i < operationCount / 4; i++) {
      operations.push({
        operation: "card_play",
        data: {
          card: this.generateWeatherCards(1)[0],
        },
        expectedMaxTime: 10, // 10ms max
      });
    }

    // Validation operations
    for (let i = 0; i < operationCount / 4; i++) {
      operations.push({
        operation: "weather_validation",
        data: {
          weather:
            Math.random() < 0.7
              ? this.generateValidWeatherCombinations(1)[0]
              : this.generateInvalidWeatherCombinations(1)[0],
        },
        expectedMaxTime: 3, // 3ms max
      });
    }

    return operations;
  }

  /**
   * Generate edge case test data
   */
  static generateEdgeCases(): Array<{
    name: string;
    data: any;
    expectedBehavior: string;
  }> {
    return [
      {
        name: "empty_weather_array",
        data: { weather: [] },
        expectedBehavior: "should_handle_gracefully",
      },
      {
        name: "null_weather",
        data: { weather: null },
        expectedBehavior: "should_throw_error",
      },
      {
        name: "undefined_weather",
        data: { weather: undefined },
        expectedBehavior: "should_throw_error",
      },
      {
        name: "invalid_weather_type",
        data: { weather: ["InvalidWeather"] },
        expectedBehavior: "should_throw_error",
      },
      {
        name: "maximum_weather_types",
        data: { weather: this.WEATHER_TYPES.slice(0, 5) },
        expectedBehavior: "should_validate_combination",
      },
      {
        name: "duplicate_weather_types",
        data: { weather: ["Sunny", "Sunny", "Hot"] },
        expectedBehavior: "should_deduplicate",
      },
      {
        name: "card_without_id",
        data: {
          card: {
            type: "Weather",
            name: "No ID Card",
            description: "Card without ID",
          },
        },
        expectedBehavior: "should_throw_error",
      },
      {
        name: "card_with_invalid_type",
        data: {
          card: {
            id: "invalid-type-card",
            type: "InvalidType",
            name: "Invalid Type Card",
            description: "Card with invalid type",
          },
        },
        expectedBehavior: "should_throw_error",
      },
      {
        name: "negative_turn_number",
        data: { turn: -1 },
        expectedBehavior: "should_throw_error",
      },
      {
        name: "turn_exceeding_limit",
        data: { turn: 100 },
        expectedBehavior: "should_throw_error",
      },
    ];
  }

  // Helper methods
  private static getCompatibleWeather(weather: WeatherType): WeatherType[] {
    const compatibility: Record<WeatherType, WeatherType[]> = {
      Sunny: ["Hot", "Warm", "Windy"],
      Hot: ["Sunny", "Humid", "Warm"],
      Cold: ["Snowy", "Foggy", "Windy"],
      Rainy: ["Cloudy", "Cool", "Stormy"],
      Cloudy: ["Rainy", "Cool", "Windy"],
      Snowy: ["Cold", "Foggy", "Windy"],
      Windy: ["Cloudy", "Cool", "Cold"],
      Stormy: ["Rainy", "Cloudy", "Windy"],
      Foggy: ["Cold", "Cool"],
      Warm: ["Sunny", "Cloudy"],
      Cool: ["Cloudy", "Rainy", "Foggy"],
      Humid: ["Hot", "Warm"],
    };

    return compatibility[weather] || [];
  }

  private static getOppositeWeather(weather: WeatherType): WeatherType[] {
    const opposites: Record<WeatherType, WeatherType[]> = {
      Hot: ["Cold", "Snowy"],
      Cold: ["Hot", "Humid"],
      Sunny: ["Stormy", "Snowy"],
      Stormy: ["Sunny"],
      Snowy: ["Hot", "Sunny"],
      Humid: ["Cold"],
    };

    return opposites[weather] || [];
  }
}

describe("Weather Scenario Generator Tests", () => {
  describe("Valid Weather Combinations", () => {
    it("should generate valid weather combinations", () => {
      const combinations =
        WeatherScenarioGenerator.generateValidWeatherCombinations(20);

      expect(combinations).toHaveLength(20);
      combinations.forEach((combination) => {
        expect(combination).toBeInstanceOf(Array);
        expect(combination.length).toBeGreaterThan(0);
        expect(combination.length).toBeLessThanOrEqual(5);

        combination.forEach((weather) => {
          expect(typeof weather).toBe("string");
          expect(weather.length).toBeGreaterThan(0);
        });
      });
    });

    it("should generate unique combinations", () => {
      const combinations =
        WeatherScenarioGenerator.generateValidWeatherCombinations(50);
      const uniqueCombinations = new Set(
        combinations.map((c) => c.sort().join(","))
      );

      // Should have reasonable variety
      expect(uniqueCombinations.size).toBeGreaterThan(10);
    });
  });

  describe("Invalid Weather Combinations", () => {
    it("should generate invalid weather combinations", () => {
      const combinations =
        WeatherScenarioGenerator.generateInvalidWeatherCombinations(10);

      expect(combinations).toHaveLength(10);
      combinations.forEach((combination) => {
        expect(combination).toBeInstanceOf(Array);
        expect(combination.length).toBeGreaterThanOrEqual(2); // Invalid combinations need at least 2 elements
      });
    });
  });

  describe("Seasonal Scenarios", () => {
    it("should generate seasonal scenarios", () => {
      const scenarios = WeatherScenarioGenerator.generateSeasonalScenarios(16);

      expect(scenarios).toHaveLength(16);
      scenarios.forEach((scenario) => {
        expect(scenario).toHaveProperty("season");
        expect(scenario).toHaveProperty("month");
        expect(scenario).toHaveProperty("expectedWeather");
        expect(scenario).toHaveProperty("description");

        expect(scenario.month).toBeGreaterThanOrEqual(1);
        expect(scenario.month).toBeLessThanOrEqual(12);
        expect(scenario.expectedWeather).toBeInstanceOf(Array);
        expect(scenario.expectedWeather.length).toBeGreaterThan(0);
      });
    });

    it("should generate season-appropriate weather", () => {
      const scenarios = WeatherScenarioGenerator.generateSeasonalScenarios(20);

      scenarios.forEach((scenario) => {
        switch (scenario.season) {
          case "Winter":
            expect([12, 1, 2]).toContain(scenario.month);
            break;
          case "Spring":
            expect([3, 4, 5]).toContain(scenario.month);
            break;
          case "Summer":
            expect([6, 7, 8]).toContain(scenario.month);
            break;
          case "Autumn":
            expect([9, 10, 11]).toContain(scenario.month);
            break;
        }
      });
    });
  });

  describe("Weather Cards", () => {
    it("should generate weather cards", () => {
      const cards = WeatherScenarioGenerator.generateWeatherCards(20);

      expect(cards).toHaveLength(20);
      cards.forEach((card) => {
        expect(card).toHaveProperty("id");
        expect(card).toHaveProperty("type");
        expect(card).toHaveProperty("name");
        expect(card).toHaveProperty("description");

        expect(typeof card.id).toBe("string");
        expect(card.id.length).toBeGreaterThan(0);
        expect([
          "Weather",
          "BreakWeather",
          "WeatherBuff",
          "WeatherNerf",
        ]).toContain(card.type);
      });
    });

    it("should generate cards with appropriate properties", () => {
      const cards = WeatherScenarioGenerator.generateWeatherCards(50);

      const weatherCards = cards.filter((c) => c.type === "Weather");
      const buffCards = cards.filter((c) => c.type === "WeatherBuff");
      const nerfCards = cards.filter((c) => c.type === "WeatherNerf");

      // Weather cards should have weather property
      weatherCards.forEach((card) => {
        expect(card).toHaveProperty("weather");
        expect(typeof card.weather).toBe("string");
      });

      // Buff/Nerf cards should have effect property
      [...buffCards, ...nerfCards].forEach((card) => {
        expect(card).toHaveProperty("effect");
        expect(typeof card.effect).toBe("object");
      });
    });
  });

  describe("Game Scenarios", () => {
    it("should generate complete game scenarios", () => {
      const scenarios = WeatherScenarioGenerator.generateGameScenarios(5);

      expect(scenarios).toHaveLength(5);
      scenarios.forEach((scenario) => {
        expect(scenario).toHaveProperty("name");
        expect(scenario).toHaveProperty("turns");
        expect(scenario).toHaveProperty("gameMode");
        expect(scenario).toHaveProperty("weatherSequence");
        expect(scenario).toHaveProperty("cardPlays");
        expect(scenario).toHaveProperty("expectedOutcomes");

        expect(scenario.turns).toBeGreaterThan(0);
        expect(scenario.weatherSequence).toHaveLength(scenario.turns);
        expect(scenario.cardPlays).toBeInstanceOf(Array);
        expect(scenario.expectedOutcomes).toBeInstanceOf(Array);
      });
    });
  });

  describe("Performance Test Data", () => {
    it("should generate performance test data", () => {
      const operations =
        WeatherScenarioGenerator.generatePerformanceTestData(100);

      expect(operations).toHaveLength(100);
      operations.forEach((operation) => {
        expect(operation).toHaveProperty("operation");
        expect(operation).toHaveProperty("data");
        expect(operation).toHaveProperty("expectedMaxTime");

        expect(typeof operation.operation).toBe("string");
        expect(typeof operation.expectedMaxTime).toBe("number");
        expect(operation.expectedMaxTime).toBeGreaterThan(0);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should generate edge case test data", () => {
      const edgeCases = WeatherScenarioGenerator.generateEdgeCases();

      expect(edgeCases.length).toBeGreaterThan(5);
      edgeCases.forEach((edgeCase) => {
        expect(edgeCase).toHaveProperty("name");
        expect(edgeCase).toHaveProperty("data");
        expect(edgeCase).toHaveProperty("expectedBehavior");

        expect(typeof edgeCase.name).toBe("string");
        expect(typeof edgeCase.expectedBehavior).toBe("string");
      });
    });
  });
});
