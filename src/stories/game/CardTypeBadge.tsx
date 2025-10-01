import React from "react";
import { Badge } from "@/components/ui/badge";
import styles from "./CardTypeBadge.module.css";

export interface CardTypeBadgeProps {
  type: string;
  category?: "spell" | "creature" | "artifact" | "enchantment" | "land";
  animated?: boolean;
  glowing?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function CardTypeBadge({
  type,
  category = "spell",
  animated = false,
  glowing = false,
  size = "md",
}: CardTypeBadgeProps) {
  // Tailwind classes cho size
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1",
  };

  // Tailwind classes cho category colors
  const categoryColors = {
    spell: "bg-blue-100 text-blue-800 border-blue-200",
    creature: "bg-green-100 text-green-800 border-green-200",
    artifact: "bg-gray-100 text-gray-800 border-gray-200",
    enchantment: "bg-purple-100 text-purple-800 border-purple-200",
    land: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  // CSS Module classes cho effects
  const effectClasses = [
    animated && styles.animatedBadge,
    glowing && styles.glowingBadge,
    styles[`category-${category}`],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Badge
      variant="outline"
      className={`
        font-medium border transition-all duration-300
        ${sizeClasses[size]}
        ${categoryColors[category]}
        ${effectClasses}
      `}
    >
      {/* Category icon - CSS Module positioning */}
      <span className={styles.categoryIcon}>
        {category === "spell" && "✨"}
        {category === "creature" && "🐾"}
        {category === "artifact" && "⚙️"}
        {category === "enchantment" && "🔮"}
        {category === "land" && "🏔️"}
      </span>

      {type}

      {/* Glow effect overlay - CSS Module */}
      {glowing && (
        <div
          className={`${styles.glowOverlay} ${styles[`glow-${category}`]}`}
        />
      )}
    </Badge>
  );
}
