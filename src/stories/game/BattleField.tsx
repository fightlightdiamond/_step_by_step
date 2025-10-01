import React from "react";
import { Card } from "@/components/ui/card";
import styles from "./BattleField.module.css";

export interface Hero {
  id: string;
  name: string;
  image?: string;
  level?: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

export interface BattleFieldProps {
  heroPosition?: number; // 0-7, vị trí hero hiện tại
  hero?: Hero; // thông tin hero
  selectedCell?: number; // ô đang được chọn (0-7)
  onCellClick?: (cellIndex: number) => void;
  animated?: boolean;
  showBorder?: boolean; // ẩn/hiện border của các ô
  showCellNumber?: boolean; // ẩn/hiện số thứ tự ô
  showCardBorder?: boolean; // ẩn/hiện viền card shadcn/ui
  showCardBackground?: boolean; // ẩn/hiện background card
  showEmptyPlaceholder?: boolean; // ẩn/hiện dấu thập (+) ở ô trống
  backgroundTheme?:
    | "default"
    | "grass"
    | "snow"
    | "desert"
    | "water"
    | "lava"
    | "forest"
    | "mountain"
    | "swamp"
    | "crystal"
    | "void"
    | "heaven"; // theme background
  className?: string;
}

export default function BattleField({
  heroPosition,
  hero,
  selectedCell,
  onCellClick,
  animated = true,
  showBorder = true,
  showCellNumber = true,
  showCardBorder = true,
  showCardBackground = true,
  showEmptyPlaceholder = true,
  backgroundTheme = "default",
  className = "",
}: BattleFieldProps) {
  const cells = Array.from({ length: 8 }, (_, index) => index);

  // Tailwind classes cho border themes (background sẽ dùng CSS Module với real images)
  const themeClasses = {
    default: "bg-gradient-to-r from-slate-100 to-slate-200 border-slate-300",
    grass: "border-green-400",
    snow: "border-blue-300",
    desert: "border-yellow-400",
    water: "border-blue-400",
    lava: "border-red-500",
    forest: "border-green-500",
    mountain: "border-gray-500",
    swamp: "border-green-600",
    crystal: "border-purple-400",
    void: "border-gray-700",
    heaven: "border-yellow-300",
  };

  return (
    <div
      className={`
      relative flex gap-2 p-4 rounded-xl border-2 transition-all duration-500
      ${themeClasses[backgroundTheme]}
      ${animated ? styles.battleFieldContainer : ""}
      ${styles[`theme-${backgroundTheme}`]}
      ${className}
    `}
    >
      {cells.map((cellIndex) => {
        const hasHero = heroPosition === cellIndex;
        const isSelected = selectedCell === cellIndex;
        const isEmpty = !hasHero;

        return (
          <Card
            key={cellIndex}
            className={`
              relative w-20 h-24 flex flex-col items-center justify-center cursor-pointer
              rounded-lg transition-all duration-300
              ${
                showCardBorder && showBorder
                  ? "border-2"
                  : showCardBorder
                  ? "border"
                  : "border-0"
              }
              ${
                !showCardBackground
                  ? "bg-transparent"
                  : isEmpty && showBorder
                  ? "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  : isEmpty && !showBorder
                  ? "bg-gray-50 hover:bg-gray-100"
                  : hasHero && showBorder
                  ? "border-blue-400 bg-blue-50"
                  : hasHero && !showBorder
                  ? "bg-blue-50"
                  : isSelected && showBorder
                  ? "border-yellow-400 bg-yellow-50"
                  : isSelected && !showBorder
                  ? "bg-yellow-50"
                  : ""
              }
              ${animated ? styles.battleCell : ""}
              ${hasHero && animated ? styles.heroCell : ""}
              ${isSelected && animated ? styles.selectedCell : ""}
              ${!showBorder ? styles.noBorder : ""}
              ${!showCardBorder ? styles.noCardBorder : ""}
              ${!showCardBackground ? styles.noCardBackground : ""}
            `}
            onClick={() => onCellClick?.(cellIndex)}
          >
            {/* Cell number */}
            {showCellNumber && (
              <div className="absolute top-1 left-1 text-xs text-gray-400 font-mono">
                {cellIndex}
              </div>
            )}

            {/* Hero content */}
            {hasHero && hero ? (
              <div
                className={`
                flex flex-col items-center justify-center h-full
                ${animated ? styles.heroContent : ""}
              `}
              >
                {/* Hero image or placeholder */}
                <div
                  className={`
                  w-12 h-12 rounded-full mb-1 flex items-center justify-center text-lg
                  ${
                    hero.rarity === "legendary"
                      ? `bg-yellow-200 ${
                          showBorder ? "border-2 border-yellow-400" : ""
                        }`
                      : hero.rarity === "epic"
                      ? `bg-purple-200 ${
                          showBorder ? "border-2 border-purple-400" : ""
                        }`
                      : hero.rarity === "rare"
                      ? `bg-blue-200 ${
                          showBorder ? "border-2 border-blue-400" : ""
                        }`
                      : `bg-gray-200 ${
                          showBorder ? "border-2 border-gray-400" : ""
                        }`
                  }
                  ${animated ? styles.heroAvatar : ""}
                `}
                >
                  {hero.image ? (
                    <img
                      src={hero.image}
                      alt={hero.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>🦸</span>
                  )}
                </div>

                {/* Hero name */}
                <div className="text-xs font-medium text-center text-gray-700 truncate w-full px-1">
                  {hero.name}
                </div>

                {/* Hero level */}
                {hero.level && (
                  <div className="text-xs text-gray-500">Lv.{hero.level}</div>
                )}
              </div>
            ) : /* Empty cell placeholder */
            showEmptyPlaceholder ? (
              <div
                className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-gray-400
                    ${
                      showBorder ? "border-2 border-dashed border-gray-300" : ""
                    }
                    ${animated ? styles.emptyCell : ""}
                  `}
              >
                <span className="text-2xl">+</span>
              </div>
            ) : (
              <div className="w-12 h-12" />
            )}

            {/* Selection glow effect */}
            {isSelected && animated && <div className={styles.selectionGlow} />}

            {/* Hero glow effect */}
            {hasHero && animated && (
              <div
                className={`${styles.heroGlow} ${
                  styles[`glow-${hero?.rarity || "common"}`]
                }`}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}
