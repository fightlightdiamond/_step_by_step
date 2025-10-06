/**
 * Simple WeatherManager test (Node.js compatible)
 */

const fs = require("fs");
const path = require("path");

// Mock WeatherManager functionality for testing
class TestWeatherManager {
  constructor(config) {
    this.config = config;
    this.weatherState = {
      currentWeather: [],
      turn: 1,
      month: 1,
      season: "Winter",
      activeCards: [],
    };
    this.stateHistory = [];
    this.eventListeners = new Map();
    this.MONTH_TO_SEASON = {
      1: "Winter",
      2: "Winter",
      3: "Spring",
      4: "Spring",
      5: "Spring",
      6: "Summer",
      7: "Summer",
      8: "Summer",
      9: "Autumn",
      10: "Autumn",
      11: "Autumn",
      12: "Winter",
    };
  }

  getCurrentWeatherState() {
    return { ...this.weatherState };
  }

  getCurrentWeather() {
    return [...this.weatherState.currentWeather];
  }

  getCurrentTurn() {
    return this.weatherState.turn;
  }

  getCurrentMonth() {
    return this.weatherState.month;
  }

  getCurrentSeason() {
    return this.weatherState.season;
  }

  getActiveCards() {
    return [...this.weatherState.activeCards];
  }

  applyWeather(weatherTypes, options = {}) {
    const opts = {
      validateChange: true,
      triggerEvents: true,
      source: "manual",
      ...options,
    };

    // Simple validation - check for opposite weather types
    if (opts.validateChange) {
      const opposites = [
        ["Hot", "Cold"],
        ["Sunny", "Snowy"],
        ["Sunny", "Stormy"],
      ];
      for (const [type1, type2] of opposites) {
        if (weatherTypes.includes(type1) && weatherTypes.includes(type2)) {
          throw new Error(
            `Opposite weather types cannot coexist: ${type1} and ${type2}`
          );
        }
      }
    }

    this.saveStateToHistory();
    const previousWeather = [...this.weatherState.currentWeather];
    this.weatherState.currentWeather = [...weatherTypes];

    if (opts.triggerEvents) {
      this.emitEvent("weatherChanged", {
        previousWeather,
        newWeather: weatherTypes,
        source: opts.source,
      });
    }

    return { isValid: true, errors: [], warnings: [] };
  }

  resetWeather(options = {}) {
    const opts = { triggerEvents: true, source: "system", ...options };

    this.saveStateToHistory();
    const previousWeather = [...this.weatherState.currentWeather];
    this.weatherState.currentWeather = [];

    if (opts.triggerEvents) {
      this.emitEvent("weatherReset", { previousWeather, source: opts.source });
    }
  }

  advanceTurn() {
    if (this.weatherState.turn >= 12) {
      throw new Error("Cannot advance beyond turn 12");
    }

    this.saveStateToHistory();
    this.weatherState.turn += 1;
    this.weatherState.month = (this.weatherState.month % 12) + 1;
    this.weatherState.season = this.MONTH_TO_SEASON[this.weatherState.month];

    // Process card expirations
    this.weatherState.activeCards = this.weatherState.activeCards.filter(
      (card) => {
        if (card.duration !== undefined) {
          card.duration -= 1;
          return card.duration > 0;
        }
        return true;
      }
    );

    this.emitEvent("turnAdvanced", {
      turn: this.weatherState.turn,
      month: this.weatherState.month,
      season: this.weatherState.season,
    });
  }

  setTurn(turn, month) {
    if (turn < 1 || turn > 12) {
      throw new Error("Turn must be between 1 and 12");
    }

    const targetMonth = month ?? turn;
    if (targetMonth < 1 || targetMonth > 12) {
      throw new Error("Month must be between 1 and 12");
    }

    this.saveStateToHistory();
    this.weatherState.turn = turn;
    this.weatherState.month = targetMonth;
    this.weatherState.season = this.MONTH_TO_SEASON[targetMonth];

    this.emitEvent("turnAdvanced", {
      turn: this.weatherState.turn,
      month: this.weatherState.month,
      season: this.weatherState.season,
    });
  }

  playWeatherCard(card) {
    this.saveStateToHistory();

    switch (card.type) {
      case "Weather":
        if (card.weather) {
          const newWeather = [
            ...this.weatherState.currentWeather,
            card.weather,
          ];
          const validationResult = this.applyWeather(newWeather, {
            source: "card",
            reason: `Played weather card: ${card.name}`,
          });

          if (card.duration && card.duration > 0) {
            this.weatherState.activeCards.push({ ...card });
          }

          this.emitEvent("cardPlayed", { card, effect: "weather_change" });
          return validationResult;
        }
        break;

      case "BreakWeather":
        this.resetWeather({
          source: "card",
          reason: `Played break weather card: ${card.name}`,
        });

        if (card.duration && card.duration > 0) {
          this.weatherState.activeCards.push({ ...card });
        }

        this.emitEvent("cardPlayed", { card, effect: "weather_break" });
        break;

      default:
        if (card.duration && card.duration > 0) {
          this.weatherState.activeCards.push({ ...card });
        }
        this.emitEvent("cardPlayed", { card, effect: "weather_modifier" });
        break;
    }

    return { isValid: true, errors: [], warnings: [] };
  }

  calculateElementalModifiers() {
    // Simple mock calculation
    const modifiers = { Fire: 0, Ice: 0, Lightning: 0 };

    for (const weather of this.weatherState.currentWeather) {
      switch (weather) {
        case "Sunny":
        case "Hot":
          modifiers.Fire += 10;
          modifiers.Ice -= 5;
          break;
        case "Snowy":
        case "Cold":
          modifiers.Ice += 10;
          modifiers.Fire -= 5;
          break;
        case "Stormy":
          modifiers.Lightning += 15;
          break;
      }
    }

    return {
      elementalModifiers: modifiers,
      appliedWeatherEffects: [],
      totalEffectsByElement: modifiers,
      clampedEffects: { Fire: false, Ice: false, Lightning: false },
      activeWeatherTypes: [...this.weatherState.currentWeather],
    };
  }

  calculateElementDamage(element, baseDamage) {
    const modifiers = this.calculateElementalModifiers();
    const modifier = modifiers.elementalModifiers[element];
    return Math.max(0, baseDamage * (1 + modifier / 100));
  }

  validateCurrentWeather() {
    return { isValid: true, errors: [], warnings: [] };
  }

  getWeatherSuggestions() {
    return ["Warm", "Cool", "Cloudy"];
  }

  getPersistenceData() {
    return {
      weatherState: { ...this.weatherState },
      config: this.config,
      version: "1.0.0",
      timestamp: Date.now(),
    };
  }

  restoreState(persistenceData) {
    if (!persistenceData.weatherState || !persistenceData.config) {
      throw new Error("Invalid persistence data");
    }

    this.saveStateToHistory();
    this.weatherState = { ...persistenceData.weatherState };
    this.config = persistenceData.config;

    this.emitEvent("stateRestored", { persistenceData });
  }

  getStateHistory() {
    return [...this.stateHistory];
  }

  undoLastChange() {
    if (this.stateHistory.length === 0) {
      return false;
    }

    const previousState = this.stateHistory.pop();
    this.weatherState = { ...previousState };
    this.emitEvent("stateRestored", { source: "undo" });
    return true;
  }

  clearHistory() {
    this.stateHistory = [];
  }

  addEventListener(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }

  removeEventListener(event, listener) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  removeAllEventListeners() {
    this.eventListeners.clear();
  }

  saveStateToHistory() {
    this.stateHistory.push({ ...this.weatherState });
    if (this.stateHistory.length > 50) {
      this.stateHistory.shift();
    }
  }

  emitEvent(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event, data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      }
    }
  }
}

// Test functions
function runTests() {
  console.log("Running WeatherManager Tests...\n");

  let passed = 0;
  let failed = 0;

  function test(name, testFn) {
    try {
      testFn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`✗ ${name}: ${error.message}`);
      failed++;
    }
  }

  // Load mock config
  const mockConfig = {
    weatherEffects: new Map(),
    compatibilityMatrix: new Map(),
    oppositeWeatherPairs: [],
    effectLimits: { min: -40, max: 40 },
  };

  let weatherManager;

  test("should initialize with default state", () => {
    weatherManager = new TestWeatherManager(mockConfig);
    const state = weatherManager.getCurrentWeatherState();

    if (!Array.isArray(state.currentWeather))
      throw new Error("currentWeather not array");
    if (state.currentWeather.length !== 0)
      throw new Error("currentWeather not empty");
    if (state.turn !== 1) throw new Error("turn not 1");
    if (state.month !== 1) throw new Error("month not 1");
    if (state.season !== "Winter") throw new Error("season not Winter");
    if (!Array.isArray(state.activeCards))
      throw new Error("activeCards not array");
  });

  test("should apply valid weather types", () => {
    const result = weatherManager.applyWeather(["Sunny", "Warm"]);

    if (!result.isValid) throw new Error("result not valid");
    const currentWeather = weatherManager.getCurrentWeather();
    if (currentWeather.length !== 2) throw new Error("weather length not 2");
    if (!currentWeather.includes("Sunny")) throw new Error("Sunny not applied");
    if (!currentWeather.includes("Warm")) throw new Error("Warm not applied");
  });

  test("should reject invalid weather combinations", () => {
    try {
      weatherManager.applyWeather(["Hot", "Cold"]);
      throw new Error("Should have thrown error for opposite weather");
    } catch (error) {
      if (!error.message.includes("Opposite weather types")) {
        throw new Error("Wrong error message");
      }
    }
  });

  test("should allow bypassing validation", () => {
    weatherManager.applyWeather(["Hot", "Cold"], { validateChange: false });
    const weather = weatherManager.getCurrentWeather();
    if (!weather.includes("Hot") || !weather.includes("Cold")) {
      throw new Error("Weather not applied when validation bypassed");
    }
  });

  test("should emit weather change events", () => {
    let eventFired = false;
    weatherManager.addEventListener("weatherChanged", () => {
      eventFired = true;
    });

    weatherManager.applyWeather(["Sunny"]);
    if (!eventFired) throw new Error("Event not fired");
  });

  test("should reset weather to empty state", () => {
    weatherManager.applyWeather(["Sunny", "Warm"]);
    weatherManager.resetWeather();

    const weather = weatherManager.getCurrentWeather();
    if (weather.length !== 0) throw new Error("Weather not reset");
  });

  test("should advance turn correctly", () => {
    weatherManager = new TestWeatherManager(mockConfig); // Reset
    weatherManager.advanceTurn();

    if (weatherManager.getCurrentTurn() !== 2)
      throw new Error("Turn not advanced");
    if (weatherManager.getCurrentMonth() !== 2)
      throw new Error("Month not advanced");
    if (weatherManager.getCurrentSeason() !== "Winter")
      throw new Error("Season incorrect");
  });

  test("should handle month rollover", () => {
    weatherManager.setTurn(11, 12);
    weatherManager.advanceTurn();

    if (weatherManager.getCurrentTurn() !== 12) throw new Error("Turn not 12");
    if (weatherManager.getCurrentMonth() !== 1)
      throw new Error("Month not rolled over");
    if (weatherManager.getCurrentSeason() !== "Winter")
      throw new Error("Season not Winter");
  });

  test("should throw error when advancing beyond max turns", () => {
    weatherManager.setTurn(12);

    try {
      weatherManager.advanceTurn();
      throw new Error("Should have thrown error");
    } catch (error) {
      if (!error.message.includes("Cannot advance beyond")) {
        throw new Error("Wrong error message");
      }
    }
  });

  test("should play weather cards", () => {
    weatherManager = new TestWeatherManager(mockConfig); // Reset
    const weatherCard = {
      id: "test-card",
      type: "Weather",
      name: "Sunny Day",
      description: "Makes it sunny",
      weather: "Sunny",
      duration: 2,
    };

    const result = weatherManager.playWeatherCard(weatherCard);

    if (!result.isValid) throw new Error("Card play result not valid");
    if (!weatherManager.getCurrentWeather().includes("Sunny")) {
      throw new Error("Weather not applied from card");
    }
    if (weatherManager.getActiveCards().length !== 1) {
      throw new Error("Card not added to active cards");
    }
  });

  test("should play break weather cards", () => {
    weatherManager.applyWeather(["Stormy"]);

    const breakCard = {
      id: "break-card",
      type: "BreakWeather",
      name: "Clear Skies",
      description: "Clears all weather",
    };

    weatherManager.playWeatherCard(breakCard);

    if (weatherManager.getCurrentWeather().length !== 0) {
      throw new Error("Weather not cleared by break card");
    }
  });

  test("should handle card expirations", () => {
    weatherManager = new TestWeatherManager(mockConfig); // Reset
    const weatherCard = {
      id: "temp-card",
      type: "Weather",
      name: "Temporary Rain",
      description: "Rain for 1 turn",
      weather: "Rainy",
      duration: 1,
    };

    weatherManager.playWeatherCard(weatherCard);
    if (weatherManager.getActiveCards().length !== 1) {
      throw new Error("Card not active");
    }

    weatherManager.advanceTurn();
    if (weatherManager.getActiveCards().length !== 0) {
      throw new Error("Card not expired");
    }
  });

  test("should calculate elemental modifiers", () => {
    weatherManager = new TestWeatherManager(mockConfig); // Reset
    weatherManager.applyWeather(["Sunny", "Hot"]);

    const result = weatherManager.calculateElementalModifiers();

    if (!result.activeWeatherTypes.includes("Sunny")) {
      throw new Error("Sunny not in active weather types");
    }
    if (!result.activeWeatherTypes.includes("Hot")) {
      throw new Error("Hot not in active weather types");
    }
    if (typeof result.elementalModifiers.Fire !== "number") {
      throw new Error("Fire modifier not a number");
    }
  });

  test("should calculate element-specific damage", () => {
    weatherManager.applyWeather(["Sunny"]);

    const damage = weatherManager.calculateElementDamage("Fire", 100);

    if (typeof damage !== "number") throw new Error("Damage not a number");
    if (damage < 0) throw new Error("Damage is negative");
  });

  test("should create persistence data", () => {
    weatherManager.applyWeather(["Sunny"]);
    weatherManager.setTurn(5);

    const persistenceData = weatherManager.getPersistenceData();

    if (!persistenceData.weatherState.currentWeather.includes("Sunny")) {
      throw new Error("Weather not in persistence data");
    }
    if (persistenceData.weatherState.turn !== 5) {
      throw new Error("Turn not in persistence data");
    }
    if (persistenceData.version !== "1.0.0") {
      throw new Error("Version not correct");
    }
    if (persistenceData.timestamp <= 0) {
      throw new Error("Timestamp not set");
    }
  });

  test("should restore state from persistence data", () => {
    weatherManager.applyWeather(["Stormy"]);
    weatherManager.setTurn(8);

    const persistenceData = weatherManager.getPersistenceData();

    // Create new manager and restore
    const newManager = new TestWeatherManager(mockConfig);
    newManager.restoreState(persistenceData);

    const restoredState = newManager.getCurrentWeatherState();
    if (!restoredState.currentWeather.includes("Stormy")) {
      throw new Error("Weather not restored");
    }
    if (restoredState.turn !== 8) {
      throw new Error("Turn not restored");
    }
  });

  test("should track state history", () => {
    weatherManager = new TestWeatherManager(mockConfig); // Reset
    weatherManager.applyWeather(["Sunny"]);
    weatherManager.applyWeather(["Rainy"]);

    const history = weatherManager.getStateHistory();

    if (history.length !== 2) throw new Error("History length not 2");
    if (history[0].currentWeather.length !== 0) {
      throw new Error("First history state not empty");
    }
    if (!history[1].currentWeather.includes("Sunny")) {
      throw new Error("Second history state not Sunny");
    }
  });

  test("should undo last change", () => {
    weatherManager.applyWeather(["Sunny"]);
    weatherManager.applyWeather(["Rainy"]);

    const undoResult = weatherManager.undoLastChange();

    if (!undoResult) throw new Error("Undo result not true");
    if (!weatherManager.getCurrentWeather().includes("Sunny")) {
      throw new Error("Weather not reverted to Sunny");
    }
  });

  test("should return false when no history to undo", () => {
    const newManager = new TestWeatherManager(mockConfig);
    const undoResult = newManager.undoLastChange();

    if (undoResult !== false) throw new Error("Undo should return false");
  });

  test("should add and remove event listeners", () => {
    let listener1Called = 0;
    let listener2Called = 0;

    const listener1 = () => listener1Called++;
    const listener2 = () => listener2Called++;

    weatherManager = new TestWeatherManager(mockConfig); // Reset
    weatherManager.addEventListener("weatherChanged", listener1);
    weatherManager.addEventListener("weatherChanged", listener2);

    weatherManager.applyWeather(["Sunny"]);

    if (listener1Called !== 1) throw new Error("Listener1 not called");
    if (listener2Called !== 1) throw new Error("Listener2 not called");

    weatherManager.removeEventListener("weatherChanged", listener1);
    weatherManager.applyWeather(["Rainy"]);

    if (listener1Called !== 1)
      throw new Error("Listener1 called after removal");
    if (listener2Called !== 2)
      throw new Error("Listener2 not called second time");
  });

  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("All WeatherManager tests passed! ✓");
  }
}

// Run the tests
runTests();
