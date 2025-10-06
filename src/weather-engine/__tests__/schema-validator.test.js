/**
 * Unit tests for JSON schema validation
 */

const {
  JSONSchemaValidator,
  SchemaValidationError,
  WEATHER_CONFIG_SCHEMA,
} = require("../config/schema-validator");
const { WEATHER_TYPES, ELEMENT_TYPES } = require("../constants");

describe("JSONSchemaValidator", () => {
  describe("basic validation", () => {
    test("should validate correct types", () => {
      expect(() =>
        JSONSchemaValidator.validate("test", { type: "string" })
      ).not.toThrow();
      expect(() =>
        JSONSchemaValidator.validate(42, { type: "number" })
      ).not.toThrow();
      expect(() =>
        JSONSchemaValidator.validate(true, { type: "boolean" })
      ).not.toThrow();
      expect(() =>
        JSONSchemaValidator.validate([], { type: "array" })
      ).not.toThrow();
      expect(() =>
        JSONSchemaValidator.validate({}, { type: "object" })
      ).not.toThrow();
    });

    test("should reject incorrect types", () => {
      expect(() =>
        JSONSchemaValidator.validate(42, { type: "string" })
      ).toThrow(SchemaValidationError);
      expect(() =>
        JSONSchemaValidator.validate("test", { type: "number" })
      ).toThrow(SchemaValidationError);
      expect(() => JSONSchemaValidator.validate({}, { type: "array" })).toThrow(
        SchemaValidationError
      );
    });

    test("should validate required properties", () => {
      const schema = {
        type: "object",
        required: ["name", "age"],
      };

      expect(() =>
        JSONSchemaValidator.validate({ name: "John", age: 30 }, schema)
      ).not.toThrow();
      expect(() =>
        JSONSchemaValidator.validate({ name: "John" }, schema)
      ).toThrow(SchemaValidationError);
      expect(() => JSONSchemaValidator.validate({ age: 30 }, schema)).toThrow(
        SchemaValidationError
      );
    });

    test("should validate enum values", () => {
      const schema = {
        type: "string",
        enum: ["red", "green", "blue"],
      };

      expect(() => JSONSchemaValidator.validate("red", schema)).not.toThrow();
      expect(() => JSONSchemaValidator.validate("yellow", schema)).toThrow(
        SchemaValidationError
      );
    });

    test("should validate number ranges", () => {
      const schema = {
        type: "number",
        minimum: 0,
        maximum: 100,
      };

      expect(() => JSONSchemaValidator.validate(50, schema)).not.toThrow();
      expect(() => JSONSchemaValidator.validate(-1, schema)).toThrow(
        SchemaValidationError
      );
      expect(() => JSONSchemaValidator.validate(101, schema)).toThrow(
        SchemaValidationError
      );
    });

    test("should validate array items", () => {
      const schema = {
        type: "array",
        items: { type: "string" },
      };

      expect(() =>
        JSONSchemaValidator.validate(["a", "b", "c"], schema)
      ).not.toThrow();
      expect(() => JSONSchemaValidator.validate(["a", 1, "c"], schema)).toThrow(
        SchemaValidationError
      );
    });

    test("should validate array length", () => {
      const schema = {
        type: "array",
        minItems: 2,
        maxItems: 4,
      };

      expect(() =>
        JSONSchemaValidator.validate([1, 2, 3], schema)
      ).not.toThrow();
      expect(() => JSONSchemaValidator.validate([1], schema)).toThrow(
        SchemaValidationError
      );
      expect(() =>
        JSONSchemaValidator.validate([1, 2, 3, 4, 5], schema)
      ).toThrow(SchemaValidationError);
    });

    test("should validate pattern properties", () => {
      const schema = {
        type: "object",
        patternProperties: {
          "^[A-Z][a-z]+$": { type: "number" },
        },
        additionalProperties: false,
      };

      expect(() =>
        JSONSchemaValidator.validate({ Name: 123, Age: 456 }, schema)
      ).not.toThrow();
      expect(() => JSONSchemaValidator.validate({ name: 123 }, schema)).toThrow(
        SchemaValidationError
      );
      expect(() =>
        JSONSchemaValidator.validate({ Name: "invalid" }, schema)
      ).toThrow(SchemaValidationError);
    });

    test("should validate additional properties", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        additionalProperties: false,
      };

      expect(() =>
        JSONSchemaValidator.validate({ name: "John" }, schema)
      ).not.toThrow();
      expect(() =>
        JSONSchemaValidator.validate({ name: "John", age: 30 }, schema)
      ).toThrow(SchemaValidationError);
    });
  });

  describe("weather config schema validation", () => {
    const createValidWeatherConfig = () => ({
      weatherEffects: Object.fromEntries(
        WEATHER_TYPES.map((weather) => [
          weather,
          Object.fromEntries(ELEMENT_TYPES.map((element) => [element, 0])),
        ])
      ),
      compatibilityMatrix: Object.fromEntries(
        WEATHER_TYPES.map((weather) => [weather, []])
      ),
      oppositeWeatherPairs: [["Hot", "Cold"]],
      effectLimits: { min: -40, max: 40 },
    });

    test("should validate complete weather configuration", () => {
      const config = createValidWeatherConfig();
      expect(() =>
        JSONSchemaValidator.validate(config, WEATHER_CONFIG_SCHEMA)
      ).not.toThrow();
    });

    test("should reject missing weather effects", () => {
      const config = createValidWeatherConfig();
      delete config.weatherEffects.Sunny;

      expect(() =>
        JSONSchemaValidator.validate(config, WEATHER_CONFIG_SCHEMA)
      ).toThrow(SchemaValidationError);
    });

    test("should reject missing element effects", () => {
      const config = createValidWeatherConfig();
      delete config.weatherEffects.Sunny.Fire;

      expect(() =>
        JSONSchemaValidator.validate(config, WEATHER_CONFIG_SCHEMA)
      ).toThrow(SchemaValidationError);
    });

    test("should reject effect values outside limits", () => {
      const config = createValidWeatherConfig();
      config.weatherEffects.Sunny.Fire = 50; // Exceeds max limit

      expect(() =>
        JSONSchemaValidator.validate(config, WEATHER_CONFIG_SCHEMA)
      ).toThrow(SchemaValidationError);
    });

    test("should reject invalid weather types in compatibility matrix", () => {
      const config = createValidWeatherConfig();
      config.compatibilityMatrix.Sunny = ["InvalidWeather"];

      expect(() =>
        JSONSchemaValidator.validate(config, WEATHER_CONFIG_SCHEMA)
      ).toThrow(SchemaValidationError);
    });

    test("should reject invalid opposite weather pairs", () => {
      const config = createValidWeatherConfig();
      config.oppositeWeatherPairs = [["InvalidWeather1", "InvalidWeather2"]];

      expect(() =>
        JSONSchemaValidator.validate(config, WEATHER_CONFIG_SCHEMA)
      ).toThrow(SchemaValidationError);
    });

    test("should reject malformed opposite weather pairs", () => {
      const config = createValidWeatherConfig();
      config.oppositeWeatherPairs = [["Hot"]]; // Should have 2 elements

      expect(() =>
        JSONSchemaValidator.validate(config, WEATHER_CONFIG_SCHEMA)
      ).toThrow(SchemaValidationError);
    });

    test("should reject missing effect limits", () => {
      const config = createValidWeatherConfig();
      delete config.effectLimits.min;

      expect(() =>
        JSONSchemaValidator.validate(config, WEATHER_CONFIG_SCHEMA)
      ).toThrow(SchemaValidationError);
    });

    test("should validate optional seasonal pools", () => {
      const config = createValidWeatherConfig();
      config.seasonalPools = {
        Spring: { Sunny: 0.3, Rainy: 0.7 },
        Summer: { Hot: 0.8, Sunny: 0.2 },
        Autumn: { Cool: 0.5, Windy: 0.5 },
        Winter: { Cold: 0.6, Snowy: 0.4 },
      };

      expect(() =>
        JSONSchemaValidator.validate(config, WEATHER_CONFIG_SCHEMA)
      ).not.toThrow();
    });

    test("should reject invalid seasonal pool probabilities", () => {
      const config = createValidWeatherConfig();
      config.seasonalPools = {
        Spring: { Sunny: 1.5 }, // Probability > 1
      };

      expect(() =>
        JSONSchemaValidator.validate(config, WEATHER_CONFIG_SCHEMA)
      ).toThrow(SchemaValidationError);
    });

    test("should validate optional monthly mappings", () => {
      const config = createValidWeatherConfig();
      config.monthlyMappings = {
        1: "Winter",
        2: "Winter",
        3: "Spring",
        4: "Spring",
        5: "Spring",
        6: "Summer",
        7: "Summer",
        8: "Summer",
        9: "Autumn",
        10: "Autumn",
        11: "Autumn",
        12: "Winter",
      };

      expect(() =>
        JSONSchemaValidator.validate(config, WEATHER_CONFIG_SCHEMA)
      ).not.toThrow();
    });

    test("should reject invalid month numbers", () => {
      const config = createValidWeatherConfig();
      config.monthlyMappings = {
        13: "Winter", // Invalid month
      };

      expect(() =>
        JSONSchemaValidator.validate(config, WEATHER_CONFIG_SCHEMA)
      ).toThrow(SchemaValidationError);
    });

    test("should reject invalid season names", () => {
      const config = createValidWeatherConfig();
      config.monthlyMappings = {
        1: "InvalidSeason",
      };

      expect(() =>
        JSONSchemaValidator.validate(config, WEATHER_CONFIG_SCHEMA)
      ).toThrow(SchemaValidationError);
    });
  });

  describe("error reporting", () => {
    test("should provide detailed error messages with paths", () => {
      const schema = {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              age: { type: "number" },
            },
          },
        },
      };

      try {
        JSONSchemaValidator.validate({ user: { age: "invalid" } }, schema);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SchemaValidationError);
        expect(error.path).toBe(".user.age");
        expect(error.message).toContain("Expected type number but got string");
      }
    });

    test("should include the invalid value in error", () => {
      try {
        JSONSchemaValidator.validate("invalid", { type: "number" });
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SchemaValidationError);
        expect(error.value).toBe("invalid");
      }
    });
  });
});
