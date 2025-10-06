/**
 * Performance Cache System for Weather Engine
 * Implements caching for frequently used weather combinations and calculations
 */

import { WeatherType, ElementType } from "../types";
import { DamageCalculationResult } from "../calculations";
import { ValidationResult } from "../validation";

/**
 * Cache entry with TTL and usage tracking
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  hitCount: number;
  lastAccessed: number;
}

/**
 * Cache statistics for monitoring
 */
export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  memoryUsage: number;
  averageHitCount: number;
  oldestEntry: number;
  newestEntry: number;
}

/**
 * Cache configuration options
 */
export interface CacheConfig {
  maxEntries: number;
  defaultTtl: number; // milliseconds
  cleanupInterval: number; // milliseconds
  enableStats: boolean;
  compressionThreshold: number; // bytes
}

/**
 * Performance cache for weather calculations
 */
export class PerformanceCache {
  private weatherValidationCache = new Map<
    string,
    CacheEntry<ValidationResult>
  >();
  private damageCalculationCache = new Map<
    string,
    CacheEntry<DamageCalculationResult>
  >();
  private weatherCompatibilityCache = new Map<string, CacheEntry<boolean>>();
  private elementDamageCache = new Map<string, CacheEntry<number>>();

  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    cleanups: 0,
  };

  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxEntries: 1000,
      defaultTtl: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      enableStats: true,
      compressionThreshold: 1024, // 1KB
      ...config,
    };

    // Start cleanup timer
    if (this.config.cleanupInterval > 0) {
      this.startCleanupTimer();
    }
  }

  /**
   * Cache weather validation result
   */
  public cacheWeatherValidation(
    weatherTypes: WeatherType[],
    result: ValidationResult,
    ttl?: number
  ): void {
    const key = this.createWeatherKey(weatherTypes);
    this.setCache(this.weatherValidationCache, key, result, ttl);
  }

  /**
   * Get cached weather validation result
   */
  public getCachedWeatherValidation(
    weatherTypes: WeatherType[]
  ): ValidationResult | null {
    const key = this.createWeatherKey(weatherTypes);
    return this.getCache(this.weatherValidationCache, key);
  }

  /**
   * Cache damage calculation result
   */
  public cacheDamageCalculation(
    weatherTypes: WeatherType[],
    result: DamageCalculationResult,
    ttl?: number
  ): void {
    const key = this.createWeatherKey(weatherTypes);
    this.setCache(this.damageCalculationCache, key, result, ttl);
  }

  /**
   * Get cached damage calculation result
   */
  public getCachedDamageCalculation(
    weatherTypes: WeatherType[]
  ): DamageCalculationResult | null {
    const key = this.createWeatherKey(weatherTypes);
    return this.getCache(this.damageCalculationCache, key);
  }

  /**
   * Cache weather compatibility result
   */
  public cacheWeatherCompatibility(
    weather1: WeatherType,
    weather2: WeatherType,
    result: boolean,
    ttl?: number
  ): void {
    const key = this.createCompatibilityKey(weather1, weather2);
    this.setCache(this.weatherCompatibilityCache, key, result, ttl);
  }

  /**
   * Get cached weather compatibility result
   */
  public getCachedWeatherCompatibility(
    weather1: WeatherType,
    weather2: WeatherType
  ): boolean | null {
    const key = this.createCompatibilityKey(weather1, weather2);
    return this.getCache(this.weatherCompatibilityCache, key);
  }

  /**
   * Cache element damage calculation
   */
  public cacheElementDamage(
    element: ElementType,
    weatherTypes: WeatherType[],
    baseDamage: number,
    result: number,
    ttl?: number
  ): void {
    const key = this.createElementDamageKey(element, weatherTypes, baseDamage);
    this.setCache(this.elementDamageCache, key, result, ttl);
  }

  /**
   * Get cached element damage calculation
   */
  public getCachedElementDamage(
    element: ElementType,
    weatherTypes: WeatherType[],
    baseDamage: number
  ): number | null {
    const key = this.createElementDamageKey(element, weatherTypes, baseDamage);
    return this.getCache(this.elementDamageCache, key);
  }

  /**
   * Clear all caches
   */
  public clearAll(): void {
    this.weatherValidationCache.clear();
    this.damageCalculationCache.clear();
    this.weatherCompatibilityCache.clear();
    this.elementDamageCache.clear();
    this.resetStats();
  }

  /**
   * Clear specific cache type
   */
  public clearCache(
    type: "validation" | "damage" | "compatibility" | "element"
  ): void {
    switch (type) {
      case "validation":
        this.weatherValidationCache.clear();
        break;
      case "damage":
        this.damageCalculationCache.clear();
        break;
      case "compatibility":
        this.weatherCompatibilityCache.clear();
        break;
      case "element":
        this.elementDamageCache.clear();
        break;
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const totalEntries =
      this.weatherValidationCache.size +
      this.damageCalculationCache.size +
      this.weatherCompatibilityCache.size +
      this.elementDamageCache.size;

    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    const missRate = totalRequests > 0 ? this.stats.misses / totalRequests : 0;

    // Calculate memory usage (rough estimate)
    const memoryUsage = this.estimateMemoryUsage();

    // Calculate average hit count and age
    let totalHitCount = 0;
    let oldestEntry = Date.now();
    let newestEntry = 0;

    const allCaches = [
      this.weatherValidationCache,
      this.damageCalculationCache,
      this.weatherCompatibilityCache,
      this.elementDamageCache,
    ];

    for (const cache of allCaches) {
      for (const entry of cache.values()) {
        totalHitCount += entry.hitCount;
        oldestEntry = Math.min(oldestEntry, entry.timestamp);
        newestEntry = Math.max(newestEntry, entry.timestamp);
      }
    }

    const averageHitCount = totalEntries > 0 ? totalHitCount / totalEntries : 0;

    return {
      totalEntries,
      hitRate,
      missRate,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      memoryUsage,
      averageHitCount,
      oldestEntry: totalEntries > 0 ? oldestEntry : 0,
      newestEntry: totalEntries > 0 ? newestEntry : 0,
    };
  }

  /**
   * Optimize cache by removing least used entries
   */
  public optimize(): void {
    const allCaches = [
      { cache: this.weatherValidationCache, name: "validation" },
      { cache: this.damageCalculationCache, name: "damage" },
      { cache: this.weatherCompatibilityCache, name: "compatibility" },
      { cache: this.elementDamageCache, name: "element" },
    ];

    for (const { cache, name } of allCaches) {
      if (cache.size > this.config.maxEntries / 4) {
        this.evictLeastUsed(cache, Math.floor(cache.size * 0.2)); // Remove 20% least used
      }
    }

    this.stats.cleanups++;
  }

  /**
   * Destroy cache and cleanup resources
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.clearAll();
  }

  /**
   * Generic cache setter
   */
  private setCache<T>(
    cache: Map<string, CacheEntry<T>>,
    key: string,
    value: T,
    ttl?: number
  ): void {
    // Check if we need to evict entries
    if (cache.size >= this.config.maxEntries) {
      this.evictLeastUsed(cache, 1);
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl ?? this.config.defaultTtl,
      hitCount: 0,
      lastAccessed: Date.now(),
    };

    cache.set(key, entry);
  }

  /**
   * Generic cache getter
   */
  private getCache<T>(
    cache: Map<string, CacheEntry<T>>,
    key: string
  ): T | null {
    const entry = cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    entry.hitCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.value;
  }

  /**
   * Evict least used entries from cache
   */
  private evictLeastUsed<T>(
    cache: Map<string, CacheEntry<T>>,
    count: number
  ): void {
    const entries = Array.from(cache.entries());

    // Sort by hit count (ascending) and last accessed (ascending)
    entries.sort((a, b) => {
      const hitDiff = a[1].hitCount - b[1].hitCount;
      if (hitDiff !== 0) return hitDiff;
      return a[1].lastAccessed - b[1].lastAccessed;
    });

    // Remove the least used entries
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      cache.delete(entries[i][0]);
      this.stats.evictions++;
    }
  }

  /**
   * Create cache key for weather types
   */
  private createWeatherKey(weatherTypes: WeatherType[]): string {
    return weatherTypes.sort().join("|");
  }

  /**
   * Create cache key for weather compatibility
   */
  private createCompatibilityKey(
    weather1: WeatherType,
    weather2: WeatherType
  ): string {
    return [weather1, weather2].sort().join("|");
  }

  /**
   * Create cache key for element damage calculation
   */
  private createElementDamageKey(
    element: ElementType,
    weatherTypes: WeatherType[],
    baseDamage: number
  ): string {
    return `${element}|${this.createWeatherKey(weatherTypes)}|${baseDamage}`;
  }

  /**
   * Estimate memory usage of all caches
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;

    const allCaches = [
      this.weatherValidationCache,
      this.damageCalculationCache,
      this.weatherCompatibilityCache,
      this.elementDamageCache,
    ];

    for (const cache of allCaches) {
      for (const [key, entry] of cache.entries()) {
        // Rough estimate: key size + entry size + overhead
        totalSize += key.length * 2; // UTF-16 characters
        totalSize += JSON.stringify(entry).length * 2;
        totalSize += 64; // Object overhead
      }
    }

    return totalSize;
  }

  /**
   * Start cleanup timer for expired entries
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.config.cleanupInterval);
  }

  /**
   * Clean up expired entries from all caches
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    const allCaches = [
      this.weatherValidationCache,
      this.damageCalculationCache,
      this.weatherCompatibilityCache,
      this.elementDamageCache,
    ];

    for (const cache of allCaches) {
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          cache.delete(key);
          cleanedCount++;
        }
      }
    }

    if (cleanedCount > 0) {
      this.stats.cleanups++;
    }
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      cleanups: 0,
    };
  }
}
