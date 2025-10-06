/**
 * Performance Monitoring and Benchmarking System
 * Continuous performance monitoring and regression detection
 */

import { describe, it, expect } from "@jest/globals";
import { WeatherManager } from "../manager/weather-manager";
import { IntegratedWeatherManager } from "../manager/integrated-weather-manager";
import { WeatherConfigLoader } from "../config/config-loader";
import { WeatherScenarioGenerator } from "./test-data-generators.test";
import defaultWeatherConfig from "../config/weather-effects.json";

interface PerformanceMetric {
  operation: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  operationsPerSecond: number;
  memoryUsage: {
    before: number;
    after: number;
    delta: number;
  };
  timestamp: number;
}

interface PerformanceBenchmark {
  name: string;
  expectedMaxAverage: number; // milliseconds
  expectedMinOpsPerSecond: number;
  expectedMaxMemoryDelta: number; // bytes
}

class PerformanceMonitor {
  private static benchmarks: Record<string, PerformanceBenchmark> = {
    weather_application: {
      name: "Weather Application",
      expectedMaxAverage: 2,
      expectedMinOpsPerSecond: 500,
      expectedMaxMemoryDelta: 5 * 1024 * 1024, // 5MB
    },
    elemental_calculation: {
      name: "Elemental Calculation",
      expectedMaxAverage: 1,
      expectedMinOpsPerSecond: 1000,
      expectedMaxMemoryDelta: 10 * 1024 * 1024, // 10MB
    },
    weather_validation: {
      name: "Weather Validation",
      expectedMaxAverage: 0.5,
      expectedMinOpsPerSecond: 2000,
      expectedMaxMemoryDelta: 5 * 1024 * 1024, // 5MB
    },
    seasonal_generation: {
      name: "Seasonal Generation",
      expectedMaxAverage: 0.1,
      expectedMinOpsPerSecond: 10000,
      expectedMaxMemoryDelta: 128 * 1024, // 128KB
    },
    integrated_operations: {
      name: "Integrated Operations",
      expectedMaxAverage: 5,
      expectedMinOpsPerSecond: 200,
      expectedMaxMemoryDelta: 5 * 1024 * 1024, // 5MB
    },
  };

  static measurePerformance(
    operation: string,
    iterations: number,
    testFunction: () => void
  ): PerformanceMetric {
    // Warm up
    for (let i = 0; i < Math.min(10, iterations / 10); i++) {
      testFunction();
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const memoryBefore = process.memoryUsage().heapUsed;
    const times: number[] = [];

    const startTime = process.hrtime.bigint();

    for (let i = 0; i < iterations; i++) {
      const iterationStart = process.hrtime.bigint();
      testFunction();
      const iterationEnd = process.hrtime.bigint();

      times.push(Number(iterationEnd - iterationStart) / 1_000_000); // Convert to milliseconds
    }

    const endTime = process.hrtime.bigint();
    const memoryAfter = process.memoryUsage().heapUsed;

    const totalTime = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const operationsPerSecond = 1000 / averageTime;

    return {
      operation,
      iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      operationsPerSecond,
      memoryUsage: {
        before: memoryBefore,
        after: memoryAfter,
        delta: memoryAfter - memoryBefore,
      },
      timestamp: Date.now(),
    };
  }

  static validatePerformance(metric: PerformanceMetric): {
    passed: boolean;
    failures: string[];
    warnings: string[];
  } {
    const benchmark = this.benchmarks[metric.operation];
    if (!benchmark) {
      return {
        passed: true,
        failures: [],
        warnings: [`No benchmark defined for operation: ${metric.operation}`],
      };
    }

    const failures: string[] = [];
    const warnings: string[] = [];

    // Check average time
    if (metric.averageTime > benchmark.expectedMaxAverage) {
      failures.push(
        `Average time ${metric.averageTime.toFixed(2)}ms exceeds benchmark ${
          benchmark.expectedMaxAverage
        }ms`
      );
    }

    // Check operations per second
    if (metric.operationsPerSecond < benchmark.expectedMinOpsPerSecond) {
      failures.push(
        `Operations per second ${Math.round(
          metric.operationsPerSecond
        )} below benchmark ${benchmark.expectedMinOpsPerSecond}`
      );
    }

    // Check memory usage
    if (metric.memoryUsage.delta > benchmark.expectedMaxMemoryDelta) {
      failures.push(
        `Memory delta ${(metric.memoryUsage.delta / 1024).toFixed(
          2
        )}KB exceeds benchmark ${(
          benchmark.expectedMaxMemoryDelta / 1024
        ).toFixed(2)}KB`
      );
    }

    // Warnings for concerning but not failing metrics
    if (metric.averageTime > benchmark.expectedMaxAverage * 0.8) {
      warnings.push(
        `Average time ${metric.averageTime.toFixed(
          2
        )}ms approaching benchmark limit`
      );
    }

    if (metric.operationsPerSecond < benchmark.expectedMinOpsPerSecond * 1.2) {
      warnings.push(
        `Operations per second ${Math.round(
          metric.operationsPerSecond
        )} approaching benchmark limit`
      );
    }

    return {
      passed: failures.length === 0,
      failures,
      warnings,
    };
  }

  static logPerformanceReport(
    metric: PerformanceMetric,
    validation: ReturnType<typeof PerformanceMonitor.validatePerformance>
  ): void {
    console.log(`\n📊 Performance Report: ${metric.operation}`);
    console.log(`   Iterations: ${metric.iterations.toLocaleString()}`);
    console.log(`   Total Time: ${metric.totalTime.toFixed(2)}ms`);
    console.log(`   Average Time: ${metric.averageTime.toFixed(4)}ms`);
    console.log(`   Min Time: ${metric.minTime.toFixed(4)}ms`);
    console.log(`   Max Time: ${metric.maxTime.toFixed(4)}ms`);
    console.log(
      `   Operations/sec: ${Math.round(
        metric.operationsPerSecond
      ).toLocaleString()}`
    );
    console.log(
      `   Memory Delta: ${(metric.memoryUsage.delta / 1024).toFixed(2)} KB`
    );

    if (validation.passed) {
      console.log(`   ✅ Performance: PASSED`);
    } else {
      console.log(`   ❌ Performance: FAILED`);
      validation.failures.forEach((failure) => {
        console.log(`      - ${failure}`);
      });
    }

    if (validation.warnings.length > 0) {
      console.log(`   ⚠️  Warnings:`);
      validation.warnings.forEach((warning) => {
        console.log(`      - ${warning}`);
      });
    }
  }

  static runPerformanceRegression(
    currentMetrics: PerformanceMetric[],
    baselineMetrics?: PerformanceMetric[]
  ): {
    regressions: Array<{
      operation: string;
      metric: string;
      current: number;
      baseline: number;
      change: number;
      changePercent: number;
    }>;
    improvements: Array<{
      operation: string;
      metric: string;
      current: number;
      baseline: number;
      change: number;
      changePercent: number;
    }>;
  } {
    const regressions = [];
    const improvements = [];

    if (!baselineMetrics) {
      return { regressions, improvements };
    }

    currentMetrics.forEach((current) => {
      const baseline = baselineMetrics.find(
        (b) => b.operation === current.operation
      );
      if (!baseline) return;

      // Check average time regression (increase is bad)
      const timeChange = current.averageTime - baseline.averageTime;
      const timeChangePercent = (timeChange / baseline.averageTime) * 100;

      if (timeChangePercent > 10) {
        // 10% slower
        regressions.push({
          operation: current.operation,
          metric: "averageTime",
          current: current.averageTime,
          baseline: baseline.averageTime,
          change: timeChange,
          changePercent: timeChangePercent,
        });
      } else if (timeChangePercent < -10) {
        // 10% faster
        improvements.push({
          operation: current.operation,
          metric: "averageTime",
          current: current.averageTime,
          baseline: baseline.averageTime,
          change: timeChange,
          changePercent: timeChangePercent,
        });
      }

      // Check operations per second regression (decrease is bad)
      const opsChange =
        current.operationsPerSecond - baseline.operationsPerSecond;
      const opsChangePercent = (opsChange / baseline.operationsPerSecond) * 100;

      if (opsChangePercent < -10) {
        // 10% fewer ops/sec
        regressions.push({
          operation: current.operation,
          metric: "operationsPerSecond",
          current: current.operationsPerSecond,
          baseline: baseline.operationsPerSecond,
          change: opsChange,
          changePercent: opsChangePercent,
        });
      } else if (opsChangePercent > 10) {
        // 10% more ops/sec
        improvements.push({
          operation: current.operation,
          metric: "operationsPerSecond",
          current: current.operationsPerSecond,
          baseline: baseline.operationsPerSecond,
          change: opsChange,
          changePercent: opsChangePercent,
        });
      }

      // Check memory usage regression (increase is bad)
      const memoryChange =
        current.memoryUsage.delta - baseline.memoryUsage.delta;
      const memoryChangePercent =
        baseline.memoryUsage.delta !== 0
          ? (memoryChange / Math.abs(baseline.memoryUsage.delta)) * 100
          : 0;

      if (memoryChangePercent > 25) {
        // 25% more memory usage
        regressions.push({
          operation: current.operation,
          metric: "memoryUsage",
          current: current.memoryUsage.delta,
          baseline: baseline.memoryUsage.delta,
          change: memoryChange,
          changePercent: memoryChangePercent,
        });
      }
    });

    return { regressions, improvements };
  }
}

describe("Performance Monitoring System", () => {
  let config: unknown;
  let weatherManager: WeatherManager;
  let integratedManager: IntegratedWeatherManager;

  beforeAll(() => {
    const configLoader = WeatherConfigLoader.getInstance();
    config = configLoader.loadFromData(defaultWeatherConfig);
    weatherManager = new WeatherManager(config);
    integratedManager = new IntegratedWeatherManager(config);
  });

  describe("Core Performance Benchmarks", () => {
    it("should meet weather application performance benchmarks", () => {
      const validWeather =
        WeatherScenarioGenerator.generateValidWeatherCombinations(10);
      let weatherIndex = 0;

      const metric = PerformanceMonitor.measurePerformance(
        "weather_application",
        1000,
        () => {
          const weather = validWeather[weatherIndex % validWeather.length];
          try {
            weatherManager.applyWeather(weather);
          } catch (error) {
            // Some may fail validation, that's expected
          }
          weatherIndex++;
        }
      );

      const validation = PerformanceMonitor.validatePerformance(metric);
      PerformanceMonitor.logPerformanceReport(metric, validation);

      expect(validation.passed).toBe(true);
      if (!validation.passed) {
        validation.failures.forEach((failure) => {
          console.error(`Performance failure: ${failure}`);
        });
      }
    });

    it("should meet elemental calculation performance benchmarks", () => {
      const validWeather =
        WeatherScenarioGenerator.generateValidWeatherCombinations(5);
      let weatherIndex = 0;

      // Pre-apply weather states
      validWeather.forEach((weather) => {
        try {
          weatherManager.applyWeather(weather);
        } catch (error) {
          // Some may fail, that's ok
        }
      });

      const metric = PerformanceMonitor.measurePerformance(
        "elemental_calculation",
        2000,
        () => {
          const weather = validWeather[weatherIndex % validWeather.length];
          try {
            weatherManager.applyWeather(weather);
            weatherManager.calculateElementalModifiers();
          } catch (error) {
            // Some may fail validation, that's expected
          }
          weatherIndex++;
        }
      );

      const validation = PerformanceMonitor.validatePerformance(metric);
      PerformanceMonitor.logPerformanceReport(metric, validation);

      expect(validation.passed).toBe(true);
    });

    it("should meet weather validation performance benchmarks", () => {
      const testWeather = [
        ...WeatherScenarioGenerator.generateValidWeatherCombinations(10),
        ...WeatherScenarioGenerator.generateInvalidWeatherCombinations(5),
      ];
      let weatherIndex = 0;

      const metric = PerformanceMonitor.measurePerformance(
        "weather_validation",
        3000,
        () => {
          const weather = testWeather[weatherIndex % testWeather.length];
          integratedManager.validateWeatherCombination(weather);
          weatherIndex++;
        }
      );

      const validation = PerformanceMonitor.validatePerformance(metric);
      PerformanceMonitor.logPerformanceReport(metric, validation);

      expect(validation.passed).toBe(true);
    });

    it("should meet integrated operations performance benchmarks", () => {
      const validWeather =
        WeatherScenarioGenerator.generateValidWeatherCombinations(10);
      const cards = WeatherScenarioGenerator.generateWeatherCards(10);
      let operationIndex = 0;

      const metric = PerformanceMonitor.measurePerformance(
        "integrated_operations",
        500,
        () => {
          const weather = validWeather[operationIndex % validWeather.length];
          const card = cards[operationIndex % cards.length];

          try {
            integratedManager.setWeather(weather);
            integratedManager.getElementalModifiers();
            integratedManager.validateWeatherCombination(weather);

            if (card.weather) {
              integratedManager.validateWeatherCombination([card.weather]);
            }
          } catch (error) {
            // Some operations may fail, that's expected
          }

          operationIndex++;
        }
      );

      const validation = PerformanceMonitor.validatePerformance(metric);
      PerformanceMonitor.logPerformanceReport(metric, validation);

      expect(validation.passed).toBe(true);
    });
  });

  describe("Memory Performance Monitoring", () => {
    it("should maintain stable memory usage during extended operations", () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const memorySnapshots = [];

      // Perform extended operations
      for (let i = 0; i < 1000; i++) {
        const weather =
          WeatherScenarioGenerator.generateValidWeatherCombinations(1)[0];

        try {
          integratedManager.setWeather(weather);
          integratedManager.getElementalModifiers();
        } catch (error) {
          // Some may fail, that's ok
        }

        // Take memory snapshots
        if (i % 100 === 0) {
          memorySnapshots.push({
            iteration: i,
            memory: process.memoryUsage().heapUsed,
          });
        }

        // Force garbage collection periodically
        if (i % 200 === 0 && global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const totalMemoryIncrease = finalMemory - initialMemory;

      // Analyze memory growth pattern
      const memoryGrowthRates = [];
      for (let i = 1; i < memorySnapshots.length; i++) {
        const growth =
          memorySnapshots[i].memory - memorySnapshots[i - 1].memory;
        memoryGrowthRates.push(growth);
      }

      const avgGrowthRate =
        memoryGrowthRates.reduce((sum, rate) => sum + rate, 0) /
        memoryGrowthRates.length;

      console.log(`\n💾 Memory Performance Analysis:`);
      console.log(
        `   Initial Memory: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`
      );
      console.log(
        `   Final Memory: ${(finalMemory / 1024 / 1024).toFixed(2)} MB`
      );
      console.log(
        `   Total Increase: ${(totalMemoryIncrease / 1024).toFixed(2)} KB`
      );
      console.log(
        `   Avg Growth Rate: ${(avgGrowthRate / 1024).toFixed(
          2
        )} KB per 100 operations`
      );

      // Memory increase should be reasonable
      expect(totalMemoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
      expect(Math.abs(avgGrowthRate)).toBeLessThan(1024 * 1024); // Less than 1MB average growth per 100 ops
    });
  });

  describe("Performance Regression Detection", () => {
    it("should detect performance regressions", () => {
      // Simulate baseline metrics (these would normally be stored)
      const baselineMetrics: PerformanceMetric[] = [
        {
          operation: "weather_application",
          iterations: 1000,
          totalTime: 1000,
          averageTime: 1.0,
          minTime: 0.5,
          maxTime: 2.0,
          operationsPerSecond: 1000,
          memoryUsage: { before: 1000000, after: 1100000, delta: 100000 },
          timestamp: Date.now() - 86400000, // 1 day ago
        },
      ];

      // Run current performance test
      const validWeather =
        WeatherScenarioGenerator.generateValidWeatherCombinations(5);
      let weatherIndex = 0;

      const currentMetric = PerformanceMonitor.measurePerformance(
        "weather_application",
        100, // Smaller test for regression detection
        () => {
          const weather = validWeather[weatherIndex % validWeather.length];
          try {
            weatherManager.applyWeather(weather);
          } catch (error) {
            // Some may fail validation, that's expected
          }
          weatherIndex++;
        }
      );

      const regressionAnalysis = PerformanceMonitor.runPerformanceRegression(
        [currentMetric],
        baselineMetrics
      );

      console.log(`\n🔍 Regression Analysis:`);
      console.log(
        `   Regressions Found: ${regressionAnalysis.regressions.length}`
      );
      console.log(
        `   Improvements Found: ${regressionAnalysis.improvements.length}`
      );

      regressionAnalysis.regressions.forEach((regression) => {
        console.log(
          `   📉 Regression in ${regression.operation}.${regression.metric}:`
        );
        console.log(`      Current: ${regression.current.toFixed(2)}`);
        console.log(`      Baseline: ${regression.baseline.toFixed(2)}`);
        console.log(`      Change: ${regression.changePercent.toFixed(1)}%`);
      });

      regressionAnalysis.improvements.forEach((improvement) => {
        console.log(
          `   📈 Improvement in ${improvement.operation}.${improvement.metric}:`
        );
        console.log(`      Current: ${improvement.current.toFixed(2)}`);
        console.log(`      Baseline: ${improvement.baseline.toFixed(2)}`);
        console.log(`      Change: ${improvement.changePercent.toFixed(1)}%`);
      });

      // For this test, we don't expect major regressions
      expect(regressionAnalysis.regressions.length).toBeLessThan(3);
    });
  });

  describe("Continuous Performance Monitoring", () => {
    it("should provide comprehensive performance dashboard", () => {
      const performanceMetrics: PerformanceMetric[] = [];

      // Run all core benchmarks
      const benchmarkOperations = [
        {
          name: "weather_application",
          iterations: 500,
          testFn: () => {
            const weather =
              WeatherScenarioGenerator.generateValidWeatherCombinations(1)[0];
            try {
              weatherManager.applyWeather(weather);
            } catch (error) {
              // Expected for some combinations
            }
          },
        },
        {
          name: "elemental_calculation",
          iterations: 1000,
          testFn: () => {
            try {
              weatherManager.calculateElementalModifiers();
            } catch (error) {
              // Expected for some states
            }
          },
        },
        {
          name: "weather_validation",
          iterations: 1500,
          testFn: () => {
            const weather =
              WeatherScenarioGenerator.generateValidWeatherCombinations(1)[0];
            integratedManager.validateWeatherCombination(weather);
          },
        },
      ];

      benchmarkOperations.forEach((benchmark) => {
        const metric = PerformanceMonitor.measurePerformance(
          benchmark.name,
          benchmark.iterations,
          benchmark.testFn
        );

        performanceMetrics.push(metric);

        const validation = PerformanceMonitor.validatePerformance(metric);
        PerformanceMonitor.logPerformanceReport(metric, validation);
      });

      // Generate performance summary
      console.log(`\n📊 Performance Dashboard Summary:`);
      console.log(
        `   Total Operations Tested: ${performanceMetrics
          .reduce((sum, m) => sum + m.iterations, 0)
          .toLocaleString()}`
      );
      console.log(
        `   Average Performance Score: ${
          performanceMetrics.filter(
            (m) => PerformanceMonitor.validatePerformance(m).passed
          ).length
        }/${performanceMetrics.length} passed`
      );

      const totalMemoryDelta = performanceMetrics.reduce(
        (sum, m) => sum + m.memoryUsage.delta,
        0
      );
      console.log(
        `   Total Memory Delta: ${(totalMemoryDelta / 1024).toFixed(2)} KB`
      );

      const avgOpsPerSecond =
        performanceMetrics.reduce((sum, m) => sum + m.operationsPerSecond, 0) /
        performanceMetrics.length;
      console.log(
        `   Average Ops/Second: ${Math.round(avgOpsPerSecond).toLocaleString()}`
      );

      // All benchmarks should pass
      performanceMetrics.forEach((metric) => {
        const validation = PerformanceMonitor.validatePerformance(metric);
        expect(validation.passed).toBe(true);
      });
    });
  });
});
