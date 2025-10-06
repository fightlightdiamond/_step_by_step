/**
 * Performance Module - Weather Engine Performance Optimizations
 */

export * from "./performance-cache";
export * from "./performance-monitor";
export * from "./optimized-weather-manager";

// Re-export commonly used types
export type {
  CacheStats,
  CacheConfig,
  PerformanceMetric,
  PerformanceStats,
  PerformanceAlert,
  PerformanceMonitorConfig,
  OptimizationConfig,
  BatchWeatherOperation,
  MemoryStats,
} from "./performance-cache";

export type {
  PerformanceMetric as PerfMetric,
  PerformanceStats as PerfStats,
} from "./performance-monitor";

export type {
  OptimizationConfig as OptConfig,
  BatchWeatherOperation as BatchOp,
} from "./optimized-weather-manager";
