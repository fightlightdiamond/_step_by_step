/**
 * Sample Game Implementation using Weather Engine
 *
 * This example demonstrates how to integrate the Weather Engine
 * into a complete turn-based game with weather mechanics.
 */

import {
  WeatherManager,
  SeasonManager,
  WeatherCardManager,
  GameModeManager,
  WeatherType,
  ElementType,
  WeatherCard,
  WeatherState,
} from "../index";

// Game entities
interface Player {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  hand: WeatherCard[];
  elementalAffinities: Record<ElementType, number>;
}

interface Spell {
  name: string;
  elementType: ElementType;
  baseDamage: number;
  cost: number;
}

interface GameAction {
  type: "cast-spell" | "play-weather-card" | "end-turn";
  playerId: string;
  targetId?: string;
  spell?: Spell;
  card?: WeatherCard;
}

/**
 * Sample Game Class demonstrating Weather Engine integration
 */
export class WeatherBasedGame {
  private weatherManager: WeatherManager;
  private seasonManager: SeasonManager;
  private cardManager: WeatherCardManager;
  private gameModeManager: GameModeManager;

  private players: Player[] = [];
  private currentTurn: number = 1;
  private currentPlayerIndex: number = 0;
  private gameOver: boolean = false;
  private winner: Player | null = null;

  constructor() {
    this.weatherManager = new WeatherManager();
    this.seasonManager = new SeasonManager();
    this.cardManager = new WeatherCardManager();
    this.gameModeManager = new GameModeManager();
  }

  /**
   * Initialize the game with players and settings
   */
  async initialize(
    playerNames: string[],
    gameMode: string = "12-Month Campaign"
  ) {
    // Set up weather system
    await this.weatherManager.loadConfig();
    this.gameModeManager.setGameMode(gameMode);

    // Create players
    this.players = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      health: 100,
      maxHealth: 100,
      hand: this.generateStartingHand(),
      elementalAffinities: {
        Fire: 0,
        Ice: 0,
        Lightning: 0,
      },
    }));

    // Set initial weather for month 1
    const initialWeather = this.seasonManager.getWeatherForMonth(1);
    this.weatherManager.applyWeather([initialWeather]);

    console.log(`🎮 Game initialized with ${this.players.length} players`);
    console.log(`🌤️  Starting weather: ${initialWeather}`);
    console.log(`🎯 Game mode: ${gameMode}`);
  }

  /**
   * Main game loop
   */
  async playGame(): Promise<Player | null> {
    console.log("\n🚀 Starting Weather-Based Game!");

    while (!this.gameOver) {
      await this.processTurn();
      this.checkWinCondition();

      if (!this.gameOver) {
        this.nextTurn();
      }
    }

    console.log(`\n🏆 Game Over! Winner: ${this.winner?.name || "No winner"}`);
    return this.winner;
  }

  /**
   * Process a single turn
   */
  private async processTurn() {
    console.log(`\n--- Turn ${this.currentTurn} ---`);

    // Update weather based on game mode
    this.updateWeatherForTurn();

    // Display current game state
    this.displayGameState();

    // Each player takes their turn
    for (let i = 0; i < this.players.length && !this.gameOver; i++) {
      const player = this.players[i];
      if (player.health > 0) {
        await this.processPlayerTurn(player);
      }
    }

    // Process card expirations
    this.cardManager.expireCards();
  }

  /**
   * Update weather for the current turn
   */
  private updateWeatherForTurn() {
    const currentMonth = ((this.currentTurn - 1) % 12) + 1;
    const newWeather = this.gameModeManager.processWeatherForTurn(
      this.currentTurn
    );

    if (newWeather.length > 0) {
      console.log(`🌦️  Weather changing to: ${newWeather.join(", ")}`);
      this.weatherManager.applyWeather(newWeather);
    }
  }

  /**
   * Process a single player's turn
   */
  private async processPlayerTurn(player: Player) {
    console.log(
      `\n${player.name}'s turn (Health: ${player.health}/${player.maxHealth})`
    );

    // Simulate player decision making
    const action = this.simulatePlayerAction(player);

    switch (action.type) {
      case "play-weather-card":
        this.handleWeatherCardPlay(player, action.card!);
        break;
      case "cast-spell":
        this.handleSpellCast(player, action.spell!, action.targetId!);
        break;
      case "end-turn":
        console.log(`${player.name} ends their turn`);
        break;
    }

    // Draw a new card
    this.drawCard(player);
  }

  /**
   * Simulate AI player decision making
   */
  private simulatePlayerAction(player: Player): GameAction {
    // Simple AI logic for demonstration
    const availableTargets = this.players.filter(
      (p) => p.id !== player.id && p.health > 0
    );

    // 30% chance to play weather card if available
    if (player.hand.length > 0 && Math.random() < 0.3) {
      const weatherCard = player.hand.find((card) => card.type === "Weather");
      if (weatherCard) {
        return {
          type: "play-weather-card",
          playerId: player.id,
          card: weatherCard,
        };
      }
    }

    // 60% chance to cast spell if targets available
    if (availableTargets.length > 0 && Math.random() < 0.6) {
      const spell = this.getRandomSpell();
      const target =
        availableTargets[Math.floor(Math.random() * availableTargets.length)];

      return {
        type: "cast-spell",
        playerId: player.id,
        targetId: target.id,
        spell,
      };
    }

    // Default: end turn
    return {
      type: "end-turn",
      playerId: player.id,
    };
  }

  /**
   * Handle weather card play
   */
  private handleWeatherCardPlay(player: Player, card: WeatherCard) {
    try {
      const currentWeather = this.weatherManager.getCurrentWeather();

      if (this.cardManager.validateCardPlay(card, currentWeather)) {
        // Play the card
        const newWeather = this.cardManager.playCard(card, currentWeather);

        // Apply weather change
        if (card.type === "BreakWeather") {
          this.weatherManager.resetWeather();
          console.log(
            `⚡ ${player.name} played ${card.name} - Weather cleared!`
          );
        } else if (card.weather) {
          this.weatherManager.applyWeather([card.weather]);
          console.log(
            `🌤️  ${player.name} played ${card.name} - Weather changed to ${card.weather}!`
          );
        }

        // Remove card from hand
        player.hand = player.hand.filter((c) => c.id !== card.id);
      } else {
        console.log(
          `❌ ${player.name} cannot play ${card.name} - Invalid card play`
        );
      }
    } catch (error) {
      console.log(
        `❌ ${player.name} failed to play ${card.name}: ${error.message}`
      );
    }
  }

  /**
   * Handle spell casting with weather effects
   */
  private handleSpellCast(player: Player, spell: Spell, targetId: string) {
    const target = this.players.find((p) => p.id === targetId);
    if (!target) return;

    // Calculate base damage
    let damage = spell.baseDamage;

    // Apply weather modifiers
    const weatherModifiers = this.weatherManager.calculateElementalModifiers();
    const weatherModifier = weatherModifiers[spell.elementType] || 0;

    // Apply weather effect (percentage-based)
    damage = Math.round(damage * (1 + weatherModifier / 100));

    // Apply player elemental affinity
    const playerAffinity = player.elementalAffinities[spell.elementType] || 0;
    damage = Math.round(damage * (1 + playerAffinity / 100));

    // Apply damage
    target.health = Math.max(0, target.health - damage);

    console.log(`⚔️  ${player.name} casts ${spell.name} on ${target.name}`);
    console.log(
      `   Base damage: ${spell.baseDamage}, Weather modifier: ${weatherModifier}%, Final damage: ${damage}`
    );
    console.log(
      `   ${target.name} health: ${target.health}/${target.maxHealth}`
    );

    if (target.health === 0) {
      console.log(`💀 ${target.name} has been defeated!`);
    }
  }

  /**
   * Display current game state
   */
  private displayGameState() {
    const currentWeather = this.weatherManager.getCurrentWeather();
    const modifiers = this.weatherManager.calculateElementalModifiers();
    const currentMonth = ((this.currentTurn - 1) % 12) + 1;
    const season = this.seasonManager.getSeasonForMonth(currentMonth);

    console.log(`📅 Month ${currentMonth} (${season})`);
    console.log(`🌤️  Weather: ${currentWeather.join(", ")}`);
    console.log(
      `🔥 Fire: ${modifiers.Fire > 0 ? "+" : ""}${modifiers.Fire}% | ❄️  Ice: ${
        modifiers.Ice > 0 ? "+" : ""
      }${modifiers.Ice}% | ⚡ Lightning: ${modifiers.Lightning > 0 ? "+" : ""}${
        modifiers.Lightning
      }%`
    );

    // Show active weather cards
    const activeCards = this.cardManager.getActiveCards();
    if (activeCards.length > 0) {
      console.log(
        `🃏 Active cards: ${activeCards.map((c) => c.name).join(", ")}`
      );
    }
  }

  /**
   * Generate starting hand for a player
   */
  private generateStartingHand(): WeatherCard[] {
    const startingCards: WeatherCard[] = [
      {
        id: "sunny-1",
        type: "Weather",
        name: "Sunny Day",
        description: "Changes weather to sunny",
        weather: "Sunny",
        cost: 2,
      },
      {
        id: "storm-1",
        type: "Weather",
        name: "Storm Call",
        description: "Summons a storm",
        weather: "Stormy",
        cost: 3,
      },
      {
        id: "clear-1",
        type: "BreakWeather",
        name: "Clear Skies",
        description: "Removes all weather effects",
        cost: 1,
      },
    ];

    return startingCards.slice(0, 2); // Start with 2 random cards
  }

  /**
   * Draw a new card for a player
   */
  private drawCard(player: Player) {
    if (player.hand.length < 5) {
      const newCard = this.generateRandomCard();
      player.hand.push(newCard);
      console.log(`📇 ${player.name} draws ${newCard.name}`);
    }
  }

  /**
   * Generate a random weather card
   */
  private generateRandomCard(): WeatherCard {
    const cardTemplates = [
      { weather: "Sunny", name: "Sunny Day", cost: 2 },
      { weather: "Rainy", name: "Rain Dance", cost: 2 },
      { weather: "Stormy", name: "Storm Call", cost: 3 },
      { weather: "Snowy", name: "Blizzard", cost: 3 },
      { weather: "Hot", name: "Heat Wave", cost: 2 },
      { weather: "Cold", name: "Frost", cost: 2 },
    ];

    const template =
      cardTemplates[Math.floor(Math.random() * cardTemplates.length)];

    return {
      id: `card-${Date.now()}-${Math.random()}`,
      type: "Weather",
      name: template.name,
      description: `Changes weather to ${template.weather}`,
      weather: template.weather as WeatherType,
      cost: template.cost,
    };
  }

  /**
   * Get a random spell for AI players
   */
  private getRandomSpell(): Spell {
    const spells: Spell[] = [
      { name: "Fireball", elementType: "Fire", baseDamage: 25, cost: 3 },
      { name: "Ice Shard", elementType: "Ice", baseDamage: 20, cost: 2 },
      {
        name: "Lightning Bolt",
        elementType: "Lightning",
        baseDamage: 30,
        cost: 4,
      },
      { name: "Flame Strike", elementType: "Fire", baseDamage: 35, cost: 5 },
      { name: "Frost Bite", elementType: "Ice", baseDamage: 15, cost: 2 },
      {
        name: "Thunder Clap",
        elementType: "Lightning",
        baseDamage: 22,
        cost: 3,
      },
    ];

    return spells[Math.floor(Math.random() * spells.length)];
  }

  /**
   * Check if game should end
   */
  private checkWinCondition() {
    const alivePlayers = this.players.filter((p) => p.health > 0);

    if (alivePlayers.length <= 1) {
      this.gameOver = true;
      this.winner = alivePlayers[0] || null;
    } else if (this.currentTurn >= 12) {
      // Game ends after 12 turns (1 year)
      this.gameOver = true;
      // Winner is player with most health
      this.winner = this.players.reduce((prev, current) =>
        prev.health > current.health ? prev : current
      );
    }
  }

  /**
   * Advance to next turn
   */
  private nextTurn() {
    this.currentTurn++;
    this.currentPlayerIndex = 0;
  }

  /**
   * Get current game statistics
   */
  getGameStats() {
    return {
      turn: this.currentTurn,
      month: ((this.currentTurn - 1) % 12) + 1,
      season: this.seasonManager.getSeasonForMonth(
        ((this.currentTurn - 1) % 12) + 1
      ),
      weather: this.weatherManager.getCurrentWeather(),
      modifiers: this.weatherManager.calculateElementalModifiers(),
      players: this.players.map((p) => ({
        name: p.name,
        health: p.health,
        handSize: p.hand.length,
      })),
      activeCards: this.cardManager.getActiveCards().length,
    };
  }
}

/**
 * Example usage and demo
 */
export async function runSampleGame() {
  console.log("🎮 Weather Engine Sample Game Demo");
  console.log("=====================================\n");

  const game = new WeatherBasedGame();

  try {
    // Initialize game with 3 AI players
    await game.initialize(["Alice", "Bob", "Charlie"], "12-Month Campaign");

    // Play the game
    const winner = await game.playGame();

    // Show final statistics
    console.log("\n📊 Final Game Statistics:");
    console.log(JSON.stringify(game.getGameStats(), null, 2));
  } catch (error) {
    console.error("Game error:", error);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runSampleGame();
}
