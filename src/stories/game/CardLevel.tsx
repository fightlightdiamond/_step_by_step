import React from "react";
import { Badge } from "@/components/ui/badge";
import styles from "./CardLevel.module.css";

export interface CardLevelProps {
  level: number;
  maxLevel?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  animated?: boolean;
  showProgress?: boolean;
}

export default function CardLevel({
  level,
  maxLevel = 100,
  position = "top-left",
  animated = false,
  showProgress = false,
}: CardLevelProps) {
  const isMaxLevel = maxLevel && level >= maxLevel;
  const progressPercentage = maxLevel ? (level / maxLevel) * 100 : 0;

  // Tailwind classes cho positioning
  const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
  };

  // CSS Module classes cho effects
  const effectClasses = [
    animated && styles.animatedLevel,
    isMaxLevel && styles.maxLevel,
    showProgress && styles.withProgress,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`absolute ${positionClasses[position]} ${effectClasses}`}>
      <Badge
        variant={isMaxLevel ? "default" : "secondary"}
        className={`
          relative font-bold text-xs px-2 py-1
          ${isMaxLevel ? "bg-yellow-500 text-white" : ""}
          ${animated ? styles.levelBadge : ""}
        `}
      >
        Lv. {level}
        {isMaxLevel && <span className={`ml-1 ${styles.maxText}`}>MAX</span>}
        {/* Progress bar cho level - CSS Module */}
        {showProgress && !isMaxLevel && (
          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
        {/* Max level sparkle effect - CSS Module */}
        {isMaxLevel && animated && <div className={styles.sparkleOverlay} />}
      </Badge>

      {/* Level up animation trigger - CSS Module */}
      {animated && <div className={styles.levelUpEffect} />}
    </div>
  );
}
