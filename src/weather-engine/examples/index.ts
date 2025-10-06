/**
 * Weather Engine Examples Index
 *
 * This file exports all example implementations and demos
 * for easy access and usage.
 */

// Sample Game Implementation
export { WeatherBasedGame, runSampleGame } from "./sample-game";

// Interactive Demo
export {
  InteractiveWeatherDemo,
  WeatherDemoCLI,
  runInteractiveDemo,
} from "./interactive-demo";

// Custom Game Modes
export {
  ElementalMasteryMode,
  ChaosStormMode,
  SeasonalConquestMode,
  WeatherDuelMode,
  EternalWeatherMode,
  CustomGameModeManager,
  demonstrateCustomGameModes,
} from "./custom-game-modes";

// Extension Tutorial
export {
  CustomWeatherTutorial,
  CustomWeatherCardTutorial,
  CustomMechanicsTutorial,
  CustomGameModeTutorial,
  WeatherEngineExtensionTutorial,
  runExtensionTutorial,
} from "./extension-tutorial";

/**
 * Run all examples in sequence
 */
export async function runAllExamples() {
  console.log("🎮 Weather Engine - All Examples Demo");
  console.log("=====================================\n");

  try {
    // 1. Sample Game
    console.log("1️⃣  Running Sample Game...\n");
    const { runSampleGame } = await import("./sample-game");
    await runSampleGame();

    console.log("\n" + "=".repeat(50) + "\n");

    // 2. Interactive Demo
    console.log("2️⃣  Running Interactive Demo...\n");
    const { runInteractiveDemo } = await import("./interactive-demo");
    await runInteractiveDemo();

    console.log("\n" + "=".repeat(50) + "\n");

    // 3. Custom Game Modes
    console.log("3️⃣  Demonstrating Custom Game Modes...\n");
    const { demonstrateCustomGameModes } = await import("./custom-game-modes");
    await demonstrateCustomGameModes();

    console.log("\n" + "=".repeat(50) + "\n");

    // 4. Extension Tutorial
    console.log("4️⃣  Running Extension Tutorial...\n");
    const { runExtensionTutorial } = await import("./extension-tutorial");
    await runExtensionTutorial();

    console.log("\n🎉 All examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running examples:", error);
  }
}

/**
 * Quick start guide for developers
 */
export function showQuickStartGuide() {
  console.log("🚀 Weather Engine Quick Start Guide");
  console.log("===================================\n");

  console.log("1. Basic Usage:");
  console.log("```typescript");
  console.log('import { WeatherManager } from "@/weather-engine";');
  console.log("");
  console.log("const weatherManager = new WeatherManager();");
  console.log("await weatherManager.loadConfig();");
  console.log('weatherManager.applyWeather(["Sunny"]);');
  console.log(
    "const modifiers = weatherManager.calculateElementalModifiers();"
  );
  console.log("```\n");

  console.log("2. Run Sample Game:");
  console.log("```typescript");
  console.log('import { runSampleGame } from "@/weather-engine/examples";');
  console.log("await runSampleGame();");
  console.log("```\n");

  console.log("3. Interactive Demo:");
  console.log("```typescript");
  console.log(
    'import { runInteractiveDemo } from "@/weather-engine/examples";'
  );
  console.log("await runInteractiveDemo();");
  console.log("```\n");

  console.log("4. Custom Game Modes:");
  console.log("```typescript");
  console.log(
    'import { CustomGameModeManager } from "@/weather-engine/examples";'
  );
  console.log("const manager = new CustomGameModeManager();");
  console.log('manager.setGameMode("Elemental Mastery");');
  console.log("```\n");

  console.log("5. Extension Tutorial:");
  console.log("```typescript");
  console.log(
    'import { runExtensionTutorial } from "@/weather-engine/examples";'
  );
  console.log("await runExtensionTutorial();");
  console.log("```\n");

  console.log("📚 For detailed documentation, see:");
  console.log("- API Documentation: ./docs/API.md");
  console.log("- Integration Guide: ./docs/INTEGRATION_GUIDE.md");
  console.log("- Configuration Reference: ./docs/CONFIGURATION.md");
  console.log("- Troubleshooting: ./docs/TROUBLESHOOTING.md");
}

/**
 * Example configurations for different use cases
 */
export const ExampleConfigurations = {
  /**
   * Balanced configuration for standard gameplay
   */
  balanced: {
    name: "Balanced Weather System",
    description: "Well-balanced weather effects suitable for most games",
    weatherEffects: {
      Sunny: { Fire: 15, Ice: -10, Lightning: -5 },
      Rainy: { Fire: -15, Ice: 5, Lightning: 10 },
      Stormy: { Fire: -10, Ice: 0, Lightning: 20 },
      Snowy: { Fire: -20, Ice: 15, Lightning: -10 },
      Hot: { Fire: 25, Ice: -15, Lightning: 0 },
      Cold: { Fire: -15, Ice: 20, Lightning: -5 },
    },
  },

  /**
   * Extreme configuration for high-impact gameplay
   */
  extreme: {
    name: "Extreme Weather System",
    description: "High-impact weather effects for dramatic gameplay",
    weatherEffects: {
      Sunny: { Fire: 30, Ice: -20, Lightning: -10 },
      Rainy: { Fire: -30, Ice: 10, Lightning: 25 },
      Stormy: { Fire: -25, Ice: 0, Lightning: 40 },
      Snowy: { Fire: -35, Ice: 30, Lightning: -15 },
      Hot: { Fire: 40, Ice: -30, Lightning: 0 },
      Cold: { Fire: -30, Ice: 35, Lightning: -10 },
    },
  },

  /**
   * Subtle configuration for minimal weather impact
   */
  subtle: {
    name: "Subtle Weather System",
    description: "Gentle weather effects that enhance without dominating",
    weatherEffects: {
      Sunny: { Fire: 8, Ice: -5, Lightning: -3 },
      Rainy: { Fire: -8, Ice: 3, Lightning: 5 },
      Stormy: { Fire: -5, Ice: 0, Lightning: 10 },
      Snowy: { Fire: -10, Ice: 8, Lightning: -5 },
      Hot: { Fire: 12, Ice: -8, Lightning: 0 },
      Cold: { Fire: -8, Ice: 10, Lightning: -3 },
    },
  },
};

/**
 * Example game scenarios for testing
 */
export const ExampleScenarios = {
  /**
   * Tutorial scenario for new players
   */
  tutorial: {
    name: "Weather Tutorial",
    description: "Learn weather mechanics step by step",
    turns: 5,
    weatherSequence: ["Sunny", "Rainy", "Stormy", "Snowy", "Clear"],
    objectives: [
      "Experience different weather types",
      "Learn elemental interactions",
      "Practice weather card usage",
    ],
  },

  /**
   * Challenge scenario for experienced players
   */
  challenge: {
    name: "Weather Master Challenge",
    description: "Test your weather mastery skills",
    turns: 12,
    weatherSequence: "seasonal", // Use seasonal progression
    objectives: [
      "Adapt to seasonal changes",
      "Maximize elemental synergies",
      "Achieve weather mastery",
    ],
  },

  /**
   * Chaos scenario for unpredictable gameplay
   */
  chaos: {
    name: "Chaos Weather Battle",
    description: "Survive unpredictable weather chaos",
    turns: 10,
    weatherSequence: "random", // Random weather each turn
    objectives: [
      "Adapt to random weather",
      "Survive weather chaos",
      "Emerge victorious",
    ],
  },
};

// Run all examples if this file is executed directly
if (require.main === module) {
  console.log("🎮 Weather Engine Examples");
  console.log("==========================\n");

  console.log("Available examples:");
  console.log("1. runSampleGame() - Complete game implementation");
  console.log("2. runInteractiveDemo() - Interactive weather exploration");
  console.log("3. demonstrateCustomGameModes() - Custom game mode examples");
  console.log("4. runExtensionTutorial() - Learn to extend the system");
  console.log("5. runAllExamples() - Run all examples in sequence\n");

  console.log("To run all examples:");
  console.log("npm run examples\n");

  showQuickStartGuide();
}
