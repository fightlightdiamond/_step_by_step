/**
 * Elemental damage calculation system
 */

import { WeatherType, ElementType, WeatherEffect } from "../types";
import { WEATHER_EFFECT_LIMITS } from "../constants";
import { ProcessedWeatherConfig } from "../config/config-loader";

/**
 * Damage calculation result
 */
export interface DamageCalculationResult {
  elementalModifiers: Record<ElementType, number>;
  appliedWeatherEffects: WeatherEffect[];
  totalEffectsByElement: Record<ElementType, number>;
  clampedEffects: Record<ElementType, boolean>;
  activeWeatherTypes: WeatherType[];
}

/**
 * Damage calculation options
 */
export interface DamageCalculationOptions {
  applyLimits: boolean;
  includeDebugInfo: boolean;
  customLimits?: {
    min: number;
    max: number;
  };
}

/**
 * Elemental damage calculator
 */
export class DamageCalculator {
  private weatherEffects: Map<WeatherType, WeatherEffect>;
  private effectLimits: { min: number; max: number };

  constructor(config: ProcessedWeatherConfig) {
    this.weatherEffects = config.weatherEffects;
    this.effectLimits = config.effectLimits;
  }

  /**
   * Calculate cumulative weather effects on all elements
   */
  public calculateElementalModifiers(
    activeWeather: WeatherType[],
    options: Partial<DamageCalculationOptions> = {}
  ): DamageCalculationResult {
    const opts: DamageCalculationOptions = {
      applyLimits: true,
      includeDebugInfo: false,
      ...options,
    };

    // Remove duplicates and filter valid weather types
    const uniqueWeather = [...new Set(activeWeather)].filter((weather) =>
      this.weatherEffects.has(weather)
    );

    // Get weather effects for each active weather type
    const appliedWeatherEffects: WeatherEffect[] = [];
    for (const weather of uniqueWeather) {
      const effect = this.weatherEffects.get(weather);
      if (effect) {
        appliedWeatherEffects.push(effect);
      }
    }

    // Calculate cumulative effects for each element
    const totalEffectsByElement: Record<ElementType, number> = {
      Fire: 0,
      Ice: 0,
      Lightning: 0,
    };

    for (const effect of appliedWeatherEffects) {
      totalEffectsByElement.Fire += effect.Fire;
      totalEffectsByElement.Ice += effect.Ice;
      totalEffectsByElement.Lightning += effect.Lightning;
    }

    // Apply limits if requested
    const elementalModifiers: Record<ElementType, number> = {
      ...totalEffectsByElement,
    };
    const clampedEffects: Record<ElementType, boolean> = {
      Fire: false,
      Ice: false,
      Lightning: false,
    };

    if (opts.applyLimits) {
      const limits = opts.customLimits || this.effectLimits;

      for (const element of ["Fire", "Ice", "Lightning"] as ElementType[]) {
        const originalValue = totalEffectsByElement[element];
        const clampedValue = this.clampWeatherEffect(originalValue, limits);

        elementalModifiers[element] = clampedValue;
        clampedEffects[element] = originalValue !== clampedValue;
      }
    }

    return {
      elementalModifiers,
      appliedWeatherEffects,
      totalEffectsByElement,
      clampedEffects,
      activeWeatherTypes: uniqueWeather,
    };
  }

  /**
   * Calculate damage modifier for a specific element
   */
  public calculateElementDamageModifier(
    element: ElementType,
    activeWeather: WeatherType[],
    baseDamage: number = 100
  ): number {
    const result = this.calculateElementalModifiers(activeWeather);
    const modifier = result.elementalModifiers[element];

    // Apply percentage modifier to base damage
    const modifiedDamage = baseDamage * (1 + modifier / 100);

    return Math.max(0, modifiedDamage); // Ensure damage doesn't go negative
  }

  /**
   * Calculate damage for all elements
   */
  public calculateAllElementDamage(
    activeWeather: WeatherType[],
    baseDamages: Record<ElementType, number>
  ): Record<ElementType, number> {
    const result = this.calculateElementalModifiers(activeWeather);
    const damages: Record<ElementType, number> = {
      Fire: 0,
      Ice: 0,
      Lightning: 0,
    };

    for (const element of ["Fire", "Ice", "Lightning"] as ElementType[]) {
      const baseDamage = baseDamages[element] || 0;
      const modifier = result.elementalModifiers[element];
      const modifiedDamage = baseDamage * (1 + modifier / 100);
      damages[element] = Math.max(0, modifiedDamage);
    }

    return damages;
  }

  /**
   * Get weather effect for a specific weather type
   */
  public getWeatherEffect(weatherType: WeatherType): WeatherEffect | null {
    return this.weatherEffects.get(weatherType) || null;
  }

  /**
   * Check if weather effects would be clamped
   */
  public wouldEffectsBeClamped(
    activeWeather: WeatherType[]
  ): Record<ElementType, boolean> {
    const result = this.calculateElementalModifiers(activeWeather, {
      applyLimits: false,
    });
    const clampedCheck: Record<ElementType, boolean> = {
      Fire: false,
      Ice: false,
      Lightning: false,
    };

    for (const element of ["Fire", "Ice", "Lightning"] as ElementType[]) {
      const value = result.totalEffectsByElement[element];
      clampedCheck[element] =
        value < this.effectLimits.min || value > this.effectLimits.max;
    }

    return clampedCheck;
  }

  /**
   * Find optimal weather combination for element boost
   */
  public findOptimalWeatherForElement(
    element: ElementType,
    availableWeather: WeatherType[],
    maxWeatherTypes: number = 3
  ): WeatherType[] {
    const weatherEffectPairs: Array<{ weather: WeatherType; effect: number }> =
      [];

    // Get effect values for the target element
    for (const weather of availableWeather) {
      const effect = this.weatherEffects.get(weather);
      if (effect) {
        weatherEffectPairs.push({
          weather,
          effect: effect[element],
        });
      }
    }

    // Sort by effect value (descending for positive effects)
    weatherEffectPairs.sort((a, b) => b.effect - a.effect);

    // Take the top weather types up to the limit
    const optimalWeather = weatherEffectPairs
      .slice(0, maxWeatherTypes)
      .filter((pair) => pair.effect > 0) // Only positive effects
      .map((pair) => pair.weather);

    return optimalWeather;
  }

  /**
   * Analyze weather combination effectiveness
   */
  public analyzeWeatherEffectiveness(activeWeather: WeatherType[]): {
    overallEffectiveness: number;
    elementBreakdown: Record<
      ElementType,
      {
        modifier: number;
        effectiveness: "poor" | "fair" | "good" | "excellent";
      }
    >;
    recommendations: string[];
  } {
    const result = this.calculateElementalModifiers(activeWeather);
    const recommendations: string[] = [];

    let totalAbsoluteEffect = 0;
    const elementBreakdown: Record<
      ElementType,
      {
        modifier: number;
        effectiveness: "poor" | "fair" | "good" | "excellent";
      }
    > = {
      Fire: { modifier: 0, effectiveness: "poor" },
      Ice: { modifier: 0, effectiveness: "poor" },
      Lightning: { modifier: 0, effectiveness: "poor" },
    };

    for (const element of ["Fire", "Ice", "Lightning"] as ElementType[]) {
      const modifier = result.elementalModifiers[element];
      elementBreakdown[element].modifier = modifier;

      const absModifier = Math.abs(modifier);
      totalAbsoluteEffect += absModifier;

      // Determine effectiveness level
      if (absModifier >= 30) {
        elementBreakdown[element].effectiveness = "excellent";
      } else if (absModifier >= 20) {
        elementBreakdown[element].effectiveness = "good";
      } else if (absModifier >= 10) {
        elementBreakdown[element].effectiveness = "fair";
      } else {
        elementBreakdown[element].effectiveness = "poor";
      }

      // Add recommendations
      if (result.clampedEffects[element]) {
        recommendations.push(
          `${element} effects are clamped at limit (${modifier})`
        );
      }

      if (modifier < -30) {
        recommendations.push(
          `${element} is severely weakened by current weather`
        );
      } else if (modifier > 30) {
        recommendations.push(
          `${element} is significantly boosted by current weather`
        );
      }
    }

    const overallEffectiveness = totalAbsoluteEffect / 3; // Average absolute effect

    if (activeWeather.length > 3) {
      recommendations.push(
        "Consider reducing weather types for more focused effects"
      );
    }

    if (overallEffectiveness < 10) {
      recommendations.push(
        "Current weather has minimal impact on elemental damage"
      );
    }

    return {
      overallEffectiveness,
      elementBreakdown,
      recommendations,
    };
  }

  /**
   * Clamp weather effect value to limits
   */
  private clampWeatherEffect(
    value: number,
    limits: { min: number; max: number } = this.effectLimits
  ): number {
    return Math.max(limits.min, Math.min(limits.max, value));
  }
}

/**
 * Utility functions for damage calculations
 */

/**
 * Clamp weather effect value to default limits
 */
export function clampWeatherEffect(value: number): number {
  return Math.max(
    WEATHER_EFFECT_LIMITS.MIN,
    Math.min(WEATHER_EFFECT_LIMITS.MAX, value)
  );
}

/**
 * Create empty weather effect
 */
export function createEmptyWeatherEffect(): WeatherEffect {
  return {
    Fire: 0,
    Ice: 0,
    Lightning: 0,
  };
}

/**
 * Add two weather effects together
 */
export function addWeatherEffects(
  effect1: WeatherEffect,
  effect2: WeatherEffect
): WeatherEffect {
  return {
    Fire: clampWeatherEffect(effect1.Fire + effect2.Fire),
    Ice: clampWeatherEffect(effect1.Ice + effect2.Ice),
    Lightning: clampWeatherEffect(effect1.Lightning + effect2.Lightning),
  };
}

/**
 * Multiply weather effect by a scalar
 */
export function multiplyWeatherEffect(
  effect: WeatherEffect,
  multiplier: number
): WeatherEffect {
  return {
    Fire: clampWeatherEffect(effect.Fire * multiplier),
    Ice: clampWeatherEffect(effect.Ice * multiplier),
    Lightning: clampWeatherEffect(effect.Lightning * multiplier),
  };
}

/**
 * Check if weather effect is valid (within limits)
 */
export function isValidWeatherEffect(effect: WeatherEffect): boolean {
  return (
    effect.Fire >= WEATHER_EFFECT_LIMITS.MIN &&
    effect.Fire <= WEATHER_EFFECT_LIMITS.MAX &&
    effect.Ice >= WEATHER_EFFECT_LIMITS.MIN &&
    effect.Ice <= WEATHER_EFFECT_LIMITS.MAX &&
    effect.Lightning >= WEATHER_EFFECT_LIMITS.MIN &&
    effect.Lightning <= WEATHER_EFFECT_LIMITS.MAX
  );
}

/**
 * Calculate percentage change from base damage
 */
export function calculateDamagePercentageChange(
  baseDamage: number,
  modifiedDamage: number
): number {
  if (baseDamage === 0) return 0;
  return ((modifiedDamage - baseDamage) / baseDamage) * 100;
}
