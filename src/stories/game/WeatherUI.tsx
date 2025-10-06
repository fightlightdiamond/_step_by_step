import React, { useState, useEffect } from "react";
import WeatherDisplay from "./WeatherDisplay";
import ElementalModifiers from "./ElementalModifiers";
import WeatherTransition from "./WeatherTransition";
import {
  WeatherState,
  WeatherType,
  ElementType,
} from "../../weather-engine/types";
import styles from "./WeatherUI.module.css";

export interface WeatherUIProps {
  weatherState: WeatherState;
  elementalModifiers: Record<ElementType, number>;
  size?: "sm" | "md" | "lg";
  layout?: "compact" | "detailed" | "sidebar";
  animated?: boolean;
  interactive?: boolean;
  showTransitions?: boolean;
  onWeatherChange?: (weather: WeatherType[]) => void;
  onElementClick?: (element: ElementType) => void;
}

export default function WeatherUI({
  weatherState,
  elementalModifiers,
  size = "md",
  layout = "detailed",
  animated = true,
  interactive = false,
  showTransitions = true,
  onWeatherChange,
  onElementClick,
}: WeatherUIProps) {
  const [previousWeather, setPreviousWeather] = useState<WeatherType[]>([]);
  const [showTransition, setShowTransition] = useState(false);

  // Track weather changes for transitions
  useEffect(() => {
    if (showTransitions && previousWeather.length > 0) {
      const weatherChanged =
        weatherState.currentWeather.length !== previousWeather.length ||
        weatherState.currentWeather.some((w, i) => w !== previousWeather[i]);

      if (weatherChanged) {
        setShowTransition(true);
      }
    }
    setPreviousWeather([...weatherState.currentWeather]);
  }, [weatherState.currentWeather, showTransitions]); // Remove previousWeather from dependencies

  const handleTransitionComplete = () => {
    setShowTransition(false);
  };

  const layoutClasses = {
    compact: "space-y-2",
    detailed: "space-y-4",
    sidebar: "space-y-3",
  };

  const containerClasses = {
    compact: "p-3",
    detailed: "p-4",
    sidebar: "p-3 max-w-xs",
  };

  return (
    <div
      className={`
        bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200
        ${containerClasses[layout]}
        ${animated ? styles.weatherUIContainer : ""}
      `}
    >
      {/* Main Weather Display */}
      <div className={layoutClasses[layout]}>
        {layout === "compact" ? (
          <div className="space-y-2">
            {/* Compact header */}
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-gray-700">
                Turn {weatherState.turn} • {weatherState.season}
              </div>
              <div className="text-xs text-gray-500">
                Month {weatherState.month}
              </div>
            </div>

            {/* Compact weather and modifiers */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <WeatherDisplay
                  weatherState={weatherState}
                  elementalModifiers={elementalModifiers}
                  size="sm"
                  showDetails={false}
                  animated={animated}
                  onWeatherChange={onWeatherChange}
                />
              </div>
              <div className="flex-shrink-0">
                <ElementalModifiers
                  modifiers={elementalModifiers}
                  size="sm"
                  layout="vertical"
                  showLabels={false}
                  animated={animated}
                  interactive={interactive}
                  onElementClick={onElementClick}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Full Weather Display */}
            <WeatherDisplay
              weatherState={weatherState}
              elementalModifiers={elementalModifiers}
              size={size}
              showDetails={layout === "detailed"}
              animated={animated}
              onWeatherChange={onWeatherChange}
            />

            {/* Separate Elemental Modifiers for detailed view */}
            {layout === "detailed" && (
              <div className="border-t pt-4">
                <h4 className="text-gray-700 font-medium mb-3">
                  Elemental Effects
                </h4>
                <ElementalModifiers
                  modifiers={elementalModifiers}
                  size={size}
                  layout="grid"
                  showLabels={true}
                  showValues={true}
                  animated={animated}
                  interactive={interactive}
                  onElementClick={onElementClick}
                />
              </div>
            )}

            {/* Sidebar layout specific elements */}
            {layout === "sidebar" && (
              <div className="space-y-3">
                <ElementalModifiers
                  modifiers={elementalModifiers}
                  size="sm"
                  layout="vertical"
                  showLabels={true}
                  showValues={true}
                  animated={animated}
                  interactive={interactive}
                  onElementClick={onElementClick}
                />

                {/* Quick stats */}
                <div className="text-xs text-gray-600 space-y-1 pt-2 border-t">
                  <div>
                    Active Weather: {weatherState.currentWeather.length}
                  </div>
                  <div>Active Cards: {weatherState.activeCards.length}</div>
                  <div>
                    Total Modifier:{" "}
                    {Object.values(elementalModifiers).reduce(
                      (sum, val) => sum + Math.abs(val),
                      0
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Weather Transition Overlay */}
      {showTransitions && (
        <WeatherTransition
          fromWeather={previousWeather}
          toWeather={weatherState.currentWeather}
          isVisible={showTransition}
          duration={2000}
          size={size}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* Interactive Controls (if enabled) */}
      {interactive && layout === "detailed" && (
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center">
            <h4 className="text-gray-700 font-medium">Weather Controls</h4>
            <button
              onClick={() => onWeatherChange?.([])}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Clear Weather
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
