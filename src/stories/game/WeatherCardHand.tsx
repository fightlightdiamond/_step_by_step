import React, { useState } from "react";
import WeatherCard from "./WeatherCard";
import { WeatherCard as WeatherCardType } from "../../weather-engine/types";
import styles from "./WeatherCardHand.module.css";

export interface WeatherCardHandProps {
  cards: WeatherCardType[];
  maxCards?: number;
  size?: "sm" | "md" | "lg";
  layout?: "fan" | "grid" | "row";
  interactive?: boolean;
  selectedCardId?: string;
  disabledCardIds?: string[];
  onCardPlay?: (card: WeatherCardType) => void;
  onCardSelect?: (card: WeatherCardType | null) => void;
  onCardHover?: (card: WeatherCardType | null) => void;
}

export default function WeatherCardHand({
  cards,
  maxCards = 7,
  size = "md",
  layout = "fan",
  interactive = true,
  selectedCardId,
  disabledCardIds = [],
  onCardPlay,
  onCardSelect,
  onCardHover,
}: WeatherCardHandProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const handleCardPlay = (card: WeatherCardType) => {
    if (onCardPlay) {
      onCardPlay(card);
    }
  };

  const handleCardClick = (card: WeatherCardType) => {
    if (onCardSelect) {
      const isCurrentlySelected = selectedCardId === card.id;
      onCardSelect(isCurrentlySelected ? null : card);
    }
  };

  const handleCardHover = (card: WeatherCardType | null) => {
    setHoveredCardId(card?.id || null);
    if (onCardHover) {
      onCardHover(card);
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case "fan":
        return "flex justify-center items-end";
      case "grid":
        return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
      case "row":
        return "flex gap-2 overflow-x-auto pb-2";
      default:
        return "flex justify-center items-end";
    }
  };

  const getCardStyle = (index: number, totalCards: number) => {
    if (layout !== "fan") return {};

    const centerIndex = (totalCards - 1) / 2;
    const offset = index - centerIndex;
    const rotation = offset * 8; // degrees
    const translateY = Math.abs(offset) * 10; // pixels
    const zIndex = totalCards - Math.abs(offset);

    return {
      transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
      zIndex,
      marginLeft: index > 0 ? "-20px" : "0",
    };
  };

  const visibleCards = cards.slice(0, maxCards);

  return (
    <div className="relative">
      {/* Card Count Indicator */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Hand: {cards.length}/{maxCards}
        </div>
        {cards.length > maxCards && (
          <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
            +{cards.length - maxCards} more
          </div>
        )}
      </div>

      {/* Cards Container */}
      <div
        className={`
          ${getLayoutClasses()}
          ${layout === "fan" ? styles.fanLayout : ""}
          min-h-[200px]
        `}
      >
        {visibleCards.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            <div className="text-4xl mb-2">🃏</div>
            <div>No cards in hand</div>
          </div>
        ) : (
          visibleCards.map((card, index) => (
            <div
              key={card.id}
              className={`
                transition-all duration-300 ease-out
                ${layout === "fan" ? "relative" : ""}
                ${hoveredCardId === card.id ? styles.hoveredCard : ""}
                ${selectedCardId === card.id ? styles.selectedCard : ""}
              `}
              style={getCardStyle(index, visibleCards.length)}
            >
              <WeatherCard
                card={card}
                size={size}
                interactive={interactive}
                disabled={disabledCardIds.includes(card.id)}
                selected={selectedCardId === card.id}
                onPlay={handleCardPlay}
                onHover={handleCardHover}
              />

              {/* Card selection overlay for non-interactive mode */}
              {!interactive && selectedCardId === card.id && (
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => handleCardClick(card)}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      {interactive && selectedCardId && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => {
              const selectedCard = cards.find((c) => c.id === selectedCardId);
              if (selectedCard) handleCardPlay(selectedCard);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Play Card
          </button>
          <button
            onClick={() => onCardSelect?.(null)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Hover Preview */}
      {hoveredCardId && layout === "fan" && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white p-2 rounded-lg shadow-lg border">
            <div className="text-xs text-gray-600 text-center">
              {cards.find((c) => c.id === hoveredCardId)?.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
