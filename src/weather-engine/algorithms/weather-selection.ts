/**
 * Weather Selection Algorithms
 * Advanced algorithms for selecting weather based on various criteria
 */

import { WeatherType, SeasonType, WeatherPool } from "../types";
import { MONTH_TO_SEASON } from "../constants";

/**
 * Configuration for weather selection algorithms
 */
export interface WeatherSelectionConfig {
  /** Base seasonal probabilities */
  seasonalWeights: Record<SeasonType, Record<WeatherType, number>>;

  /** Monthly adjustments to seasonal weights */
  monthlyAdjustments?: Record<number, Partial<Record<WeatherType, number>>>;

  /** Weather transition probabilities (current weather affects next weather) */
  transitionMatrix?: Record<WeatherType, Record<WeatherType, number>>;

  /** Minimum and maximum weights for any weather type */
  weightLimits?: {
    min: number;
    max: number;
  };

  /** Randomness factor (0 = deterministic, 1 = fully random) */
  randomnessFactor?: number;
}

/**
 * Weather selection context for advanced algorithms
 */
export interface WeatherSelectionContext {
  /** Current month (1-12) */
  month: number;

  /** Current turn in the game */
  turn: number;

  /** Previous weather types (for transition-based selection) */
  previousWeather?: WeatherType[];

  /** Weather history for pattern analysis */
  weatherHistory?: WeatherType[][];

  /** Game mode specific modifiers */
  gameModeModifiers?: Record<string, number>;
}

/**
 * Result of weather selection with metadata
 */
export interface WeatherSelectionResult {
  /** Selected weather type */
  weather: WeatherType;

  /** Probability of this selection (0-1) */
  probability: number;

  /** Algorithm used for selection */
  algorithm: string;

  /** Additional metadata about the selection */
  metadata: {
    seasonalWeight: number;
    monthlyAdjustment: number;
    transitionBonus: number;
    finalWeight: number;
  };
}

/**
 * Advanced weather selection algorithms
 */
export class WeatherSelectionAlgorithms {
  private config: WeatherSelectionConfig;

  constructor(config: WeatherSelectionConfig) {
    this.config = {
      weightLimits: { min: 0, max: 100 },
      randomnessFactor: 1.0,
      ...config,
    };
  }

  /**
   * Basic weighted random selection based on seasonal pools
   */
  public selectBasicWeighted(
    season: SeasonType,
    context?: Partial<WeatherSelectionContext>
  ): WeatherSelectionResult {
    const seasonalWeights = this.config.seasonalWeights[season];
    if (!seasonalWeights) {
      throw new Error(`No seasonal weights configured for ${season}`);
    }

    const adjustedWeights = this.applyMonthlyAdjustments(
      seasonalWeights,
      context?.month || 1
    );

    const selectedWeather = this.performWeightedSelection(adjustedWeights);
    const totalWeight = Object.values(adjustedWeights).reduce(
      (sum, w) => sum + w,
      0
    );
    const probability = adjustedWeights[selectedWeather] / totalWeight;

    return {
      weather: selectedWeather,
      probability,
      algorithm: "basic_weighted",
      metadata: {
        seasonalWeight: seasonalWeights[selectedWeather] || 0,
        monthlyAdjustment: this.getMonthlyAdjustment(
          selectedWeather,
          context?.month || 1
        ),
        transitionBonus: 0,
        finalWeight: adjustedWeights[selectedWeather],
      },
    };
  }

  /**
   * Transition-based selection considering previous weather
   */
  public selectWithTransitions(
    season: SeasonType,
    context: WeatherSelectionContext
  ): WeatherSelectionResult {
    const baseWeights = this.config.seasonalWeights[season];
    if (!baseWeights) {
      throw new Error(`No seasonal weights configured for ${season}`);
    }

    let adjustedWeights = this.applyMonthlyAdjustments(
      baseWeights,
      context.month
    );

    // Apply transition bonuses if previous weather exists
    if (
      context.previousWeather &&
      context.previousWeather.length > 0 &&
      this.config.transitionMatrix
    ) {
      adjustedWeights = this.applyTransitionBonuses(
        adjustedWeights,
        context.previousWeather
      );
    }

    const selectedWeather = this.performWeightedSelection(adjustedWeights);
    const totalWeight = Object.values(adjustedWeights).reduce(
      (sum, w) => sum + w,
      0
    );
    const probability = adjustedWeights[selectedWeather] / totalWeight;

    return {
      weather: selectedWeather,
      probability,
      algorithm: "transition_based",
      metadata: {
        seasonalWeight: baseWeights[selectedWeather] || 0,
        monthlyAdjustment: this.getMonthlyAdjustment(
          selectedWeather,
          context.month
        ),
        transitionBonus: this.calculateTransitionBonus(
          selectedWeather,
          context.previousWeather || []
        ),
        finalWeight: adjustedWeights[selectedWeather],
      },
    };
  }

  /**
   * Pattern-aware selection based on weather history
   */
  public selectPatternAware(
    season: SeasonType,
    context: WeatherSelectionContext
  ): WeatherSelectionResult {
    const baseWeights = this.config.seasonalWeights[season];
    if (!baseWeights) {
      throw new Error(`No seasonal weights configured for ${season}`);
    }

    let adjustedWeights = this.applyMonthlyAdjustments(
      baseWeights,
      context.month
    );

    // Apply pattern-based adjustments
    if (context.weatherHistory && context.weatherHistory.length > 0) {
      adjustedWeights = this.applyPatternAdjustments(
        adjustedWeights,
        context.weatherHistory
      );
    }

    const selectedWeather = this.performWeightedSelection(adjustedWeights);
    const totalWeight = Object.values(adjustedWeights).reduce(
      (sum, w) => sum + w,
      0
    );
    const probability = adjustedWeights[selectedWeather] / totalWeight;

    return {
      weather: selectedWeather,
      probability,
      algorithm: "pattern_aware",
      metadata: {
        seasonalWeight: baseWeights[selectedWeather] || 0,
        monthlyAdjustment: this.getMonthlyAdjustment(
          selectedWeather,
          context.month
        ),
        transitionBonus: 0,
        finalWeight: adjustedWeights[selectedWeather],
      },
    };
  }

  /**
   * Balanced selection that prevents weather type repetition
   */
  public selectBalanced(
    season: SeasonType,
    context: WeatherSelectionContext
  ): WeatherSelectionResult {
    const baseWeights = this.config.seasonalWeights[season];
    if (!baseWeights) {
      throw new Error(`No seasonal weights configured for ${season}`);
    }

    let adjustedWeights = this.applyMonthlyAdjustments(
      baseWeights,
      context.month
    );

    // Apply balancing penalties for recently used weather
    if (context.weatherHistory && context.weatherHistory.length > 0) {
      adjustedWeights = this.applyBalancingPenalties(
        adjustedWeights,
        context.weatherHistory
      );
    }

    const selectedWeather = this.performWeightedSelection(adjustedWeights);
    const totalWeight = Object.values(adjustedWeights).reduce(
      (sum, w) => sum + w,
      0
    );
    const probability = adjustedWeights[selectedWeather] / totalWeight;

    return {
      weather: selectedWeather,
      probability,
      algorithm: "balanced",
      metadata: {
        seasonalWeight: baseWeights[selectedWeather] || 0,
        monthlyAdjustment: this.getMonthlyAdjustment(
          selectedWeather,
          context.month
        ),
        transitionBonus: 0,
        finalWeight: adjustedWeights[selectedWeather],
      },
    };
  }

  /**
   * Generate weather for a specific month with enhanced algorithms
   */
  public generateMonthWeather(
    month: number,
    algorithm: "basic" | "transition" | "pattern" | "balanced" = "basic",
    context?: Partial<WeatherSelectionContext>
  ): WeatherSelectionResult {
    if (month < 1 || month > 12) {
      throw new Error(`Invalid month: ${month}. Must be between 1 and 12.`);
    }

    const season = MONTH_TO_SEASON[month];
    const fullContext: WeatherSelectionContext = {
      month,
      turn: 1,
      ...context,
    };

    switch (algorithm) {
      case "basic":
        return this.selectBasicWeighted(season, fullContext);
      case "transition":
        return this.selectWithTransitions(season, fullContext);
      case "pattern":
        return this.selectPatternAware(season, fullContext);
      case "balanced":
        return this.selectBalanced(season, fullContext);
      default:
        throw new Error(`Unknown algorithm: ${algorithm}`);
    }
  }

  /**
   * Update configuration with new seasonal probabilities
   */
  public updateConfiguration(updates: Partial<WeatherSelectionConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): WeatherSelectionConfig {
    return { ...this.config };
  }

  /**
   * Apply monthly adjustments to base seasonal weights
   */
  private applyMonthlyAdjustments(
    baseWeights: Record<WeatherType, number>,
    month: number
  ): Record<WeatherType, number> {
    const adjustments = this.config.monthlyAdjustments?.[month] || {};
    const result: Record<WeatherType, number> = {};

    for (const [weather, baseWeight] of Object.entries(baseWeights)) {
      const adjustment = adjustments[weather as WeatherType] || 0;
      const adjustedWeight = Math.max(
        this.config.weightLimits?.min || 0,
        Math.min(this.config.weightLimits?.max || 100, baseWeight + adjustment)
      );
      result[weather as WeatherType] = adjustedWeight;
    }

    return result;
  }

  /**
   * Apply transition bonuses based on previous weather
   */
  private applyTransitionBonuses(
    weights: Record<WeatherType, number>,
    previousWeather: WeatherType[]
  ): Record<WeatherType, number> {
    if (!this.config.transitionMatrix || previousWeather.length === 0) {
      return weights;
    }

    const result = { ...weights };
    const lastWeather = previousWeather[previousWeather.length - 1];
    const transitions = this.config.transitionMatrix[lastWeather];

    if (transitions) {
      for (const [weather, bonus] of Object.entries(transitions)) {
        if (result[weather as WeatherType] !== undefined) {
          result[weather as WeatherType] += bonus;
        }
      }
    }

    return result;
  }

  /**
   * Apply pattern-based adjustments
   */
  private applyPatternAdjustments(
    weights: Record<WeatherType, number>,
    weatherHistory: WeatherType[][]
  ): Record<WeatherType, number> {
    const result = { ...weights };

    // Simple pattern detection: avoid weather that appeared in last 3 turns
    const recentWeather = weatherHistory.slice(-3).flat();
    const weatherCounts = new Map<WeatherType, number>();

    recentWeather.forEach((weather) => {
      weatherCounts.set(weather, (weatherCounts.get(weather) || 0) + 1);
    });

    // Apply penalties for recently used weather
    for (const [weather, count] of weatherCounts.entries()) {
      if (result[weather] !== undefined) {
        const penalty = count * 5; // 5 point penalty per recent occurrence
        result[weather] = Math.max(0, result[weather] - penalty);
      }
    }

    return result;
  }

  /**
   * Apply balancing penalties to prevent repetition
   */
  private applyBalancingPenalties(
    weights: Record<WeatherType, number>,
    weatherHistory: WeatherType[][]
  ): Record<WeatherType, number> {
    const result = { ...weights };
    const allWeather = weatherHistory.flat();
    const weatherCounts = new Map<WeatherType, number>();

    allWeather.forEach((weather) => {
      weatherCounts.set(weather, (weatherCounts.get(weather) || 0) + 1);
    });

    // Calculate average usage
    const totalCount = allWeather.length;
    const averageUsage = totalCount / Object.keys(weights).length;

    // Apply penalties for overused weather types
    for (const [weather, count] of weatherCounts.entries()) {
      if (result[weather] !== undefined && count > averageUsage) {
        const penalty = (count - averageUsage) * 3;
        result[weather] = Math.max(0, result[weather] - penalty);
      }
    }

    return result;
  }

  /**
   * Perform weighted random selection
   */
  private performWeightedSelection(
    weights: Record<WeatherType, number>
  ): WeatherType {
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

    if (totalWeight === 0) {
      // If all weights are 0, select randomly from available options
      const availableWeather = Object.keys(weights) as WeatherType[];
      return availableWeather[
        Math.floor(Math.random() * availableWeather.length)
      ];
    }

    const random =
      Math.random() * totalWeight * (this.config.randomnessFactor || 1);
    let currentWeight = 0;

    for (const [weather, weight] of Object.entries(weights)) {
      currentWeight += weight;
      if (random <= currentWeight) {
        return weather as WeatherType;
      }
    }

    // Fallback to first available weather type
    return Object.keys(weights)[0] as WeatherType;
  }

  /**
   * Get monthly adjustment for a specific weather type
   */
  private getMonthlyAdjustment(weather: WeatherType, month: number): number {
    return this.config.monthlyAdjustments?.[month]?.[weather] || 0;
  }

  /**
   * Calculate transition bonus for a weather type
   */
  private calculateTransitionBonus(
    weather: WeatherType,
    previousWeather: WeatherType[]
  ): number {
    if (!this.config.transitionMatrix || previousWeather.length === 0) {
      return 0;
    }

    const lastWeather = previousWeather[previousWeather.length - 1];
    return this.config.transitionMatrix[lastWeather]?.[weather] || 0;
  }
}
