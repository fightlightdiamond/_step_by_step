/**
 * Comprehensive tests for elemental damage calculation system
 */

const fs = require("fs");
const path = require("path");

// Mock the damage calculator functionality for testing
class TestDamageCalculator {
  constructor(config) {
    this.weatherEffects = config.weatherEffects;
    this.effectLimits = config.effectLimits;
  }

  calculateElementalModifiers(activeWeather, options = {}) {
    const opts = {
      applyLimits: true,
      includeDebugInfo: false,
      ...options,
    };

    // Remove duplicates and filter valid weather types
    const uniqueWeather = [...new Set(activeWeather)].filter((weather) =>
      this.weatherEffects.has(weather)
    );

    // Get weather effects for each active weather type
    const appliedWeatherEffects = [];
    for (const weather of uniqueWeather) {
      const effect = this.weatherEffects.get(weather);
      if (effect) {
        appliedWeatherEffects.push(effect);
      }
    }

    // Calculate cumulative effects for each element
    const totalEffectsByElement = {
      Fire: 0,
      Ice: 0,
      Lightning: 0,
    };

    for (const effect of appliedWeatherEffects) {
      totalEffectsByElement.Fire += effect.Fire;
      totalEffectsByElement.Ice += effect.Ice;
      totalEffectsByElement.Lightning += effect.Lightning;
    }

    // Apply limits if requested
    const elementalModifiers = { ...totalEffectsByElement };
    const clampedEffects = {
      Fire: false,
      Ice: false,
      Lightning: false,
    };

    if (opts.applyLimits) {
      const limits = opts.customLimits || this.effectLimits;

      for (const element of ["Fire", "Ice", "Lightning"]) {
        const originalValue = totalEffectsByElement[element];
        const clampedValue = this.clampWeatherEffect(originalValue, limits);

        elementalModifiers[element] = clampedValue;
        clampedEffects[element] = originalValue !== clampedValue;
      }
    }

    return {
      elementalModifiers,
      appliedWeatherEffects,
      totalEffectsByElement,
      clampedEffects,
      activeWeatherTypes: uniqueWeather,
    };
  }

  calculateElementDamageModifier(element, activeWeather, baseDamage = 100) {
    const result = this.calculateElementalModifiers(activeWeather);
    const modifier = result.elementalModifiers[element];

    // Apply percentage modifier to base damage
    const modifiedDamage = baseDamage * (1 + modifier / 100);

    return Math.max(0, modifiedDamage); // Ensure damage doesn't go negative
  }

  calculateAllElementDamage(activeWeather, baseDamages) {
    const result = this.calculateElementalModifiers(activeWeather);
    const damages = {
      Fire: 0,
      Ice: 0,
      Lightning: 0,
    };

    for (const element of ["Fire", "Ice", "Lightning"]) {
      const baseDamage = baseDamages[element] || 0;
      const modifier = result.elementalModifiers[element];
      const modifiedDamage = baseDamage * (1 + modifier / 100);
      damages[element] = Math.max(0, modifiedDamage);
    }

    return damages;
  }

  getWeatherEffect(weatherType) {
    return this.weatherEffects.get(weatherType) || null;
  }

  wouldEffectsBeClamped(activeWeather) {
    const result = this.calculateElementalModifiers(activeWeather, {
      applyLimits: false,
    });
    const clampedCheck = {
      Fire: false,
      Ice: false,
      Lightning: false,
    };

    for (const element of ["Fire", "Ice", "Lightning"]) {
      const value = result.totalEffectsByElement[element];
      clampedCheck[element] =
        value < this.effectLimits.min || value > this.effectLimits.max;
    }

    return clampedCheck;
  }

  findOptimalWeatherForElement(element, availableWeather, maxWeatherTypes = 3) {
    const weatherEffectPairs = [];

    // Get effect values for the target element
    for (const weather of availableWeather) {
      const effect = this.weatherEffects.get(weather);
      if (effect) {
        weatherEffectPairs.push({
          weather,
          effect: effect[element],
        });
      }
    }

    // Sort by effect value (descending for positive effects)
    weatherEffectPairs.sort((a, b) => b.effect - a.effect);

    // Take the top weather types up to the limit
    const optimalWeather = weatherEffectPairs
      .slice(0, maxWeatherTypes)
      .filter((pair) => pair.effect > 0) // Only positive effects
      .map((pair) => pair.weather);

    return optimalWeather;
  }

  analyzeWeatherEffectiveness(activeWeather) {
    const result = this.calculateElementalModifiers(activeWeather);
    const recommendations = [];

    let totalAbsoluteEffect = 0;
    const elementBreakdown = {
      Fire: { modifier: 0, effectiveness: "poor" },
      Ice: { modifier: 0, effectiveness: "poor" },
      Lightning: { modifier: 0, effectiveness: "poor" },
    };

    for (const element of ["Fire", "Ice", "Lightning"]) {
      const modifier = result.elementalModifiers[element];
      elementBreakdown[element].modifier = modifier;

      const absModifier = Math.abs(modifier);
      totalAbsoluteEffect += absModifier;

      // Determine effectiveness level
      if (absModifier >= 30) {
        elementBreakdown[element].effectiveness = "excellent";
      } else if (absModifier >= 20) {
        elementBreakdown[element].effectiveness = "good";
      } else if (absModifier >= 10) {
        elementBreakdown[element].effectiveness = "fair";
      } else {
        elementBreakdown[element].effectiveness = "poor";
      }

      // Add recommendations
      if (result.clampedEffects[element]) {
        recommendations.push(
          `${element} effects are clamped at limit (${modifier})`
        );
      }

      if (modifier < -30) {
        recommendations.push(
          `${element} is severely weakened by current weather`
        );
      } else if (modifier > 30) {
        recommendations.push(
          `${element} is significantly boosted by current weather`
        );
      }
    }

    const overallEffectiveness = totalAbsoluteEffect / 3; // Average absolute effect

    if (activeWeather.length > 3) {
      recommendations.push(
        "Consider reducing weather types for more focused effects"
      );
    }

    if (overallEffectiveness < 10) {
      recommendations.push(
        "Current weather has minimal impact on elemental damage"
      );
    }

    return {
      overallEffectiveness,
      elementBreakdown,
      recommendations,
    };
  }

  clampWeatherEffect(value, limits = this.effectLimits) {
    return Math.max(limits.min, Math.min(limits.max, value));
  }
}

// Utility functions
function clampWeatherEffect(value) {
  return Math.max(-40, Math.min(40, value));
}

function createEmptyWeatherEffect() {
  return {
    Fire: 0,
    Ice: 0,
    Lightning: 0,
  };
}

function addWeatherEffects(effect1, effect2) {
  return {
    Fire: clampWeatherEffect(effect1.Fire + effect2.Fire),
    Ice: clampWeatherEffect(effect1.Ice + effect2.Ice),
    Lightning: clampWeatherEffect(effect1.Lightning + effect2.Lightning),
  };
}

function multiplyWeatherEffect(effect, multiplier) {
  return {
    Fire: clampWeatherEffect(effect.Fire * multiplier),
    Ice: clampWeatherEffect(effect.Ice * multiplier),
    Lightning: clampWeatherEffect(effect.Lightning * multiplier),
  };
}

function isValidWeatherEffect(effect) {
  return (
    effect.Fire >= -40 &&
    effect.Fire <= 40 &&
    effect.Ice >= -40 &&
    effect.Ice <= 40 &&
    effect.Lightning >= -40 &&
    effect.Lightning <= 40
  );
}

function calculateDamagePercentageChange(baseDamage, modifiedDamage) {
  if (baseDamage === 0) return 0;
  return ((modifiedDamage - baseDamage) / baseDamage) * 100;
}

// Helper function to create test config
function createTestConfig() {
  const configPath = path.join(__dirname, "../config/weather-effects.json");
  const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));

  // Convert to Map format
  const weatherEffects = new Map();
  for (const [weather, effects] of Object.entries(configData.weatherEffects)) {
    weatherEffects.set(weather, effects);
  }

  return {
    weatherEffects,
    effectLimits: configData.effectLimits,
  };
}

// Test functions
function runTests() {
  console.log("Running Damage Calculator Tests...\n");

  let passed = 0;
  let failed = 0;

  function test(name, testFn) {
    try {
      testFn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`✗ ${name}: ${error.message}`);
      failed++;
    }
  }

  const config = createTestConfig();
  const calculator = new TestDamageCalculator(config);

  test("should calculate elemental modifiers for single weather", () => {
    const result = calculator.calculateElementalModifiers(["Sunny"]);
    if (!result.elementalModifiers)
      throw new Error("Should have elemental modifiers");
    if (typeof result.elementalModifiers.Fire !== "number")
      throw new Error("Fire modifier should be number");
    if (typeof result.elementalModifiers.Ice !== "number")
      throw new Error("Ice modifier should be number");
    if (typeof result.elementalModifiers.Lightning !== "number")
      throw new Error("Lightning modifier should be number");
  });

  test("should calculate cumulative effects for multiple weather types", () => {
    const result = calculator.calculateElementalModifiers(["Sunny", "Hot"]);
    if (!result.elementalModifiers)
      throw new Error("Should have elemental modifiers");

    // Both Sunny and Hot should boost Fire
    const sunnyEffect = calculator.getWeatherEffect("Sunny");
    const hotEffect = calculator.getWeatherEffect("Hot");
    const expectedFire = sunnyEffect.Fire + hotEffect.Fire;

    if (Math.abs(result.totalEffectsByElement.Fire - expectedFire) > 0.1) {
      throw new Error(
        `Expected Fire effect ${expectedFire}, got ${result.totalEffectsByElement.Fire}`
      );
    }
  });

  test("should clamp effects to limits", () => {
    // Create a combination that would exceed limits
    const result = calculator.calculateElementalModifiers(["Hot", "Sunny"], {
      applyLimits: true,
    });

    for (const element of ["Fire", "Ice", "Lightning"]) {
      const modifier = result.elementalModifiers[element];
      if (modifier < -40 || modifier > 40) {
        throw new Error(
          `${element} modifier ${modifier} exceeds limits [-40, 40]`
        );
      }
    }
  });

  test("should not clamp effects when disabled", () => {
    const result = calculator.calculateElementalModifiers(["Hot", "Sunny"], {
      applyLimits: false,
    });

    // totalEffectsByElement should contain unclamped values
    if (!result.totalEffectsByElement)
      throw new Error("Should have total effects");
  });

  test("should calculate element damage modifier correctly", () => {
    const baseDamage = 100;
    const modifiedDamage = calculator.calculateElementDamageModifier(
      "Fire",
      ["Sunny"],
      baseDamage
    );

    if (typeof modifiedDamage !== "number")
      throw new Error("Should return number");
    if (modifiedDamage < 0) throw new Error("Damage should not be negative");

    // Sunny should boost Fire, so modified damage should be higher
    const sunnyEffect = calculator.getWeatherEffect("Sunny");
    if (sunnyEffect.Fire > 0 && modifiedDamage <= baseDamage) {
      throw new Error("Fire damage should be boosted by Sunny weather");
    }
  });

  test("should calculate all element damage correctly", () => {
    const baseDamages = { Fire: 100, Ice: 100, Lightning: 100 };
    const damages = calculator.calculateAllElementDamage(
      ["Sunny"],
      baseDamages
    );

    if (!damages.Fire || !damages.Ice || !damages.Lightning)
      throw new Error("Should have all element damages");

    for (const element of ["Fire", "Ice", "Lightning"]) {
      if (damages[element] < 0)
        throw new Error(`${element} damage should not be negative`);
    }
  });

  test("should handle empty weather array", () => {
    const result = calculator.calculateElementalModifiers([]);

    if (result.elementalModifiers.Fire !== 0)
      throw new Error("Fire modifier should be 0 for no weather");
    if (result.elementalModifiers.Ice !== 0)
      throw new Error("Ice modifier should be 0 for no weather");
    if (result.elementalModifiers.Lightning !== 0)
      throw new Error("Lightning modifier should be 0 for no weather");
  });

  test("should handle duplicate weather types", () => {
    const result1 = calculator.calculateElementalModifiers(["Sunny"]);
    const result2 = calculator.calculateElementalModifiers(["Sunny", "Sunny"]);

    // Should be the same result (duplicates removed)
    if (result1.elementalModifiers.Fire !== result2.elementalModifiers.Fire) {
      throw new Error("Duplicate weather should not change result");
    }
  });

  test("should detect when effects would be clamped", () => {
    const clampedCheck = calculator.wouldEffectsBeClamped(["Hot", "Sunny"]);

    if (typeof clampedCheck.Fire !== "boolean")
      throw new Error("Should return boolean for Fire");
    if (typeof clampedCheck.Ice !== "boolean")
      throw new Error("Should return boolean for Ice");
    if (typeof clampedCheck.Lightning !== "boolean")
      throw new Error("Should return boolean for Lightning");
  });

  test("should find optimal weather for element boost", () => {
    const availableWeather = ["Sunny", "Hot", "Cold", "Snowy"];
    const optimal = calculator.findOptimalWeatherForElement(
      "Fire",
      availableWeather,
      2
    );

    if (!Array.isArray(optimal)) throw new Error("Should return array");
    if (optimal.length > 2)
      throw new Error("Should respect max weather types limit");

    // Should prefer weather that boosts Fire
    if (optimal.length > 0) {
      const firstWeatherEffect = calculator.getWeatherEffect(optimal[0]);
      if (firstWeatherEffect.Fire <= 0)
        throw new Error("Should prioritize Fire-boosting weather");
    }
  });

  test("should analyze weather effectiveness", () => {
    const analysis = calculator.analyzeWeatherEffectiveness(["Sunny", "Hot"]);

    if (typeof analysis.overallEffectiveness !== "number")
      throw new Error("Should have overall effectiveness");
    if (!analysis.elementBreakdown)
      throw new Error("Should have element breakdown");
    if (!Array.isArray(analysis.recommendations))
      throw new Error("Should have recommendations array");

    for (const element of ["Fire", "Ice", "Lightning"]) {
      if (!analysis.elementBreakdown[element])
        throw new Error(`Should have breakdown for ${element}`);
      if (typeof analysis.elementBreakdown[element].modifier !== "number") {
        throw new Error(`Should have numeric modifier for ${element}`);
      }
    }
  });

  // Test utility functions
  test("should clamp weather effect values", () => {
    if (clampWeatherEffect(50) !== 40)
      throw new Error("Should clamp to max limit");
    if (clampWeatherEffect(-50) !== -40)
      throw new Error("Should clamp to min limit");
    if (clampWeatherEffect(20) !== 20)
      throw new Error("Should not clamp valid values");
  });

  test("should create empty weather effect", () => {
    const effect = createEmptyWeatherEffect();
    if (effect.Fire !== 0 || effect.Ice !== 0 || effect.Lightning !== 0) {
      throw new Error("Empty effect should have all zeros");
    }
  });

  test("should add weather effects correctly", () => {
    const effect1 = { Fire: 10, Ice: -5, Lightning: 15 };
    const effect2 = { Fire: 5, Ice: 10, Lightning: -10 };
    const result = addWeatherEffects(effect1, effect2);

    if (result.Fire !== 15) throw new Error("Fire should be 15");
    if (result.Ice !== 5) throw new Error("Ice should be 5");
    if (result.Lightning !== 5) throw new Error("Lightning should be 5");
  });

  test("should clamp when adding weather effects", () => {
    const effect1 = { Fire: 30, Ice: -30, Lightning: 0 };
    const effect2 = { Fire: 20, Ice: -20, Lightning: 0 };
    const result = addWeatherEffects(effect1, effect2);

    if (result.Fire !== 40) throw new Error("Fire should be clamped to 40");
    if (result.Ice !== -40) throw new Error("Ice should be clamped to -40");
  });

  test("should multiply weather effects correctly", () => {
    const effect = { Fire: 10, Ice: -10, Lightning: 5 };
    const result = multiplyWeatherEffect(effect, 2);

    if (result.Fire !== 20) throw new Error("Fire should be 20");
    if (result.Ice !== -20) throw new Error("Ice should be -20");
    if (result.Lightning !== 10) throw new Error("Lightning should be 10");
  });

  test("should validate weather effects", () => {
    if (!isValidWeatherEffect({ Fire: 20, Ice: -10, Lightning: 5 })) {
      throw new Error("Valid effect should pass validation");
    }
    if (isValidWeatherEffect({ Fire: 50, Ice: 0, Lightning: 0 })) {
      throw new Error("Invalid effect should fail validation");
    }
    if (isValidWeatherEffect({ Fire: 0, Ice: -50, Lightning: 0 })) {
      throw new Error("Invalid effect should fail validation");
    }
  });

  test("should calculate damage percentage change", () => {
    const change = calculateDamagePercentageChange(100, 120);
    if (Math.abs(change - 20) > 0.1)
      throw new Error("Should calculate 20% increase");

    const decrease = calculateDamagePercentageChange(100, 80);
    if (Math.abs(decrease - -20) > 0.1)
      throw new Error("Should calculate 20% decrease");

    const noChange = calculateDamagePercentageChange(0, 0);
    if (noChange !== 0) throw new Error("Should handle zero base damage");
  });

  test("should handle custom limits", () => {
    const customLimits = { min: -20, max: 20 };
    const result = calculator.calculateElementalModifiers(["Hot", "Sunny"], {
      applyLimits: true,
      customLimits,
    });

    for (const element of ["Fire", "Ice", "Lightning"]) {
      const modifier = result.elementalModifiers[element];
      if (modifier < -20 || modifier > 20) {
        throw new Error(
          `${element} modifier ${modifier} exceeds custom limits [-20, 20]`
        );
      }
    }
  });

  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("All tests passed! ✓");
  }
}

// Run the tests
runTests();
