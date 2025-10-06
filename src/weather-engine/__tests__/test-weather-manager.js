/**
 * Simple Node.js test for WeatherManager
 */

const { WeatherManager, WeatherConfigLoader } = require("../dist/index.js");
const defaultWeatherConfig = require("../config/weather-effects.json");

async function testWeatherManager() {
  console.log("Testing WeatherManager...");

  try {
    // Load configuration
    const configLoader = WeatherConfigLoader.getInstance();
    const config = configLoader.loadFromData(defaultWeatherConfig);
    console.log("✓ Configuration loaded successfully");

    // Create WeatherManager
    const weatherManager = new WeatherManager(config);
    console.log("✓ WeatherManager created successfully");

    // Test initial state
    const initialState = weatherManager.getCurrentWeatherState();
    console.log("✓ Initial state:", {
      weather: initialState.currentWeather,
      turn: initialState.turn,
      month: initialState.month,
      season: initialState.season,
    });

    // Test applying weather
    const validationResult = weatherManager.applyWeather(["Sunny", "Warm"]);
    console.log("✓ Applied weather successfully:", validationResult.isValid);
    console.log("  Current weather:", weatherManager.getCurrentWeather());

    // Test damage calculation
    const damageResult = weatherManager.calculateElementalModifiers();
    console.log("✓ Calculated elemental modifiers:", {
      Fire: damageResult.elementalModifiers.Fire,
      Ice: damageResult.elementalModifiers.Ice,
      Lightning: damageResult.elementalModifiers.Lightning,
    });

    // Test turn advancement
    weatherManager.advanceTurn();
    console.log("✓ Advanced turn:", {
      turn: weatherManager.getCurrentTurn(),
      month: weatherManager.getCurrentMonth(),
      season: weatherManager.getCurrentSeason(),
    });

    // Test weather reset
    weatherManager.resetWeather();
    console.log("✓ Reset weather:", weatherManager.getCurrentWeather());

    // Test weather card
    const weatherCard = {
      id: "test-card",
      type: "Weather",
      name: "Sunny Day",
      description: "Makes it sunny",
      weather: "Sunny",
      duration: 2,
    };

    weatherManager.playWeatherCard(weatherCard);
    console.log("✓ Played weather card:", {
      weather: weatherManager.getCurrentWeather(),
      activeCards: weatherManager.getActiveCards().length,
    });

    // Test state persistence
    const persistenceData = weatherManager.getPersistenceData();
    console.log("✓ Created persistence data:", {
      version: persistenceData.version,
      timestamp: persistenceData.timestamp > 0,
    });

    // Test state history
    const history = weatherManager.getStateHistory();
    console.log("✓ State history length:", history.length);

    // Test undo
    const undoResult = weatherManager.undoLastChange();
    console.log("✓ Undo result:", undoResult);

    console.log("\n🎉 All WeatherManager tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testWeatherManager();
}

module.exports = { testWeatherManager };
