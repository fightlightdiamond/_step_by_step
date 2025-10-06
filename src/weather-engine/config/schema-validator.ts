/**
 * JSON Schema validation for weather configurations
 */

import {
  WEATHER_TYPES,
  ELEMENT_TYPES,
  WEATHER_EFFECT_LIMITS,
} from "../constants";

/**
 * JSON Schema for weather configuration validation
 */
export const WEATHER_CONFIG_SCHEMA = {
  type: "object",
  required: [
    "weatherEffects",
    "compatibilityMatrix",
    "oppositeWeatherPairs",
    "effectLimits",
  ],
  properties: {
    weatherEffects: {
      type: "object",
      required: WEATHER_TYPES,
      properties: Object.fromEntries(
        WEATHER_TYPES.map((weatherType) => [
          weatherType,
          {
            type: "object",
            required: ELEMENT_TYPES,
            properties: Object.fromEntries(
              ELEMENT_TYPES.map((elementType) => [
                elementType,
                {
                  type: "number",
                  minimum: WEATHER_EFFECT_LIMITS.MIN,
                  maximum: WEATHER_EFFECT_LIMITS.MAX,
                },
              ])
            ),
            additionalProperties: false,
          },
        ])
      ),
      additionalProperties: false,
    },
    compatibilityMatrix: {
      type: "object",
      required: WEATHER_TYPES,
      properties: Object.fromEntries(
        WEATHER_TYPES.map((weatherType) => [
          weatherType,
          {
            type: "array",
            items: {
              type: "string",
              enum: WEATHER_TYPES,
            },
          },
        ])
      ),
      additionalProperties: false,
    },
    oppositeWeatherPairs: {
      type: "array",
      items: {
        type: "array",
        items: {
          type: "string",
          enum: WEATHER_TYPES,
        },
        minItems: 2,
        maxItems: 2,
      },
    },
    effectLimits: {
      type: "object",
      required: ["min", "max"],
      properties: {
        min: {
          type: "number",
        },
        max: {
          type: "number",
        },
      },
      additionalProperties: false,
    },
    seasonalPools: {
      type: "object",
      properties: {
        Spring: {
          type: "object",
          patternProperties: {
            "^(Sunny|Cloudy|Rainy|Windy|Stormy|Foggy|Snowy|Hot|Cold|Warm|Cool|Humid)$":
              {
                type: "number",
                minimum: 0,
                maximum: 1,
              },
          },
          additionalProperties: false,
        },
        Summer: {
          type: "object",
          patternProperties: {
            "^(Sunny|Cloudy|Rainy|Windy|Stormy|Foggy|Snowy|Hot|Cold|Warm|Cool|Humid)$":
              {
                type: "number",
                minimum: 0,
                maximum: 1,
              },
          },
          additionalProperties: false,
        },
        Autumn: {
          type: "object",
          patternProperties: {
            "^(Sunny|Cloudy|Rainy|Windy|Stormy|Foggy|Snowy|Hot|Cold|Warm|Cool|Humid)$":
              {
                type: "number",
                minimum: 0,
                maximum: 1,
              },
          },
          additionalProperties: false,
        },
        Winter: {
          type: "object",
          patternProperties: {
            "^(Sunny|Cloudy|Rainy|Windy|Stormy|Foggy|Snowy|Hot|Cold|Warm|Cool|Humid)$":
              {
                type: "number",
                minimum: 0,
                maximum: 1,
              },
          },
          additionalProperties: false,
        },
      },
    },
    monthlyMappings: {
      type: "object",
      patternProperties: {
        "^([1-9]|1[0-2])$": {
          type: "string",
          enum: ["Spring", "Summer", "Autumn", "Winter"],
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
} as const;

/**
 * Schema validation error
 */
export class SchemaValidationError extends Error {
  constructor(
    message: string,
    public readonly path?: string,
    public readonly value?: any
  ) {
    super(`Schema validation error: ${message}`);
    this.name = "SchemaValidationError";
  }
}

/**
 * Simple JSON Schema validator implementation
 */
export class JSONSchemaValidator {
  /**
   * Validate data against schema
   */
  public static validate(data: any, schema: any, path: string = ""): void {
    if (schema.type) {
      this.validateType(data, schema.type, path);
    }

    if (schema.required && typeof data === "object" && data !== null) {
      this.validateRequired(data, schema.required, path);
    }

    if (schema.properties && typeof data === "object" && data !== null) {
      this.validateProperties(data, schema.properties, path);
    }

    if (schema.patternProperties && typeof data === "object" && data !== null) {
      this.validatePatternProperties(data, schema.patternProperties, path);
    }

    if (schema.items && Array.isArray(data)) {
      this.validateArrayItems(data, schema.items, path);
    }

    if (schema.enum) {
      this.validateEnum(data, schema.enum, path);
    }

    if (typeof schema.minimum === "number" && typeof data === "number") {
      this.validateMinimum(data, schema.minimum, path);
    }

    if (typeof schema.maximum === "number" && typeof data === "number") {
      this.validateMaximum(data, schema.maximum, path);
    }

    if (typeof schema.minItems === "number" && Array.isArray(data)) {
      this.validateMinItems(data, schema.minItems, path);
    }

    if (typeof schema.maxItems === "number" && Array.isArray(data)) {
      this.validateMaxItems(data, schema.maxItems, path);
    }

    if (
      schema.additionalProperties === false &&
      typeof data === "object" &&
      data !== null
    ) {
      this.validateNoAdditionalProperties(data, schema, path);
    }
  }

  private static validateType(
    data: any,
    expectedType: string,
    path: string
  ): void {
    const actualType = Array.isArray(data) ? "array" : typeof data;
    if (actualType !== expectedType) {
      throw new SchemaValidationError(
        `Expected type ${expectedType} but got ${actualType}`,
        path,
        data
      );
    }
  }

  private static validateRequired(
    data: any,
    required: string[],
    path: string
  ): void {
    for (const prop of required) {
      if (!(prop in data)) {
        throw new SchemaValidationError(
          `Missing required property: ${prop}`,
          `${path}.${prop}`,
          data
        );
      }
    }
  }

  private static validateProperties(
    data: any,
    properties: any,
    path: string
  ): void {
    for (const [prop, propSchema] of Object.entries(properties)) {
      if (prop in data) {
        this.validate(data[prop], propSchema, `${path}.${prop}`);
      }
    }
  }

  private static validatePatternProperties(
    data: any,
    patternProperties: any,
    path: string
  ): void {
    for (const [pattern, propSchema] of Object.entries(patternProperties)) {
      const regex = new RegExp(pattern);
      for (const [key, value] of Object.entries(data)) {
        if (regex.test(key)) {
          this.validate(value, propSchema, `${path}.${key}`);
        }
      }
    }
  }

  private static validateArrayItems(
    data: any[],
    itemSchema: any,
    path: string
  ): void {
    data.forEach((item, index) => {
      this.validate(item, itemSchema, `${path}[${index}]`);
    });
  }

  private static validateEnum(
    data: any,
    enumValues: any[],
    path: string
  ): void {
    if (!enumValues.includes(data)) {
      throw new SchemaValidationError(
        `Value must be one of: ${enumValues.join(", ")}`,
        path,
        data
      );
    }
  }

  private static validateMinimum(
    data: number,
    minimum: number,
    path: string
  ): void {
    if (data < minimum) {
      throw new SchemaValidationError(
        `Value ${data} is below minimum ${minimum}`,
        path,
        data
      );
    }
  }

  private static validateMaximum(
    data: number,
    maximum: number,
    path: string
  ): void {
    if (data > maximum) {
      throw new SchemaValidationError(
        `Value ${data} is above maximum ${maximum}`,
        path,
        data
      );
    }
  }

  private static validateMinItems(
    data: any[],
    minItems: number,
    path: string
  ): void {
    if (data.length < minItems) {
      throw new SchemaValidationError(
        `Array must have at least ${minItems} items`,
        path,
        data
      );
    }
  }

  private static validateMaxItems(
    data: any[],
    maxItems: number,
    path: string
  ): void {
    if (data.length > maxItems) {
      throw new SchemaValidationError(
        `Array must have at most ${maxItems} items`,
        path,
        data
      );
    }
  }

  private static validateNoAdditionalProperties(
    data: any,
    schema: any,
    path: string
  ): void {
    const allowedProps = new Set([
      ...(schema.properties ? Object.keys(schema.properties) : []),
      ...(schema.patternProperties
        ? this.getPatternPropertyKeys(data, schema.patternProperties)
        : []),
    ]);

    for (const key of Object.keys(data)) {
      if (
        !allowedProps.has(key) &&
        !this.matchesPatternProperty(key, schema.patternProperties)
      ) {
        throw new SchemaValidationError(
          `Additional property not allowed: ${key}`,
          `${path}.${key}`,
          data[key]
        );
      }
    }
  }

  private static getPatternPropertyKeys(
    data: any,
    patternProperties: any
  ): string[] {
    const keys: string[] = [];
    for (const pattern of Object.keys(patternProperties)) {
      const regex = new RegExp(pattern);
      for (const key of Object.keys(data)) {
        if (regex.test(key)) {
          keys.push(key);
        }
      }
    }
    return keys;
  }

  private static matchesPatternProperty(
    key: string,
    patternProperties: any
  ): boolean {
    if (!patternProperties) return false;
    for (const pattern of Object.keys(patternProperties)) {
      const regex = new RegExp(pattern);
      if (regex.test(key)) {
        return true;
      }
    }
    return false;
  }
}
