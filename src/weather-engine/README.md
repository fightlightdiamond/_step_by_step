# Weather Engine

A comprehensive weather system for turn-based games that manages weather effects, seasonal changes, and weather-based gameplay mechanics.

## Overview

The Weather Engine provides a modular, configurable, and extensible system for managing weather in games. It supports multiple weather types, seasonal transitions, weather cards, and various game modes.

## Features

- **12 Weather Types**: Sunny, Cloudy, Rainy, Windy, Stormy, Foggy, Snowy, Hot, Cold, Warm, Cool, Humid
- **3 Element Types**: Fire, Ice, Lightning with weather modifiers (-40 to +40)
- **4 Seasons**: Spring, Summer, Autumn, Winter with appropriate weather pools
- **Weather Validation**: Prevents logically impossible weather combinations
- **Weather Cards**: Strategic weather manipulation system
- **Multiple Game Modes**: Support for various weather-based gameplay modes
- **Extensible Configuration**: JSON-based weather effects and rules

## Project Structure

```
src/weather-engine/
├── types/                  # TypeScript type definitions
│   ├── weather.ts         # Core weather types and interfaces
│   ├── config.ts          # Configuration and game state types
│   ├── errors.ts          # Error classes
│   └── index.ts           # Type exports
├── constants/             # Constants and enums
│   ├── weather.ts         # Weather constants and mappings
│   └── index.ts           # Constants exports
├── utils/                 # Utility functions
│   ├── weather-utils.ts   # Weather validation and calculation utilities
│   └── index.ts           # Utils exports
├── __tests__/             # Test files
│   ├── types.test.ts      # TypeScript tests (Vitest)
│   └── basic.test.js      # JavaScript tests (Jest)
├── README.md              # This file
└── index.ts               # Main export file
```

## Core Types

### Weather Types

- `WeatherType`: Union type of all 12 weather types
- `ElementType`: Fire, Ice, Lightning
- `SeasonType`: Spring, Summer, Autumn, Winter

### Weather Effects

- `WeatherEffect`: Modifiers for each element type (-40 to +40)
- `WeatherState`: Current game weather state
- `WeatherCard`: Weather manipulation cards

### Game Configuration

- `WeatherConfig`: Complete weather system configuration
- `GameMode`: Game mode definitions with weather rules
- `GameState`: Complete game state including weather

## Key Features Implemented

### 1. Type System

- Complete TypeScript type definitions for all weather system components
- Type guards for runtime validation
- Comprehensive error types for different failure scenarios

### 2. Constants and Mappings

- All 12 weather types as constants
- Month-to-season mapping (1-12 months to 4 seasons)
- Opposite weather pairs for validation
- Weather effect limits and game configuration defaults

### 3. Utility Functions

- Weather type validation
- Season calculation from month
- Opposite weather detection
- Weather effect clamping and combination
- ID generation for weather entities

### 4. Error Handling

- Custom error classes for different failure types
- Weather validation errors
- Card play errors
- Configuration and game state errors

## Usage Examples

```typescript
import {
  WeatherType,
  ElementType,
  isValidWeatherType,
  getSeasonForMonth,
  createEmptyWeatherEffect,
  addWeatherEffects,
} from "./weather-engine";

// Validate weather types
const isValid = isValidWeatherType("Sunny"); // true

// Get season for month
const season = getSeasonForMonth(6); // 'Summer'

// Work with weather effects
const effect1 = { Fire: 10, Ice: -5, Lightning: 0 };
const effect2 = { Fire: 5, Ice: 10, Lightning: -10 };
const combined = addWeatherEffects(effect1, effect2);
// Result: { Fire: 15, Ice: 5, Lightning: -10 }
```

## Requirements Satisfied

This implementation satisfies the following requirements from the specification:

### Requirement 1.1

- ✅ Supports 12 different weather types
- ✅ Weather types apply modifiers to Fire, Ice, and Lightning elements

### Requirement 1.2

- ✅ Weather modifiers range from -40 to +40
- ✅ System validates weather combinations for logical consistency

## Next Steps

The foundation is now ready for implementing the core weather system components:

1. **Weather Manager**: Core weather state management
2. **Season Manager**: Seasonal weather selection
3. **Card System**: Weather card implementation
4. **Game Mode System**: Multiple game mode support
5. **Configuration System**: JSON-based configuration loading

## Testing

The weather engine includes comprehensive tests:

- **TypeScript Tests**: `__tests__/types.test.ts` (Vitest)
- **JavaScript Tests**: `__tests__/basic.test.js` (Jest)
- **Manual Test**: `test-basic.js` for quick verification

Run tests with:

```bash
npm test
```

## Architecture

The weather engine follows a modular architecture:

- **Types**: Comprehensive TypeScript definitions
- **Constants**: Immutable configuration values
- **Utils**: Pure utility functions
- **Extensible**: Ready for additional components

This foundation provides a solid base for building the complete weather system according to the design specifications.
