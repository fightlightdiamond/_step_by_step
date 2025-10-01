import React from "react";
import styles from "./GameCard.module.css";

export interface GameCardProps {
  title: string;
  level: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  image?: string;
  isActive?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export default function GameCard({
  title,
  level,
  rarity,
  image,
  isActive = false,
  isHovered = false,
  onClick,
}: GameCardProps) {
  // Tailwind classes cho layout, spacing, colors cơ bản
  const baseClasses =
    "relative w-48 h-64 rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 overflow-hidden";

  // Tailwind classes cho rarity colors
  const rarityClasses = {
    common: "border-gray-300 bg-gray-50 hover:bg-gray-100",
    rare: "border-blue-400 bg-blue-50 hover:bg-blue-100",
    epic: "border-purple-400 bg-purple-50 hover:bg-purple-100",
    legendary: "border-yellow-400 bg-yellow-50 hover:bg-yellow-100",
  };

  // CSS Module classes cho effects đặc biệt
  const effectClasses = [
    isActive && styles.activeGlow,
    isHovered && styles.hoverEffect,
    styles[`rarity-${rarity}`],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`${baseClasses} ${rarityClasses[rarity]} ${effectClasses}`}
      onClick={onClick}
    >
      {/* Background pattern - CSS Module cho pattern phức tạp */}
      <div className={`absolute inset-0 ${styles.backgroundPattern}`} />

      {/* Image container - Tailwind cho layout */}
      <div className="relative z-10 w-full h-32 mb-4 rounded-lg overflow-hidden bg-gray-200">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🎮</span>
          </div>
        )}
      </div>

      {/* Content - Tailwind cho typography và spacing */}
      <div className="relative z-10 space-y-2">
        <h3 className="text-lg font-bold text-gray-800 truncate">{title}</h3>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Level {level}</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              rarity === "common"
                ? "bg-gray-200 text-gray-700"
                : rarity === "rare"
                ? "bg-blue-200 text-blue-700"
                : rarity === "epic"
                ? "bg-purple-200 text-purple-700"
                : "bg-yellow-200 text-yellow-700"
            }`}
          >
            {rarity.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Active indicator - CSS Module cho animation */}
      {isActive && (
        <div
          className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-green-400 ${styles.activePulse}`}
        />
      )}

      {/* Shine effect - CSS Module cho complex animation */}
      <div className={`absolute inset-0 ${styles.shineEffect}`} />
    </div>
  );
}
