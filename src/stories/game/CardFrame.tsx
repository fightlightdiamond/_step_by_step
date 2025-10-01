import React from "react";
import { Card } from "@/components/ui/card";
import styles from "./CardFrame.module.css";

export interface CardFrameProps {
  children: React.ReactNode;
  rarity?: "common" | "rare" | "epic" | "legendary";
  glowing?: boolean;
  animated?: boolean;
  className?: string;
}

export default function CardFrame({
  children,
  rarity = "common",
  glowing = false,
  animated = false,
  className = "",
}: CardFrameProps) {
  // Tailwind classes cho layout, spacing, colors cơ bản
  const rarityClasses = {
    common: "border-gray-400 bg-gradient-to-b from-gray-100 to-gray-200",
    rare: "border-blue-400 bg-gradient-to-b from-blue-50 to-blue-100",
    epic: "border-purple-400 bg-gradient-to-b from-purple-50 to-purple-100",
    legendary:
      "border-yellow-400 bg-gradient-to-b from-yellow-50 to-yellow-100",
  };

  // CSS Module classes cho effects đặc biệt
  const effectClasses = [
    glowing && styles.glowingFrame,
    animated && styles.animatedFrame,
    styles[`rarity-${rarity}`],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      className={`
        border-2 transition-all duration-300
        ${rarityClasses[rarity]}
        ${effectClasses}
        ${className}
      `}
    >
      {/* Inner glow effect - CSS Module */}
      {glowing && <div className={styles.innerGlow} />}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Legendary sparkle effect - CSS Module */}
      {rarity === "legendary" && animated && (
        <div className={styles.sparkleEffect} />
      )}
    </Card>
  );
}
