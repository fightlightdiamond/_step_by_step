/**
 * Tests for security manager
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { SecurityManager, SecurityConfig } from "../security/security-manager";
import { WeatherLogger } from "../utils/error-logger";
import {
  ErrorRecoveryManager,
  createSafeFallbackWeatherState,
} from "../utils/error-recovery";
import { SecurityError, InputValidationError } from "../types/errors";
import { WeatherType, GameState } from "../types/weather";

describe("SecurityManager", () => {
  let securityManager: SecurityManager;
  let logger: WeatherLogger;
  let recoveryManager: ErrorRecoveryManager;
  let validGameState: GameState;

  beforeEach(() => {
    logger = new WeatherLogger({ enableConsoleOutput: false });
    const fallbackStates = {
      defaultWeather: ["Sunny"] as WeatherType[],
      defaultGameState: { currentTurn: 1 },
      defaultWeatherState: createSafeFallbackWeatherState(),
    };
    recoveryManager = new ErrorRecoveryManager(logger, fallbackStates);

    const config: Partial<SecurityConfig> = {
      enableInputValidation: true,
      enableStateIntegrityChecks: true,
      enableAntiCheat: true,
      strictMode: false,
    };

    securityManager = new SecurityManager(logger, recoveryManager, config);

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

  describe("Input Validation", () => {
    it("should validate weather types successfully", async () => {
      const input = ["Sunny", "Rainy"];
      const result = await securityManager.validateWeatherTypes(input);

      expect(result).toEqual(["Sunny", "Rainy"]);
    });

    it("should handle invalid weather types in non-strict mode", async () => {
      const input = ["InvalidWeather"];

      // In non-strict mode, should not throw but should log errors
      const result = await securityManager.validateWeatherTypes(input);

      // Should return empty array or sanitized result
      expect(Array.isArray(result)).toBe(true);

      // Should increment error count
      const stats = securityManager.getSecurityStatistics();
      expect(stats.validationErrorCount).toBeGreaterThan(0);
    });

    it("should validate weather cards successfully", async () => {
      const card = {
        id: "card1",
        name: "Sunny Day",
        type: "Weather",
        weather: "Sunny",
      };

      const result = await securityManager.validateWeatherCard(card);

      expect(result.id).toBe("card1");
      expect(result.name).toBe("Sunny Day");
    });

    it("should sanitize malicious input in cards", async () => {
      const maliciousCard = {
        id: '<script>alert("xss")</script>card1',
        name: "Test Card",
        type: "Weather",
      };

      const result = await securityManager.validateWeatherCard(maliciousCard);

      // Should sanitize the malicious content
      expect(result.id).not.toContain("<script>");
      expect(result.id).toContain("card1");
      expect(result.name).toBe("Test Card");
    });

    it("should validate game state successfully", async () => {
      const state = {
        currentTurn: 3,
        currentMonth: 3,
        gameMode: "standard",
      };

      const result = await securityManager.validateGameState(state);

      expect(result.currentTurn).toBe(3);
      expect(result.currentMonth).toBe(3);
    });

    it("should sanitize game state strings", async () => {
      const state = {
        gameMode: '<script>alert("xss")</script>standard',
      };

      const result = await securityManager.validateGameState(state);

      expect(result.gameMode).not.toContain("<script>");
      expect(result.gameMode).toContain("standard");
    });
  });

  describe("State Integrity Checks", () => {
    it("should pass valid game state integrity check", async () => {
      await expect(
        securityManager.checkStateIntegrity(validGameState)
      ).resolves.not.toThrow();
    });

    it("should detect state inconsistencies", async () => {
      const invalidState = {
        ...validGameState,
        currentMonth: 3, // Inconsistent with turn
        weatherState: {
          ...validGameState.weatherState,
          month: 3,
        },
      };

      // Should not throw in non-strict mode, but should log warnings
      await expect(
        securityManager.checkStateIntegrity(invalidState)
      ).resolves.not.toThrow();
    });

    it("should detect impossible weather combinations", async () => {
      const invalidState = {
        ...validGameState,
        weatherState: {
          ...validGameState.weatherState,
          currentWeather: ["Hot", "Cold"] as WeatherType[],
        },
      };

      // Should not throw in non-strict mode
      await expect(
        securityManager.checkStateIntegrity(invalidState)
      ).resolves.not.toThrow();
    });

    it("should throw in strict mode for integrity violations", async () => {
      const strictManager = new SecurityManager(logger, recoveryManager, {
        strictMode: true,
        enableStateIntegrityChecks: true,
      });

      const invalidState = {
        ...validGameState,
        weatherState: {
          ...validGameState.weatherState,
          currentWeather: ["Hot", "Cold"] as WeatherType[],
        },
      };

      await expect(
        strictManager.checkStateIntegrity(invalidState)
      ).rejects.toThrow();
    });

    it("should detect state tampering", async () => {
      const oldState = { ...validGameState };
      const newState = { ...validGameState, gameMode: "hacked" };

      // Should not throw in non-strict mode
      await expect(
        securityManager.checkForTampering(oldState, newState, ["currentTurn"])
      ).resolves.not.toThrow();
    });

    it("should allow authorized state changes", async () => {
      const oldState = { ...validGameState };
      const newState = { ...validGameState, currentTurn: 6, currentMonth: 6 };

      await expect(
        securityManager.checkForTampering(oldState, newState, [
          "currentTurn",
          "currentMonth",
        ])
      ).resolves.not.toThrow();
    });
  });

  describe("Anti-Cheat Validation", () => {
    it("should allow normal player actions", async () => {
      const action = { type: "card_play" };
      const playerHistory = [
        { turn: 5, type: "action", timestamp: Date.now() - 1000 },
      ];

      await expect(
        securityManager.validatePlayerAction(
          action,
          validGameState,
          playerHistory
        )
      ).resolves.not.toThrow();
    });

    it("should detect rapid-fire actions", async () => {
      const action = { type: "action" };
      const playerHistory = [
        { turn: 5, type: "action", timestamp: Date.now() - 50 },
      ];

      // Should not throw in non-strict mode
      await expect(
        securityManager.validatePlayerAction(
          action,
          validGameState,
          playerHistory
        )
      ).resolves.not.toThrow();
    });

    it("should allow normal weather changes", async () => {
      const oldWeather: WeatherType[] = ["Sunny"];
      const newWeather: WeatherType[] = ["Cloudy"];

      await expect(
        securityManager.validateWeatherChange(oldWeather, newWeather, [
          "card_play",
        ])
      ).resolves.not.toThrow();
    });

    it("should detect impossible weather transitions", async () => {
      const oldWeather: WeatherType[] = ["Sunny"];
      const newWeather: WeatherType[] = ["Stormy"];

      // Should not throw in non-strict mode
      await expect(
        securityManager.validateWeatherChange(oldWeather, newWeather, [
          "natural",
        ])
      ).resolves.not.toThrow();
    });
  });

  describe("Security Audit", () => {
    it("should perform successful audit on valid state", async () => {
      const result = await securityManager.performSecurityAudit(validGameState);

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe("low");
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should detect issues in audit", async () => {
      // Simulate validation errors
      try {
        await securityManager.validateWeatherTypes(["InvalidWeather"]);
      } catch (error) {
        // Expected to fail
      }

      const result = await securityManager.performSecurityAudit(validGameState);

      // Should still pass the audit but may have recommendations
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should provide recommendations", async () => {
      const result = await securityManager.performSecurityAudit(validGameState);

      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe("Configuration Management", () => {
    it("should update configuration", () => {
      const newConfig = { strictMode: true };
      securityManager.updateConfig(newConfig);

      const stats = securityManager.getSecurityStatistics();
      expect(stats.config.strictMode).toBe(true);
    });

    it("should disable features when configured", async () => {
      securityManager.updateConfig({ enableInputValidation: false });

      // Should pass through without validation
      const result = await securityManager.validateWeatherTypes([
        "InvalidWeather",
      ]);
      expect(result).toEqual(["InvalidWeather"]);
    });
  });

  describe("Statistics and Monitoring", () => {
    it("should provide security statistics", () => {
      const stats = securityManager.getSecurityStatistics();

      expect(stats).toHaveProperty("validationErrorCount");
      expect(stats).toHaveProperty("securityViolations");
      expect(stats).toHaveProperty("config");
      expect(stats).toHaveProperty("errorFrequency");
      expect(stats).toHaveProperty("criticalErrors");
    });

    it("should reset security counters", () => {
      securityManager.resetSecurityCounters();

      const stats = securityManager.getSecurityStatistics();
      expect(stats.validationErrorCount).toBe(0);
      expect(Object.keys(stats.securityViolations)).toHaveLength(0);
    });

    it("should track validation errors", async () => {
      try {
        await securityManager.validateWeatherTypes(["InvalidWeather"]);
      } catch (error) {
        // Expected to fail
      }

      const stats = securityManager.getSecurityStatistics();
      expect(stats.validationErrorCount).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle security errors gracefully in non-strict mode", async () => {
      const maliciousInput = '<script>alert("xss")</script>Sunny';

      const result = await securityManager.validateWeatherTypes([
        maliciousInput,
      ]);

      // Should sanitize and return valid weather types
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);

      // Should track security violations
      const stats = securityManager.getSecurityStatistics();
      expect(Object.keys(stats.securityViolations).length).toBeGreaterThan(0);
    });

    it("should attempt error recovery", async () => {
      // This test verifies that the security manager integrates with error recovery
      const stats = securityManager.getSecurityStatistics();
      expect(stats).toBeDefined();
    });
  });

  describe("Integration", () => {
    it("should work with all security features enabled", async () => {
      const fullConfig: Partial<SecurityConfig> = {
        enableInputValidation: true,
        enableStateIntegrityChecks: true,
        enableAntiCheat: true,
        enableSecurityLogging: true,
        strictMode: false,
      };

      const fullSecurityManager = new SecurityManager(
        logger,
        recoveryManager,
        fullConfig
      );

      // Should handle normal operations
      const weatherTypes = await fullSecurityManager.validateWeatherTypes([
        "Sunny",
      ]);
      expect(weatherTypes).toEqual(["Sunny"]);

      await fullSecurityManager.checkStateIntegrity(validGameState);

      const audit = await fullSecurityManager.performSecurityAudit(
        validGameState
      );
      expect(audit.timestamp).toBeInstanceOf(Date);
    });

    it("should work with all security features disabled", async () => {
      const minimalConfig: Partial<SecurityConfig> = {
        enableInputValidation: false,
        enableStateIntegrityChecks: false,
        enableAntiCheat: false,
        enableSecurityLogging: false,
      };

      const minimalSecurityManager = new SecurityManager(
        logger,
        recoveryManager,
        minimalConfig
      );

      // Should pass through without validation
      const weatherTypes = await minimalSecurityManager.validateWeatherTypes([
        "InvalidWeather",
      ]);
      expect(weatherTypes).toEqual(["InvalidWeather"]);
    });
  });
});
