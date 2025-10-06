/**
 * Optimized Weather Manager with Performance Enhancements
 * Extends the base WeatherManager with caching and performance monitoring
 */

import {
  WeatherManager,
  WeatherChangeOptions,
} from "../manager/weather-manager";
import { WeatherType, WeatherState, WeatherCard, ElementType } from "../types";
import { ValidationResult } from "../validation";
import { DamageCalculationResult } from "../calculations";
import { ProcessedWeatherConfig } from "../config";
import { PerformanceCache, CacheConfig } from "./performance-cache";
import {
  PerformanceMonitor,
  PerformanceMonitorConfig,
} from "./performance-monitor";

/**
 * Optimization configuration
 */
export interface OptimizationConfig {
  enableCaching: boolean;
  enablePerformanceMonitoring: boolean;
  enableBatchProcessing: boolean;
  batchSize: number;
  enableLazyLoading: boolean;
  enableMemoryOptimization: boolean;
  cacheConfig?: Partial<CacheConfig>;
  monitorConfig?: Partial<PerformanceMonitorConfig>;
}

/**
 * Batch operation for processing multiple weather changes
 */
export interface BatchWeatherOperation {
  type: "apply" | "reset" | "card";
  weatherTypes?: WeatherType[];
  card?: WeatherCard;
  options?: WeatherChangeOptions;
}

/**
 * Memory optimization statistics
 */
export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  cacheMemory: number;
  stateMemory: number;
}

/**
 * Optimized weather manager with performance enhancements
 */
export class OptimizedWeatherManager extends WeatherManager {
  private cache?: PerformanceCache;
  private monitor?: PerformanceMonitor;
  private config: OptimizationConfig;
  private batchQueue: BatchWeatherOperation[] = [];
  private batchTimer?: NodeJS.Timeout;
  private memoryOptimizationTimer?: NodeJS.Timeout;

  constructor(
    weatherConfig: ProcessedWeatherConfig,
    initialState?: Partial<WeatherState>,
    optimizationConfig: Partial<OptimizationConfig> = {}
  ) {
    super(weatherConfig, initialState);

    this.config = {
      enableCaching: true,
      enablePerformanceMonitoring: true,
      enableBatchProcessing: false,
      batchSize: 10,
      enableLazyLoading: true,
      enableMemoryOptimization: true,
      ...optimizationConfig,
    };

    this.initializeOptimizations();
  }

  /**
   * Apply weather with caching and performance monitoring
   */
  public applyWeather(
    weatherTypes: WeatherType[],
    options: WeatherChangeOptions = {}
  ): ValidationResult {
    return (
      this.monitor?.timeFunction(
        "applyWeather",
        () => this.applyWeatherOptimized(weatherTypes, options),
        { weatherCount: weatherTypes.length, source: options.source }
      ) ?? this.applyWeatherOptimized(weatherTypes, options)
    );
  }

  /**
   * Calculate elemental modifiers with caching
   */
  public calculateElementalModifiers(): DamageCalculationResult {
    const currentWeather = this.getCurrentWeather();

    // Check cache first
    if (this.cache) {
      const cached = this.cache.getCachedDamageCalculation(currentWeather);
      if (cached) {
        this.monitor?.recordMetric("cache_hit_damage_calculation", 1, "cache");
        return cached;
      }
      this.monitor?.recordMetric("cache_miss_damage_calculation", 1, "cache");
    }

    // Calculate and cache result
    const result =
      this.monitor?.timeFunction(
        "calculateElementalModifiers",
        () => super.calculateElementalModifiers(),
        { weatherCount: currentWeather.length }
      ) ?? super.calculateElementalModifiers();

    if (this.cache) {
      this.cache.cacheDamageCalculation(currentWeather, result);
    }

    return result;
  }

  /**
   * Calculate element damage with caching
   */
  public calculateElementDamage(
    element: ElementType,
    baseDamage: number
  ): number {
    const currentWeather = this.getCurrentWeather();

    // Check cache first
    if (this.cache) {
      const cached = this.cache.getCachedElementDamage(
        element,
        currentWeather,
        baseDamage
      );
      if (cached) {
        this.monitor?.recordMetric("cache_hit_element_damage", 1, "cache");
        return cached;
      }
      this.monitor?.recordMetric("cache_miss_element_damage", 1, "cache");
    }

    // Calculate and cache result
    const result =
      this.monitor?.timeFunction(
        "calculateElementDamage",
        () => super.calculateElementDamage(element, baseDamage),
        { element, baseDamage, weatherCount: currentWeather.length }
      ) ?? super.calculateElementDamage(element, baseDamage);

    if (this.cache) {
      this.cache.cacheElementDamage(
        element,
        currentWeather,
        baseDamage,
        result
      );
    }

    return result;
  }

  /**
   * Validate weather with caching
   */
  public validateCurrentWeather(): ValidationResult {
    const currentWeather = this.getCurrentWeather();

    // Check cache first
    if (this.cache) {
      const cached = this.cache.getCachedWeatherValidation(currentWeather);
      if (cached) {
        this.monitor?.recordMetric("cache_hit_weather_validation", 1, "cache");
        return cached;
      }
      this.monitor?.recordMetric("cache_miss_weather_validation", 1, "cache");
    }

    // Validate and cache result
    const result =
      this.monitor?.timeFunction(
        "validateCurrentWeather",
        () => super.validateCurrentWeather(),
        { weatherCount: currentWeather.length }
      ) ?? super.validateCurrentWeather();

    if (this.cache) {
      this.cache.cacheWeatherValidation(currentWeather, result);
    }

    return result;
  }

  /**
   * Batch process multiple weather operations
   */
  public batchProcess(operations: BatchWeatherOperation[]): ValidationResult[] {
    if (!this.config.enableBatchProcessing) {
      return operations.map((op) => this.processSingleOperation(op));
    }

    return (
      this.monitor?.timeFunction(
        "batchProcess",
        () => this.processBatchOperations(operations),
        { operationCount: operations.length }
      ) ?? this.processBatchOperations(operations)
    );
  }

  /**
   * Queue operation for batch processing
   */
  public queueOperation(operation: BatchWeatherOperation): void {
    if (!this.config.enableBatchProcessing) {
      this.processSingleOperation(operation);
      return;
    }

    this.batchQueue.push(operation);

    if (this.batchQueue.length >= this.config.batchSize) {
      this.processBatch();
    } else if (!this.batchTimer) {
      // Process batch after a short delay if not full
      this.batchTimer = setTimeout(() => this.processBatch(), 10);
    }
  }

  /**
   * Get performance statistics
   */
  public getPerformanceStats(): {
    cache?: any;
    monitor?: any;
    memory?: MemoryStats;
  } {
    const stats: any = {};

    if (this.cache) {
      stats.cache = this.cache.getStats();
    }

    if (this.monitor) {
      stats.monitor = this.monitor.generateReport();
    }

    if (this.config.enableMemoryOptimization) {
      stats.memory = this.getMemoryStats();
    }

    return stats;
  }

  /**
   * Optimize performance by clearing caches and running cleanup
   */
  public optimize(): void {
    this.monitor?.startTimer("optimization");

    // Optimize cache
    if (this.cache) {
      this.cache.optimize();
      this.monitor?.recordMetric("cache_optimization", 1, "throughput");
    }

    // Record memory usage
    if (this.monitor) {
      this.monitor.recordMemoryUsage("optimization");
    }

    // Run garbage collection if available
    if (global.gc) {
      global.gc();
      this.monitor?.recordMetric("garbage_collection", 1, "memory");
    }

    this.monitor?.endTimer("optimization");
  }

  /**
   * Warm up caches with common weather combinations
   */
  public warmupCaches(commonCombinations: WeatherType[][]): void {
    if (!this.cache) return;

    this.monitor?.startTimer("cache_warmup");

    for (const combination of commonCombinations) {
      // Pre-calculate and cache validation
      const validation = super.validateCurrentWeather();
      this.cache.cacheWeatherValidation(combination, validation);

      // Pre-calculate and cache damage calculations
      const originalWeather = this.getCurrentWeather();
      try {
        super.applyWeather(combination, {
          validateChange: false,
          triggerEvents: false,
        });
        const damage = super.calculateElementalModifiers();
        this.cache.cacheDamageCalculation(combination, damage);
      } finally {
        // Restore original weather
        super.applyWeather(originalWeather, {
          validateChange: false,
          triggerEvents: false,
        });
      }
    }

    this.monitor?.endTimer("cache_warmup", {
      combinationCount: commonCombinations.length,
    });
  }

  /**
   * Clear all performance optimizations
   */
  public clearOptimizations(): void {
    if (this.cache) {
      this.cache.clearAll();
    }

    if (this.monitor) {
      this.monitor.cleanup();
    }

    this.batchQueue = [];
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }
  }

  /**
   * Destroy optimized manager and cleanup resources
   */
  public destroy(): void {
    this.clearOptimizations();

    if (this.cache) {
      this.cache.destroy();
    }

    if (this.monitor) {
      this.monitor.destroy();
    }

    if (this.memoryOptimizationTimer) {
      clearInterval(this.memoryOptimizationTimer);
    }
  }

  /**
   * Initialize optimization systems
   */
  private initializeOptimizations(): void {
    if (this.config.enableCaching) {
      this.cache = new PerformanceCache(this.config.cacheConfig);
    }

    if (this.config.enablePerformanceMonitoring) {
      this.monitor = new PerformanceMonitor(this.config.monitorConfig);

      // Set up performance alerts
      this.monitor.addAlert({
        metric: "applyWeather",
        threshold: 100, // 100ms
        condition: "above",
        callback: (metric) => {
          console.warn(`Slow weather application detected: ${metric.value}ms`);
        },
      });

      this.monitor.addAlert({
        metric: "calculateElementalModifiers",
        threshold: 50, // 50ms
        condition: "above",
        callback: (metric) => {
          console.warn(`Slow damage calculation detected: ${metric.value}ms`);
        },
      });
    }

    if (this.config.enableMemoryOptimization) {
      this.startMemoryOptimization();
    }
  }

  /**
   * Apply weather with optimizations
   */
  private applyWeatherOptimized(
    weatherTypes: WeatherType[],
    options: WeatherChangeOptions
  ): ValidationResult {
    // Check validation cache first if validating
    if (options.validateChange !== false && this.cache) {
      const cached = this.cache.getCachedWeatherValidation(weatherTypes);
      if (cached && !cached.isValid) {
        this.monitor?.recordMetric(
          "cache_hit_validation_early_exit",
          1,
          "cache"
        );
        return cached;
      }
    }

    // Apply weather using parent implementation
    const result = super.applyWeather(weatherTypes, options);

    // Cache the validation result
    if (this.cache) {
      this.cache.cacheWeatherValidation(weatherTypes, result);
    }

    // Record throughput
    this.monitor?.recordThroughput("weather_applications", 1, 1000);

    return result;
  }

  /**
   * Process batch operations efficiently
   */
  private processBatchOperations(
    operations: BatchWeatherOperation[]
  ): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Group operations by type for better efficiency
    const grouped = operations.reduce((acc, op, index) => {
      if (!acc[op.type]) acc[op.type] = [];
      acc[op.type].push({ operation: op, index });
      return acc;
    }, {} as Record<string, Array<{ operation: BatchWeatherOperation; index: number }>>);

    // Process each group
    for (const [type, ops] of Object.entries(grouped)) {
      for (const { operation, index } of ops) {
        results[index] = this.processSingleOperation(operation);
      }
    }

    return results;
  }

  /**
   * Process a single batch operation
   */
  private processSingleOperation(
    operation: BatchWeatherOperation
  ): ValidationResult {
    switch (operation.type) {
      case "apply":
        if (operation.weatherTypes) {
          return this.applyWeather(operation.weatherTypes, operation.options);
        }
        break;
      case "reset":
        this.resetWeather(operation.options);
        return { isValid: true, errors: [], warnings: [] };
      case "card":
        if (operation.card) {
          return this.playWeatherCard(operation.card);
        }
        break;
    }

    return {
      isValid: false,
      errors: [
        { type: "INVALID_OPERATION", message: "Invalid batch operation" },
      ],
      warnings: [],
    };
  }

  /**
   * Process queued batch operations
   */
  private processBatch(): void {
    if (this.batchQueue.length === 0) return;

    const operations = [...this.batchQueue];
    this.batchQueue = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    this.batchProcess(operations);
  }

  /**
   * Get memory statistics
   */
  private getMemoryStats(): MemoryStats {
    const memUsage = process.memoryUsage();

    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers || 0,
      cacheMemory: this.cache?.getStats().memoryUsage || 0,
      stateMemory: this.estimateStateMemory(),
    };
  }

  /**
   * Estimate memory usage of weather state
   */
  private estimateStateMemory(): number {
    const state = this.getCurrentWeatherState();
    return JSON.stringify(state).length * 2; // Rough estimate for UTF-16
  }

  /**
   * Start memory optimization timer
   */
  private startMemoryOptimization(): void {
    this.memoryOptimizationTimer = setInterval(() => {
      this.monitor?.recordMemoryUsage("periodic");

      const memStats = this.getMemoryStats();

      // Trigger optimization if memory usage is high
      if (memStats.heapUsed > 100 * 1024 * 1024) {
        // 100MB threshold
        this.optimize();
      }
    }, 30000); // Every 30 seconds
  }
}
