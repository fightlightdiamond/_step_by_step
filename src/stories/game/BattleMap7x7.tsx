import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Position {
  row: number;
  col: number;
}

interface Monster {
  id: string;
  position: Position;
  type: "goblin" | "orc" | "skeleton" | "dragon";
  level: number;
}

interface BattleMap7x7Props {
  heroCell?: Position;
  monsters?: Monster[];
  highlightRange?: Position[];
  onCellClick?: (position: Position) => void;
  showRandomizeButton?: boolean;
  showBorder?: boolean;
  showCellNumber?: boolean;
  showCardBorder?: boolean;
  showCardBackground?: boolean;
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
    | "heaven";
  className?: string;
}

const MONSTER_TYPES = ["goblin", "orc", "skeleton", "dragon"] as const;
const MONSTER_ICONS = {
  goblin: "👹",
  orc: "👺",
  skeleton: "💀",
  dragon: "🐉",
};

const MONSTER_COLORS = {
  goblin: "bg-green-200 border-green-400",
  orc: "bg-gray-200 border-gray-400",
  skeleton: "bg-purple-200 border-purple-400",
  dragon: "bg-red-200 border-red-400",
};

const BACKGROUND_THEMES = {
  default: "bg-gradient-to-br from-green-50 to-blue-50",
  grass: "bg-gradient-to-br from-green-100 to-green-200",
  snow: "bg-gradient-to-br from-blue-50 to-white",
  desert: "bg-gradient-to-br from-yellow-100 to-orange-200",
  water: "bg-gradient-to-br from-blue-100 to-cyan-200",
  lava: "bg-gradient-to-br from-red-200 to-orange-300",
  forest: "bg-gradient-to-br from-green-200 to-emerald-300",
  mountain: "bg-gradient-to-br from-gray-200 to-slate-300",
  swamp: "bg-gradient-to-br from-green-300 to-yellow-400",
  crystal: "bg-gradient-to-br from-purple-100 to-pink-200",
  void: "bg-gradient-to-br from-gray-800 to-black",
  heaven: "bg-gradient-to-br from-yellow-100 to-blue-100",
};

export default function BattleMap7x7({
  heroCell = { row: 6, col: 3 },
  monsters: initialMonsters,
  highlightRange = [],
  onCellClick,
  showRandomizeButton = true,
  showBorder = true,
  showCellNumber = true,
  showCardBorder = true,
  showCardBackground = true,
  backgroundTheme = "default",
  className = "",
}: BattleMap7x7Props) {
  const [monsters, setMonsters] = useState<Monster[]>([]);

  const getManhattanDistance = (pos1: Position, pos2: Position): number => {
    return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
  };

  const generateRandomMonsters = useCallback((): Monster[] => {
    const validPositions: Position[] = [];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const position = { row, col };
        if (
          !(row === heroCell.row && col === heroCell.col) &&
          getManhattanDistance(position, heroCell) >= 2
        ) {
          validPositions.push(position);
        }
      }
    }

    const shuffled = [...validPositions].sort(() => Math.random() - 0.5);
    const monsterCount = Math.min(
      Math.floor(Math.random() * 4) + 5,
      validPositions.length
    );

    const newMonsters: Monster[] = [];
    for (let i = 0; i < monsterCount; i++) {
      const position = shuffled[i];
      const monster: Monster = {
        id: `monster-${i}`,
        position,
        type: MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)],
        level: Math.floor(Math.random() * 20) + 5,
      };
      newMonsters.push(monster);
    }

    return newMonsters;
  }, [heroCell.row, heroCell.col]);

  useEffect(() => {
    if (initialMonsters) {
      setMonsters(initialMonsters);
    } else {
      setMonsters(generateRandomMonsters());
    }
  }, [initialMonsters, generateRandomMonsters]);

  const handleRandomizeMonsters = () => {
    setMonsters(generateRandomMonsters());
  };

  const getCellInfo = (row: number, col: number) => {
    const isHero = heroCell.row === row && heroCell.col === col;
    const monster = monsters.find(
      (m) => m.position.row === row && m.position.col === col
    );
    const isHighlighted = highlightRange.some(
      (h) => h.row === row && h.col === col
    );

    let className =
      "w-full aspect-square flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ";
    let content = null;

    if (isHero) {
      className +=
        "bg-blue-500 text-white animate-pulse border-blue-600 shadow-lg transform scale-105";
      content = (
        <div className="text-center">
          <div className="text-2xl">🛡️</div>
          <div className="text-xs font-bold">HERO</div>
        </div>
      );
    } else if (monster) {
      className += `${MONSTER_COLORS[monster.type]} hover:scale-105`;
      content = (
        <div className="text-center">
          <div className="text-xl">{MONSTER_ICONS[monster.type]}</div>
          <div className="text-xs font-bold">Lv.{monster.level}</div>
        </div>
      );
    } else if (isHighlighted) {
      className += "bg-green-200 border-green-400 hover:bg-green-300";
      content = (
        <div className="text-center">
          <div className="text-lg text-green-600">⚡</div>
          <div className="text-xs text-green-700">Range</div>
        </div>
      );
    } else {
      if (showCardBackground) {
        className +=
          "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300";
      }
      content = showCellNumber ? (
        <div className="text-center">
          <div className="text-xs text-gray-400">
            {row},{col}
          </div>
        </div>
      ) : null;
    }

    return { className, content };
  };

  return (
    <div className={`w-fit mx-auto p-4 ${className}`}>
      {showRandomizeButton && (
        <div className="mb-4 text-center">
          <Button
            onClick={handleRandomizeMonsters}
            variant="outline"
            className="mb-2"
          >
            🎲 Randomize Monsters
          </Button>
          <div className="text-sm text-gray-600">
            Monsters: {monsters.length} | Hero: [{heroCell.row},{heroCell.col}]
          </div>
        </div>
      )}

      <div
        className={`grid grid-cols-7 grid-rows-7 gap-px p-4 ${BACKGROUND_THEMES[backgroundTheme]} rounded-xl border shadow-lg`}
      >
        {Array.from({ length: 49 }, (_, index) => {
          const row = Math.floor(index / 7);
          const col = index % 7;
          const { className: cellClassName, content } = getCellInfo(row, col);

          return (
            <Card
              key={`cell-${row}-${col}`}
              className={`${cellClassName} ${
                !showCardBorder ? "border-0 shadow-none" : ""
              } ${!showCardBackground ? "!bg-transparent" : ""}`}
              onClick={() => onCellClick?.({ row, col })}
            >
              {content}
            </Card>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-500 rounded border"></div>
          <span>Hero</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-200 border-green-400 border rounded"></div>
          <span>Goblin</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-200 border-gray-400 border rounded"></div>
          <span>Orc</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-purple-200 border-purple-400 border rounded"></div>
          <span>Skeleton</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-200 border-red-400 border rounded"></div>
          <span>Dragon</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-200 border-green-400 border rounded"></div>
          <span>Range</span>
        </div>
      </div>
    </div>
  );
}
