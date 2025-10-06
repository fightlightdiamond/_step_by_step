// Simple test to verify weather engine basic functionality
const weatherEngine = require("./index.ts");

console.log("Testing weather engine...");

// Test constants
console.log("Weather types:", weatherEngine.WEATHER_TYPES.length);
console.log("Element types:", weatherEngine.ELEMENT_TYPES.length);
console.log("Season types:", weatherEngine.SEASON_TYPES.length);

// Test utilities
console.log(
  "Is Sunny valid weather?",
  weatherEngine.isValidWeatherType("Sunny")
);
console.log("Is Fire valid element?", weatherEngine.isValidElementType("Fire"));
console.log("Season for January:", weatherEngine.getSeasonForMonth(1));

// Test weather effects
const effect = weatherEngine.createEmptyWeatherEffect();
console.log("Empty weather effect:", effect);

const clampedValue = weatherEngine.clampWeatherEffect(50);
console.log("Clamped value (50):", clampedValue);

console.log("Weather engine basic test completed successfully!");
