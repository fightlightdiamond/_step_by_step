import React from "react";
import { ElementType } from "../../weather-engine/types";
import styles from "./ElementalModifiers.module.css";

export interface ElementalModifiersProps {
  modifiers: Record<ElementType, number>;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical" | "grid";
  showLabels?: boolean;
  showValues?: boolean;
  animated?: boolean;
  interactive?: boolean;
  onElementClick?: (element: ElementType) => void;
}

const ELEMENT_CONFIG: Record<
  ElementType,
  {
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
    name: string;
  }
> = {
  Fire: {
    icon: "🔥",
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    name: "Fire",
  },
  Ice: {
    icon: "🧊",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    name: "Ice",
  },
  Lightning: {
    icon: "⚡",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    name: "Lightning",
  },
};

export default function ElementalModifiers({
  modifiers,
  size = "md",
  layout = "grid",
  showLabels = true,
  showValues = true,
  animated = true,
  interactive = false,
  onElementClick,
}: ElementalModifiersProps) {
  const sizeClasses = {
    sm: "text-sm p-2",
    md: "text-base p-3",
    lg: "text-lg p-4",
  };

  const iconSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const layoutClasses = {
    horizontal: "flex flex-row gap-2",
    vertical: "flex flex-col gap-2",
    grid: "grid grid-cols-3 gap-2",
  };

  const formatModifier = (value: number): string => {
    return value > 0 ? `+${value}` : `${value}`;
  };

  const getModifierIntensity = (value: number): "low" | "medium" | "high" => {
    const absValue = Math.abs(value);
    if (absValue <= 10) return "low";
    if (absValue <= 25) return "medium";
    return "high";
  };

  const getModifierColor = (value: number): string => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-500";
  };

  const getModifierBg = (value: number): string => {
    if (value > 0) return "bg-green-50 border-green-200";
    if (value < 0) return "bg-red-50 border-red-200";
    return "bg-gray-50 border-gray-200";
  };

  const handleElementClick = (element: ElementType) => {
    if (interactive && onElementClick) {
      onElementClick(element);
    }
  };

  return (
    <div className={layoutClasses[layout]}>
      {(Object.entries(modifiers) as [ElementType, number][]).map(
        ([element, modifier], index) => {
          const config = ELEMENT_CONFIG[element];
          const intensity = getModifierIntensity(modifier);

          return (
            <div
              key={element}
              className={`
                relative rounded-lg border transition-all duration-200
                ${sizeClasses[size]}
                ${config.bgColor} ${config.borderColor}
                ${getModifierBg(modifier)}
                ${
                  interactive
                    ? "cursor-pointer hover:shadow-md hover:scale-105"
                    : ""
                }
                ${animated ? styles.elementCard : ""}
                ${
                  animated
                    ? styles[
                        `intensity${
                          intensity.charAt(0).toUpperCase() + intensity.slice(1)
                        }`
                      ]
                    : ""
                }
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleElementClick(element)}
            >
              {/* Element Icon */}
              <div
                className={`${iconSizes[size]} ${config.color} text-center mb-1`}
              >
                {config.icon}
              </div>

              {/* Element Label */}
              {showLabels && (
                <div className="text-center text-xs text-gray-600 mb-1 font-medium">
                  {config.name}
                </div>
              )}

              {/* Modifier Value */}
              {showValues && (
                <div
                  className={`
                    text-center font-bold
                    ${
                      size === "sm"
                        ? "text-xs"
                        : size === "lg"
                        ? "text-base"
                        : "text-sm"
                    }
                    ${getModifierColor(modifier)}
                  `}
                >
                  {formatModifier(modifier)}
                </div>
              )}

              {/* Intensity Indicator */}
              {animated && (
                <div
                  className={`
                    absolute top-1 right-1 w-2 h-2 rounded-full
                    ${styles.intensityIndicator}
                    ${
                      styles[
                        `indicator${
                          intensity.charAt(0).toUpperCase() + intensity.slice(1)
                        }`
                      ]
                    }
                  `}
                />
              )}

              {/* Modifier Bar */}
              <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`
                    h-full transition-all duration-500 ease-out
                    ${
                      modifier > 0
                        ? "bg-green-400"
                        : modifier < 0
                        ? "bg-red-400"
                        : "bg-gray-300"
                    }
                    ${animated ? styles.modifierBar : ""}
                  `}
                  style={{
                    width: `${Math.min((Math.abs(modifier) / 40) * 100, 100)}%`,
                    marginLeft: modifier < 0 ? "auto" : "0",
                  }}
                />
              </div>

              {/* Hover Effect */}
              {interactive && (
                <div
                  className={`absolute inset-0 rounded-lg ${styles.hoverOverlay}`}
                />
              )}
            </div>
          );
        }
      )}
    </div>
  );
}
