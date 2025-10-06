/**
 * Example plugin: Time Manipulation Plugin
 * Adds time-based game modes and weather cards
 */

import {
  WeatherEnginePlugin,
  PluginContext,
  CustomGameModeDefinition,
  CustomWeatherCardDefinition,
  GameModeContext,
  CardPlayContext,
} from "../plugin-system";
import { WeatherType } from "../../types";

/**
 * Time Manipulation Plugin
 * Adds game modes and cards that manipulate time and weather patterns
 */
export class TimeManipulationPlugin implements WeatherEnginePlugin {
  public readonly name = "time-manipulation";
  public readonly version = "1.0.0";
  public readonly description =
    "Adds time-based game modes and weather manipulation cards";
  public readonly author = "Weather Engine Team";

  public readonly gameModes: CustomGameModeDefinition[] = [
    {
      name: "TimeLoop",
      displayName: "Time Loop",
      description: "Weather patterns repeat every 3 turns in an endless loop",
      rules: {
        weatherChangeFrequency: 1,
        allowPlayerWeatherControl: true,
        allowWeatherMixing: true,
        maxWeatherTypes: 2,
        weatherSource: "custom",
      },

      onStart: (context: GameModeContext) => {
        console.log(
          "Time Loop mode started - weather will repeat every 3 turns"
        );
        // Initialize the loop pattern
        context.gameState.loopPattern = [];
        context.gameState.loopLength = 3;
      },

      generateWeather: (turn: number, context: GameModeContext) => {
        const loopIndex = (turn - 1) % context.gameState.loopLength;

        if (context.gameState.loopPattern.length <= loopIndex) {
          // Generate new weather for this position in the loop
          const possibleWeather: WeatherType[] = [
            "Sunny",
            "Rainy",
            "Windy",
            "Stormy",
          ];
          const randomWeather =
            possibleWeather[Math.floor(Math.random() * possibleWeather.length)];
          context.gameState.loopPattern[loopIndex] = [randomWeather];
        }

        return context.gameState.loopPattern[loopIndex];
      },

      onTurnStart: (turn: number, context: GameModeContext) => {
        const loopIndex = (turn - 1) % context.gameState.loopLength;
        console.log(
          `Turn ${turn}: Loop position ${loopIndex + 1}/${
            context.gameState.loopLength
          }`
        );
      },
    },

    {
      name: "WeatherAcceleration",
      displayName: "Weather Acceleration",
      description: "Weather changes become more frequent and intense over time",
      rules: {
        weatherChangeFrequency: 1,
        allowPlayerWeatherControl: false,
        allowWeatherMixing: true,
        maxWeatherTypes: 3,
        weatherSource: "custom",
      },

      onStart: (context: GameModeContext) => {
        console.log("Weather Acceleration mode started");
        context.gameState.accelerationFactor = 1;
      },

      generateWeather: (turn: number, context: GameModeContext) => {
        // Increase acceleration factor over time
        context.gameState.accelerationFactor = 1 + turn * 0.1;

        // Generate more weather types as acceleration increases
        const numWeatherTypes = Math.min(
          3,
          Math.floor(context.gameState.accelerationFactor)
        );
        const possibleWeather: WeatherType[] = [
          "Sunny",
          "Rainy",
          "Windy",
          "Stormy",
          "Hot",
          "Cold",
        ];

        const selectedWeather: WeatherType[] = [];
        for (let i = 0; i < numWeatherTypes; i++) {
          const randomIndex = Math.floor(
            Math.random() * possibleWeather.length
          );
          const weather = possibleWeather[randomIndex];
          if (!selectedWeather.includes(weather)) {
            selectedWeather.push(weather);
          }
        }

        return selectedWeather;
      },

      onTurnStart: (turn: number, context: GameModeContext) => {
        console.log(
          `Turn ${turn}: Acceleration factor ${context.gameState.accelerationFactor.toFixed(
            1
          )}`
        );
      },
    },
  ];

  public readonly weatherCards: CustomWeatherCardDefinition[] = [
    {
      id: "time-rewind",
      name: "Time Rewind",
      description: "Revert weather to what it was 2 turns ago",
      type: "TimeManipulation",
      cost: 3,
      rarity: "rare",
      artwork: "⏪",
      flavorText: "Sometimes the past holds the key to victory",

      canPlay: (context: CardPlayContext) => {
        // Can only play if there's weather history
        return context.turn > 2;
      },

      onPlay: (context: CardPlayContext) => {
        console.log(
          "Time Rewind played - reverting to weather from 2 turns ago"
        );
        // This would need to be implemented in the main weather system
        // For now, just log the action
      },
    },

    {
      id: "weather-forecast",
      name: "Weather Forecast",
      description: "Reveal the next 3 turns of weather",
      type: "Information",
      cost: 2,
      rarity: "uncommon",
      artwork: "🔮",
      flavorText: "Knowledge of the future is power",

      onPlay: (context: CardPlayContext) => {
        console.log(
          "Weather Forecast played - revealing future weather patterns"
        );
        // This would show future weather to the player
      },
    },

    {
      id: "temporal-storm",
      name: "Temporal Storm",
      description:
        "Create a storm that exists in multiple time periods simultaneously",
      type: "Weather",
      weather: "Stormy",
      duration: 3,
      cost: 4,
      rarity: "epic",
      artwork: "⚡",
      flavorText: "A storm that transcends time itself",

      onPlay: (context: CardPlayContext) => {
        console.log(
          "Temporal Storm played - creating multi-dimensional weather effect"
        );
        // Special temporal storm effects would be implemented here
      },

      onExpire: (context: CardPlayContext) => {
        console.log("Temporal Storm fades across all timelines");
      },
    },

    {
      id: "weather-lock",
      name: "Weather Lock",
      description: "Prevent weather from changing for 2 turns",
      type: "Control",
      duration: 2,
      cost: 3,
      rarity: "rare",
      artwork: "🔒",
      flavorText: "Sometimes stability is the greatest power",

      onPlay: (context: CardPlayContext) => {
        console.log("Weather Lock played - weather changes are now prevented");
        // This would set a flag to prevent weather changes
      },
    },
  ];

  public async initialize(context: PluginContext): Promise<void> {
    console.log("Initializing Time Manipulation Plugin...");
  }

  public async activate(context: PluginContext): Promise<void> {
    console.log("Time Manipulation Plugin activated!");

    // Register for weather change events to track history
    context.on("weatherChange", this.trackWeatherHistory.bind(this));
  }

  public async deactivate(context: PluginContext): Promise<void> {
    console.log("Time Manipulation Plugin deactivated");
  }

  private weatherHistory: WeatherType[][] = [];

  private trackWeatherHistory(
    oldWeather: WeatherType[],
    newWeather: WeatherType[]
  ): void {
    this.weatherHistory.push(newWeather);

    // Keep only the last 10 weather states
    if (this.weatherHistory.length > 10) {
      this.weatherHistory.shift();
    }
  }

  public getWeatherHistory(): WeatherType[][] {
    return [...this.weatherHistory];
  }
}

/**
 * Factory function to create the plugin instance
 */
export function createTimeManipulationPlugin(): TimeManipulationPlugin {
  return new TimeManipulationPlugin();
}
