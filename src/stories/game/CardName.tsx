import React from "react";
import styles from "./CardName.module.css";

export interface CardNameProps {
  name: string;
  subtitle?: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
  animated?: boolean;
  truncate?: boolean;
  alignment?: "left" | "center" | "right";
  className?: string;
}

export default function CardName({
  name,
  subtitle,
  rarity = "common",
  animated = false,
  truncate = false,
  alignment = "center",
  className = "",
}: CardNameProps) {
  // Tailwind classes cho alignment và typography
  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  // Tailwind classes cho rarity colors
  const rarityColors = {
    common: "text-gray-800",
    rare: "text-blue-700",
    epic: "text-purple-700",
    legendary: "text-yellow-700",
  };

  // CSS Module classes cho effects
  const effectClasses = [
    animated && styles.animatedName,
    styles[`rarity-${rarity}`],
    rarity === "legendary" && styles.legendaryText,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${alignmentClasses[alignment]} ${className}`}>
      <h3
        className={`
        font-bold text-lg transition-all duration-300
        ${rarityColors[rarity]}
        ${truncate ? "truncate" : ""}
        ${effectClasses}
      `}
      >
        {name}

        {/* Legendary crown icon - CSS Module positioning */}
        {rarity === "legendary" && (
          <span className={`ml-2 ${styles.crownIcon}`}>👑</span>
        )}
      </h3>

      {subtitle && (
        <p
          className={`
          text-sm text-gray-600 mt-1
          ${truncate ? "truncate" : ""}
          ${animated ? styles.animatedSubtitle : ""}
        `}
        >
          {subtitle}
        </p>
      )}

      {/* Legendary text glow effect - CSS Module */}
      {rarity === "legendary" && animated && (
        <div className={styles.textGlow} />
      )}
    </div>
  );
}
