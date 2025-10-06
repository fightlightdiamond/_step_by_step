/**
 * Custom Game Mode Examples
 *
 * This file demonstrates how to create custom game modes
 * with unique weather rules and mechanics.
 */

import {
  GameMode,
  WeatherRules,
  SpecialRule,
  WeatherType,
  GameModeManager,
  WeatherManager,
  SeasonManager,
} from "../index";

/**
 * Custom Game Mode: Elemental Mastery
 *
 * A mode focused on mastering elemental combinations
 * with enhanced weather effects and strategic depth.
 */
export const ElementalMasteryMode: GameMode = {
  name: "Elemental Mastery",
  description:
    "Master the elements with enhanced weather effects and strategic combinations",
  weatherRules: {
    weatherChangeFrequency: 2, // Weather changes every 2 turns
    allowPlayerWeatherControl: true,
    allowWeatherMixing: true,
    maxWeatherTypes: 3, // Allow up to 3 weather types
    weatherSource: "player-controlled",
  },
  turnLimit: 20,
  specialRules: [
    {
      name: "Enhanced Effects",
      description: "All weather effects are increased by 50%",
      effect: "weatherEffectMultiplier: 1.5",
    },
    {
      name: "Elemental Mastery Bonus",
      description: "Players gain +5% damage for each different element used",
      effect: "elementalMasteryBonus: 5",
    },
    {
      name: "Weather Synergy",
      description: "Compatible weather combinations provide additional bonuses",
      effect: "weatherSynergyBonus: true",
    },
  ],
};

/**
 * Custom Game Mode: Chaos Storm
 *
 * Unpredictable weather changes create chaotic battlefield conditions.
 */
export const ChaosStormMode: GameMode = {
  name: "Chaos Storm",
  description: "Survive the chaos as weather changes unpredictably every turn",
  weatherRules: {
    weatherChangeFrequency: 1, // Weather changes every turn
    allowPlayerWeatherControl: false, // No player control
    allowWeatherMixing: true,
    maxWeatherTypes: 5, // Maximum chaos
    weatherSource: "random",
  },
  turnLimit: 15,
  specialRules: [
    {
      name: "Chaos Multiplier",
      description: "Weather effects are doubled but unpredictable",
      effect: "weatherEffectMultiplier: 2.0, chaosMode: true",
    },
    {
      name: "Storm Surge",
      description: "Every 3rd turn, all weather effects are tripled",
      effect: "stormSurgeInterval: 3, stormSurgeMultiplier: 3.0",
    },
    {
      name: "Adaptation Bonus",
      description: "Players gain resistance to repeated weather types",
      effect: "adaptationBonus: true",
    },
  ],
};

/**
 * Custom Game Mode: Seasonal Conquest
 *
 * Players must adapt to changing seasons with locked seasonal weather.
 */
export const SeasonalConquestMode: GameMode = {
  name: "Seasonal Conquest",
  description:
    "Conquer through the seasons with locked seasonal weather patterns",
  weatherRules: {
    weatherChangeFrequency: 3, // Weather changes every 3 turns
    allowPlayerWeatherControl: true,
    allowWeatherMixing: false, // Pure seasonal weather only
    maxWeatherTypes: 1,
    weatherSource: "seasonal",
  },
  turnLimit: 24, // 2 full years
  specialRules: [
    {
      name: "Seasonal Lock",
      description: "Weather is locked to current season patterns",
      effect: "seasonLock: true",
    },
    {
      name: "Seasonal Mastery",
      description: "Bonus damage for using season-appropriate elements",
      effect: "seasonalMasteryBonus: 25",
    },
    {
      name: "Year Cycle Bonus",
      description: "Completing a full year grants permanent bonuses",
      effect: "yearCycleBonus: true",
    },
  ],
};

/**
 * Custom Game Mode: Weather Duel
 *
 * Fast-paced 1v1 mode with rapid weather changes and card focus.
 */
export const WeatherDuelMode: GameMode = {
  name: "Weather Duel",
  description: "Fast-paced dueling with rapid weather card exchanges",
  weatherRules: {
    weatherChangeFrequency: 1,
    allowPlayerWeatherControl: true,
    allowWeatherMixing: true,
    maxWeatherTypes: 2,
    weatherSource: "player-controlled",
  },
  turnLimit: 10,
  specialRules: [
    {
      name: "Rapid Fire",
      description: "Players can play multiple weather cards per turn",
      effect: "multipleCardsPerTurn: true",
    },
    {
      name: "Counter Weather",
      description: "Playing opposite weather cancels previous weather",
      effect: "counterWeatherMechanic: true",
    },
    {
      name: "Duel Intensity",
      description: "Weather effects increase each turn",
      effect: "intensityMultiplier: 0.1", // +10% per turn
    },
  ],
};

/**
 * Custom Game Mode: Eternal Weather
 *
 * Long-term strategic mode with persistent weather effects.
 */
export const EternalWeatherMode: GameMode = {
  name: "Eternal Weather",
  description:
    "Long-term strategy with persistent and evolving weather patterns",
  weatherRules: {
    weatherChangeFrequency: 5, // Weather changes every 5 turns
    allowPlayerWeatherControl: true,
    allowWeatherMixing: true,
    maxWeatherTypes: 4,
    weatherSource: "predetermined",
  },
  turnLimit: 50, // Long game
  specialRules: [
    {
      name: "Weather Persistence",
      description: "Weather effects accumulate over time",
      effect: "weatherPersistence: true",
    },
    {
      name: "Evolution Mechanic",
      description: "Weather types can evolve into stronger variants",
      effect: "weatherEvolution: true",
    },
    {
      name: "Legacy Effects",
      description: "Past weather leaves permanent traces",
      effect: "legacyEffects: true",
    },
  ],
};

/**
 * Custom Game Mode Manager with Extended Functionality
 */
export class CustomGameModeManager extends GameModeManager {
  private customModes: Map<string, GameMode> = new Map();
  private weatherEffectMultipliers: Map<string, number> = new Map();
  private specialMechanics: Map<string, any> = new Map();

  constructor() {
    super();
    this.registerCustomModes();
  }

  /**
   * Register all custom game modes
   */
  private registerCustomModes() {
    this.registerGameMode(ElementalMasteryMode);
    this.registerGameMode(ChaosStormMode);
    this.registerGameMode(SeasonalConquestMode);
    this.registerGameMode(WeatherDuelMode);
    this.registerGameMode(EternalWeatherMode);
  }

  /**
   * Register a custom game mode
   */
  registerGameMode(gameMode: GameMode) {
    this.customModes.set(gameMode.name, gameMode);

    // Parse special rules for mechanics
    if (gameMode.specialRules) {
      gameMode.specialRules.forEach((rule) => {
        this.parseSpecialRule(gameMode.name, rule);
      });
    }
  }

  /**
   * Parse special rules into actionable mechanics
   */
  private parseSpecialRule(modeName: string, rule: SpecialRule) {
    const effects = rule.effect.split(",").map((e) => e.trim());

    effects.forEach((effect) => {
      const [key, value] = effect.split(":").map((s) => s.trim());

      switch (key) {
        case "weatherEffectMultiplier":
          this.weatherEffectMultipliers.set(modeName, parseFloat(value));
          break;
        case "chaosMode":
          this.specialMechanics.set(`${modeName}_chaos`, value === "true");
          break;
        case "seasonLock":
          this.specialMechanics.set(`${modeName}_seasonLock`, value === "true");
          break;
        // Add more special mechanics as needed
      }
    });
  }

  /**
   * Process weather for turn with custom mode mechanics
   */
  processWeatherForTurn(turn: number): WeatherType[] {
    const currentMode = this.getCurrentMode();
    let weather = super.processWeatherForTurn(turn);

    // Apply custom mode mechanics
    switch (currentMode.name) {
      case "Chaos Storm":
        weather = this.processChaosStormWeather(turn, weather);
        break;
      case "Seasonal Conquest":
        weather = this.processSeasonalConquestWeather(turn, weather);
        break;
      case "Weather Duel":
        weather = this.processWeatherDuelWeather(turn, weather);
        break;
      case "Eternal Weather":
        weather = this.processEternalWeatherWeather(turn, weather);
        break;
    }

    return weather;
  }

  /**
   * Process Chaos Storm weather mechanics
   */
  private processChaosStormWeather(
    turn: number,
    baseWeather: WeatherType[]
  ): WeatherType[] {
    const allWeatherTypes: WeatherType[] = [
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

    // Generate 2-5 random weather types
    const numWeatherTypes = Math.floor(Math.random() * 4) + 2; // 2-5
    const chaosWeather: WeatherType[] = [];

    for (let i = 0; i < numWeatherTypes; i++) {
      let attempts = 0;
      let weatherType: WeatherType;

      do {
        weatherType =
          allWeatherTypes[Math.floor(Math.random() * allWeatherTypes.length)];
        attempts++;
      } while (chaosWeather.includes(weatherType) && attempts < 10);

      if (!chaosWeather.includes(weatherType)) {
        chaosWeather.push(weatherType);
      }
    }

    // Storm Surge every 3rd turn
    if (turn % 3 === 0) {
      console.log(`⚡ Storm Surge on turn ${turn}! Weather effects tripled!`);
    }

    return chaosWeather;
  }

  /**
   * Process Seasonal Conquest weather mechanics
   */
  private processSeasonalConquestWeather(
    turn: number,
    baseWeather: WeatherType[]
  ): WeatherType[] {
    const seasonManager = new SeasonManager();
    const month = ((turn - 1) % 12) + 1;
    const season = seasonManager.getSeasonForMonth(month);

    // Lock to seasonal weather only
    const seasonalWeather = seasonManager.getWeatherForMonth(month);

    console.log(
      `🗓️  Turn ${turn}: Month ${month} (${season}) - Weather: ${seasonalWeather}`
    );

    return [seasonalWeather];
  }

  /**
   * Process Weather Duel mechanics
   */
  private processWeatherDuelWeather(
    turn: number,
    baseWeather: WeatherType[]
  ): WeatherType[] {
    // In Weather Duel, weather is primarily controlled by players
    // Base weather changes are minimal

    if (turn === 1) {
      // Start with neutral conditions
      return ["Cloudy"];
    }

    // Intensity increases each turn
    const intensity = Math.floor(turn / 2);
    console.log(`⚔️  Duel Intensity: Level ${intensity}`);

    return baseWeather;
  }

  /**
   * Process Eternal Weather mechanics
   */
  private processEternalWeatherWeather(
    turn: number,
    baseWeather: WeatherType[]
  ): WeatherType[] {
    // Predetermined weather pattern for long-term strategy
    const weatherCycle: WeatherType[] = [
      "Sunny",
      "Warm",
      "Hot",
      "Humid",
      "Stormy",
      "Rainy",
      "Cloudy",
      "Foggy",
      "Cool",
      "Cold",
      "Snowy",
      "Windy",
    ];

    const cyclePosition = (turn - 1) % weatherCycle.length;
    const currentWeather = weatherCycle[cyclePosition];

    // Weather evolution mechanic
    if (turn > 20 && turn % 10 === 0) {
      console.log(
        `🌟 Weather Evolution! ${currentWeather} becomes more powerful!`
      );
    }

    return [currentWeather];
  }

  /**
   * Apply weather effect multipliers for custom modes
   */
  applyWeatherEffectMultiplier(modeName: string, baseEffect: number): number {
    const multiplier = this.weatherEffectMultipliers.get(modeName) || 1.0;
    return Math.round(baseEffect * multiplier);
  }

  /**
   * Check if special mechanic is active
   */
  hasSpecialMechanic(modeName: string, mechanic: string): boolean {
    return this.specialMechanics.get(`${modeName}_${mechanic}`) === true;
  }

  /**
   * Get all custom game modes
   */
  getCustomGameModes(): GameMode[] {
    return Array.from(this.customModes.values());
  }

  /**
   * Demonstrate all custom game modes
   */
  demonstrateCustomModes() {
    console.log("🎮 Custom Game Mode Demonstration");
    console.log("=================================\n");

    this.getCustomGameModes().forEach((mode) => {
      console.log(`🎯 ${mode.name}`);
      console.log(`   ${mode.description}`);
      console.log(`   Turn Limit: ${mode.turnLimit}`);
      console.log(`   Weather Rules:`);
      console.log(
        `     - Change Frequency: Every ${mode.weatherRules.weatherChangeFrequency} turn(s)`
      );
      console.log(
        `     - Player Control: ${
          mode.weatherRules.allowPlayerWeatherControl ? "Yes" : "No"
        }`
      );
      console.log(
        `     - Weather Mixing: ${
          mode.weatherRules.allowWeatherMixing ? "Yes" : "No"
        }`
      );
      console.log(
        `     - Max Weather Types: ${mode.weatherRules.maxWeatherTypes}`
      );
      console.log(`     - Weather Source: ${mode.weatherRules.weatherSource}`);

      if (mode.specialRules && mode.specialRules.length > 0) {
        console.log(`   Special Rules:`);
        mode.specialRules.forEach((rule) => {
          console.log(`     - ${rule.name}: ${rule.description}`);
        });
      }

      // Simulate weather for first 5 turns
      console.log(`   Sample Weather Progression:`);
      this.setGameMode(mode.name);

      for (let turn = 1; turn <= 5; turn++) {
        const weather = this.processWeatherForTurn(turn);
        console.log(`     Turn ${turn}: ${weather.join(", ") || "No change"}`);
      }

      console.log("");
    });
  }
}

/**
 * Example usage of custom game modes
 */
export async function demonstrateCustomGameModes() {
  console.log("🎮 Custom Game Mode Examples");
  console.log("============================\n");

  const customManager = new CustomGameModeManager();

  // Demonstrate all custom modes
  customManager.demonstrateCustomModes();

  // Example: Create a game with Elemental Mastery mode
  console.log("🎯 Example: Elemental Mastery Game Session");
  console.log("==========================================\n");

  customManager.setGameMode("Elemental Mastery");
  const weatherManager = new WeatherManager();
  await weatherManager.loadConfig();

  // Simulate 10 turns of Elemental Mastery
  for (let turn = 1; turn <= 10; turn++) {
    console.log(`Turn ${turn}:`);

    // Get weather for this turn
    const weather = customManager.processWeatherForTurn(turn);

    if (weather.length > 0) {
      weatherManager.applyWeather(weather);
      const modifiers = weatherManager.calculateElementalModifiers();

      // Apply Elemental Mastery multiplier (1.5x)
      const enhancedModifiers = {
        Fire: customManager.applyWeatherEffectMultiplier(
          "Elemental Mastery",
          modifiers.Fire
        ),
        Ice: customManager.applyWeatherEffectMultiplier(
          "Elemental Mastery",
          modifiers.Ice
        ),
        Lightning: customManager.applyWeatherEffectMultiplier(
          "Elemental Mastery",
          modifiers.Lightning
        ),
      };

      console.log(`  Weather: ${weather.join(", ")}`);
      console.log(
        `  Base Effects: Fire: ${modifiers.Fire}%, Ice: ${modifiers.Ice}%, Lightning: ${modifiers.Lightning}%`
      );
      console.log(
        `  Enhanced Effects: Fire: ${enhancedModifiers.Fire}%, Ice: ${enhancedModifiers.Ice}%, Lightning: ${enhancedModifiers.Lightning}%`
      );
    } else {
      console.log(`  No weather change`);
    }

    console.log("");
  }
}

// Run the demonstration if this file is executed directly
if (require.main === module) {
  demonstrateCustomGameModes();
}
