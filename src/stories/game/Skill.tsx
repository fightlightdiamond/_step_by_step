import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import styles from "./Skill.module.css";

export interface SkillProps {
  name: string;
  img: string;
  desc: string;
  level?: number;
  maxLevel?: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
  unlocked?: boolean;
  animated?: boolean;
  size?: "small" | "medium" | "large" | "xlarge";
  onClick?: () => void;
}

export default function Skill({
  name,
  img,
  desc,
  level = 1,
  maxLevel = 5,
  rarity = "common",
  unlocked = true,
  animated = false,
  size = "medium",
  onClick,
}: SkillProps) {
  const isMaxLevel = level >= maxLevel;

  // Size configurations
  const sizeConfig = {
    small: {
      cardWidth: "w-32",
      iconSize: "w-12 h-12",
      imageSize: 48,
      padding: "p-3",
      nameSize: "text-sm",
      levelSize: "text-xs",
      descSize: "text-xs",
      spacing: "mb-1",
    },
    medium: {
      cardWidth: "w-40",
      iconSize: "w-16 h-16",
      imageSize: 64,
      padding: "p-4",
      nameSize: "text-lg",
      levelSize: "text-sm",
      descSize: "text-sm",
      spacing: "mb-2",
    },
    large: {
      cardWidth: "w-48",
      iconSize: "w-24 h-24",
      imageSize: 96,
      padding: "p-6",
      nameSize: "text-xl",
      levelSize: "text-sm",
      descSize: "text-sm",
      spacing: "mb-3",
    },
    xlarge: {
      cardWidth: "w-56",
      iconSize: "w-32 h-32",
      imageSize: 128,
      padding: "p-8",
      nameSize: "text-2xl",
      levelSize: "text-base",
      descSize: "text-base",
      spacing: "mb-4",
    },
  };

  const currentSize = sizeConfig[size];

  // Tailwind classes cho rarity colors
  const rarityClasses = {
    common: "border-gray-300 bg-gray-50",
    rare: "border-blue-400 bg-blue-50",
    epic: "border-purple-400 bg-purple-50",
    legendary: "border-yellow-400 bg-yellow-50",
  };

  // CSS Module classes cho effects
  const effectClasses = [
    animated && styles.animatedSkill,
    !unlocked && styles.lockedSkill,
    isMaxLevel && styles.maxLevelSkill,
    styles[`rarity-${rarity}`],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      className={`
        ${
          currentSize.cardWidth
        } cursor-pointer transition-all duration-300 border-2
        ${rarityClasses[rarity]}
        ${effectClasses}
        ${unlocked ? "hover:shadow-lg hover:-translate-y-1" : "opacity-60"}
      `}
      onClick={unlocked ? onClick : undefined}
    >
      <CardContent
        className={`flex flex-col items-center ${currentSize.padding} relative`}
      >
        {/* Skill Icon Container */}
        <div
          className={`
          relative ${currentSize.iconSize} rounded-xl ${
            currentSize.spacing
          } overflow-hidden
          ${unlocked ? "border shadow" : "border-dashed border-gray-300"}
          ${animated ? styles.iconContainer : ""}
        `}
        >
          <Image
            src={img}
            alt={name}
            width={currentSize.imageSize}
            height={currentSize.imageSize}
            className={`
              w-full h-full object-contain transition-all duration-300
              ${unlocked ? "" : "grayscale opacity-50"}
              ${animated ? styles.skillIcon : ""}
            `}
          />

          {/* Lock overlay - CSS Module */}
          {!unlocked && (
            <div className={styles.lockOverlay}>
              <span className="text-gray-400 text-xl">🔒</span>
            </div>
          )}

          {/* Max level crown - CSS Module */}
          {isMaxLevel && unlocked && (
            <div className={styles.maxLevelCrown}>
              <span className="text-yellow-500 text-sm">👑</span>
            </div>
          )}
        </div>

        {/* Skill Name */}
        <div
          className={`
          ${currentSize.nameSize} font-semibold text-center mb-1
          ${unlocked ? "text-gray-800" : "text-gray-400"}
          ${animated ? styles.skillName : ""}
        `}
        >
          {name}
        </div>

        {/* Skill Level */}
        <div
          className={`
          ${currentSize.levelSize} font-medium mb-2
          ${isMaxLevel ? "text-yellow-600" : "text-blue-600"}
        `}
        >
          {unlocked ? `Level ${level}/${maxLevel}` : "Locked"}
        </div>

        {/* Skill Description */}
        <div
          className={`
          ${currentSize.descSize} text-center leading-relaxed
          ${unlocked ? "text-gray-500" : "text-gray-400"}
        `}
        >
          {desc}
        </div>

        {/* Level Progress Bar - CSS Module */}
        {unlocked && !isMaxLevel && (
          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${(level / maxLevel) * 100}%` }}
            />
          </div>
        )}

        {/* Rarity glow effect - CSS Module */}
        {unlocked && animated && rarity !== "common" && (
          <div className={`${styles.rarityGlow} ${styles[`glow-${rarity}`]}`} />
        )}

        {/* Unlock animation - CSS Module */}
        {unlocked && animated && <div className={styles.unlockEffect} />}
      </CardContent>
    </Card>
  );
}
