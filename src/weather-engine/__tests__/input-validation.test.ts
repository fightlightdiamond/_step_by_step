/**
 * Tests for input validation and security measures
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  InputValidator,
  StateIntegrityChecker,
  AntiCheatValidator,
  ValidationResult,
  SecurityCheckResult,
} from "../validation/input-validator";
import {
  WeatherType,
  WeatherCard,
  GameState,
  WeatherState,
} from "../types/weather";
import { SecurityError } from "../types/errors";

describe("InputValidator", () => {
  describe("validateWeatherTypes", () => {
    it("should validate valid weather types", () => {
      const input = ["Sunny", "Rainy", "Hot"];
      const result = InputValidator.validateWeatherTypes(input);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toEqual(["Sunny", "Rainy", "Hot"]);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject non-array input", () => {
      const result = InputValidator.validateWeatherTypes("Sunny");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Weather types must be an array");
    });

    it("should reject empty array", () => {
      const result = InputValidator.validateWeatherTypes([]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("At least one weather type is required");
    });

    it("should limit weather types to maximum", () => {
      const input = ["Sunny", "Rainy", "Hot", "Cold", "Windy", "Stormy"];
      const result = InputValidator.validateWeatherTypes(input);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toHaveLength(5);
      expect(result.warnings).toContain(
        "Too many weather types (6). Limiting to 5"
      );
    });

    it("should reject invalid weather types", () => {
      const input = ["Sunny", "InvalidWeather", "Rainy"];
      const result = InputValidator.validateWeatherTypes(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid weather type: InvalidWeather");
    });

    it("should remove duplicates", () => {
      const input = ["Sunny", "Rainy", "Sunny"];
      const result = InputValidator.validateWeatherTypes(input);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toEqual(["Sunny", "Rainy"]);
      expect(result.warnings).toContain(
        "Duplicate weather type removed: Sunny"
      );
    });

    it("should reject non-string elements", () => {
      const input = ["Sunny", 123, "Rainy"];
      const result = InputValidator.validateWeatherTypes(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Weather type at index 1 must be a string"
      );
    });
  });

  describe("validateWeatherCard", () => {
    it("should validate valid weather card", () => {
      const card = {
        id: "card1",
        name: "Sunny Day",
        type: "Weather",
        weather: "Sunny",
        duration: 3,
        cost: 2,
      };

      const result = InputValidator.validateWeatherCard(card);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue?.id).toBe("card1");
      expect(result.sanitizedValue?.name).toBe("Sunny Day");
    });

    it("should reject non-object input", () => {
      const result = InputValidator.validateWeatherCard("not an object");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Weather card must be an object");
    });

    it("should require id and name", () => {
      const card = { type: "Weather" };
      const result = InputValidator.validateWeatherCard(card);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Card ID is required and must be a string"
      );
      expect(result.errors).toContain(
        "Card name is required and must be a string"
      );
    });

    it("should validate card type", () => {
      const card = {
        id: "card1",
        name: "Test Card",
        type: "InvalidType",
      };

      const result = InputValidator.validateWeatherCard(card);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Card type must be one of: Weather, BreakWeather, WeatherBuff, WeatherNerf"
      );
    });

    it("should validate weather type in card", () => {
      const card = {
        id: "card1",
        name: "Test Card",
        type: "Weather",
        weather: "InvalidWeather",
      };

      const result = InputValidator.validateWeatherCard(card);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Invalid weather type in card: InvalidWeather"
      );
    });

    it("should validate duration and cost", () => {
      const card = {
        id: "card1",
        name: "Test Card",
        type: "Weather",
        duration: -1,
        cost: -5,
      };

      const result = InputValidator.validateWeatherCard(card);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Card duration must be a non-negative number"
      );
      expect(result.errors).toContain(
        "Card cost must be a non-negative number"
      );
    });
  });

  describe("validateGameState", () => {
    it("should validate valid game state", () => {
      const state = {
        currentTurn: 5,
        currentMonth: 5,
        gameMode: "standard",
      };

      const result = InputValidator.validateGameState(state);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue?.currentTurn).toBe(5);
      expect(result.sanitizedValue?.currentMonth).toBe(5);
    });

    it("should reject non-object input", () => {
      const result = InputValidator.validateGameState("not an object");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Game state must be an object");
    });

    it("should validate turn bounds", () => {
      const state = { currentTurn: 15 };
      const result = InputValidator.validateGameState(state);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Current turn must be a number between 1 and 12"
      );
    });

    it("should validate month bounds", () => {
      const state = { currentMonth: 0 };
      const result = InputValidator.validateGameState(state);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Current month must be a number between 1 and 12"
      );
    });

    it("should sanitize game mode string", () => {
      const state = { gameMode: '<script>alert("xss")</script>standard' };
      const result = InputValidator.validateGameState(state);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue?.gameMode).not.toContain("<script>");
    });
  });

  describe("validateNumber", () => {
    it("should validate valid numbers", () => {
      const result = InputValidator.validateNumber(42);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(42);
    });

    it("should reject non-numbers", () => {
      const result = InputValidator.validateNumber("not a number");

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Value must be a valid number");
    });

    it("should reject NaN and Infinity", () => {
      expect(InputValidator.validateNumber(NaN).isValid).toBe(false);
      expect(InputValidator.validateNumber(Infinity).isValid).toBe(false);
    });

    it("should validate min/max bounds", () => {
      expect(InputValidator.validateNumber(5, 10, 20).isValid).toBe(false);
      expect(InputValidator.validateNumber(25, 10, 20).isValid).toBe(false);
      expect(InputValidator.validateNumber(15, 10, 20).isValid).toBe(true);
    });
  });

  describe("validateString", () => {
    it("should validate valid strings", () => {
      const result = InputValidator.validateString("hello world");

      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe("hello world");
    });

    it("should handle required validation", () => {
      const result = InputValidator.validateString(null, { required: true });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Value is required");
    });

    it("should validate length constraints", () => {
      const rules = { minLength: 5, maxLength: 10 };

      expect(InputValidator.validateString("hi", rules).isValid).toBe(false);
      expect(
        InputValidator.validateString("this is too long", rules).isValid
      ).toBe(false);
      expect(InputValidator.validateString("perfect", rules).isValid).toBe(
        true
      );
    });

    it("should validate patterns", () => {
      const rules = { pattern: /^[a-zA-Z]+$/ };

      expect(InputValidator.validateString("hello", rules).isValid).toBe(true);
      expect(InputValidator.validateString("hello123", rules).isValid).toBe(
        false
      );
    });

    it("should validate allowed values", () => {
      const rules = { allowedValues: ["red", "green", "blue"] };

      expect(InputValidator.validateString("red", rules).isValid).toBe(true);
      expect(InputValidator.validateString("yellow", rules).isValid).toBe(
        false
      );
    });
  });

  describe("sanitizeString", () => {
    it("should remove dangerous patterns", () => {
      const dangerous = '<script>alert("xss")</script>Hello';
      const sanitized = InputValidator.sanitizeString(dangerous);

      expect(sanitized).not.toContain("<script>");
      expect(sanitized).toContain("Hello");
    });

    it("should encode HTML entities", () => {
      const html = '<div>Hello & "World"</div>';
      const sanitized = InputValidator.sanitizeString(html);

      expect(sanitized).toContain("&lt;div&gt;");
      expect(sanitized).toContain("&amp;");
      expect(sanitized).toContain("&quot;");
    });

    it("should remove control characters", () => {
      const withControl = "Hello\x00\x1FWorld";
      const sanitized = InputValidator.sanitizeString(withControl);

      expect(sanitized).toBe("HelloWorld");
    });

    it("should limit string length", () => {
      const longString = "a".repeat(2000);
      const sanitized = InputValidator.sanitizeString(longString);

      expect(sanitized.length).toBeLessThanOrEqual(1000);
    });
  });

  describe("performSecurityCheck", () => {
    it("should pass clean input", () => {
      const result = InputValidator.performSecurityCheck("clean input", "test");

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe("low");
    });

    it("should detect script injection", () => {
      const malicious = '<script>alert("xss")</script>';
      const result = InputValidator.performSecurityCheck(malicious, "test");

      expect(result.passed).toBe(false);
      expect(result.riskLevel).toBe("critical");
      expect(result.violations).toContain(
        "Potential code injection detected in test"
      );
    });

    it("should detect SQL injection", () => {
      const malicious = "'; DROP TABLE users; --";
      const result = InputValidator.performSecurityCheck(malicious, "test");

      expect(result.passed).toBe(false);
      expect(result.riskLevel).toBe("high");
    });

    it("should detect oversized inputs", () => {
      const oversized = "a".repeat(2000);
      const result = InputValidator.performSecurityCheck(oversized, "test");

      expect(result.passed).toBe(true); // Not failed, but has violations
      expect(result.violations).toContain(
        "Input too large in test (2000 > 1000)"
      );
      expect(result.riskLevel).toBe("medium");
    });

    it("should detect prototype pollution", () => {
      const malicious = Object.create(null);
      malicious["__proto__"] = { polluted: true };
      const result = InputValidator.performSecurityCheck(malicious, "test");

      expect(result.passed).toBe(false);
      expect(result.riskLevel).toBe("critical");
      expect(result.violations).toContain(
        "Potential prototype pollution detected in test"
      );
    });
  });

  describe("validateAndSanitize", () => {
    it("should perform security checks before validation", () => {
      const maliciousInput = '<script>alert("xss")</script>';

      expect(() => {
        InputValidator.validateAndSanitize(
          maliciousInput,
          InputValidator.validateString,
          "test"
        );
      }).toThrow(SecurityError);
    });

    it("should pass clean input through validation", () => {
      const cleanInput = "clean string";
      const result = InputValidator.validateAndSanitize(
        cleanInput,
        InputValidator.validateString,
        "test"
      );

      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe("clean string");
    });
  });
});

describe("StateIntegrityChecker", () => {
  let validGameState: GameState;

  beforeEach(() => {
    validGameState = {
      currentTurn: 5,
      currentMonth: 5,
      weatherState: {
        currentWeather: ["Sunny"],
        turn: 5,
        month: 5,
        season: "Spring",
        activeCards: [],
        weatherHistory: [],
        elementalModifiers: { Fire: 10, Ice: -5, Lightning: 0 },
      },
      playerStates: [],
      gameMode: "standard",
      turnHistory: [],
    };
  });

  describe("checkGameStateIntegrity", () => {
    it("should pass valid game state", () => {
      const result =
        StateIntegrityChecker.checkGameStateIntegrity(validGameState);

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("should detect turn/month inconsistency", () => {
      validGameState.currentMonth = 3;
      const result =
        StateIntegrityChecker.checkGameStateIntegrity(validGameState);

      expect(result.violations).toContain("Turn and month are inconsistent");
      expect(result.riskLevel).toBe("medium");
    });

    it("should detect weather state inconsistency", () => {
      validGameState.weatherState.turn = 3;
      const result =
        StateIntegrityChecker.checkGameStateIntegrity(validGameState);

      expect(result.violations).toContain(
        "Weather state turn does not match game turn"
      );
    });

    it("should detect impossible weather combinations", () => {
      validGameState.weatherState.currentWeather = ["Hot", "Cold"];
      const result =
        StateIntegrityChecker.checkGameStateIntegrity(validGameState);

      expect(result.passed).toBe(false);
      expect(result.riskLevel).toBe("high");
      expect(result.violations).toContain(
        "Impossible weather combination: Hot and Cold"
      );
    });

    it("should detect out-of-bounds elemental modifiers", () => {
      validGameState.weatherState.elementalModifiers.Fire = 50;
      const result =
        StateIntegrityChecker.checkGameStateIntegrity(validGameState);

      expect(result.passed).toBe(false);
      expect(result.violations).toContain(
        "Elemental modifier out of bounds: Fire = 50"
      );
    });
  });

  describe("checkForTampering", () => {
    it("should allow authorized changes", () => {
      const oldState = { ...validGameState };
      const newState = { ...validGameState, currentTurn: 6, currentMonth: 6 };

      const result = StateIntegrityChecker.checkForTampering(
        oldState,
        newState,
        ["currentTurn", "currentMonth"]
      );

      expect(result.passed).toBe(true);
    });

    it("should detect unauthorized changes", () => {
      const oldState = { ...validGameState };
      const newState = { ...validGameState, gameMode: "hacked" };

      const result = StateIntegrityChecker.checkForTampering(
        oldState,
        newState,
        ["currentTurn"]
      );

      expect(result.passed).toBe(false);
      expect(result.violations).toContain(
        "Unauthorized state change: gameMode"
      );
    });

    it("should detect backwards turn movement", () => {
      const oldState = { ...validGameState, currentTurn: 5 };
      const newState = { ...validGameState, currentTurn: 4 };

      const result = StateIntegrityChecker.checkForTampering(
        oldState,
        newState,
        ["currentTurn"]
      );

      expect(result.passed).toBe(false);
      expect(result.violations).toContain("Turn cannot go backwards");
    });

    it("should detect turn skipping", () => {
      const oldState = { ...validGameState, currentTurn: 5 };
      const newState = { ...validGameState, currentTurn: 8 };

      const result = StateIntegrityChecker.checkForTampering(
        oldState,
        newState,
        ["currentTurn"]
      );

      expect(result.passed).toBe(false);
      expect(result.violations).toContain("Turn cannot skip ahead");
    });
  });
});

describe("AntiCheatValidator", () => {
  let validGameState: GameState;
  let playerHistory: any[];

  beforeEach(() => {
    validGameState = {
      currentTurn: 5,
      currentMonth: 5,
      weatherState: {
        currentWeather: ["Sunny"],
        turn: 5,
        month: 5,
        season: "Spring",
        activeCards: [],
        weatherHistory: [],
        elementalModifiers: { Fire: 0, Ice: 0, Lightning: 0 },
      },
      playerStates: [],
      gameMode: "standard",
      turnHistory: [],
    };

    playerHistory = [
      { turn: 5, type: "card_play", timestamp: Date.now() - 1000 },
      { turn: 5, type: "weather_change", timestamp: Date.now() - 500 },
    ];
  });

  describe("validatePlayerAction", () => {
    it("should allow normal player actions", () => {
      const action = { type: "card_play" };
      const result = AntiCheatValidator.validatePlayerAction(
        action,
        validGameState,
        playerHistory
      );

      expect(result.passed).toBe(true);
    });

    it("should detect too many actions per turn", () => {
      // Add many actions to history
      const manyActions = Array(15)
        .fill(null)
        .map((_, i) => ({
          turn: 5,
          type: "action",
          timestamp: Date.now() - i * 100,
        }));

      const result = AntiCheatValidator.validatePlayerAction(
        { type: "action" },
        validGameState,
        manyActions
      );

      expect(result.passed).toBe(false);
      expect(result.violations).toContain("Too many actions per turn");
    });

    it("should detect too many weather changes", () => {
      const weatherChanges = Array(5)
        .fill(null)
        .map((_, i) => ({
          turn: 5,
          type: "weather_change",
          timestamp: Date.now() - i * 100,
        }));

      const result = AntiCheatValidator.validatePlayerAction(
        { type: "weather_change" },
        validGameState,
        weatherChanges
      );

      expect(result.violations).toContain("Too many weather changes per turn");
    });

    it("should detect rapid-fire actions", () => {
      const recentHistory = [
        { turn: 5, type: "action", timestamp: Date.now() - 50 },
      ];

      const result = AntiCheatValidator.validatePlayerAction(
        { type: "action" },
        validGameState,
        recentHistory
      );

      expect(result.passed).toBe(false);
      expect(result.violations).toContain(
        "Actions too frequent (possible automation)"
      );
    });
  });

  describe("validateWeatherChange", () => {
    it("should allow normal weather changes", () => {
      const result = AntiCheatValidator.validateWeatherChange(
        ["Sunny"],
        ["Cloudy"],
        ["card_play"]
      );

      expect(result.passed).toBe(true);
    });

    it("should detect drastic weather changes", () => {
      const result = AntiCheatValidator.validateWeatherChange(
        ["Sunny"],
        ["Rainy", "Stormy", "Cold", "Windy"],
        ["card_play"]
      );

      expect(result.violations).toContain("Weather change too drastic");
    });

    it("should detect impossible weather transitions", () => {
      const result = AntiCheatValidator.validateWeatherChange(
        ["Sunny"],
        ["Stormy"],
        ["natural"]
      );

      expect(result.passed).toBe(false);
      expect(result.violations).toContain(
        "Impossible weather transition: Sunny to Stormy"
      );
    });
  });
});

describe("Integration Tests", () => {
  it("should handle complete validation workflow", () => {
    const input = {
      weatherTypes: ["Sunny", "Rainy"],
      card: {
        id: "test-card",
        name: "Test Card",
        type: "Weather",
        weather: "Sunny",
      },
      gameState: {
        currentTurn: 3,
        currentMonth: 3,
      },
    };

    // Validate weather types
    const weatherResult = InputValidator.validateWeatherTypes(
      input.weatherTypes
    );
    expect(weatherResult.isValid).toBe(true);

    // Validate card
    const cardResult = InputValidator.validateWeatherCard(input.card);
    expect(cardResult.isValid).toBe(true);

    // Validate game state
    const stateResult = InputValidator.validateGameState(input.gameState);
    expect(stateResult.isValid).toBe(true);
  });

  it("should handle malicious input across all validators", () => {
    const maliciousInput = '<script>alert("xss")</script>';

    // Should be caught by security checks
    expect(() => {
      InputValidator.validateAndSanitize(
        maliciousInput,
        InputValidator.validateString,
        "test"
      );
    }).toThrow(SecurityError);
  });
});
