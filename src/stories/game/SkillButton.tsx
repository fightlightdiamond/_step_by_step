// components/SkillButton.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import styles from "./SkillButton.module.css";

export interface SkillButtonProps {
  name: string;
  icon?: string;
  cooldown?: number;
  disabled?: boolean;
  onClick?: () => void;
}

export default function SkillButton({
  name,
  icon,
  cooldown = 0,
  disabled = false,
  onClick,
}: SkillButtonProps) {
  const isOnCooldown = cooldown > 0;
  const isDisabled = disabled || isOnCooldown;

  return (
    <Button
      variant={disabled ? "secondary" : "default"}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        relative w-16 h-16 p-2 overflow-hidden
        ${!isDisabled ? styles.skillReady : ""}
        ${isOnCooldown ? styles.cooldownOverlay : ""}
      `}
      title={`${name}${isOnCooldown ? ` (${cooldown}s)` : ""}`}
    >
      {icon && (
        <img
          src={icon}
          alt={name}
          className={`w-8 h-8 transition-all duration-200 ${
            isDisabled ? "grayscale opacity-60" : ""
          }`}
        />
      )}

      {isOnCooldown && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span
            className={`text-white font-bold text-lg ${styles.cooldownText}`}
          >
            {cooldown}
          </span>
        </div>
      )}
    </Button>
  );
}
