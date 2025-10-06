"use client";

import WeatherBattleGame from "@/components/WeatherBattleGame";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ⚔️ Weather Battle Arena ⚔️
          </h1>
          <p className="text-lg text-gray-600">
            Use weather cards to boost your attacks and defeat your opponent!
          </p>
        </div>

        <WeatherBattleGame />
      </div>
    </div>
  );
}
