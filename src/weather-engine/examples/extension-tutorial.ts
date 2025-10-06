/**
 * Weather Engine Extension Tutorial
 *
 * This tutorial demonstrates how to extend the Weather Engine
 * with custom weather types, effects, and mechanics.
 */

import {
  WeatherManager,
  WeatherType,
  ElementType,
  WeatherEffect,
  WeatherCard,
  GameMode,
  WeatherRules,
} from "../index";

/**
 * Tutorial Step 1: Creating Custom Weather Types
 */
export class CustomWeatherTutorial {
  private weatherManager: WeatherManager;

  constructor() {
    this.weatherManager = new WeatherManager();
  }

  async initialize() {
    await this.weatherManager.loadConfig();
    console.log("🎓 Weather Engine Extension Tutorial");
    console.log("====================================\n");
  }

  /**
   * Step 1: Add a new weather type with custom effects
   */
  addCustomWeatherType() {
    console.log("📚 Step 1: Adding Custom Weather Types");
    console.log("======================================\n");

    // Define a new weather type: Volcanic
    const volcanicWeather: WeatherType = "Volcanic" as WeatherType;
    const volcanicEffect: WeatherEffect = {
      Fire: 35, // Strong fire boost
      Ice: -30, // Strong ice penalty
      Lightning: 15, // Moderate lightning boost
    };

    console.log("Creating custom weather type: Volcanic");
    console.log(
      `Effects: Fire: +${volcanicEffect.Fire}%, Ice: ${volcanicEffect.Ice}%, Lightning: +${volcanicEffect.Lightning}%`
    );

    // Register the custom weather type
    this.weatherManager.registerCustomWeather(volcanicWeather, volcanicEffect);

    // Set compatibility rules
    this.weatherManager.setWeatherCompatibility(volcanicWeather, [
      "Hot",
      "Stormy",
    ]);
    this.weatherManager.setWeatherIncompatibility(volcanicWeather, [
      "Cold",
      "Snowy",
      "Foggy",
    ]);

    console.log("✅ Volcanic weather registered successfully!\n");

    // Test the new weather type
    console.log("Testing Volcanic weather:");
    try {
      this.weatherManager.applyWeather([volcanicWeather]);
      const modifiers = this.weatherManager.calculateElementalModifiers();
      console.log(
        `Current effects: Fire: ${modifiers.Fire}%, Ice: ${modifiers.Ice}%, Lightning: ${modifiers.Lightning}%`
      );
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }

    console.log("");
  }

  /**
   * Step 2: Create weather types with dynamic effects
   */
  addDynamicWeatherType() {
    console.log("📚 Step 2: Dynamic Weather Effects");
    console.log("===================================\n");

    // Create a weather type with effects that change based on conditions
    const temporalWeather: WeatherType = "Temporal" as WeatherType;

    // Dynamic effect calculation based on turn number
    const calculateTemporalEffect = (turn: number): WeatherEffect => {
      const intensity = Math.sin(turn * 0.5) * 20; // Oscillating effect
      return {
        Fire: Math.round(intensity),
        Ice: Math.round(-intensity),
        Lightning: Math.round(intensity * 0.5),
      };
    };

    console.log("Creating dynamic weather type: Temporal");
    console.log("Effects change based on turn number (oscillating pattern)");

    // Register with initial effect
    const initialEffect = calculateTemporalEffect(1);
    this.weatherManager.registerCustomWeather(temporalWeather, initialEffect);

    // Demonstrate dynamic effects over several turns
    console.log("\nTemporal weather effects over 8 turns:");
    for (let turn = 1; turn <= 8; turn++) {
      const effect = calculateTemporalEffect(turn);
      console.log(
        `Turn ${turn}: Fire: ${effect.Fire > 0 ? "+" : ""}${
          effect.Fire
        }%, Ice: ${effect.Ice > 0 ? "+" : ""}${effect.Ice}%, Lightning: ${
          effect.Lightning > 0 ? "+" : ""
        }${effect.Lightning}%`
      );
    }

    console.log("");
  }

  /**
   * Step 3: Create composite weather effects
   */
  addCompositeWeatherType() {
    console.log("📚 Step 3: Composite Weather Types");
    console.log("===================================\n");

    // Create a weather type that combines multiple base weather effects
    const hurricaneWeather: WeatherType = "Hurricane" as WeatherType;

    // Hurricane combines Stormy + Windy + Rainy effects
    const stormyEffect = this.weatherManager.getWeatherEffect("Stormy");
    const windyEffect = this.weatherManager.getWeatherEffect("Windy");
    const rainyEffect = this.weatherManager.getWeatherEffect("Rainy");

    const hurricaneEffect: WeatherEffect = {
      Fire: Math.round(
        (stormyEffect.Fire + windyEffect.Fire + rainyEffect.Fire) * 0.8
      ), // Slightly reduced
      Ice: Math.round(
        (stormyEffect.Ice + windyEffect.Ice + rainyEffect.Ice) * 0.8
      ),
      Lightning: Math.round(
        (stormyEffect.Lightning +
          windyEffect.Lightning +
          rainyEffect.Lightning) *
          1.2
      ), // Enhanced
    };

    console.log("Creating composite weather type: Hurricane");
    console.log("Combines effects from Stormy + Windy + Rainy weather");
    console.log(`Base components:`);
    console.log(
      `  Stormy: Fire: ${stormyEffect.Fire}%, Ice: ${stormyEffect.Ice}%, Lightning: ${stormyEffect.Lightning}%`
    );
    console.log(
      `  Windy: Fire: ${windyEffect.Fire}%, Ice: ${windyEffect.Ice}%, Lightning: ${windyEffect.Lightning}%`
    );
    console.log(
      `  Rainy: Fire: ${rainyEffect.Fire}%, Ice: ${rainyEffect.Ice}%, Lightning: ${rainyEffect.Lightning}%`
    );
    console.log(
      `Hurricane result: Fire: ${hurricaneEffect.Fire}%, Ice: ${hurricaneEffect.Ice}%, Lightning: ${hurricaneEffect.Lightning}%`
    );

    this.weatherManager.registerCustomWeather(
      hurricaneWeather,
      hurricaneEffect
    );
    console.log("✅ Hurricane weather registered successfully!\n");
  }
}

/**
 * Tutorial Step 2: Creating Custom Weather Cards
 */
export class CustomWeatherCardTutorial {
  /**
   * Create basic weather cards
   */
  createBasicWeatherCards(): WeatherCard[] {
    console.log("📚 Step 4: Creating Custom Weather Cards");
    console.log("========================================\n");

    const customCards: WeatherCard[] = [
      // Volcanic Eruption Card
      {
        id: "volcanic-eruption",
        type: "Weather",
        name: "Volcanic Eruption",
        description: "Unleash volcanic forces, massively boosting Fire damage",
        weather: "Volcanic" as WeatherType,
        cost: 4,
        duration: 2,
      },

      // Temporal Rift Card
      {
        id: "temporal-rift",
        type: "Weather",
        name: "Temporal Rift",
        description: "Open a rift in time, creating unstable weather patterns",
        weather: "Temporal" as WeatherType,
        cost: 5,
        duration: 3,
      },

      // Elemental Harmony Card (Buff type)
      {
        id: "elemental-harmony",
        type: "WeatherBuff",
        name: "Elemental Harmony",
        description: "Harmonize all elements for balanced power",
        effect: {
          Fire: 15,
          Ice: 15,
          Lightning: 15,
        },
        duration: 4,
        cost: 3,
      },

      // Weather Nullifier Card
      {
        id: "weather-nullifier",
        type: "BreakWeather",
        name: "Weather Nullifier",
        description:
          "Advanced technology that completely neutralizes all weather",
        cost: 2,
      },

      // Elemental Chaos Card (Random effects)
      {
        id: "elemental-chaos",
        type: "WeatherBuff",
        name: "Elemental Chaos",
        description:
          "Chaotic energies randomly boost or reduce elemental damage",
        effect: this.generateRandomEffect(),
        duration: 2,
        cost: 1,
      },
    ];

    console.log("Created custom weather cards:");
    customCards.forEach((card) => {
      console.log(`🃏 ${card.name} (${card.type})`);
      console.log(`   ${card.description}`);
      console.log(
        `   Cost: ${card.cost}${
          card.duration ? `, Duration: ${card.duration}` : ""
        }`
      );

      if (card.weather) {
        console.log(`   Weather: ${card.weather}`);
      }

      if (card.effect) {
        const effectStr = Object.entries(card.effect)
          .map(
            ([element, modifier]) =>
              `${element}: ${modifier > 0 ? "+" : ""}${modifier}%`
          )
          .join(", ");
        console.log(`   Effect: ${effectStr}`);
      }

      console.log("");
    });

    return customCards;
  }

  /**
   * Create advanced weather cards with special mechanics
   */
  createAdvancedWeatherCards(): WeatherCard[] {
    console.log("📚 Step 5: Advanced Weather Cards");
    console.log("=================================\n");

    const advancedCards: WeatherCard[] = [
      // Conditional Effect Card
      {
        id: "seasonal-amplifier",
        type: "WeatherBuff",
        name: "Seasonal Amplifier",
        description: "Amplifies effects based on current season",
        effect: this.calculateSeasonalEffect(),
        duration: 3,
        cost: 3,
      },

      // Stacking Effect Card
      {
        id: "storm-builder",
        type: "WeatherBuff",
        name: "Storm Builder",
        description: "Effects increase each turn it remains active",
        effect: { Lightning: 5 }, // Base effect, increases over time
        duration: 5,
        cost: 2,
      },

      // Reactive Card
      {
        id: "weather-mirror",
        type: "WeatherBuff",
        name: "Weather Mirror",
        description: "Copies and reverses opponent weather effects",
        effect: { Fire: 0, Ice: 0, Lightning: 0 }, // Calculated dynamically
        duration: 3,
        cost: 4,
      },
    ];

    console.log("Created advanced weather cards with special mechanics:");
    advancedCards.forEach((card) => {
      console.log(`🃏 ${card.name}`);
      console.log(`   ${card.description}`);
      console.log(`   Special Mechanic: ${this.getCardMechanic(card.id)}`);
      console.log("");
    });

    return advancedCards;
  }

  private generateRandomEffect(): Partial<Record<ElementType, number>> {
    return {
      Fire: Math.floor(Math.random() * 41) - 20, // -20 to +20
      Ice: Math.floor(Math.random() * 41) - 20, // -20 to +20
      Lightning: Math.floor(Math.random() * 41) - 20, // -20 to +20
    };
  }

  private calculateSeasonalEffect(): Partial<Record<ElementType, number>> {
    // This would normally check current season
    // For demo, we'll use Spring effects
    return {
      Fire: 10,
      Ice: 5,
      Lightning: 15,
    };
  }

  private getCardMechanic(cardId: string): string {
    const mechanics = {
      "seasonal-amplifier": "Effects change based on current season",
      "storm-builder": "Effects increase by +2 each turn",
      "weather-mirror": "Copies and inverts opponent effects",
    };
    return mechanics[cardId] || "Standard effect";
  }
}

/**
 * Tutorial Step 3: Creating Custom Game Mechanics
 */
export class CustomMechanicsTutorial {
  /**
   * Create weather evolution mechanic
   */
  createWeatherEvolution() {
    console.log("📚 Step 6: Weather Evolution Mechanic");
    console.log("=====================================\n");

    const weatherEvolutions = new Map<WeatherType, WeatherType>([
      ["Sunny", "Hot" as WeatherType],
      ["Hot", "Volcanic" as WeatherType],
      ["Rainy", "Stormy" as WeatherType],
      ["Stormy", "Hurricane" as WeatherType],
      ["Cold", "Snowy" as WeatherType],
      ["Snowy", "Blizzard" as WeatherType],
    ]);

    console.log("Weather Evolution Chains:");
    weatherEvolutions.forEach((evolved, base) => {
      console.log(`${base} → ${evolved}`);
    });

    // Evolution trigger conditions
    const evolutionConditions = {
      turnThreshold: 5, // Weather must be active for 5+ turns
      intensityThreshold: 3, // Must have 3+ compatible weather types
      playerTrigger: true, // Players can trigger evolution with special cards
    };

    console.log("\nEvolution Conditions:");
    console.log(
      `- Weather must be active for ${evolutionConditions.turnThreshold}+ turns`
    );
    console.log(
      `- Must have ${evolutionConditions.intensityThreshold}+ compatible weather types`
    );
    console.log(`- Players can trigger with evolution cards`);
    console.log("");
  }

  /**
   * Create weather resistance mechanic
   */
  createWeatherResistance() {
    console.log("📚 Step 7: Weather Resistance Mechanic");
    console.log("======================================\n");

    // Players build resistance to repeated weather exposure
    const resistanceSystem = {
      maxResistance: 50, // Maximum 50% resistance
      buildRate: 5, // +5% resistance per exposure
      decayRate: 2, // -2% resistance per turn without exposure
      immunityThreshold: 40, // 40% resistance grants immunity to negative effects
    };

    console.log("Weather Resistance System:");
    console.log(`- Maximum resistance: ${resistanceSystem.maxResistance}%`);
    console.log(`- Build rate: +${resistanceSystem.buildRate}% per exposure`);
    console.log(
      `- Decay rate: -${resistanceSystem.decayRate}% per turn without exposure`
    );
    console.log(`- Immunity threshold: ${resistanceSystem.immunityThreshold}%`);

    // Example resistance progression
    console.log("\nExample: Fire Resistance Progression");
    let fireResistance = 0;
    for (let turn = 1; turn <= 10; turn++) {
      const exposedToFire = turn <= 6; // Exposed to fire weather for first 6 turns

      if (exposedToFire) {
        fireResistance = Math.min(
          fireResistance + resistanceSystem.buildRate,
          resistanceSystem.maxResistance
        );
      } else {
        fireResistance = Math.max(
          fireResistance - resistanceSystem.decayRate,
          0
        );
      }

      const status =
        fireResistance >= resistanceSystem.immunityThreshold ? " (IMMUNE)" : "";
      console.log(`Turn ${turn}: ${fireResistance}% Fire Resistance${status}`);
    }

    console.log("");
  }

  /**
   * Create weather synergy mechanic
   */
  createWeatherSynergy() {
    console.log("📚 Step 8: Weather Synergy Mechanic");
    console.log("===================================\n");

    // Define weather synergies that provide bonus effects
    const weatherSynergies = new Map<
      string,
      { bonus: number; description: string }
    >([
      [
        "Sunny+Hot",
        { bonus: 25, description: "Scorching heat amplifies fire damage" },
      ],
      [
        "Rainy+Stormy",
        { bonus: 30, description: "Perfect storm boosts lightning damage" },
      ],
      [
        "Cold+Snowy",
        { bonus: 20, description: "Freezing conditions enhance ice damage" },
      ],
      [
        "Windy+Stormy",
        {
          bonus: 15,
          description: "Turbulent winds increase all elemental effects",
        },
      ],
      [
        "Foggy+Cold",
        { bonus: 10, description: "Chilling mist reduces enemy accuracy" },
      ],
    ]);

    console.log("Weather Synergy Combinations:");
    weatherSynergies.forEach((synergy, combination) => {
      console.log(`${combination}: +${synergy.bonus}% bonus`);
      console.log(`  ${synergy.description}`);
    });

    // Anti-synergies (negative combinations)
    const antiSynergies = new Map<
      string,
      { penalty: number; description: string }
    >([
      [
        "Hot+Rainy",
        {
          penalty: -15,
          description: "Steam reduces visibility and effectiveness",
        },
      ],
      [
        "Sunny+Foggy",
        {
          penalty: -10,
          description: "Conflicting conditions create instability",
        },
      ],
    ]);

    console.log("\nWeather Anti-Synergies:");
    antiSynergies.forEach((antiSynergy, combination) => {
      console.log(`${combination}: ${antiSynergy.penalty}% penalty`);
      console.log(`  ${antiSynergy.description}`);
    });

    console.log("");
  }
}

/**
 * Tutorial Step 4: Creating Custom Game Modes
 */
export class CustomGameModeTutorial {
  /**
   * Create a weather mastery game mode
   */
  createWeatherMasteryMode(): GameMode {
    console.log("📚 Step 9: Custom Game Mode Creation");
    console.log("====================================\n");

    const weatherMasteryRules: WeatherRules = {
      weatherChangeFrequency: 2,
      allowPlayerWeatherControl: true,
      allowWeatherMixing: true,
      maxWeatherTypes: 4,
      weatherSource: "player-controlled",
    };

    const weatherMasteryMode: GameMode = {
      name: "Weather Mastery Challenge",
      description: "Master all weather types to achieve victory",
      weatherRules: weatherMasteryRules,
      turnLimit: 30,
      specialRules: [
        {
          name: "Mastery Progression",
          description: "Players must use each weather type to unlock bonuses",
          effect: "masteryProgression: true",
        },
        {
          name: "Weather Expertise",
          description:
            "Repeated use of weather types increases their effectiveness",
          effect: "weatherExpertise: true",
        },
        {
          name: "Grand Mastery",
          description: "Using all 12 weather types grants ultimate power",
          effect: "grandMasteryBonus: 100",
        },
      ],
    };

    console.log("Created Weather Mastery Challenge mode:");
    console.log(`Name: ${weatherMasteryMode.name}`);
    console.log(`Description: ${weatherMasteryMode.description}`);
    console.log(`Turn Limit: ${weatherMasteryMode.turnLimit}`);
    console.log("Special Rules:");
    weatherMasteryMode.specialRules?.forEach((rule) => {
      console.log(`  - ${rule.name}: ${rule.description}`);
    });

    console.log("\nMastery Progression System:");
    const weatherTypes: WeatherType[] = [
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

    weatherTypes.forEach((weather, index) => {
      const masteryLevel = Math.floor(index / 3) + 1;
      const bonus = masteryLevel * 5;
      console.log(
        `${weather}: Mastery Level ${masteryLevel} (+${bonus}% effectiveness)`
      );
    });

    console.log("");
    return weatherMasteryMode;
  }

  /**
   * Create a seasonal tournament mode
   */
  createSeasonalTournamentMode(): GameMode {
    console.log("📚 Step 10: Seasonal Tournament Mode");
    console.log("====================================\n");

    const tournamentMode: GameMode = {
      name: "Seasonal Tournament",
      description:
        "Compete through all four seasons with escalating challenges",
      weatherRules: {
        weatherChangeFrequency: 3,
        allowPlayerWeatherControl: true,
        allowWeatherMixing: false,
        maxWeatherTypes: 2,
        weatherSource: "seasonal",
      },
      turnLimit: 16, // 4 turns per season
      specialRules: [
        {
          name: "Seasonal Brackets",
          description: "Each season is a separate tournament bracket",
          effect: "seasonalBrackets: true",
        },
        {
          name: "Escalating Difficulty",
          description: "Weather effects increase each season",
          effect: "difficultyEscalation: 0.25",
        },
        {
          name: "Championship Bonus",
          description: "Winners of each season get permanent bonuses",
          effect: "championshipBonus: true",
        },
      ],
    };

    console.log("Tournament Structure:");
    const seasons = ["Spring", "Summer", "Autumn", "Winter"];
    seasons.forEach((season, index) => {
      const difficulty = 1 + index * 0.25;
      console.log(
        `${season} Bracket: Turns ${index * 4 + 1}-${
          (index + 1) * 4
        }, Difficulty: ${difficulty}x`
      );
    });

    console.log("");
    return tournamentMode;
  }
}

/**
 * Complete Extension Tutorial Runner
 */
export class WeatherEngineExtensionTutorial {
  private weatherTutorial: CustomWeatherTutorial;
  private cardTutorial: CustomWeatherCardTutorial;
  private mechanicsTutorial: CustomMechanicsTutorial;
  private gameModeTutorial: CustomGameModeTutorial;

  constructor() {
    this.weatherTutorial = new CustomWeatherTutorial();
    this.cardTutorial = new CustomWeatherCardTutorial();
    this.mechanicsTutorial = new CustomMechanicsTutorial();
    this.gameModeTutorial = new CustomGameModeTutorial();
  }

  async runCompleteTutorial() {
    console.log("🎓 Complete Weather Engine Extension Tutorial");
    console.log("=============================================\n");

    // Initialize
    await this.weatherTutorial.initialize();

    // Weather Types
    this.weatherTutorial.addCustomWeatherType();
    this.weatherTutorial.addDynamicWeatherType();
    this.weatherTutorial.addCompositeWeatherType();

    // Weather Cards
    this.cardTutorial.createBasicWeatherCards();
    this.cardTutorial.createAdvancedWeatherCards();

    // Game Mechanics
    this.mechanicsTutorial.createWeatherEvolution();
    this.mechanicsTutorial.createWeatherResistance();
    this.mechanicsTutorial.createWeatherSynergy();

    // Game Modes
    this.gameModeTutorial.createWeatherMasteryMode();
    this.gameModeTutorial.createSeasonalTournamentMode();

    // Summary
    this.showTutorialSummary();
  }

  private showTutorialSummary() {
    console.log("🎯 Tutorial Summary");
    console.log("==================\n");
    console.log("You have learned how to:");
    console.log("✅ Create custom weather types with unique effects");
    console.log("✅ Implement dynamic and composite weather systems");
    console.log("✅ Design custom weather cards with special mechanics");
    console.log(
      "✅ Build advanced game mechanics (evolution, resistance, synergy)"
    );
    console.log("✅ Create custom game modes with unique rules");
    console.log("");
    console.log("Next Steps:");
    console.log("🔹 Experiment with your own weather combinations");
    console.log("🔹 Create themed weather sets for your game");
    console.log("🔹 Implement player progression systems");
    console.log("🔹 Add visual and audio effects for custom weather");
    console.log("🔹 Balance test your custom content");
    console.log("");
    console.log("Happy weather engineering! 🌤️");
  }
}

/**
 * Run the complete extension tutorial
 */
export async function runExtensionTutorial() {
  const tutorial = new WeatherEngineExtensionTutorial();
  await tutorial.runCompleteTutorial();
}

// Run the tutorial if this file is executed directly
if (require.main === module) {
  runExtensionTutorial();
}
