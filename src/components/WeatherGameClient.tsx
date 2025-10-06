"use client";

import React, { useState, useEffect, useCallback } from "react";
import WeatherUI from "@/stories/game/WeatherUI";
import WeatherCard from "@/stories/game/WeatherCard";
import {
  WeatherType,
  ElementType,
  WeatherCard as WeatherCardType,
  WeatherState,
} from "@/weather-engine/types";

interface GameState {
  turn: number;
  month: number;
  season: string;
  score: number;
  energy: number;
  maxEnergy: number;
  gameMode: string;
  isGameOver: boolean;
  victory: boolean;
}

const SAMPLE_CARDS: WeatherCardType[] = [
  {
    id: "sunny-day",
    type: "Weather",
    name: "Sunny Day",
    description: "Changes weather to sunny, boosting Fire damage",
    weather: "Sunny",
    cost: 2,
  },
  {
    id: "storm-call",
    type: "Weather",
    name: "Storm Call",
    description: "Summons a powerful storm, greatly boosting Lightning damage",
    weather: "Stormy",
    cost: 3,
  },
  {
    id: "blizzard",
    type: "Weather",
    name: "Blizzard",
    description: "Creates a fierce snowstorm, boosting Ice damage",
    weather: "Snowy",
    cost: 3,
  },
  {
    id: "clear-skies",
    type: "BreakWeather",
    name: "Clear Skies",
    description: "Removes all weather effects",
    cost: 1,
  },
  {
    id: "fire-enhancement",
    type: "WeatherBuff",
    name: "Fire Enhancement",
    description: "Increases Fire damage by 15% for 3 turns",
    effect: { Fire: 15 },
    duration: 3,
    cost: 2,
  },
  {
    id: "ice-shield",
    type: "WeatherBuff",
    name: "Ice Shield",
    description: "Increases Ice damage by 12% for 4 turns",
    effect: { Ice: 12 },
    duration: 4,
    cost: 2,
  },
  {
    id: "lightning-rod",
    type: "WeatherBuff",
    name: "Lightning Rod",
    description: "Increases Lightning damage by 18% for 2 turns",
    effect: { Lightning: 18 },
    duration: 2,
    cost: 2,
  },
  {
    id: "elemental-chaos",
    type: "WeatherBuff",
    name: "Elemental Chaos",
    description: "Random elemental boost for 3 turns",
    effect: { Fire: 10, Ice: 5, Lightning: 8 },
    duration: 3,
    cost: 4,
  },
];

// Simple weather effects without complex managers
const WEATHER_EFFECTS = {
  Sunny: { Fire: 20, Ice: -10, Lightning: -5 },
  Cloudy: { Fire: -5, Ice: 0, Lightning: 5 },
  Rainy: { Fire: -20, Ice: 5, Lightning: 15 },
  Windy: { Fire: 5, Ice: 5, Lightning: 10 },
  Stormy: { Fire: -15, Ice: 0, Lightning: 25 },
  Foggy: { Fire: -5, Ice: 10, Lightning: -15 },
  Snowy: { Fire: -25, Ice: 20, Lightning: -10 },
  Hot: { Fire: 30, Ice: -20, Lightning: 0 },
  Cold: { Fire: -20, Ice: 25, Lightning: -5 },
  Warm: { Fire: 10, Ice: -5, Lightning: 0 },
  Cool: { Fire: -5, Ice: 10, Lightning: 0 },
  Humid: { Fire: -10, Ice: -5, Lightning: 20 },
};

const SEASONS = ["Winter", "Spring", "Summer", "Autumn"];

export default function WeatherGameClient() {
  const [isInitialized, setIsInitialized] = useState(false);

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    turn: 1,
    month: 1,
    season: "Winter",
    score: 0,
    energy: 5,
    maxEnergy: 5,
    gameMode: "12-Month Campaign",
    isGameOver: false,
    victory: false,
  });

  // Weather state
  const [weatherState, setWeatherState] = useState<WeatherState>({
    currentWeather: ["Cold"],
    activeCards: [],
    turn: 1,
    month: 1,
    season: "Winter",
  });

  // Player state
  const [playerHand, setPlayerHand] = useState<WeatherCardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<WeatherCardType | null>(
    null
  );
  const [elementalModifiers, setElementalModifiers] = useState<
    Record<ElementType, number>
  >({
    Fire: -20, // Cold weather effect
    Ice: 25,
    Lightning: -5,
  });

  // UI state
  const [gameLog, setGameLog] = useState<string[]>([
    "Game started! Welcome to the Weather Engine.",
    "Starting in Winter with Cold weather.",
  ]);

  // Initialize game
  useEffect(() => {
    // Only initialize on client side to avoid hydration mismatch
    const timer = setTimeout(() => {
      const initialHand = getRandomCards(5);
      setPlayerHand(initialHand);
      setIsInitialized(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const getRandomCards = (count: number): WeatherCardType[] => {
    // Use a more deterministic shuffle to avoid hydration issues
    const shuffled = [...SAMPLE_CARDS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  };

  const calculateElementalModifiers = (
    weather: WeatherType[],
    activeCards: WeatherCardType[]
  ): Record<ElementType, number> => {
    const modifiers = { Fire: 0, Ice: 0, Lightning: 0 };

    // Apply weather effects
    weather.forEach((w) => {
      const effects = WEATHER_EFFECTS[w];
      if (effects) {
        modifiers.Fire += effects.Fire;
        modifiers.Ice += effects.Ice;
        modifiers.Lightning += effects.Lightning;
      }
    });

    // Apply card effects
    activeCards.forEach((card) => {
      if (card.effect) {
        Object.entries(card.effect).forEach(([element, value]) => {
          modifiers[element as ElementType] += value;
        });
      }
    });

    return modifiers;
  };

  const addToLog = (message: string) => {
    setGameLog((prev) => [
      ...prev.slice(-9),
      `Turn ${gameState.turn}: ${message}`,
    ]);
  };

  const playCard = useCallback(
    (card: WeatherCardType) => {
      if (gameState.energy < card.cost) {
        addToLog(
          `Not enough energy to play ${card.name}. Need ${card.cost}, have ${gameState.energy}.`
        );
        return;
      }

      let newWeather = [...weatherState.currentWeather];
      let newActiveCards = [...weatherState.activeCards];

      if (card.type === "Weather" && card.weather) {
        // Replace current weather with new weather
        newWeather = [card.weather];
        addToLog(`${card.name} played! Weather changed to ${card.weather}.`);
      } else if (card.type === "BreakWeather") {
        // Clear all weather
        newWeather = [];
        newActiveCards = [];
        addToLog(`${card.name} played! All weather effects cleared.`);
      } else if (card.type === "WeatherBuff" && card.effect) {
        // Add buff card to active cards
        newActiveCards.push({ ...card, duration: card.duration || 1 });
        addToLog(
          `${card.name} played! Elemental effects enhanced for ${card.duration} turns.`
        );
      }

      // Update states
      const newModifiers = calculateElementalModifiers(
        newWeather,
        newActiveCards
      );

      setWeatherState((prev) => ({
        ...prev,
        currentWeather: newWeather,
        activeCards: newActiveCards,
      }));

      setElementalModifiers(newModifiers);

      // Remove card from hand and spend energy
      setPlayerHand((prev) => prev.filter((c) => c.id !== card.id));
      setGameState((prev) => ({
        ...prev,
        energy: prev.energy - card.cost,
        score: prev.score + card.cost * 10, // Score based on card cost
      }));

      setSelectedCard(null);
    },
    [gameState.energy, weatherState.currentWeather, weatherState.activeCards]
  );

  const nextTurn = useCallback(() => {
    const newTurn = gameState.turn + 1;
    const newMonth = Math.min(12, newTurn);
    const seasonIndex = Math.floor((newMonth - 1) / 3);
    const newSeason = SEASONS[seasonIndex] || "Winter";

    // Process card durations
    const updatedActiveCards = weatherState.activeCards
      .map((card) => ({ ...card, duration: (card.duration || 1) - 1 }))
      .filter((card) => (card.duration || 0) > 0);

    // Restore energy
    const newEnergy = Math.min(gameState.maxEnergy, gameState.energy + 2);

    // Draw new card
    if (playerHand.length < 7) {
      const newCard = getRandomCards(1)[0];
      if (newCard) {
        setPlayerHand((prev) => [...prev, newCard]);
      }
    }

    // Check for game end
    const isGameOver = newMonth > 12;
    const victory = isGameOver && gameState.score >= 500; // Victory condition

    // Update modifiers with new active cards
    const newModifiers = calculateElementalModifiers(
      weatherState.currentWeather,
      updatedActiveCards
    );

    setGameState((prev) => ({
      ...prev,
      turn: newTurn,
      month: newMonth,
      season: newSeason,
      energy: newEnergy,
      isGameOver,
      victory,
    }));

    setWeatherState((prev) => ({
      ...prev,
      turn: newTurn,
      month: newMonth,
      season: newSeason,
      activeCards: updatedActiveCards,
    }));

    setElementalModifiers(newModifiers);

    addToLog(`Turn ${newTurn} begins. Energy restored to ${newEnergy}.`);

    if (isGameOver) {
      addToLog(
        victory
          ? "🎉 Victory! You mastered the weather!"
          : "💔 Game Over. Try again!"
      );
    }
  }, [gameState, weatherState, playerHand.length]);

  const restartGame = () => {
    const initialGameState = {
      turn: 1,
      month: 1,
      season: "Winter",
      score: 0,
      energy: 5,
      maxEnergy: 5,
      gameMode: "12-Month Campaign",
      isGameOver: false,
      victory: false,
    };

    const initialWeatherState = {
      currentWeather: ["Cold"] as WeatherType[],
      activeCards: [],
      turn: 1,
      month: 1,
      season: "Winter",
    };

    setGameState(initialGameState);
    setWeatherState(initialWeatherState);
    setPlayerHand(getRandomCards(5));
    setSelectedCard(null);
    setElementalModifiers({ Fire: -20, Ice: 25, Lightning: -5 });
    setGameLog([
      "Game restarted! Welcome to the Weather Engine.",
      "Starting in Winter with Cold weather.",
    ]);
  };

  const calculateDamageExample = (element: ElementType): number => {
    const baseDamage = 100;
    const modifier = elementalModifiers[element];
    return Math.round(baseDamage * (1 + modifier / 100));
  };

  // Show loading state until initialized
  if (!isInitialized) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {gameState.turn}
              </div>
              <div className="text-sm text-gray-500">Turn</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {gameState.score}
              </div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {gameState.energy}/{gameState.maxEnergy}
              </div>
              <div className="text-sm text-gray-500">Energy</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!gameState.isGameOver && (
              <button
                onClick={nextTurn}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Next Turn →
              </button>
            )}
            <button
              onClick={restartGame}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Restart Game
            </button>
          </div>
        </div>

        {/* Game Over Message */}
        {gameState.isGameOver && (
          <div
            className={`text-center p-4 rounded-lg ${
              gameState.victory
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <div className="text-2xl font-bold mb-2">
              {gameState.victory ? "🎉 Victory!" : "💔 Game Over"}
            </div>
            <div>
              {gameState.victory
                ? `Congratulations! You scored ${gameState.score} points and mastered the weather!`
                : `You scored ${gameState.score} points. Try to reach 500 points to win!`}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Display */}
        <div className="lg:col-span-2">
          <WeatherUI
            weatherState={weatherState}
            elementalModifiers={elementalModifiers}
            size="lg"
            layout="detailed"
            animated={true}
            interactive={false}
            showTransitions={true}
          />

          {/* Damage Calculator */}
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              ⚔️ Damage Calculator
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {(["Fire", "Ice", "Lightning"] as ElementType[]).map(
                (element) => (
                  <div
                    key={element}
                    className="text-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="text-2xl mb-2">
                      {element === "Fire"
                        ? "🔥"
                        : element === "Ice"
                        ? "❄️"
                        : "⚡"}
                    </div>
                    <div className="font-medium text-gray-700">{element}</div>
                    <div className="text-sm text-gray-500">
                      100 → {calculateDamageExample(element)}
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        elementalModifiers[element] > 0
                          ? "text-green-600"
                          : elementalModifiers[element] < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {elementalModifiers[element] > 0 ? "+" : ""}
                      {elementalModifiers[element]}%
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Game Log */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📜 Game Log</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {gameLog.map((log, index) => (
              <div
                key={index}
                className="text-sm text-gray-600 p-2 bg-gray-50 rounded"
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player Hand */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">🃏 Your Hand</h3>
          <div className="text-sm text-gray-500">
            {playerHand.length} cards • {gameState.energy} energy available
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          {playerHand.map((card) => (
            <div key={card.id} className="relative">
              <WeatherCard
                card={card}
                size="md"
                interactive={!gameState.isGameOver}
                disabled={gameState.energy < card.cost}
                selected={selectedCard?.id === card.id}
                showDetails={true}
                onPlay={playCard}
                onHover={setSelectedCard}
              />
              {gameState.energy < card.cost && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  Need {card.cost - gameState.energy} more energy
                </div>
              )}
            </div>
          ))}

          {playerHand.length === 0 && (
            <div className="text-gray-400 text-center py-8">
              No cards in hand. Cards will be drawn automatically.
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-3">🎮 How to Play</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <strong>Goal:</strong> Score 500+ points by playing weather cards
            strategically over 12 turns (months).
          </div>
          <div>
            <strong>Energy:</strong> Each card costs energy to play. You gain 2
            energy per turn.
          </div>
          <div>
            <strong>Weather Cards:</strong> Change the active weather to boost
            elemental damage.
          </div>
          <div>
            <strong>Buff Cards:</strong> Provide temporary elemental bonuses
            that stack with weather.
          </div>
          <div>
            <strong>Strategy:</strong> Combine weather and buff effects for
            maximum elemental damage bonuses!
          </div>
          <div>
            <strong>Scoring:</strong> Earn points by playing cards. Higher cost
            cards give more points.
          </div>
        </div>
      </div>
    </div>
  );
}
