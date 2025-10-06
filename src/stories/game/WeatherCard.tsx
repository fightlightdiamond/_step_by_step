import React from "react";
import {
  WeatherCard as WeatherCardType,
  WeatherType,
  ElementType,
} from "../../weather-engine/types";
import styles from "./WeatherCard.module.css";

export interface WeatherCardProps {
  card: WeatherCardType;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  disabled?: boolean;
  selected?: boolean;
  showDetails?: boolean;
  onPlay?: (card: WeatherCardType) => void;
  onHover?: (card: WeatherCardType | null) => void;
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

const CARD_TYPE_COLORS = {
  Weather: "bg-blue-500",
  BreakWeather: "bg-red-500",
  WeatherBuff: "bg-green-500",
  WeatherNerf: "bg-purple-500",
};

const CARD_TYPE_LABELS = {
  Weather: "Weather",
  BreakWeather: "Break",
  WeatherBuff: "Buff",
  WeatherNerf: "Nerf",
};

export default function WeatherCard({
  card,
  size = "md",
  interactive = false,
  disabled = false,
  selected = false,
  showDetails = true,
  onPlay,
  onHover,
}: WeatherCardProps) {
  const sizeClasses = {
    sm: "w-32 h-44 text-xs",
    md: "w-40 h-56 text-sm",
    lg: "w-48 h-64 text-base",
  };

  const iconSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  const handleClick = () => {
    if (interactive && !disabled && onPlay) {
      onPlay(card);
    }
  };

  const handleMouseEnter = () => {
    if (onHover) {
      onHover(card);
    }
  };

  const handleMouseLeave = () => {
    if (onHover) {
      onHover(null);
    }
  };

  const formatEffect = (
    effect: Partial<Record<ElementType, number>>
  ): string => {
    return Object.entries(effect)
      .map(([element, value]) => `${element}: ${value > 0 ? "+" : ""}${value}`)
      .join(", ");
  };

  return (
    <div
      className={`
        relative rounded-lg border-2 shadow-md transition-all duration-200
        ${sizeClasses[size]}
        ${
          interactive
            ? "cursor-pointer hover:shadow-lg hover:-translate-y-1"
            : ""
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${selected ? "ring-2 ring-blue-400 ring-offset-2" : ""}
        ${interactive && !disabled ? styles.interactiveCard : ""}
        bg-white border-gray-300
      `}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Card Type Badge */}
      <div
        className={`
          absolute -top-2 -right-2 px-2 py-1 rounded-full text-white text-xs font-bold
          ${CARD_TYPE_COLORS[card.type]}
        `}
      >
        {CARD_TYPE_LABELS[card.type]}
      </div>

      {/* Card Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Weather Icon */}
          {card.weather && (
            <div className={`${iconSizes[size]}`}>
              {WEATHER_ICONS[card.weather]}
            </div>
          )}

          {/* Cost */}
          {card.cost !== undefined && (
            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
              {card.cost}
            </div>
          )}
        </div>

        {/* Card Name */}
        <h3 className="font-bold text-gray-800 mt-2 leading-tight">
          {card.name}
        </h3>
      </div>

      {/* Card Body */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Description */}
        {showDetails && (
          <p className="text-gray-600 text-xs leading-relaxed mb-2 flex-1">
            {card.description}
          </p>
        )}

        {/* Weather Effect */}
        {card.weather && (
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-700 mb-1">
              Weather:
            </div>
            <div className="bg-blue-50 px-2 py-1 rounded text-xs text-blue-800">
              {card.weather}
            </div>
          </div>
        )}

        {/* Elemental Effects */}
        {card.effect && Object.keys(card.effect).length > 0 && (
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-700 mb-1">
              Effects:
            </div>
            <div className="bg-green-50 px-2 py-1 rounded text-xs text-green-800">
              {formatEffect(card.effect)}
            </div>
          </div>
        )}

        {/* Duration */}
        {card.duration && (
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Duration:</span>
            <span className="font-medium">{card.duration} turns</span>
          </div>
        )}
      </div>

      {/* Play Button (for interactive cards) */}
      {interactive && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-20 rounded-lg">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
            Play Card
          </button>
        </div>
      )}

      {/* Selection Indicator */}
      {selected && (
        <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none" />
      )}

      {/* Disabled Overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-30 rounded-lg flex items-center justify-center">
          <span className="text-gray-700 font-medium text-xs">Cannot Play</span>
        </div>
      )}
    </div>
  );
}
