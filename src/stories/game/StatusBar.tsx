import React from "react";
import styles from "./StatusBar.module.css";

export interface StatusBarProps {
  label: string;
  current: number;
  max: number;
  type?: "health" | "mana" | "experience" | "energy";
  showNumbers?: boolean;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StatusBar({
  label,
  current,
  max,
  type = "health",
  showNumbers = true,
  animated = true,
  size = "md",
}: StatusBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  // Tailwind classes cho layout và sizing
  const sizeClasses = {
    sm: "h-2 text-xs",
    md: "h-4 text-sm",
    lg: "h-6 text-base",
  };

  // Tailwind classes cho colors theo type
  const typeColors = {
    health: "bg-red-500",
    mana: "bg-blue-500",
    experience: "bg-yellow-500",
    energy: "bg-green-500",
  };

  const backgroundColors = {
    health: "bg-red-100",
    mana: "bg-blue-100",
    experience: "bg-yellow-100",
    energy: "bg-green-100",
  };

  return (
    <div className="w-full space-y-1">
      {/* Label và numbers - Tailwind cho typography */}
      <div className="flex justify-between items-center">
        <span
          className={`font-medium text-gray-700 ${
            sizeClasses[size].split(" ")[1]
          }`}
        >
          {label}
        </span>
        {showNumbers && (
          <span className={`text-gray-600 ${sizeClasses[size].split(" ")[1]}`}>
            {current}/{max}
          </span>
        )}
      </div>

      {/* Progress bar container - Tailwind cho layout */}
      <div
        className={`
        relative w-full rounded-full overflow-hidden border border-gray-200
        ${sizeClasses[size].split(" ")[0]} 
        ${backgroundColors[type]}
      `}
      >
        {/* Progress fill - Kết hợp Tailwind và CSS Module */}
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${typeColors[type]}
            ${animated ? styles.animatedFill : ""}
            ${styles[`type-${type}`]}
          `}
          style={{ width: `${percentage}%` }}
        />

        {/* Shine effect - CSS Module cho animation phức tạp */}
        {animated && (
          <div className={`absolute inset-0 ${styles.shineEffect}`} />
        )}

        {/* Critical warning - CSS Module cho pulsing effect */}
        {percentage <= 20 && type === "health" && (
          <div className={`absolute inset-0 ${styles.criticalWarning}`} />
        )}
      </div>

      {/* Percentage text overlay cho large size */}
      {size === "lg" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-sm drop-shadow-md">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
