# Weather Engine Configuration Reference

## Table of Contents

- [Configuration Overview](#configuration-overview)
- [Weather Effects Configuration](#weather-effects-configuration)
- [Seasonal Configuration](#seasonal-configuration)
- [Game Mode Configuration](#game-mode-configuration)
- [Card Configuration](#card-configuration)
- [Validation Rules](#validation-rules)
- [Environment Configuration](#environment-configuration)
- [Custom Configuration](#custom-configuration)

## Configuration Overview

The Weather Engine uses JSON-based configuration files to define weather effects, seasonal patterns, game modes, and validation rules. This allows for easy customization without code changes.

### Default Configuration Structure

```json
{
  "weatherEffects": {
    /* Weather type effects */
  },
  "seasonalPools": {
    /* Seasonal weather distributions */
  },
  "compatibilityMatrix": {
    /* Weather compatibility rules */
  },
  "gameModes": {
    /* Available game modes */
  },
  "cards": {
    /* Weather card definitions */
  },
  "validation": {
    /* Validation rules */
  },
  "limits": {
    /* System limits and bounds */
  }
}
```

### Configuration Loading

```typescript
import { ConfigManager } from "@/weather-engine/config/config-manager";

const configManager = new ConfigManager();

// Load default configuration
await configManager.loadConfig();

// Load custom configuration
await configManager.loadConfig("./custom-weather-config.json");

// Load configuration with validation
const config = await configManager.loadConfig("./config.json", {
  validate: true,
});
```

## Weather Effects Configuration

### Basic Weather Effects

Define how each weather type affects elemental damage:

```json
{
  "weatherEffects": {
    "Sunny": {
      "Fire": 20,
      "Ice": -10,
      "Lightning": -5
    },
    "Rainy": {
      "Fire": -20,
      "Ice": 5,
      "Lightning": 15
    },
    "Stormy": {
      "Fire": -15,
      "Ice": 0,
      "Lightning": 25
    },
    "Snowy": {
      "Fire": -25,
      "Ice": 20,
      "Lightning": -10
    },
    "Hot": {
      "Fire": 30,
      "Ice": -20,
      "Lightning": 0
    },
    "Cold": {
      "Fire": -20,
      "Ice": 25,
      "Lightning": -5
    },
    "Windy": {
      "Fire": 5,
      "Ice": 5,
      "Lightning": 10
    },
    "Foggy": {
      "Fire": -5,
      "Ice": 10,
      "Lightning": -15
    },
    "Cloudy": {
      "Fire": -5,
      "Ice": 0,
      "Lightning": 5
    },
    "Humid": {
      "Fire": -10,
      "Ice": -5,
      "Lightning": 20
    },
    "Warm": {
      "Fire": 10,
      "Ice": -5,
      "Lightning": 0
    },
    "Cool": {
      "Fire": -5,
      "Ice": 10,
      "Lightning": 0
    }
  }
}
```

### Weather Effect Properties

Each weather effect supports the following properties:

- **Fire**: Modifier for Fire element damage (-40 to +40)
- **Ice**: Modifier for Ice element damage (-40 to +40)
- **Lightning**: Modifier for Lightning element damage (-40 to +40)

### Custom Weather Types

Add custom weather types with their effects:

```json
{
  "weatherEffects": {
    "Volcanic": {
      "Fire": 35,
      "Ice": -30,
      "Lightning": 15
    },
    "Blizzard": {
      "Fire": -30,
      "Ice": 35,
      "Lightning": -20
    },
    "Sandstorm": {
      "Fire": 10,
      "Ice": -15,
      "Lightning": -25
    }
  }
}
```

## Seasonal Configuration

### Seasonal Weather Pools

Define which weather types are available in each season and their probability weights:

```json
{
  "seasonalPools": {
    "Spring": {
      "weights": {
        "Rainy": 0.25,
        "Cloudy": 0.2,
        "Windy": 0.15,
        "Warm": 0.15,
        "Sunny": 0.1,
        "Cool": 0.1,
        "Foggy": 0.05
      }
    },
    "Summer": {
      "weights": {
        "Sunny": 0.3,
        "Hot": 0.25,
        "Warm": 0.15,
        "Humid": 0.1,
        "Cloudy": 0.1,
        "Windy": 0.05,
        "Stormy": 0.05
      }
    },
    "Autumn": {
      "weights": {
        "Cloudy": 0.25,
        "Windy": 0.2,
        "Rainy": 0.15,
        "Cool": 0.15,
        "Foggy": 0.1,
        "Stormy": 0.1,
        "Sunny": 0.05
      }
    },
    "Winter": {
      "weights": {
        "Cold": 0.25,
        "Snowy": 0.25,
        "Foggy": 0.15,
        "Windy": 0.15,
        "Cloudy": 0.1,
        "Stormy": 0.1
      }
    }
  }
}
```

### Month-to-Season Mapping

Define which months belong to which seasons:

```json
{
  "monthlyMappings": {
    "1": "Winter",
    "2": "Winter",
    "3": "Spring",
    "4": "Spring",
    "5": "Spring",
    "6": "Summer",
    "7": "Summer",
    "8": "Summer",
    "9": "Autumn",
    "10": "Autumn",
    "11": "Autumn",
    "12": "Winter"
  }
}
```

### Regional Seasonal Variations

Support different seasonal patterns for different regions:

```json
{
  "regionalSeasons": {
    "Northern": {
      "Spring": [3, 4, 5],
      "Summer": [6, 7, 8],
      "Autumn": [9, 10, 11],
      "Winter": [12, 1, 2]
    },
    "Southern": {
      "Spring": [9, 10, 11],
      "Summer": [12, 1, 2],
      "Autumn": [3, 4, 5],
      "Winter": [6, 7, 8]
    },
    "Tropical": {
      "Wet": [5, 6, 7, 8, 9, 10],
      "Dry": [11, 12, 1, 2, 3, 4]
    }
  }
}
```

## Game Mode Configuration

### Standard Game Modes

Define the built-in game modes and their rules:

```json
{
  "gameModes": {
    "12-Month Campaign": {
      "name": "12-Month Campaign",
      "description": "Progress through 12 months with seasonal weather changes",
      "weatherRules": {
        "weatherChangeFrequency": 1,
        "allowPlayerWeatherControl": true,
        "allowWeatherMixing": false,
        "maxWeatherTypes": 1,
        "weatherSource": "seasonal"
      },
      "turnLimit": 12,
      "specialRules": []
    },
    "Weather Chaos": {
      "name": "Weather Chaos",
      "description": "Random weather mixing creates unpredictable conditions",
      "weatherRules": {
        "weatherChangeFrequency": 1,
        "allowPlayerWeatherControl": true,
        "allowWeatherMixing": true,
        "maxWeatherTypes": 5,
        "weatherSource": "random"
      },
      "turnLimit": 20,
      "specialRules": [
        {
          "name": "Chaos Mixing",
          "description": "2-5 random weather types active each turn",
          "effect": "randomWeatherCount: [2, 5]"
        }
      ]
    },
    "Seasonal Event": {
      "name": "Seasonal Event",
      "description": "Weather restricted to one specific season",
      "weatherRules": {
        "weatherChangeFrequency": 2,
        "allowPlayerWeatherControl": true,
        "allowWeatherMixing": false,
        "maxWeatherTypes": 1,
        "weatherSource": "seasonal"
      },
      "turnLimit": 15,
      "specialRules": [
        {
          "name": "Season Lock",
          "description": "All weather comes from selected season",
          "effect": "seasonLock: true"
        }
      ]
    }
  }
}
```

### Custom Game Mode Properties

- **weatherChangeFrequency**: How often weather changes (every N turns)
- **allowPlayerWeatherControl**: Whether players can play weather cards
- **allowWeatherMixing**: Whether multiple weather types can be active
- **maxWeatherTypes**: Maximum number of simultaneous weather types
- **weatherSource**: Source of weather changes ('seasonal', 'random', 'predetermined', 'player-controlled')
- **turnLimit**: Maximum number of turns in the game mode
- **specialRules**: Array of special rules that modify gameplay

## Card Configuration

### Weather Card Definitions

Define available weather cards and their properties:

```json
{
  "cards": {
    "weatherCards": [
      {
        "id": "sunny-day",
        "type": "Weather",
        "name": "Sunny Day",
        "description": "Changes weather to sunny, boosting Fire damage",
        "weather": "Sunny",
        "cost": 2,
        "rarity": "Common"
      },
      {
        "id": "storm-call",
        "type": "Weather",
        "name": "Storm Call",
        "description": "Summons a powerful storm, greatly boosting Lightning damage",
        "weather": "Stormy",
        "cost": 3,
        "rarity": "Rare"
      },
      {
        "id": "weather-break",
        "type": "BreakWeather",
        "name": "Clear Skies",
        "description": "Removes all weather effects",
        "cost": 1,
        "rarity": "Common"
      }
    ],
    "buffCards": [
      {
        "id": "fire-enhancement",
        "type": "WeatherBuff",
        "name": "Fire Enhancement",
        "description": "Increases Fire damage by 15% for 3 turns",
        "effect": {
          "Fire": 15
        },
        "duration": 3,
        "cost": 2,
        "rarity": "Uncommon"
      }
    ]
  }
}
```

### Card Properties

- **id**: Unique identifier for the card
- **type**: Card type ('Weather', 'BreakWeather', 'WeatherBuff', 'WeatherNerf')
- **name**: Display name of the card
- **description**: Card description for UI
- **weather**: Weather type to apply (for Weather cards)
- **effect**: Direct elemental modifiers (for Buff/Nerf cards)
- **duration**: How many turns the effect lasts
- **cost**: Resource cost to play the card
- **rarity**: Card rarity for deck building

## Validation Rules

### Weather Compatibility Matrix

Define which weather types can coexist:

```json
{
  "compatibilityMatrix": {
    "Sunny": ["Hot", "Warm", "Windy"],
    "Rainy": ["Cloudy", "Cool", "Windy", "Stormy"],
    "Hot": ["Sunny", "Warm", "Humid"],
    "Cold": ["Snowy", "Foggy", "Windy", "Cool"],
    "Stormy": ["Rainy", "Windy", "Cloudy"],
    "Snowy": ["Cold", "Windy", "Foggy"]
  }
}
```

### Opposite Weather Pairs

Define weather types that cannot coexist:

```json
{
  "oppositeWeatherPairs": [
    ["Hot", "Cold"],
    ["Sunny", "Snowy"],
    ["Sunny", "Stormy"],
    ["Hot", "Foggy"],
    ["Snowy", "Humid"]
  ]
}
```

### Effect Limits

Define bounds for weather effects:

```json
{
  "limits": {
    "weatherEffects": {
      "min": -40,
      "max": 40
    },
    "maxWeatherTypes": 5,
    "maxCardDuration": 10,
    "maxCardCost": 10
  }
}
```

## Environment Configuration

### Development Configuration

Configuration for development environment:

```json
{
  "environment": "development",
  "debug": {
    "enableLogging": true,
    "logLevel": "debug",
    "enableWeatherHistory": true,
    "maxHistorySize": 100
  },
  "hotReload": {
    "enabled": true,
    "watchFiles": ["./weather-config.json", "./cards.json"]
  },
  "testing": {
    "enableTestMode": true,
    "deterministicRandom": true,
    "randomSeed": 12345
  }
}
```

### Production Configuration

Configuration for production environment:

```json
{
  "environment": "production",
  "debug": {
    "enableLogging": false,
    "logLevel": "error",
    "enableWeatherHistory": false
  },
  "performance": {
    "enableCaching": true,
    "cacheSize": 1000,
    "enableBatching": true
  },
  "security": {
    "validateInputs": true,
    "enableAntiCheat": true,
    "maxOperationsPerSecond": 100
  }
}
```

## Custom Configuration

### Creating Custom Configurations

```typescript
import { WeatherConfig } from "@/weather-engine/types/config";

const customConfig: WeatherConfig = {
  weatherEffects: {
    // Custom weather effects
    Mystical: {
      Fire: 25,
      Ice: 25,
      Lightning: 25,
    },
  },
  seasonalPools: {
    // Custom seasonal distributions
    "Eternal Spring": {
      weights: {
        Sunny: 0.4,
        Warm: 0.3,
        Rainy: 0.2,
        Windy: 0.1,
      },
    },
  },
  gameModes: {
    // Custom game mode
    "Elemental Mastery": {
      name: "Elemental Mastery",
      description: "Enhanced elemental effects",
      weatherRules: {
        weatherChangeFrequency: 1,
        allowPlayerWeatherControl: true,
        allowWeatherMixing: true,
        maxWeatherTypes: 2,
        weatherSource: "player-controlled",
      },
      turnLimit: 25,
      specialRules: [
        {
          name: "Enhanced Effects",
          description: "All weather effects are doubled",
          effect: "weatherEffectMultiplier: 2.0",
        },
      ],
    },
  },
};
```

### Configuration Validation Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "weatherEffects": {
      "type": "object",
      "patternProperties": {
        "^[A-Za-z]+$": {
          "type": "object",
          "properties": {
            "Fire": { "type": "number", "minimum": -40, "maximum": 40 },
            "Ice": { "type": "number", "minimum": -40, "maximum": 40 },
            "Lightning": { "type": "number", "minimum": -40, "maximum": 40 }
          },
          "required": ["Fire", "Ice", "Lightning"]
        }
      }
    },
    "seasonalPools": {
      "type": "object",
      "patternProperties": {
        "^[A-Za-z ]+$": {
          "type": "object",
          "properties": {
            "weights": {
              "type": "object",
              "patternProperties": {
                "^[A-Za-z]+$": {
                  "type": "number",
                  "minimum": 0,
                  "maximum": 1
                }
              }
            }
          }
        }
      }
    }
  },
  "required": ["weatherEffects", "seasonalPools"]
}
```

### Loading Custom Configurations

```typescript
// Load configuration from file
const config = await configManager.loadConfig("./my-custom-config.json");

// Load configuration from object
const config = configManager.loadConfigFromObject(customConfigObject);

// Merge configurations
const mergedConfig = configManager.mergeConfigs(baseConfig, customConfig);

// Validate configuration
const isValid = configManager.validateConfig(config);
if (!isValid) {
  console.error(
    "Configuration validation failed:",
    configManager.getValidationErrors()
  );
}
```

### Configuration Hot Reloading

```typescript
// Enable hot reloading in development
if (process.env.NODE_ENV === "development") {
  configManager.enableHotReload("./weather-config.json");

  configManager.on("configReloaded", (newConfig) => {
    console.log("Configuration reloaded:", newConfig);
    // Update weather engine with new configuration
    weatherEngine.updateConfig(newConfig);
  });
}
```

### Configuration Best Practices

1. **Validation**: Always validate configurations before use
2. **Versioning**: Include version numbers in configuration files
3. **Documentation**: Document custom properties and their effects
4. **Testing**: Test configurations with different scenarios
5. **Backup**: Keep backup copies of working configurations
6. **Environment-specific**: Use different configurations for different environments

### Example Complete Configuration

```json
{
  "version": "1.0.0",
  "metadata": {
    "name": "Custom Weather Configuration",
    "description": "Enhanced weather system with custom effects",
    "author": "Game Developer",
    "created": "2024-01-01"
  },
  "weatherEffects": {
    "Sunny": { "Fire": 20, "Ice": -10, "Lightning": -5 },
    "Rainy": { "Fire": -20, "Ice": 5, "Lightning": 15 },
    "Stormy": { "Fire": -15, "Ice": 0, "Lightning": 25 },
    "Snowy": { "Fire": -25, "Ice": 20, "Lightning": -10 },
    "Hot": { "Fire": 30, "Ice": -20, "Lightning": 0 },
    "Cold": { "Fire": -20, "Ice": 25, "Lightning": -5 },
    "Windy": { "Fire": 5, "Ice": 5, "Lightning": 10 },
    "Foggy": { "Fire": -5, "Ice": 10, "Lightning": -15 },
    "Cloudy": { "Fire": -5, "Ice": 0, "Lightning": 5 },
    "Humid": { "Fire": -10, "Ice": -5, "Lightning": 20 },
    "Warm": { "Fire": 10, "Ice": -5, "Lightning": 0 },
    "Cool": { "Fire": -5, "Ice": 10, "Lightning": 0 }
  },
  "seasonalPools": {
    "Spring": {
      "weights": {
        "Rainy": 0.25,
        "Cloudy": 0.2,
        "Windy": 0.15,
        "Warm": 0.15,
        "Sunny": 0.1,
        "Cool": 0.1,
        "Foggy": 0.05
      }
    },
    "Summer": {
      "weights": {
        "Sunny": 0.3,
        "Hot": 0.25,
        "Warm": 0.15,
        "Humid": 0.1,
        "Cloudy": 0.1,
        "Windy": 0.05,
        "Stormy": 0.05
      }
    },
    "Autumn": {
      "weights": {
        "Cloudy": 0.25,
        "Windy": 0.2,
        "Rainy": 0.15,
        "Cool": 0.15,
        "Foggy": 0.1,
        "Stormy": 0.1,
        "Sunny": 0.05
      }
    },
    "Winter": {
      "weights": {
        "Cold": 0.25,
        "Snowy": 0.25,
        "Foggy": 0.15,
        "Windy": 0.15,
        "Cloudy": 0.1,
        "Stormy": 0.1
      }
    }
  },
  "compatibilityMatrix": {
    "Sunny": ["Hot", "Warm", "Windy"],
    "Rainy": ["Cloudy", "Cool", "Windy", "Stormy"],
    "Hot": ["Sunny", "Warm", "Humid"],
    "Cold": ["Snowy", "Foggy", "Windy", "Cool"],
    "Stormy": ["Rainy", "Windy", "Cloudy"],
    "Snowy": ["Cold", "Windy", "Foggy"]
  },
  "oppositeWeatherPairs": [
    ["Hot", "Cold"],
    ["Sunny", "Snowy"],
    ["Sunny", "Stormy"],
    ["Hot", "Foggy"],
    ["Snowy", "Humid"]
  ],
  "limits": {
    "weatherEffects": { "min": -40, "max": 40 },
    "maxWeatherTypes": 5,
    "maxCardDuration": 10,
    "maxCardCost": 10
  }
}
```

This configuration reference provides comprehensive documentation for customizing the Weather Engine to fit your specific game requirements.
