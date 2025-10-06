/**
 * Interactive Weather Effects Demo
 *
 * This demo provides an interactive way to explore weather effects,
 * test weather combinations, and see real-time calculations.
 */

import {
  WeatherManager,
  SeasonManager,
  WeatherCardManager,
  GameModeManager,
  WeatherType,
  ElementType,
  WeatherCard,
  WeatherEffect,
} from "../index";

/**
 * Interactive Weather Demo Class
 */
export class InteractiveWeatherDemo {
  private weatherManager: WeatherManager;
  private seasonManager: SeasonManager;
  private cardManager: WeatherCardManager;
  private gameModeManager: GameModeManager;

  private demoState = {
    currentWeather: [] as WeatherType[],
    selectedElements: ["Fire", "Ice", "Lightning"] as ElementType[],
    baseDamage: 100,
    showHistory: true,
    weatherHistory: [] as {
      weather: WeatherType[];
      modifiers: Record<ElementType, number>;
      timestamp: Date;
    }[],
  };

  constructor() {
    this.weatherManager = new WeatherManager();
    this.seasonManager = new SeasonManager();
    this.cardManager = new WeatherCardManager();
    this.gameModeManager = new GameModeManager();
  }

  /**
   * Initialize the demo
   */
  async initialize() {
    await this.weatherManager.loadConfig();
    console.log("🌤️  Interactive Weather Demo Initialized!");
    console.log('Type "help" for available commands\n');
  }

  /**
   * Apply weather and show effects
   */
  applyWeather(weatherTypes: WeatherType[]) {
    try {
      // Validate weather combination
      if (!this.weatherManager.validateWeatherMix(weatherTypes)) {
        console.log("❌ Invalid weather combination!");
        this.showWeatherCompatibility(weatherTypes);
        return;
      }

      // Apply weather
      this.weatherManager.applyWeather(weatherTypes);
      this.demoState.currentWeather = [...weatherTypes];

      // Calculate and display effects
      const modifiers = this.weatherManager.calculateElementalModifiers();

      console.log(`🌤️  Weather applied: ${weatherTypes.join(", ")}`);
      this.displayWeatherEffects(modifiers);

      // Add to history
      if (this.demoState.showHistory) {
        this.demoState.weatherHistory.push({
          weather: [...weatherTypes],
          modifiers: { ...modifiers },
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.log(`❌ Error applying weather: ${error.message}`);
    }
  }

  /**
   * Display current weather effects
   */
  displayWeatherEffects(modifiers: Record<ElementType, number>) {
    console.log("\n📊 Elemental Damage Modifiers:");
    console.log("================================");

    this.demoState.selectedElements.forEach((element) => {
      const modifier = modifiers[element] || 0;
      const modifiedDamage = Math.round(
        this.demoState.baseDamage * (1 + modifier / 100)
      );
      const arrow = modifier > 0 ? "↗️" : modifier < 0 ? "↘️" : "➡️";
      const color = modifier > 0 ? "🟢" : modifier < 0 ? "🔴" : "⚪";

      console.log(
        `${this.getElementIcon(element)} ${element}: ${color} ${
          modifier > 0 ? "+" : ""
        }${modifier}% ${arrow} ${
          this.demoState.baseDamage
        } → ${modifiedDamage} damage`
      );
    });

    console.log("");
  }

  /**
   * Show weather compatibility information
   */
  showWeatherCompatibility(weatherTypes: WeatherType[]) {
    console.log("\n🔍 Weather Compatibility Analysis:");
    console.log("==================================");

    for (let i = 0; i < weatherTypes.length; i++) {
      for (let j = i + 1; j < weatherTypes.length; j++) {
        const weather1 = weatherTypes[i];
        const weather2 = weatherTypes[j];

        if (this.weatherManager.areOppositeWeathers(weather1, weather2)) {
          console.log(
            `❌ ${weather1} and ${weather2} are opposite weather types`
          );
        } else {
          console.log(`✅ ${weather1} and ${weather2} are compatible`);
        }
      }
    }

    // Show compatible weather for each type
    weatherTypes.forEach((weather) => {
      const compatible = this.weatherManager.getCompatibleWeather(weather);
      console.log(
        `🌤️  ${weather} is compatible with: ${compatible.join(", ")}`
      );
    });

    console.log("");
  }

  /**
   * Demonstrate seasonal weather patterns
   */
  demonstrateSeasonalWeather() {
    console.log("🗓️  Seasonal Weather Demonstration");
    console.log("==================================\n");

    for (let month = 1; month <= 12; month++) {
      const season = this.seasonManager.getSeasonForMonth(month);
      const weatherPool = this.seasonManager.getWeatherPool(season);
      const selectedWeather = this.seasonManager.getWeatherForMonth(month);

      console.log(`Month ${month.toString().padStart(2, "0")} (${season}):`);
      console.log(`  Available: ${weatherPool.join(", ")}`);
      console.log(`  Selected:  ${selectedWeather}`);

      // Show what the effects would be
      this.weatherManager.applyWeather([selectedWeather]);
      const modifiers = this.weatherManager.calculateElementalModifiers();
      const effectSummary = Object.entries(modifiers)
        .map(
          ([element, modifier]) =>
            `${element}: ${modifier > 0 ? "+" : ""}${modifier}%`
        )
        .join(", ");
      console.log(`  Effects:   ${effectSummary}\n`);
    }
  }

  /**
   * Demonstrate weather card system
   */
  demonstrateWeatherCards() {
    console.log("🃏 Weather Card Demonstration");
    console.log("=============================\n");

    const sampleCards: WeatherCard[] = [
      {
        id: "sunny-demo",
        type: "Weather",
        name: "Sunny Day",
        description: "Changes weather to sunny, boosting Fire damage",
        weather: "Sunny",
        cost: 2,
      },
      {
        id: "storm-demo",
        type: "Weather",
        name: "Lightning Storm",
        description: "Summons a storm, greatly boosting Lightning damage",
        weather: "Stormy",
        cost: 3,
      },
      {
        id: "clear-demo",
        type: "BreakWeather",
        name: "Clear Skies",
        description: "Removes all weather effects",
        cost: 1,
      },
      {
        id: "fire-buff-demo",
        type: "WeatherBuff",
        name: "Fire Enhancement",
        description: "Increases Fire damage by 15% for 3 turns",
        effect: { Fire: 15 },
        duration: 3,
        cost: 2,
      },
    ];

    sampleCards.forEach((card) => {
      console.log(`🃏 ${card.name} (${card.type})`);
      console.log(`   ${card.description}`);
      console.log(`   Cost: ${card.cost}`);

      if (card.weather) {
        console.log(`   Weather: ${card.weather}`);
      }

      if (card.effect) {
        const effectStr = Object.entries(card.effect)
          .map(([element, modifier]) => `${element}: +${modifier}%`)
          .join(", ");
        console.log(`   Effect: ${effectStr}`);
      }

      if (card.duration) {
        console.log(`   Duration: ${card.duration} turns`);
      }

      console.log("");
    });

    // Demonstrate card play
    console.log("Playing cards in sequence:\n");

    sampleCards.forEach((card, index) => {
      console.log(`${index + 1}. Playing ${card.name}:`);

      try {
        const currentWeather = this.weatherManager.getCurrentWeather();

        if (this.cardManager.validateCardPlay(card, currentWeather)) {
          const newWeather = this.cardManager.playCard(card, currentWeather);

          if (card.type === "BreakWeather") {
            this.weatherManager.resetWeather();
            console.log("   ✅ Weather cleared!");
          } else if (card.weather) {
            this.weatherManager.applyWeather([card.weather]);
            console.log(`   ✅ Weather changed to ${card.weather}`);
          }

          const modifiers = this.weatherManager.calculateElementalModifiers();
          this.displayWeatherEffects(modifiers);
        } else {
          console.log("   ❌ Cannot play this card in current weather");
        }
      } catch (error) {
        console.log(`   ❌ Error playing card: ${error.message}`);
      }
    });
  }

  /**
   * Demonstrate game modes
   */
  demonstrateGameModes() {
    console.log("🎮 Game Mode Demonstration");
    console.log("==========================\n");

    const gameModes = ["12-Month Campaign", "Weather Chaos", "Seasonal Event"];

    gameModes.forEach((modeName) => {
      console.log(`🎯 ${modeName}:`);

      try {
        this.gameModeManager.setGameMode(modeName);
        const mode = this.gameModeManager.getCurrentMode();

        console.log(`   Description: ${mode.description}`);
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
        console.log(
          `     - Weather Source: ${mode.weatherRules.weatherSource}`
        );

        if (mode.specialRules && mode.specialRules.length > 0) {
          console.log(`   Special Rules:`);
          mode.specialRules.forEach((rule) => {
            console.log(`     - ${rule.name}: ${rule.description}`);
          });
        }

        // Simulate a few turns
        console.log(`   Sample weather progression:`);
        for (let turn = 1; turn <= 5; turn++) {
          const weather = this.gameModeManager.processWeatherForTurn(turn);
          console.log(
            `     Turn ${turn}: ${weather.join(", ") || "No change"}`
          );
        }

        console.log("");
      } catch (error) {
        console.log(`   ❌ Error with game mode: ${error.message}\n`);
      }
    });
  }

  /**
   * Run weather effect comparison
   */
  compareWeatherEffects(weatherCombinations: WeatherType[][]) {
    console.log("⚖️  Weather Effect Comparison");
    console.log("=============================\n");

    const results: Array<{
      weather: WeatherType[];
      modifiers: Record<ElementType, number>;
      totalEffect: number;
      isValid: boolean;
    }> = [];

    weatherCombinations.forEach((weather) => {
      try {
        const isValid = this.weatherManager.validateWeatherMix(weather);

        if (isValid) {
          this.weatherManager.applyWeather(weather);
          const modifiers = this.weatherManager.calculateElementalModifiers();
          const totalEffect = Object.values(modifiers).reduce(
            (sum, val) => sum + Math.abs(val),
            0
          );

          results.push({
            weather: [...weather],
            modifiers: { ...modifiers },
            totalEffect,
            isValid: true,
          });
        } else {
          results.push({
            weather: [...weather],
            modifiers: { Fire: 0, Ice: 0, Lightning: 0 },
            totalEffect: 0,
            isValid: false,
          });
        }
      } catch (error) {
        results.push({
          weather: [...weather],
          modifiers: { Fire: 0, Ice: 0, Lightning: 0 },
          totalEffect: 0,
          isValid: false,
        });
      }
    });

    // Sort by total effect (descending)
    results.sort((a, b) => b.totalEffect - a.totalEffect);

    console.log("Results (sorted by total effect):");
    console.log(
      "Weather Combination".padEnd(25) +
        "Fire".padEnd(8) +
        "Ice".padEnd(8) +
        "Lightning".padEnd(12) +
        "Total".padEnd(8) +
        "Valid"
    );
    console.log("-".repeat(70));

    results.forEach((result) => {
      const weatherStr = result.weather.join(", ").padEnd(25);
      const fireStr = `${result.modifiers.Fire > 0 ? "+" : ""}${
        result.modifiers.Fire
      }%`.padEnd(8);
      const iceStr = `${result.modifiers.Ice > 0 ? "+" : ""}${
        result.modifiers.Ice
      }%`.padEnd(8);
      const lightningStr = `${result.modifiers.Lightning > 0 ? "+" : ""}${
        result.modifiers.Lightning
      }%`.padEnd(12);
      const totalStr = `${result.totalEffect}%`.padEnd(8);
      const validStr = result.isValid ? "✅" : "❌";

      console.log(
        `${weatherStr}${fireStr}${iceStr}${lightningStr}${totalStr}${validStr}`
      );
    });

    console.log("");
  }

  /**
   * Show weather history
   */
  showWeatherHistory() {
    if (this.demoState.weatherHistory.length === 0) {
      console.log("📜 No weather history available\n");
      return;
    }

    console.log("📜 Weather History");
    console.log("==================\n");

    this.demoState.weatherHistory.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.timestamp.toLocaleTimeString()}`);
      console.log(`   Weather: ${entry.weather.join(", ")}`);
      console.log(
        `   Effects: Fire: ${entry.modifiers.Fire}%, Ice: ${entry.modifiers.Ice}%, Lightning: ${entry.modifiers.Lightning}%`
      );
      console.log("");
    });
  }

  /**
   * Clear weather history
   */
  clearHistory() {
    this.demoState.weatherHistory = [];
    console.log("📜 Weather history cleared\n");
  }

  /**
   * Set base damage for calculations
   */
  setBaseDamage(damage: number) {
    this.demoState.baseDamage = Math.max(1, damage);
    console.log(`⚔️  Base damage set to ${this.demoState.baseDamage}\n`);
  }

  /**
   * Reset weather to neutral state
   */
  resetWeather() {
    this.weatherManager.resetWeather();
    this.demoState.currentWeather = [];
    console.log("🌤️  Weather reset to neutral state\n");
  }

  /**
   * Get element icon
   */
  private getElementIcon(element: ElementType): string {
    const icons = {
      Fire: "🔥",
      Ice: "❄️",
      Lightning: "⚡",
    };
    return icons[element] || "🔸";
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log("🆘 Interactive Weather Demo Commands");
    console.log("====================================\n");
    console.log("Weather Commands:");
    console.log("  apply <weather1> [weather2] ...  - Apply weather types");
    console.log("  reset                           - Reset weather to neutral");
    console.log(
      "  current                         - Show current weather state"
    );
    console.log(
      "  compatible <weather>            - Show compatible weather types"
    );
    console.log("");
    console.log("Demonstration Commands:");
    console.log(
      "  seasonal                        - Show seasonal weather patterns"
    );
    console.log("  cards                          - Demonstrate weather cards");
    console.log("  modes                          - Show game modes");
    console.log(
      "  compare                        - Compare weather effect combinations"
    );
    console.log("");
    console.log("Utility Commands:");
    console.log(
      "  damage <amount>                - Set base damage for calculations"
    );
    console.log("  history                        - Show weather history");
    console.log("  clear                          - Clear weather history");
    console.log("  help                           - Show this help");
    console.log("");
    console.log("Available Weather Types:");
    console.log("  Sunny, Cloudy, Rainy, Windy, Stormy, Foggy,");
    console.log("  Snowy, Hot, Cold, Warm, Cool, Humid");
    console.log("");
  }

  /**
   * Get current weather state
   */
  getCurrentState() {
    const modifiers = this.weatherManager.calculateElementalModifiers();

    return {
      weather: this.demoState.currentWeather,
      modifiers,
      baseDamage: this.demoState.baseDamage,
      historyCount: this.demoState.weatherHistory.length,
    };
  }
}

/**
 * Command-line interface for the demo
 */
export class WeatherDemoCLI {
  private demo: InteractiveWeatherDemo;

  constructor() {
    this.demo = new InteractiveWeatherDemo();
  }

  async start() {
    await this.demo.initialize();
    this.demo.showHelp();

    // In a real CLI, you would set up readline interface here
    // For this demo, we'll show some example interactions
    this.runExampleSession();
  }

  private runExampleSession() {
    console.log("🎬 Running Example Demo Session");
    console.log("===============================\n");

    // Example 1: Apply single weather
    console.log("> apply Sunny");
    this.demo.applyWeather(["Sunny"]);

    // Example 2: Apply multiple compatible weather
    console.log("> apply Hot Sunny");
    this.demo.applyWeather(["Hot", "Sunny"]);

    // Example 3: Try incompatible weather
    console.log("> apply Hot Cold");
    this.demo.applyWeather(["Hot", "Cold"]);

    // Example 4: Show seasonal patterns
    console.log("> seasonal");
    this.demo.demonstrateSeasonalWeather();

    // Example 5: Show weather cards
    console.log("> cards");
    this.demo.demonstrateWeatherCards();

    // Example 6: Compare weather effects
    console.log("> compare");
    const combinations = [
      ["Sunny"],
      ["Hot"],
      ["Sunny", "Hot"],
      ["Stormy"],
      ["Rainy", "Stormy"],
      ["Cold", "Snowy"],
      ["Hot", "Cold"], // Invalid
      ["Windy", "Cloudy"],
    ];
    this.demo.compareWeatherEffects(combinations);

    // Example 7: Show history
    console.log("> history");
    this.demo.showWeatherHistory();
  }
}

/**
 * Run the interactive demo
 */
export async function runInteractiveDemo() {
  const cli = new WeatherDemoCLI();
  await cli.start();
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runInteractiveDemo();
}
