import React from "react";
import styles from "./CardStat.module.css";

export interface CardStatProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  type?: "attack" | "defense" | "health" | "mana" | "speed" | "default";
  animated?: boolean;
  highlighted?: boolean;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
}

export default function CardStat({
  label,
  value,
  icon,
  type = "default",
  animated = false,
  highlighted = false,
  size = "md",
  layout = "horizontal",
}: CardStatProps) {
  // Tailwind classes cho layout
  const layoutClasses = {
    horizontal: "flex items-center gap-2",
    vertical: "flex flex-col items-center text-center",
  };

  // Tailwind classes cho size
  const sizeClasses = {
    sm: {
      icon: "text-sm",
      label: "text-xs",
      value: "text-sm font-medium",
    },
    md: {
      icon: "text-base",
      label: "text-xs",
      value: "text-base font-semibold",
    },
    lg: {
      icon: "text-lg",
      label: "text-sm",
      value: "text-lg font-bold",
    },
  };

  // Tailwind classes cho type colors
  const typeColors = {
    attack: "text-red-600",
    defense: "text-blue-600",
    health: "text-green-600",
    mana: "text-purple-600",
    speed: "text-yellow-600",
    default: "text-gray-600",
  };

  // CSS Module classes cho effects
  const effectClasses = [
    animated && styles.animatedStat,
    highlighted && styles.highlighted,
    styles[`type-${type}`],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`
      ${layoutClasses[layout]}
      ${effectClasses}
      transition-all duration-300
    `}
    >
      {/* Icon với type-specific effects */}
      {icon && (
        <span
          className={`
          ${sizeClasses[size].icon}
          ${typeColors[type]}
          ${animated ? styles.animatedIcon : ""}
        `}
        >
          {icon}
        </span>
      )}

      {/* Content container */}
      <div className={layout === "horizontal" ? "flex flex-col" : "space-y-1"}>
        <span
          className={`
          ${sizeClasses[size].label}
          text-gray-500 uppercase tracking-wide
        `}
        >
          {label}
        </span>

        <span
          className={`
          ${sizeClasses[size].value}
          ${typeColors[type]}
          ${animated ? styles.animatedValue : ""}
        `}
        >
          {value}

          {/* Stat boost indicator - CSS Module */}
          {highlighted && <span className={styles.boostIndicator}>↑</span>}
        </span>
      </div>

      {/* Background glow effect - CSS Module */}
      {highlighted && (
        <div className={`${styles.glowBackground} ${styles[`glow-${type}`]}`} />
      )}
    </div>
  );
}
