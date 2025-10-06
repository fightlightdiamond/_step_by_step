import React from "react";
import {
  WeatherType,
  ElementType,
  WeatherState,
} from "../../weather-engine/types";
import styles from "./WeatherDisplay.module.css";

export interface WeatherDisplayProps {
  weatherState: WeatherState;
  elementalModifiers: Record<ElementType, number>;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  animated?: boolean;
  onWeatherChange?: (weather: WeatherType[]) => void;
}

const WEATHER_ICONS: Record<WeatherType, string> = {
  Sunny: "☀️",
  Cloudy: "☁️",
  Rainy: "🌧️",
  Windy: "💨",
  Stormy: "⛈️",
  Foggy: "🌫️",
  Snowy: "❄️",
  Hot: "🔥",
  Cold: "🧊",
  Warm: "🌤️",
  Cool: "🌬️",
  Humid: "💧",
};

const WEATHER_COLORS: Record<WeatherType, string> = {
  Sunny: "text-yellow-500",
  Cloudy: "text-gray-500",
  Rainy: "text-blue-500",
  Windy: "text-cyan-400",
  Stormy: "text-purple-600",
  Foggy: "text-gray-400",
  Snowy: "text-blue-200",
  Hot: "text-red-500",
  Cold: "text-blue-600",
  Warm: "text-orange-400",
  Cool: "text-teal-400",
  Humid: "text-blue-400",
};

const ELEMENT_COLORS: Record<ElementType, string> = {
  Fire: "text-red-500",
  Ice: "text-blue-500",
  Lightning: "text-yellow-500",
};

const ELEMENT_ICONS: Record<ElementType, string> = {
  Fire: "🔥",
  Ice: "🧊",
  Lightning: "⚡",
};

export default function WeatherDisplay({
  weatherState,
  elementalModifiers,
  size = "md",
  showDetails = true,
  animated = true,
  onWeatherChange,
}: WeatherDisplayProps) {
  const sizeClasses = {
    sm: "text-sm p-2",
    md: "text-base p-4",
    lg: "text-lg p-6",
  };

  const iconSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const formatModifier = (value: number): string => {
    return value > 0 ? `+${value}` : `${value}`;
  };

  const getModifierColor = (value: number): string => {
    if (value > 0) return "text-green-500";
    if (value < 0) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm
        ${sizeClasses[size]}
        ${animated ? styles.weatherContainer : ""}
      `}
    >
      {/* Header with turn and season info */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-gray-600">
          <span className="font-medium">Turn {weatherState.turn}</span>
          <span className="mx-2">•</span>
          <span>Month {weatherState.month}</span>
        </div>
        <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {weatherState.season}
        </div>
      </div>

      {/* Current Weather Display */}
      <div className="mb-4">
        <h3 className="text-gray-700 font-medium mb-2">Current Weather</h3>
        <div className="flex flex-wrap gap-2">
          {weatherState.currentWeather.length === 0 ? (
            <div className="text-gray-400 italic">No active weather</div>
          ) : (
            weatherState.currentWeather.map((weather, index) => (
              <div
                key={`${weather}-${index}`}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-full border
                  bg-gray-50 hover:bg-gray-100 transition-colors
                  ${animated ? styles.weatherBadge : ""}
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span
                  className={`${iconSizes[size]} ${WEATHER_COLORS[weather]}`}
                >
                  {WEATHER_ICONS[weather]}
                </span>
                <span className="font-medium text-gray-700">{weather}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Elemental Modifiers */}
      {showDetails && (
        <div className="border-t pt-3">
          <h4 className="text-gray-700 font-medium mb-2">Elemental Effects</h4>
          <div className="grid grid-cols-3 gap-3">
            {(
              Object.entries(elementalModifiers) as [ElementType, number][]
            ).map(([element, modifier]) => (
              <div
                key={element}
                className={`
                    flex flex-col items-center p-2 rounded-lg border
                    bg-gray-50 hover:bg-gray-100 transition-colors
                    ${animated ? styles.elementModifier : ""}
                  `}
              >
                <div
                  className={`${iconSizes[size]} ${ELEMENT_COLORS[element]} mb-1`}
                >
                  {ELEMENT_ICONS[element]}
                </div>
                <div className="text-xs text-gray-600 mb-1">{element}</div>
                <div
                  className={`
                      font-bold text-sm
                      ${getModifierColor(modifier)}
                    `}
                >
                  {formatModifier(modifier)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Weather Cards */}
      {showDetails && weatherState.activeCards.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <h4 className="text-gray-700 font-medium mb-2">Active Cards</h4>
          <div className="space-y-1">
            {weatherState.activeCards.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded border border-blue-200"
              >
                <span className="font-medium text-blue-800">{card.name}</span>
                {card.duration && (
                  <span className="text-blue-600">
                    {card.duration} turn{card.duration !== 1 ? "s" : ""} left
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
