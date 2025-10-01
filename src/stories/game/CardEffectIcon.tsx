// components/CardEffectIcon.tsx
import React from "react";
import styles from "./CardEffectIcon.module.css";

export interface CardEffectIconProps {
  effect: string;
  icon: string;
  active?: boolean;
}

export default function CardEffectIcon({
  effect,
  icon,
  active = false,
}: CardEffectIconProps) {
  return (
    <div
      className={`
        relative w-8 h-8 rounded-full border-2 flex items-center justify-center
        ${
          active
            ? `border-yellow-400 bg-yellow-100 ${styles.activeGlow}`
            : "border-gray-300 bg-gray-100"
        }
      `}
      title={effect}
    >
      <span className="text-sm">{icon}</span>
      {active && (
        <div
          className={`absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full ${styles.pulse}`}
        ></div>
      )}
    </div>
  );
}
