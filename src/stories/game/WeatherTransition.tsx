import React, { useEffect, useState } from "react";
import { WeatherType } from "../../weather-engine/types";
import styles from "./WeatherTransition.module.css";

export interface WeatherTransitionProps {
  fromWeather: WeatherType[];
  toWeather: WeatherType[];
  isVisible: boolean;
  duration?: number;
  onComplete?: () => void;
  size?: "sm" | "md" | "lg";
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

export default function WeatherTransition({
  fromWeather,
  toWeather,
  isVisible,
  duration = 2000,
  onComplete,
  size = "md",
}: WeatherTransitionProps) {
  const [phase, setPhase] = useState<"fadeOut" | "transition" | "fadeIn">(
    "fadeOut"
  );

  const iconSizes = {
    sm: "text-4xl",
    md: "text-6xl",
    lg: "text-8xl",
  };

  const containerSizes = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
  };

  useEffect(() => {
    if (!isVisible) return;

    const phaseTime = duration / 3;

    // Phase 1: Fade out old weather
    setPhase("fadeOut");

    const timer1 = setTimeout(() => {
      setPhase("transition");
    }, phaseTime);

    // Phase 2: Transition effect
    const timer2 = setTimeout(() => {
      setPhase("fadeIn");
    }, phaseTime * 2);

    // Phase 3: Complete
    const timer3 = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isVisible, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black bg-opacity-50 backdrop-blur-sm
        ${styles.transitionOverlay}
      `}
    >
      <div
        className={`
          relative rounded-2xl bg-white shadow-2xl
          ${containerSizes[size]}
          ${styles.transitionContainer}
        `}
      >
        {/* Background Effects */}
        <div
          className={`absolute inset-0 rounded-2xl ${styles.backgroundEffect}`}
        />

        {/* From Weather (Fade Out) */}
        {phase === "fadeOut" && (
          <div
            className={`
              absolute inset-0 flex flex-col items-center justify-center
              ${styles.fadeOutWeather}
            `}
          >
            <div className="text-center">
              <div
                className={`${iconSizes[size]} mb-2 flex justify-center gap-2`}
              >
                {fromWeather.map((weather, index) => (
                  <span
                    key={`from-${weather}-${index}`}
                    className={`${WEATHER_COLORS[weather]} ${styles.weatherIcon}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {WEATHER_ICONS[weather]}
                  </span>
                ))}
              </div>
              <div className="text-gray-600 font-medium">
                {fromWeather.join(" + ")}
              </div>
            </div>
          </div>
        )}

        {/* Transition Effect */}
        {phase === "transition" && (
          <div
            className={`
              absolute inset-0 flex items-center justify-center
              ${styles.transitionEffect}
            `}
          >
            <div className={styles.transitionSpinner} />
            <div className={styles.transitionRipple} />
            <div className={styles.transitionParticles}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={styles.particle}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    transform: `rotate(${i * 30}deg) translateY(-40px)`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* To Weather (Fade In) */}
        {phase === "fadeIn" && (
          <div
            className={`
              absolute inset-0 flex flex-col items-center justify-center
              ${styles.fadeInWeather}
            `}
          >
            <div className="text-center">
              <div
                className={`${iconSizes[size]} mb-2 flex justify-center gap-2`}
              >
                {toWeather.map((weather, index) => (
                  <span
                    key={`to-${weather}-${index}`}
                    className={`${WEATHER_COLORS[weather]} ${styles.weatherIcon}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {WEATHER_ICONS[weather]}
                  </span>
                ))}
              </div>
              <div className="text-gray-600 font-medium">
                {toWeather.join(" + ")}
              </div>
            </div>
          </div>
        )}

        {/* Transition Arrow */}
        {phase === "transition" && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${styles.transitionArrow}`}
          >
            <div className="text-4xl text-blue-500">→</div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-blue-500 transition-all ease-linear ${styles.progressBar}`}
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
