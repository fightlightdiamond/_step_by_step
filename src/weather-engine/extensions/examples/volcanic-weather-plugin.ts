/**
 * Example plugin: Volcanic Weather Plugin
 * Adds volcanic weather types and related game mechanics
 */

import {
  WeatherEnginePlugin,
  PluginContext,
  CustomWeatherTypeDefinition,
} from "../plugin-system";
import { WeatherType, ElementType } from "../../types";

/**
 * Volcanic Weather Plugin
 * Adds volcanic weather types like Ash Storm, Lava Rain, etc.
 */
export class VolcanicWeatherPlugin implements WeatherEnginePlugin {
  public readonly name = "volcanic-weather";
  public readonly version = "1.0.0";
  public readonly description = "Adds volcanic weather types and mechanics";
  public readonly author = "Weather Engine Team";

  public readonly weatherTypes: CustomWeatherTypeDefinition[] = [
    {
      name: "AshStorm",
      displayName: "Ash Storm",
      description:
        "A storm of volcanic ash that reduces visibility and affects all elements",
      effects: {
        Fire: 15,
        Ice: -20,
        Lightning: -10,
      },
      compatibleWith: ["Windy", "Stormy", "Hot"],
      oppositeOf: ["Sunny", "Clear"],
      icon: "🌋",
      color: "#8B4513",

      validate: (weather: WeatherType[]) => {
        // Ash storms cannot occur with clear weather
        return !weather.includes("Sunny");
      },

      calculateEffects: (baseEffects, context) => {
        // Ash storms get stronger over time
        const multiplier = Math.min(1.5, 1 + context.turn * 0.1);
        return {
          Fire: Math.round(baseEffects.Fire * multiplier),
          Ice: Math.round(baseEffects.Ice * multiplier),
          Lightning: Math.round(baseEffects.Lightning * multiplier),
        };
      },
    },

    {
      name: "LavaRain",
      displayName: "Lava Rain",
      description:
        "Molten rock falls from the sky, dramatically boosting fire damage",
      effects: {
        Fire: 35,
        Ice: -30,
        Lightning: 5,
      },
      compatibleWith: ["Hot", "AshStorm"],
      oppositeOf: ["Cold", "Snowy", "Rainy"],
      icon: "🔥",
      color: "#FF4500",

      validate: (weather: WeatherType[]) => {
        // Lava rain cannot occur with cold weather
        return !weather.some((w) => ["Cold", "Snowy"].includes(w));
      },
    },

    {
      name: "VolcanicWinter",
      displayName: "Volcanic Winter",
      description: "Ash blocks sunlight, creating an artificial winter",
      effects: {
        Fire: -25,
        Ice: 20,
        Lightning: -15,
      },
      compatibleWith: ["Cold", "AshStorm", "Foggy"],
      oppositeOf: ["Hot", "Sunny", "LavaRain"],
      icon: "❄️",
      color: "#4682B4",

      calculateEffects: (baseEffects, context) => {
        // Gets colder the longer it lasts
        const duration = context.activeCards.filter(
          (card) => card.name === "Volcanic Winter"
        ).length;

        const multiplier = 1 + duration * 0.2;
        return {
          Fire: Math.round(baseEffects.Fire * multiplier),
          Ice: Math.round(baseEffects.Ice * multiplier),
          Lightning: baseEffects.Lightning,
        };
      },
    },
  ];

  public async initialize(context: PluginContext): Promise<void> {
    console.log("Initializing Volcanic Weather Plugin...");

    // Register event listeners
    context.on("weatherChange", this.onWeatherChange.bind(this));
    context.on("cardPlayed", this.onCardPlayed.bind(this));
  }

  public async activate(context: PluginContext): Promise<void> {
    console.log("Volcanic Weather Plugin activated!");

    // Emit custom event
    context.emit(
      "volcanicWeatherActivated",
      this.weatherTypes.map((wt) => wt.name)
    );
  }

  public async deactivate(context: PluginContext): Promise<void> {
    console.log("Volcanic Weather Plugin deactivated");
  }

  public onWeatherChange(
    oldWeather: WeatherType[],
    newWeather: WeatherType[]
  ): void {
    const volcanicWeather = newWeather.filter((w) =>
      ["AshStorm", "LavaRain", "VolcanicWinter"].includes(w)
    );

    if (volcanicWeather.length > 0) {
      console.log(`Volcanic weather detected: ${volcanicWeather.join(", ")}`);

      // Special interactions between volcanic weather types
      if (
        volcanicWeather.includes("AshStorm") &&
        volcanicWeather.includes("LavaRain")
      ) {
        console.log("Ash Storm + Lava Rain combo: Extra fire damage!");
      }
    }
  }

  public onCardPlayed(card: any): void {
    if (card.name === "Volcanic Eruption") {
      console.log(
        "Volcanic Eruption card played! Triggering special effects..."
      );
    }
  }
}

/**
 * Factory function to create the plugin instance
 */
export function createVolcanicWeatherPlugin(): VolcanicWeatherPlugin {
  return new VolcanicWeatherPlugin();
}
