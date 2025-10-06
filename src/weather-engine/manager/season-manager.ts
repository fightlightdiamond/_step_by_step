/**
 * Season Manager - Handles seasonal weather patterns and monthly weather pools
 */

import { WeatherType, SeasonType, WeatherPool } from "../types";
import { MONTH_TO_SEASON, SEASON_TYPES, WEATHER_TYPES } from "../constants";
import {
  WeatherSelectionAlgorithms,
  WeatherSelectionConfig,
  WeatherSelectionContext,
  WeatherSelectionResult,
} from "../algorithms/weather-selection";

/**
 * Configuration for seasonal weather pools with weights
 */
export interface SeasonalWeatherConfig {
  [key: string]: Record<WeatherType, number>;
}

/**
 * Default seasonal weather pools with probability weights
 */
export const DEFAULT_SEASONAL_POOLS: SeasonalWeatherConfig = {
  Winter: {
    Cold: 25,
    Snowy: 25,
    Foggy: 15,
    Windy: 15,
    Cloudy: 10,
    Stormy: 10,
    Sunny: 0,
    Rainy: 0,
    Hot: 0,
    Warm: 0,
    Cool: 0,
    Humid: 0,
  },
  Spring: {
    Rainy: 20,
    Cloudy: 20,
    Windy: 15,
    Warm: 15,
    Cool: 10,
    Sunny: 10,
    Foggy: 5,
    Stormy: 5,
    Cold: 0,
    Snowy: 0,
    Hot: 0,
    Humid: 0,
  },
  Summer: {
    Hot: 25,
    Sunny: 25,
    Humid: 15,
    Warm: 15,
    Cloudy: 10,
    Stormy: 10,
    Cold: 0,
    Snowy: 0,
    Foggy: 0,
    Windy: 0,
    Cool: 0,
    Rainy: 0,
  },
  Autumn: {
    Cool: 20,
    Windy: 20,
    Cloudy: 15,
    Rainy: 15,
    Foggy: 10,
    Warm: 10,
    Stormy: 10,
    Cold: 0,
    Snowy: 0,
    Hot: 0,
    Sunny: 0,
    Humid: 0,
  },
};

/**
 * SeasonManager handles seasonal weather patterns and monthly weather selection
 */
export class SeasonManager {
  private monthlyWeatherPools: Map<number, WeatherPool>;
  private seasonalTransitions: Map<SeasonType, WeatherType[]>;
  private seasonalConfig: SeasonalWeatherConfig;

  constructor(seasonalConfig: SeasonalWeatherConfig = DEFAULT_SEASONAL_POOLS) {
    this.seasonalConfig = seasonalConfig;
    this.monthlyWeatherPools = new Map();
    this.seasonalTransitions = new Map();

    this.initializeWeatherPools();
    this.initializeSeasonalTransitions();
  }

  /**
   * Get weather for a specific month using weighted random selection
   */
  public getWeatherForMonth(month: number): WeatherType {
    if (month < 1 || month > 12) {
      throw new Error(`Invalid month: ${month}. Must be between 1 and 12.`);
    }

    const weatherPool = this.monthlyWeatherPools.get(month);
    if (!weatherPool) {
      throw new Error(`No weather pool found for month ${month}`);
    }

    return this.selectWeatherByProbability(weatherPool);
  }

  /**
   * Get the season for a specific month
   */
  public getSeasonForMonth(month: number): SeasonType {
    if (month < 1 || month > 12) {
      throw new Error(`Invalid month: ${month}. Must be between 1 and 12.`);
    }

    return MONTH_TO_SEASON[month];
  }

  /**
   * Get all possible weather types for a season
   */
  public getWeatherPool(season: SeasonType): WeatherType[] {
    const transitions = this.seasonalTransitions.get(season);
    if (!transitions) {
      throw new Error(`No weather pool found for season ${season}`);
    }
    return [...transitions];
  }

  /**
   * Get weather for a specific season using weighted random selection
   */
  public getWeatherForSeason(season: SeasonType): WeatherType {
    const seasonConfig = this.seasonalConfig[season];
    if (!seasonConfig) {
      throw new Error(`No configuration found for season ${season}`);
    }

    const weatherPool = this.createWeatherPool(seasonConfig);
    return this.selectWeatherByProbability(weatherPool);
  }

  /**
   * Get the weather pool with weights for a specific season
   */
  public getSeasonalWeatherPool(season: SeasonType): WeatherPool {
    const seasonConfig = this.seasonalConfig[season];
    if (!seasonConfig) {
      throw new Error(`No configuration found for season ${season}`);
    }

    return this.createWeatherPool(seasonConfig);
  }

  /**
   * Update seasonal configuration
   */
  public updateSeasonalConfig(newConfig: Partial<SeasonalWeatherConfig>): void {
    this.seasonalConfig = { ...this.seasonalConfig, ...newConfig };
    this.initializeWeatherPools();
    this.initializeSeasonalTransitions();
  }

  /**
   * Get probability of a specific weather type in a given season
   */
  public getWeatherProbability(
    season: SeasonType,
    weather: WeatherType
  ): number {
    const seasonConfig = this.seasonalConfig[season];
    if (!seasonConfig) {
      return 0;
    }

    const weight = seasonConfig[weather] || 0;
    const totalWeight = Object.values(seasonConfig).reduce(
      (sum, w) => sum + w,
      0
    );

    return totalWeight > 0 ? weight / totalWeight : 0;
  }

  /**
   * Get weather using advanced selection algorithms
   */
  public getWeatherWithAlgorithm(
    month: number,
    algorithm: "basic" | "transition" | "pattern" | "balanced" = "basic",
    context?: Partial<WeatherSelectionContext>
  ): WeatherSelectionResult {
    if (month < 1 || month > 12) {
      throw new Error(`Invalid month: ${month}. Must be between 1 and 12.`);
    }

    const selectionConfig: WeatherSelectionConfig = {
      seasonalWeights: this.convertToSelectionConfig(),
      monthlyAdjustments: this.generateMonthlyAdjustments(),
      transitionMatrix: this.generateTransitionMatrix(),
    };

    const algorithms = new WeatherSelectionAlgorithms(selectionConfig);
    return algorithms.generateMonthWeather(month, algorithm, context);
  }

  /**
   * Generate multiple weather options with probabilities
   */
  public getWeatherOptions(
    month: number,
    count: number = 3
  ): WeatherSelectionResult[] {
    if (month < 1 || month > 12) {
      throw new Error(`Invalid month: ${month}. Must be between 1 and 12.`);
    }

    const season = this.getSeasonForMonth(month);
    const seasonConfig = this.seasonalConfig[season];
    if (!seasonConfig) {
      throw new Error(`No configuration found for season ${season}`);
    }

    const results: WeatherSelectionResult[] = [];
    const weatherPool = this.createWeatherPool(seasonConfig);

    // Sort weather types by weight (descending)
    const sortedWeather = Array.from(weatherPool.weights.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, count);

    for (const [weather, weight] of sortedWeather) {
      const probability = weight / weatherPool.totalWeight;
      results.push({
        weather,
        probability,
        algorithm: "probability_ranking",
        metadata: {
          seasonalWeight: weight,
          monthlyAdjustment: 0,
          transitionBonus: 0,
          finalWeight: weight,
        },
      });
    }

    return results;
  }

  /**
   * Predict weather patterns for multiple months
   */
  public predictWeatherPattern(
    startMonth: number,
    monthCount: number,
    algorithm: "basic" | "transition" | "pattern" | "balanced" = "basic"
  ): WeatherSelectionResult[] {
    if (startMonth < 1 || startMonth > 12) {
      throw new Error(`Invalid start month: ${startMonth}`);
    }

    const results: WeatherSelectionResult[] = [];
    const weatherHistory: WeatherType[][] = [];
    let previousWeather: WeatherType[] = [];

    for (let i = 0; i < monthCount; i++) {
      const currentMonth = ((startMonth - 1 + i) % 12) + 1;
      const context: Partial<WeatherSelectionContext> = {
        month: currentMonth,
        turn: i + 1,
        previousWeather,
        weatherHistory: [...weatherHistory],
      };

      const result = this.getWeatherWithAlgorithm(
        currentMonth,
        algorithm,
        context
      );
      results.push(result);

      // Update history for next iteration
      previousWeather = [result.weather];
      weatherHistory.push([result.weather]);
    }

    return results;
  }

  /**
   * Initialize weather pools for all months
   */
  private initializeWeatherPools(): void {
    this.monthlyWeatherPools.clear();

    for (let month = 1; month <= 12; month++) {
      const season = this.getSeasonForMonth(month);
      const seasonConfig = this.seasonalConfig[season];

      if (seasonConfig) {
        const weatherPool = this.createWeatherPool(seasonConfig);
        this.monthlyWeatherPools.set(month, weatherPool);
      }
    }
  }

  /**
   * Initialize seasonal transitions (available weather types per season)
   */
  private initializeSeasonalTransitions(): void {
    this.seasonalTransitions.clear();

    for (const season of SEASON_TYPES) {
      const seasonConfig = this.seasonalConfig[season];
      if (seasonConfig) {
        const availableWeather = Object.entries(seasonConfig)
          .filter(([_, weight]) => weight > 0)
          .map(([weather, _]) => weather as WeatherType);

        this.seasonalTransitions.set(season, availableWeather);
      }
    }
  }

  /**
   * Create a weather pool from configuration
   */
  private createWeatherPool(config: Record<WeatherType, number>): WeatherPool {
    const weights = new Map<WeatherType, number>();
    let totalWeight = 0;

    for (const [weather, weight] of Object.entries(config)) {
      if (weight > 0) {
        weights.set(weather as WeatherType, weight);
        totalWeight += weight;
      }
    }

    return {
      weights,
      totalWeight,
    };
  }

  /**
   * Select weather using weighted random selection
   */
  private selectWeatherByProbability(pool: WeatherPool): WeatherType {
    if (pool.totalWeight === 0) {
      throw new Error("Cannot select weather from empty pool");
    }

    const random = Math.random() * pool.totalWeight;
    let currentWeight = 0;

    for (const [weather, weight] of pool.weights.entries()) {
      currentWeight += weight;
      if (random <= currentWeight) {
        return weather;
      }
    }

    // Fallback to first weather type (should not happen with proper weights)
    const firstWeather = pool.weights.keys().next().value;
    if (!firstWeather) {
      throw new Error("No weather types available in pool");
    }

    return firstWeather;
  }

  /**
   * Convert seasonal config to selection algorithm format
   */
  private convertToSelectionConfig(): Record<
    SeasonType,
    Record<WeatherType, number>
  > {
    const result: Record<SeasonType, Record<WeatherType, number>> = {} as any;

    for (const season of SEASON_TYPES) {
      const seasonConfig = this.seasonalConfig[season];
      if (seasonConfig) {
        result[season] = { ...seasonConfig };
      }
    }

    return result;
  }

  /**
   * Generate monthly adjustments for fine-tuning seasonal weights
   */
  private generateMonthlyAdjustments(): Record<
    number,
    Partial<Record<WeatherType, number>>
  > {
    const adjustments: Record<
      number,
      Partial<Record<WeatherType, number>>
    > = {};

    // Add subtle monthly variations within seasons
    // Winter months (Dec, Jan, Feb)
    adjustments[12] = { Cold: 5, Snowy: 5, Warm: -10 }; // Early winter
    adjustments[1] = { Cold: 10, Snowy: 10, Warm: -15 }; // Peak winter
    adjustments[2] = { Cold: 5, Snowy: 0, Warm: -5 }; // Late winter

    // Spring months (Mar, Apr, May)
    adjustments[3] = { Cool: 5, Rainy: 5, Cold: -5 }; // Early spring
    adjustments[4] = { Warm: 5, Sunny: 5, Cold: -10 }; // Mid spring
    adjustments[5] = { Warm: 10, Sunny: 5, Cool: -5 }; // Late spring

    // Summer months (Jun, Jul, Aug)
    adjustments[6] = { Hot: 5, Sunny: 5, Cool: -10 }; // Early summer
    adjustments[7] = { Hot: 10, Humid: 5, Cool: -15 }; // Peak summer
    adjustments[8] = { Hot: 5, Humid: 0, Warm: 5 }; // Late summer

    // Autumn months (Sep, Oct, Nov)
    adjustments[9] = { Cool: 5, Windy: 5, Hot: -10 }; // Early autumn
    adjustments[10] = { Cool: 10, Foggy: 5, Warm: -5 }; // Mid autumn
    adjustments[11] = { Cold: 5, Foggy: 5, Warm: -10 }; // Late autumn

    return adjustments;
  }

  /**
   * Generate transition matrix for weather continuity
   */
  private generateTransitionMatrix(): Record<
    WeatherType,
    Record<WeatherType, number>
  > {
    const matrix: Record<WeatherType, Record<WeatherType, number>> = {} as any;

    // Define weather transition bonuses (how likely one weather follows another)
    const transitions: Array<[WeatherType, WeatherType, number]> = [
      // Sunny weather transitions
      ["Sunny", "Warm", 5],
      ["Sunny", "Hot", 3],
      ["Sunny", "Cloudy", 2],

      // Cloudy weather transitions
      ["Cloudy", "Rainy", 5],
      ["Cloudy", "Stormy", 3],
      ["Cloudy", "Foggy", 2],

      // Rainy weather transitions
      ["Rainy", "Cloudy", 4],
      ["Rainy", "Stormy", 3],
      ["Rainy", "Cool", 2],

      // Cold weather transitions
      ["Cold", "Snowy", 5],
      ["Cold", "Foggy", 3],
      ["Cold", "Windy", 2],

      // Hot weather transitions
      ["Hot", "Sunny", 4],
      ["Hot", "Humid", 5],
      ["Hot", "Stormy", 2],

      // Stormy weather transitions
      ["Stormy", "Rainy", 4],
      ["Stormy", "Windy", 3],
      ["Stormy", "Cloudy", 2],
    ];

    // Initialize matrix
    for (const weather of WEATHER_TYPES) {
      matrix[weather] = {} as Record<WeatherType, number>;
      for (const nextWeather of WEATHER_TYPES) {
        matrix[weather][nextWeather] = 0;
      }
    }

    // Apply transition bonuses
    for (const [from, to, bonus] of transitions) {
      matrix[from][to] = bonus;
    }

    return matrix;
  }
}
