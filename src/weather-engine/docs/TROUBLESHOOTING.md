# Weather Engine Troubleshooting Guide

## Table of Contents

- [Common Issues](#common-issues)
- [Error Messages](#error-messages)
- [Performance Issues](#performance-issues)
- [Configuration Problems](#configuration-problems)
- [Integration Issues](#integration-issues)
- [Debugging Tools](#debugging-tools)
- [FAQ](#faq)

## Common Issues

### Weather Validation Errors

#### Issue: "Invalid weather combination" error when applying weather

**Symptoms:**

- `WeatherValidationError` thrown when calling `applyWeather()`
- Weather changes are rejected
- Console shows validation error messages

**Causes:**

- Attempting to combine opposite weather types (Hot + Cold)
- Exceeding maximum weather types for current game mode
- Invalid weather type names

**Solutions:**

```typescript
// Check weather compatibility before applying
const weatherManager = new WeatherManager();

// Method 1: Validate before applying
const weatherToApply = ["Hot", "Sunny"];
if (weatherManager.validateWeatherMix(weatherToApply)) {
  weatherManager.applyWeather(weatherToApply);
} else {
  console.log("Invalid weather combination");
}

// Method 2: Use try-catch for error handling
try {
  weatherManager.applyWeather(["Hot", "Cold"]); // This will fail
} catch (error) {
  if (error instanceof WeatherValidationError) {
    console.log(`Weather validation failed: ${error.reason}`);
    console.log(`Invalid weather: ${error.invalidWeather}`);
  }
}

// Method 3: Check compatibility matrix
const compatibleWeather = weatherManager.getCompatibleWeather("Hot");
console.log("Weather compatible with Hot:", compatibleWeather);
```

#### Issue: Weather effects not calculating correctly

**Symptoms:**

- Elemental modifiers showing unexpected values
- Weather effects not applying to damage calculations
- Inconsistent effect calculations

**Solutions:**

```typescript
// Debug weather effect calculations
const weatherManager = new WeatherManager();
weatherManager.applyWeather(["Sunny", "Hot"]);

// Check current weather
console.log("Current weather:", weatherManager.getCurrentWeather());

// Check individual weather effects
const sunnyEffect = weatherManager.getWeatherEffect("Sunny");
const hotEffect = weatherManager.getWeatherEffect("Hot");
console.log("Sunny effect:", sunnyEffect);
console.log("Hot effect:", hotEffect);

// Check combined effects
const combinedEffects = weatherManager.calculateElementalModifiers();
console.log("Combined effects:", combinedEffects);

// Verify effect limits
const clampedEffects = weatherManager.calculateElementalModifiers(true);
console.log("Clamped effects:", clampedEffects);
```

### Card System Issues

#### Issue: Weather cards not playing correctly

**Symptoms:**

- `CardPlayError` when attempting to play valid cards
- Cards not affecting weather state
- Card effects not applying

**Solutions:**

```typescript
const cardManager = new WeatherCardManager();
const weatherManager = new WeatherManager();

// Debug card play issues
const card: WeatherCard = {
  id: "sunny-1",
  type: "Weather",
  name: "Sunny Day",
  weather: "Sunny",
};

// Check card validation
const currentWeather = weatherManager.getCurrentWeather();
const canPlay = cardManager.validateCardPlay(card, currentWeather);
console.log("Can play card:", canPlay);

if (!canPlay) {
  // Check specific validation issues
  const validationResult = cardManager.getCardValidationDetails(
    card,
    currentWeather
  );
  console.log("Validation details:", validationResult);
}

// Check game mode restrictions
const gameMode = gameModeManager.getCurrentMode();
if (!gameMode.weatherRules.allowPlayerWeatherControl) {
  console.log("Current game mode does not allow weather cards");
}
```

#### Issue: Card effects not expiring

**Symptoms:**

- Cards remain active beyond their duration
- Card effects stack indefinitely
- Memory usage increases over time

**Solutions:**

```typescript
// Manual card expiration
cardManager.expireCards();

// Check active cards
const activeCards = cardManager.getActiveCards();
console.log("Active cards:", activeCards);

// Debug card durations
activeCards.forEach((card) => {
  console.log(`Card ${card.name}: ${card.remainingDuration} turns left`);
});

// Force expire specific card
cardManager.expireCard(cardId);

// Set up automatic expiration
setInterval(() => {
  cardManager.expireCards();
}, 1000); // Expire every second
```

### Season Manager Issues

#### Issue: Incorrect seasonal weather selection

**Symptoms:**

- Winter weather appearing in summer
- Seasonal probabilities not working
- Weather selection seems random

**Solutions:**

```typescript
const seasonManager = new SeasonManager();

// Debug seasonal selection
const month = 6; // June
const season = seasonManager.getSeasonForMonth(month);
console.log(`Month ${month} is in ${season}`);

// Check seasonal weather pool
const weatherPool = seasonManager.getWeatherPool(season);
console.log(`${season} weather pool:`, weatherPool);

// Check weather selection weights
const weights = seasonManager.getSeasonalWeights(season);
console.log(`${season} weights:`, weights);

// Test weather selection multiple times
for (let i = 0; i < 10; i++) {
  const weather = seasonManager.getWeatherForMonth(month);
  console.log(`Selection ${i + 1}: ${weather}`);
}
```

## Error Messages

### WeatherValidationError

```
WeatherValidationError: Invalid weather combination: Hot and Cold are opposite weather types
```

**Cause:** Attempting to apply opposite weather types simultaneously.

**Solution:** Check weather compatibility before applying:

```typescript
const areOpposite = weatherManager.areOppositeWeathers("Hot", "Cold");
if (areOpposite) {
  console.log("Cannot combine Hot and Cold weather");
}
```

### CardPlayError

```
CardPlayError: Cannot play card Sunny Day: Weather cards not allowed in current game mode
```

**Cause:** Current game mode doesn't allow player weather control.

**Solution:** Check game mode rules:

```typescript
const gameMode = gameModeManager.getCurrentMode();
if (!gameMode.weatherRules.allowPlayerWeatherControl) {
  // Switch to a mode that allows weather cards
  gameModeManager.setGameMode("12-Month Campaign");
}
```

### ConfigurationError

```
ConfigurationError: Invalid weather effect value: Fire effect 50 exceeds maximum limit of 40
```

**Cause:** Configuration contains values outside allowed limits.

**Solution:** Validate and fix configuration:

```typescript
// Check configuration limits
const config = configManager.getConfig();
const limits = config.limits.weatherEffects;

// Fix invalid values
Object.keys(config.weatherEffects).forEach((weatherType) => {
  const effect = config.weatherEffects[weatherType];
  Object.keys(effect).forEach((element) => {
    if (effect[element] > limits.max) {
      effect[element] = limits.max;
    }
    if (effect[element] < limits.min) {
      effect[element] = limits.min;
    }
  });
});
```

## Performance Issues

### High Memory Usage

**Symptoms:**

- Memory usage increases over time
- Application becomes slow
- Browser/Node.js crashes

**Causes:**

- Weather history not being pruned
- Event listeners not being removed
- Large configuration files

**Solutions:**

```typescript
// Enable memory management
weatherManager.enableMemoryManagement({
  maxHistorySize: 50,
  pruneInterval: 1000,
  enableGarbageCollection: true,
});

// Manual cleanup
weatherManager.clearHistory();
weatherManager.clearCache();

// Remove event listeners
weatherManager.removeAllListeners();

// Monitor memory usage
setInterval(() => {
  const memoryUsage = weatherManager.getMemoryUsage();
  console.log("Memory usage:", memoryUsage);

  if (memoryUsage.heapUsed > 100 * 1024 * 1024) {
    // 100MB
    weatherManager.performCleanup();
  }
}, 5000);
```

### Slow Weather Calculations

**Symptoms:**

- Weather effect calculations take too long
- UI freezes during weather changes
- High CPU usage

**Solutions:**

```typescript
// Enable caching
weatherManager.enableCaching({
  maxCacheSize: 1000,
  enableEffectCache: true,
  enableValidationCache: true,
});

// Use batch operations
const weatherOperations = [["Sunny"], ["Hot"], ["Windy"]];

weatherManager.processBatch(weatherOperations);

// Optimize configuration
const optimizedConfig = configManager.optimizeConfig(config);
weatherManager.updateConfig(optimizedConfig);
```

### Frequent Weather Updates

**Symptoms:**

- Weather changes too frequently
- Performance degrades with many updates
- UI updates lag behind weather changes

**Solutions:**

```typescript
// Throttle weather updates
const throttledWeatherUpdate = throttle((weather) => {
  weatherManager.applyWeather(weather);
}, 100); // Max once per 100ms

// Batch UI updates
const uiUpdateQueue = [];
const processUIUpdates = debounce(() => {
  uiUpdateQueue.forEach((update) => update());
  uiUpdateQueue.length = 0;
}, 50);

weatherManager.on("weatherChanged", (weather) => {
  uiUpdateQueue.push(() => updateWeatherUI(weather));
  processUIUpdates();
});
```

## Configuration Problems

### Configuration Not Loading

**Symptoms:**

- Default weather effects being used
- Custom configurations ignored
- Configuration file not found errors

**Solutions:**

```typescript
// Check configuration file path
const configPath = "./weather-config.json";
const fs = require("fs");

if (!fs.existsSync(configPath)) {
  console.error(`Configuration file not found: ${configPath}`);
  // Create default configuration
  configManager.createDefaultConfig(configPath);
}

// Load with error handling
try {
  const config = await configManager.loadConfig(configPath);
  console.log("Configuration loaded successfully");
} catch (error) {
  console.error("Failed to load configuration:", error);
  // Fall back to default configuration
  const defaultConfig = configManager.getDefaultConfig();
  weatherManager.updateConfig(defaultConfig);
}
```

### Invalid Configuration Values

**Symptoms:**

- Weather effects not working as expected
- Validation errors on startup
- Inconsistent behavior

**Solutions:**

```typescript
// Validate configuration
const config = await configManager.loadConfig();
const validationResult = configManager.validateConfig(config);

if (!validationResult.isValid) {
  console.error("Configuration validation failed:");
  validationResult.errors.forEach((error) => {
    console.error(`- ${error.path}: ${error.message}`);
  });

  // Fix common issues
  const fixedConfig = configManager.fixCommonIssues(config);
  weatherManager.updateConfig(fixedConfig);
}
```

## Integration Issues

### React Integration Problems

**Symptoms:**

- Weather state not updating in React components
- Event listeners not working
- Memory leaks in React components

**Solutions:**

```typescript
// Proper React integration
import { useEffect, useState } from "react";

const WeatherComponent = ({ weatherManager }) => {
  const [weather, setWeather] = useState([]);
  const [modifiers, setModifiers] = useState({});

  useEffect(() => {
    // Initial state
    setWeather(weatherManager.getCurrentWeather());
    setModifiers(weatherManager.calculateElementalModifiers());

    // Event listeners
    const handleWeatherChange = (newWeather) => {
      setWeather([...newWeather]);
      setModifiers(weatherManager.calculateElementalModifiers());
    };

    weatherManager.on("weatherChanged", handleWeatherChange);

    // Cleanup
    return () => {
      weatherManager.off("weatherChanged", handleWeatherChange);
    };
  }, [weatherManager]);

  return (
    <div>
      <div>Current Weather: {weather.join(", ")}</div>
      <div>Fire Modifier: {modifiers.Fire}%</div>
      <div>Ice Modifier: {modifiers.Ice}%</div>
      <div>Lightning Modifier: {modifiers.Lightning}%</div>
    </div>
  );
};
```

### Game Loop Integration

**Symptoms:**

- Weather not updating with game turns
- Desynchronization between weather and game state
- Weather changes at wrong times

**Solutions:**

```typescript
class GameLoop {
  private weatherManager: WeatherManager;
  private gameModeManager: GameModeManager;
  private currentTurn: number = 1;

  processTurn() {
    // Update weather at start of turn
    const shouldUpdateWeather = this.shouldUpdateWeatherThisTurn();

    if (shouldUpdateWeather) {
      const newWeather = this.gameModeManager.processWeatherForTurn(
        this.currentTurn
      );
      this.weatherManager.applyWeather(newWeather);
    }

    // Process player actions
    this.processPlayerActions();

    // Process card expirations at end of turn
    this.cardManager.expireCards();

    this.currentTurn++;
  }

  private shouldUpdateWeatherThisTurn(): boolean {
    const gameMode = this.gameModeManager.getCurrentMode();
    const frequency = gameMode.weatherRules.weatherChangeFrequency;
    return this.currentTurn % frequency === 0;
  }
}
```

## Debugging Tools

### Enable Debug Mode

```typescript
// Enable comprehensive debugging
weatherManager.enableDebugMode({
  logLevel: "debug",
  logWeatherChanges: true,
  logCardPlays: true,
  logValidation: true,
  logPerformance: true,
});

// Custom debug logger
weatherManager.setDebugLogger((level, message, data) => {
  console.log(`[${level.toUpperCase()}] ${message}`, data);
});
```

### Weather State Inspector

```typescript
// Inspect current weather state
const inspector = weatherManager.getStateInspector();

console.log("Weather State Inspector:");
console.log("- Current Weather:", inspector.getCurrentWeather());
console.log("- Active Cards:", inspector.getActiveCards());
console.log("- Weather History:", inspector.getWeatherHistory());
console.log("- Performance Metrics:", inspector.getPerformanceMetrics());
console.log("- Memory Usage:", inspector.getMemoryUsage());
```

### Validation Debugger

```typescript
// Debug weather validation
const validator = weatherManager.getValidator();

const weather = ["Hot", "Cold"];
const validationResult = validator.validateWithDetails(weather);

console.log("Validation Result:");
console.log("- Is Valid:", validationResult.isValid);
console.log("- Errors:", validationResult.errors);
console.log("- Warnings:", validationResult.warnings);
console.log("- Suggestions:", validationResult.suggestions);
```

## FAQ

### Q: Why are my weather effects not applying to damage calculations?

**A:** Check the following:

1. Ensure weather is properly applied: `weatherManager.getCurrentWeather()`
2. Verify elemental modifiers are calculated: `weatherManager.calculateElementalModifiers()`
3. Check if damage calculation is using the modifiers correctly
4. Ensure weather effects are within valid limits (-40 to +40)

### Q: How do I create custom weather types?

**A:** Add them to your configuration file:

```json
{
  "weatherEffects": {
    "Volcanic": {
      "Fire": 35,
      "Ice": -30,
      "Lightning": 15
    }
  }
}
```

Then register the weather type:

```typescript
weatherManager.registerCustomWeather("Volcanic", {
  Fire: 35,
  Ice: -30,
  Lightning: 15,
});
```

### Q: Can I have more than 5 weather types active at once?

**A:** The default limit is 5, but you can modify it in configuration:

```json
{
  "limits": {
    "maxWeatherTypes": 10
  }
}
```

Or in game mode rules:

```json
{
  "weatherRules": {
    "maxWeatherTypes": 8
  }
}
```

### Q: How do I prevent certain weather combinations?

**A:** Use the compatibility matrix in configuration:

```json
{
  "compatibilityMatrix": {
    "Hot": ["Sunny", "Warm"],
    "Cold": ["Snowy", "Foggy"]
  },
  "oppositeWeatherPairs": [
    ["Hot", "Cold"],
    ["Sunny", "Stormy"]
  ]
}
```

### Q: Why is my seasonal weather selection not working?

**A:** Check:

1. Month-to-season mapping is correct
2. Seasonal weights add up to 1.0
3. Weather types in seasonal pools exist in weatherEffects
4. SeasonManager is properly initialized

### Q: How do I optimize performance for large numbers of weather changes?

**A:** Use these optimization techniques:

1. Enable caching: `weatherManager.enableCaching()`
2. Use batch operations: `weatherManager.processBatch()`
3. Limit weather history: `weatherManager.setMaxHistorySize(50)`
4. Throttle UI updates
5. Use web workers for heavy calculations

### Q: Can I save and restore weather state?

**A:** Yes, use the state management methods:

```typescript
// Save state
const weatherState = weatherManager.getWeatherState();
localStorage.setItem("weatherState", JSON.stringify(weatherState));

// Restore state
const savedState = JSON.parse(localStorage.getItem("weatherState"));
weatherManager.restoreState(savedState);
```

### Q: How do I handle weather in multiplayer games?

**A:** Ensure weather state is synchronized:

```typescript
// Server-side weather management
const serverWeatherManager = new WeatherManager();

// Broadcast weather changes to all clients
serverWeatherManager.on("weatherChanged", (weather) => {
  broadcastToAllClients("weatherUpdate", weather);
});

// Client-side weather sync
socket.on("weatherUpdate", (weather) => {
  clientWeatherManager.syncWeather(weather);
});
```

### Q: What's the best way to test weather engine integration?

**A:** Use the provided test utilities:

```typescript
import { WeatherTestUtils } from "@/weather-engine/testing";

// Create test environment
const testManager = WeatherTestUtils.createMockWeatherManager();
const testState = WeatherTestUtils.createTestGameState();

// Simulate game scenarios
const weatherHistory = WeatherTestUtils.simulateGameTurns(testManager, 12);

// Verify results
expect(weatherHistory).toHaveLength(12);
expect(weatherHistory[0]).toContain("Spring weather");
```

For more specific issues not covered here, please check the [API Documentation](./API.md) or create an issue in the project repository.
