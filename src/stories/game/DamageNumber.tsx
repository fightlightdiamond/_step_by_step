import React from "react";
import styles from "./DamageNumber.module.css";

export interface DamageNumberProps {
  damage: number;
  type?: "physical" | "magical" | "true" | "heal";
  critical?: boolean;
  animated?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  floating?: boolean;
}

export default function DamageNumber({
  damage,
  type = "physical",
  critical = false,
  animated = true,
  size = "md",
  floating = false,
}: DamageNumberProps) {
  // Tailwind classes cho colors
  const typeColors = {
    physical: "text-red-500",
    magical: "text-blue-500",
    true: "text-white",
    heal: "text-green-500",
  };

  // Tailwind classes cho size
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
  };

  // CSS Module classes cho effects
  const effectClasses = [
    animated && styles.animatedNumber,
    critical && styles.criticalHit,
    floating && styles.floatingNumber,
    styles[`type-${type}`],
    styles[`size-${size}`],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`
      relative font-bold drop-shadow-lg select-none
      ${sizeClasses[size]}
      ${typeColors[type]}
      ${effectClasses}
    `}
    >
      {/* Critical hit prefix */}
      {critical && <span className={`${styles.criticalText} mr-1`}>CRIT!</span>}

      {/* Main damage number */}
      <span className={styles.damageValue}>
        {type === "heal" && "+"}
        {damage.toLocaleString()}
      </span>

      {/* Type indicator icon */}
      <span className={`${styles.typeIcon} ml-1`}>
        {type === "physical" && "⚔️"}
        {type === "magical" && "✨"}
        {type === "true" && "💀"}
        {type === "heal" && "💚"}
      </span>

      {/* Critical hit burst effect - CSS Module */}
      {critical && animated && <div className={styles.criticalBurst} />}

      {/* Floating animation trail - CSS Module */}
      {floating && animated && <div className={styles.floatingTrail} />}

      {/* Damage type glow - CSS Module */}
      {animated && (
        <div className={`${styles.damageGlow} ${styles[`glow-${type}`]}`} />
      )}
    </div>
  );
}
