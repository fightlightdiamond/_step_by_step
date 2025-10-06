/**
 * Unit tests for weather mixing validation logic
 */

const fs = require("fs");
const path = require("path");

// Mock the weather validator functionality for testing
class TestWeatherValidator {
  constructor(config) {
    this.compatibilityMatrix = config.compatibilityMatrix;
    this.oppositeWeatherPairs = config.oppositeWeatherPairs;
  }

  validateWeatherCombination(weatherTypes) {
    const errors = [];
    const warnings = [];

    // Remove duplicates
    const uniqueWeather = [...new Set(weatherTypes)];

    // Check for too many weather types
    if (uniqueWeather.length > 5) {
      errors.push({
        errorType: "TOO_MANY_WEATHER_TYPES",
        invalidWeather: uniqueWeather,
        message: `Too many weather types: ${uniqueWeather.length}. Maximum allowed: 5`,
      });
    }

    // Check for opposite weather types
    const oppositeErrors = this.checkOppositeWeatherTypes(uniqueWeather);
    errors.push(...oppositeErrors);

    // Check for incompatible weather types
    const incompatibilityErrors = this.checkWeatherCompatibility(uniqueWeather);
    errors.push(...incompatibilityErrors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  areOppositeWeatherTypes(weather1, weather2) {
    return this.oppositeWeatherPairs.some(
      ([type1, type2]) =>
        (type1 === weather1 && type2 === weather2) ||
        (type1 === weather2 && type2 === weather1)
    );
  }

  hasOppositeWeatherTypes(weatherTypes) {
    for (let i = 0; i < weatherTypes.length; i++) {
      for (let j = i + 1; j < weatherTypes.length; j++) {
        if (this.areOppositeWeatherTypes(weatherTypes[i], weatherTypes[j])) {
          return true;
        }
      }
    }
    return false;
  }

  areWeatherTypesCompatible(weather1, weather2) {
    const compatible1 = this.compatibilityMatrix.get(weather1) || [];
    const compatible2 = this.compatibilityMatrix.get(weather2) || [];

    return compatible1.includes(weather2) || compatible2.includes(weather1);
  }

  getCompatibleWeatherTypes(weatherType) {
    return this.compatibilityMatrix.get(weatherType) || [];
  }

  getOppositeWeatherTypes(weatherType) {
    const opposites = [];

    for (const [type1, type2] of this.oppositeWeatherPairs) {
      if (type1 === weatherType) {
        opposites.push(type2);
      } else if (type2 === weatherType) {
        opposites.push(type1);
      }
    }

    return opposites;
  }

  findCompatibleWeatherTypes(baseWeather, candidateWeather) {
    const compatible = [];

    for (const candidate of candidateWeather) {
      let isCompatibleWithAll = true;

      // Check if candidate is compatible with all base weather types
      for (const base of baseWeather) {
        if (!this.areWeatherTypesCompatible(base, candidate)) {
          isCompatibleWithAll = false;
          break;
        }
      }

      // Check if candidate is not opposite to any base weather type
      if (isCompatibleWithAll) {
        let hasOpposite = false;
        for (const base of baseWeather) {
          if (this.areOppositeWeatherTypes(base, candidate)) {
            hasOpposite = true;
            break;
          }
        }

        if (!hasOpposite) {
          compatible.push(candidate);
        }
      }
    }

    return compatible;
  }

  checkOppositeWeatherTypes(weatherTypes) {
    const errors = [];

    for (let i = 0; i < weatherTypes.length; i++) {
      for (let j = i + 1; j < weatherTypes.length; j++) {
        const weather1 = weatherTypes[i];
        const weather2 = weatherTypes[j];

        if (this.areOppositeWeatherTypes(weather1, weather2)) {
          errors.push({
            errorType: "OPPOSITE_WEATHER",
            invalidWeather: [weather1, weather2],
            message: `Opposite weather types cannot coexist: ${weather1} and ${weather2}`,
          });
        }
      }
    }

    return errors;
  }

  checkWeatherCompatibility(weatherTypes) {
    const errors = [];

    for (let i = 0; i < weatherTypes.length; i++) {
      for (let j = i + 1; j < weatherTypes.length; j++) {
        const weather1 = weatherTypes[i];
        const weather2 = weatherTypes[j];

        // Skip if they are opposites (already handled)
        if (this.areOppositeWeatherTypes(weather1, weather2)) {
          continue;
        }

        // Check if they are compatible
        if (!this.areWeatherTypesCompatible(weather1, weather2)) {
          errors.push({
            errorType: "INCOMPATIBLE_WEATHER",
            invalidWeather: [weather1, weather2],
            message: `Incompatible weather types: ${weather1} and ${weather2}`,
          });
        }
      }
    }

    return errors;
  }
}

// Helper function to create test config
function createTestConfig() {
  const configPath = path.join(__dirname, "../config/weather-effects.json");
  const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));

  // Convert to Map format
  const compatibilityMatrix = new Map();
  for (const [weather, compatible] of Object.entries(
    configData.compatibilityMatrix
  )) {
    compatibilityMatrix.set(weather, compatible);
  }

  return {
    compatibilityMatrix,
    oppositeWeatherPairs: configData.oppositeWeatherPairs,
  };
}

// Test functions
function runTests() {
  console.log("Running Weather Validator Tests...\n");

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
  const validator = new TestWeatherValidator(config);

  test("should validate compatible weather combinations", () => {
    const result = validator.validateWeatherCombination(["Sunny", "Warm"]);
    if (!result.isValid) throw new Error("Should be valid combination");
    if (result.errors.length > 0) throw new Error("Should have no errors");
  });

  test("should reject opposite weather combinations", () => {
    const result = validator.validateWeatherCombination(["Hot", "Cold"]);
    if (result.isValid) throw new Error("Should be invalid combination");
    if (result.errors.length === 0) throw new Error("Should have errors");
    if (result.errors[0].errorType !== "OPPOSITE_WEATHER")
      throw new Error("Should be opposite weather error");
  });

  test("should reject too many weather types", () => {
    const result = validator.validateWeatherCombination([
      "Sunny",
      "Rainy",
      "Windy",
      "Stormy",
      "Foggy",
      "Snowy",
    ]);
    if (result.isValid) throw new Error("Should be invalid combination");
    const tooManyError = result.errors.find(
      (e) => e.errorType === "TOO_MANY_WEATHER_TYPES"
    );
    if (!tooManyError)
      throw new Error("Should have too many weather types error");
  });

  test("should detect opposite weather types correctly", () => {
    if (!validator.areOppositeWeatherTypes("Hot", "Cold"))
      throw new Error("Hot and Cold should be opposites");
    if (!validator.areOppositeWeatherTypes("Sunny", "Snowy"))
      throw new Error("Sunny and Snowy should be opposites");
    if (validator.areOppositeWeatherTypes("Sunny", "Rainy"))
      throw new Error("Sunny and Rainy should not be opposites");
  });

  test("should detect opposite weather types in arrays", () => {
    if (!validator.hasOppositeWeatherTypes(["Hot", "Cold"]))
      throw new Error("Should detect opposites");
    if (!validator.hasOppositeWeatherTypes(["Sunny", "Rainy", "Snowy"]))
      throw new Error("Should detect opposites");
    if (validator.hasOppositeWeatherTypes(["Sunny", "Rainy", "Windy"]))
      throw new Error("Should not detect opposites");
  });

  test("should check weather compatibility correctly", () => {
    if (!validator.areWeatherTypesCompatible("Sunny", "Warm"))
      throw new Error("Sunny and Warm should be compatible");
    if (validator.areWeatherTypesCompatible("Hot", "Cold"))
      throw new Error("Hot and Cold should not be compatible");
  });

  test("should get compatible weather types", () => {
    const compatible = validator.getCompatibleWeatherTypes("Sunny");
    if (!Array.isArray(compatible)) throw new Error("Should return array");
    if (compatible.length === 0)
      throw new Error("Sunny should have compatible weather types");
  });

  test("should get opposite weather types", () => {
    const opposites = validator.getOppositeWeatherTypes("Hot");
    if (!Array.isArray(opposites)) throw new Error("Should return array");
    if (!opposites.includes("Cold"))
      throw new Error("Cold should be opposite of Hot");
  });

  test("should find compatible weather types from candidates", () => {
    const baseWeather = ["Sunny"];
    const candidates = ["Warm", "Cold", "Hot"];
    const compatible = validator.findCompatibleWeatherTypes(
      baseWeather,
      candidates
    );

    if (!Array.isArray(compatible)) throw new Error("Should return array");
    if (compatible.includes("Cold"))
      throw new Error("Cold should not be compatible with Sunny");
  });

  test("should handle empty weather arrays", () => {
    const result = validator.validateWeatherCombination([]);
    if (!result.isValid) throw new Error("Empty array should be valid");
    if (result.errors.length > 0)
      throw new Error("Empty array should have no errors");
  });

  test("should handle duplicate weather types", () => {
    const result = validator.validateWeatherCombination([
      "Sunny",
      "Sunny",
      "Warm",
    ]);
    if (!result.isValid) throw new Error("Should handle duplicates");
    // Should only process unique weather types
  });

  test("should validate single weather type", () => {
    const result = validator.validateWeatherCombination(["Sunny"]);
    if (!result.isValid) throw new Error("Single weather type should be valid");
    if (result.errors.length > 0)
      throw new Error("Single weather type should have no errors");
  });

  test("should validate complex valid combinations", () => {
    const result = validator.validateWeatherCombination([
      "Cloudy",
      "Rainy",
      "Cool",
    ]);
    if (!result.isValid) throw new Error("Should be valid combination");
    if (result.errors.length > 0) throw new Error("Should have no errors");
  });

  test("should reject multiple incompatible combinations", () => {
    const result = validator.validateWeatherCombination([
      "Hot",
      "Cold",
      "Sunny",
      "Snowy",
    ]);
    if (result.isValid) throw new Error("Should be invalid combination");
    if (result.errors.length < 2)
      throw new Error("Should have multiple errors");
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
