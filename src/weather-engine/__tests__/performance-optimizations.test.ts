/**
 * Performance Optimizations Tests
 * Tests for caching, monitoring, and optimized weather manager
 */

// Jest globals are available without import
import {
  PerformanceCache,
  CacheConfig,
} from "../performance/performance-cache";
import { PerformanceMonitor } from "../performance/performance-monitor";
import { OptimizedWeatherManager } from "../performance/optimized-weather-manager";
import { WeatherType, ElementType } from "../types";
import { ValidationResult } from "../validation";
import { DamageCalculationResult } from "../calculations";
import { WeatherConfigLoader } from "../config";

describe("PerformanceCache", () => {
  let cache: PerformanceCache;
  let config: CacheConfig;

  beforeEach(() => {
    config = {
      maxEntries: 100,
      defaultTtl: 1000,
      cleanupInterval: 0, // Disable auto cleanup for tests
      enableStats: true,
      compressionThreshold: 1024,
    };
    cache = new PerformanceCache(config);
  });

  afterEach(() => {
    cache.destroy();
  });

  describe("Weather Validation Caching", () => {
    it("should cache and retrieve weather validation results", () => {
      const weatherTypes: WeatherType[] = ["Sunny", "Hot"];
      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      // Cache the result
      cache.cacheWeatherValidation(weatherTypes, validationResult);

      // Retrieve from cache
      const cached = cache.getCachedWeatherValidation(weatherTypes);
      expect(cached).toEqual(validationResult);
    });

    it("should return null for non-cached weather combinations", () => {
      const weatherTypes: WeatherType[] = ["Rainy", "Cold"];
      const cached = cache.getCachedWeatherValidation(weatherTypes);
      expect(cached).toBeNull();
    });

    it("should handle weather type order independence", () => {
      const weatherTypes1: WeatherType[] = ["Sunny", "Hot"];
      const weatherTypes2: WeatherType[] = ["Hot", "Sunny"];
      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      cache.cacheWeatherValidation(weatherTypes1, validationResult);
      const cached = cache.getCachedWeatherValidation(weatherTypes2);
      expect(cached).toEqual(validationResult);
    });
  });

  describe("Damage Calculation Caching", () => {
    it("should cache and retrieve damage calculation results", () => {
      const weatherTypes: WeatherType[] = ["Stormy", "Windy"];
      const damageResult: DamageCalculationResult = {
        Fire: { modifier: 10, finalValue: 110 },
        Ice: { modifier: -5, finalValue: 95 },
        Lightning: { modifier: 20, finalValue: 120 },
      };

      cache.cacheDamageCalculation(weatherTypes, damageResult);
      const cached = cache.getCachedDamageCalculation(weatherTypes);
      expect(cached).toEqual(damageResult);
    });
  });

  describe("Element Damage Caching", () => {
    it("should cache element-specific damage calculations", () => {
      const element: ElementType = "Fire";
      const weatherTypes: WeatherType[] = ["Sunny"];
      const baseDamage = 100;
      const result = 120;

      cache.cacheElementDamage(element, weatherTypes, baseDamage, result);
      const cached = cache.getCachedElementDamage(
        element,
        weatherTypes,
        baseDamage
      );
      expect(cached).toBe(result);
    });

    it("should differentiate between different base damage values", () => {
      const element: ElementType = "Fire";
      const weatherTypes: WeatherType[] = ["Sunny"];

      cache.cacheElementDamage(element, weatherTypes, 100, 120);
      cache.cacheElementDamage(element, weatherTypes, 200, 240);

      expect(cache.getCachedElementDamage(element, weatherTypes, 100)).toBe(
        120
      );
      expect(cache.getCachedElementDamage(element, weatherTypes, 200)).toBe(
        240
      );
    });
  });

  describe("Cache Management", () => {
    it("should respect TTL and expire entries", async () => {
      const shortTtlCache = new PerformanceCache({ defaultTtl: 50 });
      const weatherTypes: WeatherType[] = ["Sunny"];
      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      shortTtlCache.cacheWeatherValidation(weatherTypes, validationResult);
      expect(shortTtlCache.getCachedWeatherValidation(weatherTypes)).toEqual(
        validationResult
      );

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(shortTtlCache.getCachedWeatherValidation(weatherTypes)).toBeNull();

      shortTtlCache.destroy();
    });

    it("should evict least used entries when cache is full", () => {
      const smallCache = new PerformanceCache({ maxEntries: 3 });

      // Fill cache
      smallCache.cacheWeatherValidation(["Sunny"], {
        isValid: true,
        errors: [],
        warnings: [],
      });
      smallCache.cacheWeatherValidation(["Rainy"], {
        isValid: true,
        errors: [],
        warnings: [],
      });
      smallCache.cacheWeatherValidation(["Cloudy"], {
        isValid: true,
        errors: [],
        warnings: [],
      });

      // Access some entries to increase hit count
      smallCache.getCachedWeatherValidation(["Sunny"]);
      smallCache.getCachedWeatherValidation(["Sunny"]);
      smallCache.getCachedWeatherValidation(["Rainy"]);

      // Add new entry, should evict 'Cloudy' (least used)
      smallCache.cacheWeatherValidation(["Windy"], {
        isValid: true,
        errors: [],
        warnings: [],
      });

      expect(smallCache.getCachedWeatherValidation(["Sunny"])).not.toBeNull();
      expect(smallCache.getCachedWeatherValidation(["Rainy"])).not.toBeNull();
      expect(smallCache.getCachedWeatherValidation(["Windy"])).not.toBeNull();
      expect(smallCache.getCachedWeatherValidation(["Cloudy"])).toBeNull();

      smallCache.destroy();
    });

    it("should provide accurate cache statistics", () => {
      const weatherTypes: WeatherType[] = ["Sunny"];
      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      // Cache and access entry
      cache.cacheWeatherValidation(weatherTypes, validationResult);
      cache.getCachedWeatherValidation(weatherTypes); // Hit
      cache.getCachedWeatherValidation(["Rainy"]); // Miss

      const stats = cache.getStats();
      expect(stats.totalEntries).toBe(1);
      expect(stats.totalHits).toBe(1);
      expect(stats.totalMisses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
      expect(stats.missRate).toBe(0.5);
    });
  });
});

describe("PerformanceMonitor", () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor({
      maxMetrics: 1000,
      retentionPeriod: 60000,
      enableAutoCleanup: false,
    });
  });

  afterEach(() => {
    monitor.destroy();
  });

  describe("Metric Recording", () => {
    it("should record and retrieve metrics", () => {
      monitor.recordMetric("test_operation", 100, "execution_time");
      monitor.recordMetric("test_operation", 150, "execution_time");
      monitor.recordMetric("test_operation", 75, "execution_time");

      const stats = monitor.getStats("test_operation");
      expect(stats).not.toBeNull();
      expect(stats!.count).toBe(3);
      expect(stats!.min).toBe(75);
      expect(stats!.max).toBe(150);
      expect(stats!.average).toBe(108.33333333333333);
    });

    it("should calculate percentiles correctly", () => {
      // Record 100 metrics with known distribution
      for (let i = 1; i <= 100; i++) {
        monitor.recordMetric("percentile_test", i, "execution_time");
      }

      const stats = monitor.getStats("percentile_test");
      expect(stats!.count).toBe(100);
      expect(stats!.median).toBe(50.5); // Average of 50 and 51
      expect(stats!.p95).toBeGreaterThanOrEqual(94);
      expect(stats!.p99).toBe(99);
    });
  });

  describe("Timing Functions", () => {
    it("should time function execution", async () => {
      const testFunction = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "result";
      };

      const result = await monitor.timeFunction("async_test", testFunction);
      expect(result).toBe("result");

      const stats = monitor.getStats("async_test");
      expect(stats).not.toBeNull();
      expect(stats!.count).toBe(1);
      expect(stats!.average).toBeGreaterThan(5); // Should be around 10ms
    });

    it("should handle function errors while still recording timing", async () => {
      const errorFunction = async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        throw new Error("Test error");
      };

      await expect(
        monitor.timeFunction("error_test", errorFunction)
      ).rejects.toThrow("Test error");

      const stats = monitor.getStats("error_test");
      expect(stats).not.toBeNull();
      expect(stats!.count).toBe(1);
    });
  });

  describe("Performance Alerts", () => {
    it("should trigger alerts when thresholds are exceeded", () => {
      let alertTriggered = false;
      let alertMetric: any = null;

      monitor.addAlert({
        metric: "slow_operation",
        threshold: 100,
        condition: "above",
        callback: (metric) => {
          alertTriggered = true;
          alertMetric = metric;
        },
      });

      monitor.recordMetric("slow_operation", 150, "execution_time");
      expect(alertTriggered).toBe(true);
      expect(alertMetric.value).toBe(150);
    });

    it("should not trigger alerts when thresholds are not exceeded", () => {
      let alertTriggered = false;

      monitor.addAlert({
        metric: "fast_operation",
        threshold: 100,
        condition: "above",
        callback: () => {
          alertTriggered = true;
        },
      });

      monitor.recordMetric("fast_operation", 50, "execution_time");
      expect(alertTriggered).toBe(false);
    });
  });

  describe("Trend Analysis", () => {
    it("should detect improving trends", () => {
      // Record decreasing values (improving performance) with larger differences
      for (let i = 1000; i >= 1; i -= 10) {
        monitor.recordMetric("improving_operation", i, "execution_time");
      }

      const stats = monitor.getStats("improving_operation");
      expect(stats!.trend).toBe("improving");
    });

    it("should detect degrading trends", () => {
      // Record increasing values (degrading performance)
      for (let i = 1; i <= 100; i++) {
        monitor.recordMetric("degrading_operation", i, "execution_time");
      }

      const stats = monitor.getStats("degrading_operation");
      expect(stats!.trend).toBe("degrading");
    });
  });
});

describe("OptimizedWeatherManager", () => {
  let manager: OptimizedWeatherManager;
  let config: any;

  beforeEach(async () => {
    const configLoader = WeatherConfigLoader.getInstance();
    config = await configLoader.loadConfig();

    manager = new OptimizedWeatherManager(config, undefined, {
      enableCaching: true,
      enablePerformanceMonitoring: true,
      enableBatchProcessing: true,
      batchSize: 5,
    });
  });

  afterEach(() => {
    manager.destroy();
  });

  describe("Caching Integration", () => {
    it("should cache weather validation results", () => {
      const weatherTypes: WeatherType[] = ["Sunny", "Hot"];

      // First call should miss cache and calculate
      const result1 = manager.validateCurrentWeather();

      // Apply the weather to set state
      manager.applyWeather(weatherTypes);

      // Second call should hit cache
      const result2 = manager.validateCurrentWeather();

      expect(result1).toEqual(result2);

      const stats = manager.getPerformanceStats();
      expect(stats.cache).toBeDefined();
      expect(stats.cache.totalHits).toBeGreaterThan(0);
    });

    it("should cache damage calculations", () => {
      manager.applyWeather(["Sunny", "Hot"]);

      // First calculation
      const result1 = manager.calculateElementalModifiers();

      // Second calculation should use cache
      const result2 = manager.calculateElementalModifiers();

      expect(result1).toEqual(result2);
    });

    it("should cache element-specific damage calculations", () => {
      manager.applyWeather(["Sunny"]);

      const damage1 = manager.calculateElementDamage("Fire", 100);
      const damage2 = manager.calculateElementDamage("Fire", 100);

      expect(damage1).toBe(damage2);
    });
  });

  describe("Performance Monitoring Integration", () => {
    it("should monitor operation timing", () => {
      manager.applyWeather(["Sunny", "Hot"]);
      manager.calculateElementalModifiers();
      manager.validateCurrentWeather();

      const stats = manager.getPerformanceStats();
      expect(stats.monitor).toBeDefined();
      expect(stats.monitor.summary.totalMetrics).toBeGreaterThan(0);
    });

    it("should track cache hit rates", () => {
      manager.applyWeather(["Sunny"]);

      // Generate some cache hits and misses
      manager.calculateElementalModifiers(); // Miss
      manager.calculateElementalModifiers(); // Hit
      manager.calculateElementDamage("Fire", 100); // Miss
      manager.calculateElementDamage("Fire", 100); // Hit

      const stats = manager.getPerformanceStats();
      expect(stats.cache.totalHits).toBeGreaterThan(0);
      expect(stats.cache.totalMisses).toBeGreaterThan(0);
    });
  });

  describe("Batch Processing", () => {
    it("should process batch operations efficiently", () => {
      const operations = [
        { type: "apply" as const, weatherTypes: ["Sunny"] as WeatherType[] },
        { type: "apply" as const, weatherTypes: ["Rainy"] as WeatherType[] },
        { type: "reset" as const },
        { type: "apply" as const, weatherTypes: ["Stormy"] as WeatherType[] },
      ];

      const results = manager.batchProcess(operations);
      expect(results).toHaveLength(4);
      expect(results.every((r) => r.isValid !== undefined)).toBe(true);
    });

    it("should queue operations for batch processing", (done) => {
      // Queue operations one by one
      manager.queueOperation({ type: "apply", weatherTypes: ["Sunny"] });
      manager.queueOperation({ type: "apply", weatherTypes: ["Hot"] });
      manager.queueOperation({ type: "reset" });

      // Operations should be processed after a short delay
      setTimeout(() => {
        const stats = manager.getPerformanceStats();
        expect(stats.monitor.summary.totalMetrics).toBeGreaterThan(0);
        done();
      }, 50);
    });
  });

  describe("Memory Optimization", () => {
    it("should track memory usage", () => {
      const stats = manager.getPerformanceStats();
      expect(stats.memory).toBeDefined();
      expect(stats.memory.heapUsed).toBeGreaterThan(0);
      expect(stats.memory.heapTotal).toBeGreaterThan(0);
    });

    it("should optimize performance on demand", () => {
      // Generate some cache entries
      manager.applyWeather(["Sunny"]);
      manager.calculateElementalModifiers();
      manager.applyWeather(["Rainy"]);
      manager.calculateElementalModifiers();

      const statsBefore = manager.getPerformanceStats();
      manager.optimize();
      const statsAfter = manager.getPerformanceStats();

      // Should have recorded optimization metrics
      expect(statsAfter.monitor.summary.totalMetrics).toBeGreaterThan(
        statsBefore.monitor.summary.totalMetrics
      );
    });
  });

  describe("Cache Warmup", () => {
    it("should warm up caches with common combinations", () => {
      const commonCombinations: WeatherType[][] = [
        ["Sunny"],
        ["Rainy"],
        ["Sunny", "Hot"],
        ["Rainy", "Cold"],
        ["Stormy", "Windy"],
      ];

      manager.warmupCaches(commonCombinations);

      // Verify cache has entries
      const stats = manager.getPerformanceStats();
      expect(stats.cache.totalEntries).toBeGreaterThan(0);

      // Verify subsequent calls hit cache
      manager.applyWeather(["Sunny"]);
      const damage = manager.calculateElementalModifiers();
      expect(damage).toBeDefined();
    });
  });

  describe("Performance Statistics", () => {
    it("should provide comprehensive performance statistics", () => {
      // Generate some activity
      manager.applyWeather(["Sunny", "Hot"]);
      manager.calculateElementalModifiers();
      manager.calculateElementDamage("Fire", 100);
      manager.validateCurrentWeather();

      const stats = manager.getPerformanceStats();

      expect(stats.cache).toBeDefined();
      expect(stats.monitor).toBeDefined();
      expect(stats.memory).toBeDefined();

      expect(stats.cache.totalEntries).toBeGreaterThan(0);
      expect(stats.monitor.summary.totalMetrics).toBeGreaterThan(0);
      expect(stats.memory.heapUsed).toBeGreaterThan(0);
    });
  });
});

describe("Performance Integration", () => {
  it("should demonstrate significant performance improvement with caching", async () => {
    const configLoader = WeatherConfigLoader.getInstance();
    const config = await configLoader.loadConfig();

    // Create managers with and without optimization
    const regularManager = new OptimizedWeatherManager(config, undefined, {
      enableCaching: false,
      enablePerformanceMonitoring: true,
    });

    const optimizedManager = new OptimizedWeatherManager(config, undefined, {
      enableCaching: true,
      enablePerformanceMonitoring: true,
    });

    const weatherCombinations: WeatherType[][] = [
      ["Sunny", "Hot"],
      ["Rainy", "Cold"],
      ["Stormy", "Windy"],
      ["Foggy", "Cool"],
      ["Snowy", "Cold"],
    ];

    // Warm up optimized cache
    optimizedManager.warmupCaches(weatherCombinations);

    // Measure performance for multiple iterations
    const iterations = 100;

    // Regular manager timing
    const regularStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      const combo = weatherCombinations[i % weatherCombinations.length];
      regularManager.applyWeather(combo);
      regularManager.calculateElementalModifiers();
      regularManager.validateCurrentWeather();
    }
    const regularTime = performance.now() - regularStart;

    // Optimized manager timing
    const optimizedStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      const combo = weatherCombinations[i % weatherCombinations.length];
      optimizedManager.applyWeather(combo);
      optimizedManager.calculateElementalModifiers();
      optimizedManager.validateCurrentWeather();
    }
    const optimizedTime = performance.now() - optimizedStart;

    // Optimized should be significantly faster due to caching
    expect(optimizedTime).toBeLessThan(regularTime);

    // Verify cache hit rate is good
    const optimizedStats = optimizedManager.getPerformanceStats();
    expect(optimizedStats.cache.hitRate).toBeGreaterThan(0.5);

    regularManager.destroy();
    optimizedManager.destroy();
  });
});
