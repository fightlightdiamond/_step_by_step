/**
 * Performance Monitor for Weather Engine
 * Tracks performance metrics, execution times, and system health
 */

/**
 * Performance metric data point
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: "execution_time" | "memory" | "cache" | "throughput" | "error";
  metadata?: Record<string, any>;
}

/**
 * Performance statistics summary
 */
export interface PerformanceStats {
  metric: string;
  count: number;
  min: number;
  max: number;
  average: number;
  median: number;
  p95: number;
  p99: number;
  standardDeviation: number;
  trend: "improving" | "degrading" | "stable";
}

/**
 * Performance alert configuration
 */
export interface PerformanceAlert {
  metric: string;
  threshold: number;
  condition: "above" | "below";
  callback: (metric: PerformanceMetric) => void;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceMonitorConfig {
  maxMetrics: number;
  retentionPeriod: number; // milliseconds
  enableAutoCleanup: boolean;
  cleanupInterval: number; // milliseconds
  enableTrending: boolean;
  trendingWindow: number; // number of data points
}

/**
 * Performance monitor for tracking weather engine performance
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private config: PerformanceMonitorConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private activeTimers: Map<string, number> = new Map();

  constructor(config: Partial<PerformanceMonitorConfig> = {}) {
    this.config = {
      maxMetrics: 10000,
      retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
      enableAutoCleanup: true,
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      enableTrending: true,
      trendingWindow: 100,
      ...config,
    };

    if (this.config.enableAutoCleanup) {
      this.startCleanupTimer();
    }
  }

  /**
   * Record a performance metric
   */
  public recordMetric(
    name: string,
    value: number,
    category: PerformanceMetric["category"] = "execution_time",
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      category,
      metadata,
    };

    this.metrics.push(metric);

    // Check if we need to trim metrics
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }

    // Check alerts
    this.checkAlerts(metric);
  }

  /**
   * Start timing an operation
   */
  public startTimer(operationName: string): void {
    this.activeTimers.set(operationName, performance.now());
  }

  /**
   * End timing an operation and record the metric
   */
  public endTimer(
    operationName: string,
    metadata?: Record<string, any>
  ): number {
    const startTime = this.activeTimers.get(operationName);
    if (startTime === undefined) {
      throw new Error(`Timer '${operationName}' was not started`);
    }

    const duration = performance.now() - startTime;
    this.activeTimers.delete(operationName);

    this.recordMetric(operationName, duration, "execution_time", metadata);
    return duration;
  }

  /**
   * Time a function execution
   */
  public async timeFunction<T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTimer(name);
    try {
      const result = await fn();
      this.endTimer(name, metadata);
      return result;
    } catch (error) {
      this.endTimer(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Record memory usage
   */
  public recordMemoryUsage(source: string): void {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      this.recordMetric(
        `memory_heap_used_${source}`,
        memUsage.heapUsed,
        "memory"
      );
      this.recordMetric(
        `memory_heap_total_${source}`,
        memUsage.heapTotal,
        "memory"
      );
      this.recordMetric(
        `memory_external_${source}`,
        memUsage.external,
        "memory"
      );
    }
  }

  /**
   * Record throughput metric
   */
  public recordThroughput(
    operationName: string,
    operationsCount: number,
    timeWindow: number
  ): void {
    const throughput = operationsCount / (timeWindow / 1000); // operations per second
    this.recordMetric(`throughput_${operationName}`, throughput, "throughput");
  }

  /**
   * Record error metric
   */
  public recordError(
    errorType: string,
    errorMessage?: string,
    metadata?: Record<string, any>
  ): void {
    this.recordMetric(`error_${errorType}`, 1, "error", {
      message: errorMessage,
      ...metadata,
    });
  }

  /**
   * Get performance statistics for a specific metric
   */
  public getStats(
    metricName: string,
    timeWindow?: number
  ): PerformanceStats | null {
    const cutoffTime = timeWindow ? Date.now() - timeWindow : 0;
    const relevantMetrics = this.metrics.filter(
      (m) => m.name === metricName && m.timestamp >= cutoffTime
    );

    if (relevantMetrics.length === 0) {
      return null;
    }

    const values = relevantMetrics.map((m) => m.value).sort((a, b) => a - b);
    const count = values.length;
    const min = values[0];
    const max = values[count - 1];
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / count;

    // Calculate median
    const median =
      count % 2 === 0
        ? (values[count / 2 - 1] + values[count / 2]) / 2
        : values[Math.floor(count / 2)];

    // Calculate percentiles
    const p95Index = Math.floor(count * 0.95);
    const p99Index = Math.floor(count * 0.99);
    const p95 = values[Math.min(p95Index, count - 1)];
    const p99 = values[Math.min(p99Index, count - 1)];

    // Calculate standard deviation
    const variance =
      values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / count;
    const standardDeviation = Math.sqrt(variance);

    // Calculate trend if enabled
    let trend: "improving" | "degrading" | "stable" = "stable";
    if (this.config.enableTrending && count >= this.config.trendingWindow) {
      trend = this.calculateTrend(
        relevantMetrics.slice(-this.config.trendingWindow)
      );
    }

    return {
      metric: metricName,
      count,
      min,
      max,
      average,
      median,
      p95,
      p99,
      standardDeviation,
      trend,
    };
  }

  /**
   * Get all available metric names
   */
  public getMetricNames(): string[] {
    const names = new Set(this.metrics.map((m) => m.name));
    return Array.from(names).sort();
  }

  /**
   * Get metrics by category
   */
  public getMetricsByCategory(
    category: PerformanceMetric["category"],
    timeWindow?: number
  ): PerformanceMetric[] {
    const cutoffTime = timeWindow ? Date.now() - timeWindow : 0;
    return this.metrics.filter(
      (m) => m.category === category && m.timestamp >= cutoffTime
    );
  }

  /**
   * Get recent metrics
   */
  public getRecentMetrics(count: number = 100): PerformanceMetric[] {
    return this.metrics.slice(-count);
  }

  /**
   * Add performance alert
   */
  public addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
  }

  /**
   * Remove performance alert
   */
  public removeAlert(metric: string): void {
    this.alerts = this.alerts.filter((alert) => alert.metric !== metric);
  }

  /**
   * Clear all alerts
   */
  public clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Generate performance report
   */
  public generateReport(timeWindow?: number): {
    summary: {
      totalMetrics: number;
      timeRange: { start: number; end: number };
      categories: Record<string, number>;
    };
    topMetrics: {
      slowest: PerformanceStats[];
      fastest: PerformanceStats[];
      mostVariable: PerformanceStats[];
    };
    trends: {
      improving: string[];
      degrading: string[];
      stable: string[];
    };
    alerts: {
      triggered: number;
      byMetric: Record<string, number>;
    };
  } {
    const cutoffTime = timeWindow ? Date.now() - timeWindow : 0;
    const relevantMetrics = this.metrics.filter(
      (m) => m.timestamp >= cutoffTime
    );

    // Summary
    const categories: Record<string, number> = {};
    relevantMetrics.forEach((m) => {
      categories[m.category] = (categories[m.category] || 0) + 1;
    });

    const timeRange = {
      start:
        relevantMetrics.length > 0
          ? Math.min(...relevantMetrics.map((m) => m.timestamp))
          : 0,
      end:
        relevantMetrics.length > 0
          ? Math.max(...relevantMetrics.map((m) => m.timestamp))
          : 0,
    };

    // Get stats for all metrics
    const metricNames = [...new Set(relevantMetrics.map((m) => m.name))];
    const allStats = metricNames
      .map((name) => this.getStats(name, timeWindow))
      .filter((stats) => stats !== null) as PerformanceStats[];

    // Top metrics analysis
    const executionTimeStats = allStats.filter((s) =>
      relevantMetrics.some(
        (m) => m.name === s.metric && m.category === "execution_time"
      )
    );

    const topMetrics = {
      slowest: executionTimeStats
        .sort((a, b) => b.average - a.average)
        .slice(0, 5),
      fastest: executionTimeStats
        .sort((a, b) => a.average - b.average)
        .slice(0, 5),
      mostVariable: allStats
        .sort((a, b) => b.standardDeviation - a.standardDeviation)
        .slice(0, 5),
    };

    // Trends analysis
    const trends = {
      improving: allStats
        .filter((s) => s.trend === "improving")
        .map((s) => s.metric),
      degrading: allStats
        .filter((s) => s.trend === "degrading")
        .map((s) => s.metric),
      stable: allStats.filter((s) => s.trend === "stable").map((s) => s.metric),
    };

    // Alerts analysis (simplified - would need to track triggered alerts in real implementation)
    const alerts = {
      triggered: 0,
      byMetric: {} as Record<string, number>,
    };

    return {
      summary: {
        totalMetrics: relevantMetrics.length,
        timeRange,
        categories,
      },
      topMetrics,
      trends,
      alerts,
    };
  }

  /**
   * Clear old metrics
   */
  public cleanup(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    const initialCount = this.metrics.length;
    this.metrics = this.metrics.filter((m) => m.timestamp >= cutoffTime);

    const removedCount = initialCount - this.metrics.length;
    if (removedCount > 0) {
      this.recordMetric("cleanup_removed_metrics", removedCount, "throughput");
    }
  }

  /**
   * Export metrics data
   */
  public exportMetrics(format: "json" | "csv" = "json"): string {
    if (format === "csv") {
      const headers = ["name", "value", "timestamp", "category", "metadata"];
      const rows = this.metrics.map((m) => [
        m.name,
        m.value.toString(),
        m.timestamp.toString(),
        m.category,
        JSON.stringify(m.metadata || {}),
      ]);

      return [headers, ...rows].map((row) => row.join(",")).join("\n");
    }

    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Destroy monitor and cleanup resources
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.metrics = [];
    this.alerts = [];
    this.activeTimers.clear();
  }

  /**
   * Calculate trend for a series of metrics
   */
  private calculateTrend(
    metrics: PerformanceMetric[]
  ): "improving" | "degrading" | "stable" {
    if (metrics.length < 2) return "stable";

    const values = metrics.map((m) => m.value);
    const n = values.length;

    // Simple linear regression to determine trend
    const sumX = (n * (n - 1)) / 2; // Sum of indices 0, 1, 2, ..., n-1
    const sumY = values.reduce((acc, val) => acc + val, 0);
    const sumXY = values.reduce((acc, val, i) => acc + i * val, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares of indices

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Determine trend based on slope and significance
    const threshold = Math.abs(values[0]) * 0.05; // 5% threshold

    if (Math.abs(slope) < threshold) return "stable";
    return slope < 0 ? "improving" : "degrading"; // Negative slope = improving performance (lower times)
  }

  /**
   * Check alerts for a new metric
   */
  private checkAlerts(metric: PerformanceMetric): void {
    for (const alert of this.alerts) {
      if (alert.metric === metric.name) {
        const shouldTrigger =
          alert.condition === "above"
            ? metric.value > alert.threshold
            : metric.value < alert.threshold;

        if (shouldTrigger) {
          try {
            alert.callback(metric);
          } catch (error) {
            console.error("Error in performance alert callback:", error);
          }
        }
      }
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }
}
