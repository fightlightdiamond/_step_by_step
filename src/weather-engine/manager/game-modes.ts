/**
 * Specific Game Mode Implementations
 * Contains predefined game modes with their rules and behaviors
 */

import { GameMode, WeatherType, SeasonType, SpecialRule } from "../types";

/**
 * 12-Month Campaign Mode
 * Standard campaign mode that progresses through 12 turns representing 12 months
 */
export const TWELVE_MONTH_CAMPAIGN: GameMode = {
  name: "12-month-campaign",
  description:
    "Standard campaign mode progressing through 12 months with seasonal weather patterns",
  weatherRules: {
    weatherChangeFrequency: 1, // Weather changes every turn
    allowPlayerWeatherControl: true, // Players can use weather cards
    allowWeatherMixing: false, // Only one weather type at a time
    maxWeatherTypes: 1,
    weatherSource: "seasonal", // Weather based on current month/season
  },
  turnLimit: 12,
  specialRules: [
    {
      name: "seasonal-progression",
      description: "Weather automatically progresses through seasons",
      effect: (gameState: any) => {
        // Weather is handled by seasonal system automatically
        // This rule ensures proper month-to-season mapping
      },
    },
  ],
};

/**
 * Weather Chaos Mode
 * Chaotic mode with random weather mixing and frequent changes
 */
export const WEATHER_CHAOS: GameMode = {
  name: "weather-chaos",
  description:
    "Chaotic mode with random weather mixing and unpredictable patterns",
  weatherRules: {
    weatherChangeFrequency: 1, // Weather changes every turn
    allowPlayerWeatherControl: true, // Players can still use cards
    allowWeatherMixing: true, // Multiple weather types allowed
    maxWeatherTypes: 5, // Up to 5 weather types simultaneously
    weatherSource: "random", // Completely random weather
  },
  turnLimit: 15, // Longer game to experience chaos
  specialRules: [
    {
      name: "chaos-multiplier",
      description: "Weather effects are amplified in chaos mode",
      effect: (gameState: any) => {
        // Could amplify weather effects by 1.5x
        // Implementation would modify damage calculations
      },
    },
    {
      name: "random-weather-burst",
      description: "Chance for additional weather changes mid-turn",
      effect: (gameState: any) => {
        // 20% chance each turn for an additional weather change
        if (Math.random() < 0.2) {
          // Trigger additional weather change
          // Implementation would call weather manager
        }
      },
    },
  ],
};

/**
 * Seasonal Event Mode
 * Restricts weather to one specific season throughout the game
 */
export const createSeasonalEventMode = (season: SeasonType): GameMode => ({
  name: `seasonal-event-${season.toLowerCase()}`,
  description: `Event mode restricted to ${season} weather patterns only`,
  weatherRules: {
    weatherChangeFrequency: 2, // Weather changes every 2 turns
    allowPlayerWeatherControl: true,
    allowWeatherMixing: false,
    maxWeatherTypes: 1,
    weatherSource: "seasonal", // Uses seasonal system but locked to one season
  },
  turnLimit: 10,
  specialRules: [
    {
      name: "seasonal-lock",
      description: `All weather is restricted to ${season} patterns`,
      effect: (gameState: any) => {
        // Force weather selection to only use the specified season
        // Implementation would override season detection
        gameState.forcedSeason = season;
      },
    },
    {
      name: "seasonal-bonus",
      description: `Enhanced effects for ${season} weather`,
      effect: (gameState: any) => {
        // Provide bonus effects for season-appropriate strategies
        // Implementation would modify elemental calculations
      },
    },
  ],
});

/**
 * Forecast Mode
 * Weather is predetermined and revealed to players in advance
 */
export const FORECAST_MODE: GameMode = {
  name: "forecast-mode",
  description:
    "Weather is predetermined and revealed to players for strategic planning",
  weatherRules: {
    weatherChangeFrequency: 1,
    allowPlayerWeatherControl: false, // No weather cards allowed
    allowWeatherMixing: false,
    maxWeatherTypes: 1,
    weatherSource: "predetermined", // Uses predetermined weather schedule
  },
  turnLimit: 12,
  specialRules: [
    {
      name: "weather-forecast",
      description: "All weather is revealed at game start",
      effect: (gameState: any) => {
        // Weather schedule is visible to all players
        // Implementation would expose weather schedule in UI
        gameState.weatherVisible = true;
      },
    },
    {
      name: "strategic-planning",
      description: "Players get extra time for planning with known weather",
      effect: (gameState: any) => {
        // Could extend turn timers or provide planning phase
        // Implementation would modify turn structure
      },
    },
  ],
};

/**
 * Weather Survival Mode
 * Continuous weather changes requiring constant adaptation
 */
export const WEATHER_SURVIVAL: GameMode = {
  name: "weather-survival",
  description:
    "Extreme mode with continuous weather changes requiring constant adaptation",
  weatherRules: {
    weatherChangeFrequency: 1, // Weather changes every turn
    allowPlayerWeatherControl: true,
    allowWeatherMixing: true,
    maxWeatherTypes: 3, // Up to 3 weather types
    weatherSource: "random", // Random weather patterns
  },
  turnLimit: 20, // Longer survival challenge
  specialRules: [
    {
      name: "weather-intensity",
      description: "Weather effects become more intense over time",
      effect: (gameState: any) => {
        // Weather effects increase by 5% every 3 turns
        const intensityMultiplier =
          1 + Math.floor(gameState.currentTurn / 3) * 0.05;
        gameState.weatherIntensity = intensityMultiplier;
      },
    },
    {
      name: "survival-pressure",
      description: "Players must adapt quickly or face penalties",
      effect: (gameState: any) => {
        // Could implement penalties for not adapting to weather changes
        // Implementation would track player adaptation metrics
      },
    },
    {
      name: "weather-storm",
      description: "Periodic weather storms with extreme effects",
      effect: (gameState: any) => {
        // Every 5 turns, trigger a weather storm
        if (gameState.currentTurn % 5 === 0) {
          gameState.weatherStorm = true;
          // Storm effects would be handled by weather manager
        }
      },
    },
  ],
};

/**
 * Blitz Mode
 * Fast-paced mode with rapid weather changes
 */
export const BLITZ_MODE: GameMode = {
  name: "blitz-mode",
  description: "Fast-paced mode with rapid weather changes and shorter turns",
  weatherRules: {
    weatherChangeFrequency: 1,
    allowPlayerWeatherControl: true,
    allowWeatherMixing: false,
    maxWeatherTypes: 2,
    weatherSource: "random",
  },
  turnLimit: 8, // Shorter game
  specialRules: [
    {
      name: "rapid-weather",
      description: "Weather changes twice per turn",
      effect: (gameState: any) => {
        // Weather changes at start and middle of turn
        gameState.rapidWeatherChanges = true;
      },
    },
    {
      name: "time-pressure",
      description: "Reduced time for decision making",
      effect: (gameState: any) => {
        // Shorter turn timers
        gameState.turnTimeLimit = 30; // 30 seconds per turn
      },
    },
  ],
};

/**
 * Elemental Mastery Mode
 * Focus on mastering specific elemental combinations
 */
export const ELEMENTAL_MASTERY: GameMode = {
  name: "elemental-mastery",
  description: "Mode focused on mastering elemental weather combinations",
  weatherRules: {
    weatherChangeFrequency: 2,
    allowPlayerWeatherControl: true,
    allowWeatherMixing: true,
    maxWeatherTypes: 2,
    weatherSource: "seasonal",
  },
  turnLimit: 15,
  specialRules: [
    {
      name: "elemental-focus",
      description: "Bonus points for effective elemental combinations",
      effect: (gameState: any) => {
        // Track and reward effective use of elemental synergies
        gameState.elementalMasteryTracking = true;
      },
    },
    {
      name: "mastery-challenges",
      description: "Special challenges for each element type",
      effect: (gameState: any) => {
        // Present challenges that require specific elemental strategies
        // Implementation would generate element-specific objectives
      },
    },
  ],
};

/**
 * All available game modes
 */
export const ALL_GAME_MODES: GameMode[] = [
  TWELVE_MONTH_CAMPAIGN,
  WEATHER_CHAOS,
  FORECAST_MODE,
  WEATHER_SURVIVAL,
  BLITZ_MODE,
  ELEMENTAL_MASTERY,
  // Seasonal event modes
  createSeasonalEventMode("Spring"),
  createSeasonalEventMode("Summer"),
  createSeasonalEventMode("Autumn"),
  createSeasonalEventMode("Winter"),
];

/**
 * Get a game mode by name
 */
export function getGameModeByName(name: string): GameMode | undefined {
  return ALL_GAME_MODES.find((mode) => mode.name === name);
}

/**
 * Get all game modes of a specific category
 */
export function getGameModesByCategory(
  category:
    | "campaign"
    | "chaos"
    | "seasonal"
    | "forecast"
    | "survival"
    | "blitz"
    | "mastery"
): GameMode[] {
  switch (category) {
    case "campaign":
      return [TWELVE_MONTH_CAMPAIGN];
    case "chaos":
      return [WEATHER_CHAOS];
    case "seasonal":
      return ALL_GAME_MODES.filter((mode) =>
        mode.name.startsWith("seasonal-event-")
      );
    case "forecast":
      return [FORECAST_MODE];
    case "survival":
      return [WEATHER_SURVIVAL];
    case "blitz":
      return [BLITZ_MODE];
    case "mastery":
      return [ELEMENTAL_MASTERY];
    default:
      return [];
  }
}

/**
 * Validate if a game mode is suitable for a given number of players
 */
export function validateGameModeForPlayers(
  mode: GameMode,
  playerCount: number
): boolean {
  // Most modes support 2-4 players
  if (playerCount < 1 || playerCount > 6) {
    return false;
  }

  // Specific mode restrictions
  switch (mode.name) {
    case "blitz-mode":
      return playerCount <= 4; // Blitz mode limited to 4 players
    case "weather-survival":
      return playerCount >= 2; // Survival mode requires at least 2 players
    default:
      return true;
  }
}

/**
 * Get recommended game modes for beginners
 */
export function getBeginnerGameModes(): GameMode[] {
  return [
    TWELVE_MONTH_CAMPAIGN,
    FORECAST_MODE,
    createSeasonalEventMode("Spring"),
  ];
}

/**
 * Get advanced game modes for experienced players
 */
export function getAdvancedGameModes(): GameMode[] {
  return [WEATHER_CHAOS, WEATHER_SURVIVAL, BLITZ_MODE, ELEMENTAL_MASTERY];
}
