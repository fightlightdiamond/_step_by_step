"use client";

import React, { useState, useEffect } from "react";
import {
  WeatherType,
  ElementType,
  WeatherCard as WeatherCardType,
} from "@/weather-engine/types";

interface Hero {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  baseAtk: number;
  currentAtk: number;
  element: ElementType;
  avatar: string;
}

interface GameState {
  turn: number;
  currentPlayer: 1 | 2;
  phase: "draw" | "play" | "battle" | "end";
  winner: number | null;
  activeWeather: WeatherType[];
}

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

const SAMPLE_CARDS: WeatherCardType[] = [
  {
    id: "sunny-day",
    type: "Weather",
    name: "Sunny Day",
    description: "Fire attacks +20%, Ice attacks -10%",
    weather: "Sunny",
    cost: 2,
  },
  {
    id: "storm-call",
    type: "Weather",
    name: "Storm Call",
    description: "Lightning attacks +25%, Fire attacks -15%",
    weather: "Stormy",
    cost: 3,
  },
  {
    id: "blizzard",
    type: "Weather",
    name: "Blizzard",
    description: "Ice attacks +20%, Fire attacks -25%",
    weather: "Snowy",
    cost: 3,
  },
  {
    id: "clear-skies",
    type: "BreakWeather",
    name: "Clear Skies",
    description: "Remove all weather effects",
    cost: 1,
  },
  {
    id: "fire-boost",
    type: "WeatherBuff",
    name: "Fire Boost",
    description: "Fire attacks +15% for 2 turns",
    effect: { Fire: 15 },
    duration: 2,
    cost: 2,
  },
  {
    id: "ice-armor",
    type: "WeatherBuff",
    name: "Ice Armor",
    description: "Ice attacks +12% for 3 turns",
    effect: { Ice: 12 },
    duration: 3,
    cost: 2,
  },
];

export default function WeatherBattleGame() {
  const [gameState, setGameState] = useState<GameState>({
    turn: 1,
    currentPlayer: 1,
    phase: "play",
    winner: null,
    activeWeather: [],
  });

  const [heroes, setHeroes] = useState<[Hero, Hero]>([
    {
      id: "hero1",
      name: "Fire Knight",
      maxHp: 100,
      currentHp: 100,
      baseAtk: 25,
      currentAtk: 25,
      element: "Fire",
      avatar: "🔥⚔️",
    },
    {
      id: "hero2",
      name: "Ice Mage",
      maxHp: 100,
      currentHp: 100,
      baseAtk: 25,
      currentAtk: 25,
      element: "Ice",
      avatar: "❄️🧙",
    },
  ]);

  const [playerHands, setPlayerHands] = useState<
    [WeatherCardType[], WeatherCardType[]]
  >([[], []]);

  const [energy, setEnergy] = useState<[number, number]>([3, 3]);
  const [selectedCard, setSelectedCard] = useState<WeatherCardType | null>(
    null
  );
  const [battleLog, setBattleLog] = useState<string[]>([
    "⚔️ Weather Battle begins!",
    "🔥 Fire Knight vs ❄️ Ice Mage",
  ]);

  const [activeBuffs, setActiveBuffs] = useState<WeatherCardType[]>([]);

  // Initialize game
  useEffect(() => {
    const timer = setTimeout(() => {
      // Deal initial cards
      const player1Cards = getRandomCards(4);
      const player2Cards = getRandomCards(4);
      setPlayerHands([player1Cards, player2Cards]);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getRandomCards = (count: number): WeatherCardType[] => {
    const shuffled = [...SAMPLE_CARDS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  };

  const calculateDamage = (attacker: Hero, defender: Hero): number => {
    let damage = attacker.baseAtk;

    // Apply weather effects
    gameState.activeWeather.forEach((weather) => {
      const effects = WEATHER_EFFECTS[weather];
      if (effects && effects[attacker.element]) {
        damage += Math.round(
          attacker.baseAtk * (effects[attacker.element] / 100)
        );
      }
    });

    // Apply buff effects
    activeBuffs.forEach((buff) => {
      if (buff.effect && buff.effect[attacker.element]) {
        damage += Math.round(
          attacker.baseAtk * (buff.effect[attacker.element] / 100)
        );
      }
    });

    return Math.max(1, damage); // Minimum 1 damage
  };

  const playCard = (card: WeatherCardType) => {
    const currentPlayerIndex = gameState.currentPlayer - 1;

    if (energy[currentPlayerIndex] < card.cost) {
      addToBattleLog(
        `❌ Not enough energy! Need ${card.cost}, have ${energy[currentPlayerIndex]}`
      );
      return;
    }

    // Apply card effect
    if (card.type === "Weather" && card.weather) {
      setGameState((prev) => ({
        ...prev,
        activeWeather: [card.weather!],
      }));
      addToBattleLog(
        `🌤️ ${card.name} played! Weather changed to ${card.weather}`
      );
    } else if (card.type === "BreakWeather") {
      setGameState((prev) => ({
        ...prev,
        activeWeather: [],
      }));
      setActiveBuffs([]);
      addToBattleLog(`☀️ ${card.name} played! All weather effects cleared`);
    } else if (card.type === "WeatherBuff" && card.effect) {
      setActiveBuffs((prev) => [...prev, card]);
      addToBattleLog(
        `✨ ${card.name} played! Buff active for ${card.duration} turns`
      );
    }

    // Remove card from hand and spend energy
    setPlayerHands((prev) => {
      const newHands: [WeatherCardType[], WeatherCardType[]] = [...prev];
      newHands[currentPlayerIndex] = newHands[currentPlayerIndex].filter(
        (c) => c.id !== card.id
      );
      return newHands;
    });

    setEnergy((prev) => {
      const newEnergy: [number, number] = [...prev];
      newEnergy[currentPlayerIndex] -= card.cost;
      return newEnergy;
    });

    setSelectedCard(null);
  };

  const attack = () => {
    const attackerIndex = gameState.currentPlayer - 1;
    const defenderIndex = attackerIndex === 0 ? 1 : 0;

    const attacker = heroes[attackerIndex];
    const defender = heroes[defenderIndex];

    const damage = calculateDamage(attacker, defender);

    // Apply damage
    setHeroes((prev) => {
      const newHeroes: [Hero, Hero] = [...prev];
      newHeroes[defenderIndex] = {
        ...newHeroes[defenderIndex],
        currentHp: Math.max(0, newHeroes[defenderIndex].currentHp - damage),
      };
      return newHeroes;
    });

    addToBattleLog(
      `⚔️ ${attacker.name} attacks ${defender.name} for ${damage} damage!`
    );

    // Check for winner
    if (defender.currentHp - damage <= 0) {
      setGameState((prev) => ({
        ...prev,
        winner: gameState.currentPlayer,
        phase: "end",
      }));
      addToBattleLog(`🏆 ${attacker.name} wins!`);
      return;
    }

    // End turn
    endTurn();
  };

  const endTurn = () => {
    // Process buff durations
    setActiveBuffs((prev) =>
      prev
        .map((buff) => ({ ...buff, duration: (buff.duration || 1) - 1 }))
        .filter((buff) => (buff.duration || 0) > 0)
    );

    // Switch player and restore energy
    setGameState((prev) => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
      turn: prev.currentPlayer === 2 ? prev.turn + 1 : prev.turn,
      phase: "play",
    }));

    setEnergy((prev) => {
      const newEnergy: [number, number] = [...prev];
      const nextPlayerIndex = gameState.currentPlayer === 1 ? 1 : 0;
      newEnergy[nextPlayerIndex] = Math.min(5, newEnergy[nextPlayerIndex] + 2);
      return newEnergy;
    });

    // Draw a card
    const nextPlayerIndex = gameState.currentPlayer === 1 ? 1 : 0;
    if (playerHands[nextPlayerIndex].length < 6) {
      const newCard = getRandomCards(1)[0];
      if (newCard) {
        setPlayerHands((prev) => {
          const newHands: [WeatherCardType[], WeatherCardType[]] = [...prev];
          newHands[nextPlayerIndex] = [...newHands[nextPlayerIndex], newCard];
          return newHands;
        });
      }
    }

    const nextPlayerName =
      gameState.currentPlayer === 1 ? heroes[1].name : heroes[0].name;
    addToBattleLog(`🔄 ${nextPlayerName}'s turn begins`);
  };

  const addToBattleLog = (message: string) => {
    setBattleLog((prev) => [
      ...prev.slice(-7),
      `Turn ${gameState.turn}: ${message}`,
    ]);
  };

  const restartGame = () => {
    setGameState({
      turn: 1,
      currentPlayer: 1,
      phase: "play",
      winner: null,
      activeWeather: [],
    });

    setHeroes([
      {
        id: "hero1",
        name: "Fire Knight",
        maxHp: 100,
        currentHp: 100,
        baseAtk: 25,
        currentAtk: 25,
        element: "Fire",
        avatar: "🔥⚔️",
      },
      {
        id: "hero2",
        name: "Ice Mage",
        maxHp: 100,
        currentHp: 100,
        baseAtk: 25,
        currentAtk: 25,
        element: "Ice",
        avatar: "❄️🧙",
      },
    ]);

    setPlayerHands([getRandomCards(4), getRandomCards(4)]);
    setEnergy([3, 3]);
    setActiveBuffs([]);
    setBattleLog([
      "⚔️ Weather Battle begins!",
      "🔥 Fire Knight vs ❄️ Ice Mage",
    ]);
  };

  const currentPlayerIndex = gameState.currentPlayer - 1;
  const currentHero = heroes[currentPlayerIndex];
  const enemyHero = heroes[currentPlayerIndex === 0 ? 1 : 0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              Turn {gameState.turn}
            </div>
            <div className="text-sm text-gray-500">
              {gameState.winner ? "Game Over" : `${currentHero.name}'s Turn`}
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              Weather:{" "}
              {gameState.activeWeather.length > 0
                ? gameState.activeWeather.join(", ")
                : "Clear"}
            </div>
            <div className="text-sm text-gray-500">
              Active Buffs: {activeBuffs.length}
            </div>
          </div>

          <button
            onClick={restartGame}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            New Game
          </button>
        </div>

        {gameState.winner && (
          <div className="mt-4 text-center p-4 bg-green-100 text-green-800 rounded-lg">
            <div className="text-2xl font-bold">
              🏆 {heroes[gameState.winner - 1].name} Wins!
            </div>
          </div>
        )}
      </div>

      {/* Battle Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heroes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Enemy Hero */}
          <div
            className={`bg-white rounded-xl shadow-lg p-6 ${
              currentPlayerIndex === 1 ? "ring-2 ring-red-400" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{enemyHero.avatar}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {enemyHero.name}
                  </h3>
                  <div className="text-sm text-gray-600">
                    Player {currentPlayerIndex === 0 ? 2 : 1}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  ATK: {enemyHero.baseAtk}
                </div>
                <div className="text-sm text-gray-600">
                  Element: {enemyHero.element}
                </div>
              </div>
            </div>

            {/* HP Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>HP</span>
                <span>
                  {enemyHero.currentHp}/{enemyHero.maxHp}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-red-500 h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${(enemyHero.currentHp / enemyHero.maxHp) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Current Player Hero */}
          <div
            className={`bg-white rounded-xl shadow-lg p-6 ${
              currentPlayerIndex === 0 ? "ring-2 ring-blue-400" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{currentHero.avatar}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {currentHero.name}
                  </h3>
                  <div className="text-sm text-gray-600">
                    Player {gameState.currentPlayer} (You)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  ATK: {currentHero.baseAtk}
                </div>
                <div className="text-sm text-gray-600">
                  Element: {currentHero.element}
                </div>
                <div className="text-sm font-bold text-blue-600">
                  Energy: {energy[currentPlayerIndex]}
                </div>
              </div>
            </div>

            {/* HP Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>HP</span>
                <span>
                  {currentHero.currentHp}/{currentHero.maxHp}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      (currentHero.currentHp / currentHero.maxHp) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            {!gameState.winner && (
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={attack}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  ⚔️ Attack ({calculateDamage(currentHero, enemyHero)} dmg)
                </button>
                <button
                  onClick={endTurn}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  End Turn
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            ⚔️ Battle Log
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {battleLog.map((log, index) => (
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
      {!gameState.winner && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">🃏 Your Cards</h3>
            <div className="text-sm text-gray-500">
              {playerHands[currentPlayerIndex].length} cards •{" "}
              {energy[currentPlayerIndex]} energy
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {playerHands[currentPlayerIndex].map((card) => (
              <div
                key={card.id}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedCard?.id === card.id
                    ? "border-blue-400 bg-blue-50"
                    : energy[currentPlayerIndex] >= card.cost
                    ? "border-gray-300 hover:border-blue-300 hover:shadow-md"
                    : "border-gray-200 opacity-50 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (energy[currentPlayerIndex] >= card.cost) {
                    if (selectedCard?.id === card.id) {
                      playCard(card);
                    } else {
                      setSelectedCard(card);
                    }
                  }
                }}
              >
                <div className="w-32">
                  <div className="text-center mb-2">
                    <div className="font-bold text-sm">{card.name}</div>
                    <div className="text-xs text-gray-600">{card.type}</div>
                  </div>
                  <div className="text-xs text-gray-700 mb-2 h-12 overflow-hidden">
                    {card.description}
                  </div>
                  <div className="text-center">
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                      {card.cost} ⚡
                    </span>
                  </div>
                </div>

                {selectedCard?.id === card.id && (
                  <div className="absolute inset-0 bg-blue-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-800 font-bold text-xs">
                      Click to Play
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Rules */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-3">🎮 How to Play</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <strong>Goal:</strong> Reduce enemy hero's HP to 0 to win the
            battle.
          </div>
          <div>
            <strong>Energy:</strong> Spend energy to play weather cards. Gain +2
            energy each turn.
          </div>
          <div>
            <strong>Weather Cards:</strong> Change weather to boost/reduce
            elemental damage.
          </div>
          <div>
            <strong>Attack:</strong> Deal damage based on your ATK +
            weather/buff modifiers.
          </div>
          <div>
            <strong>Elements:</strong> Fire Knight uses Fire attacks, Ice Mage
            uses Ice attacks.
          </div>
          <div>
            <strong>Strategy:</strong> Use weather cards to boost your element
            and weaken enemy's!
          </div>
        </div>
      </div>
    </div>
  );
}
