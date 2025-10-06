/**
 * Error logging and debugging tools for the weather engine
 */

import {
  WeatherEngineError,
  ErrorSeverity,
  ErrorContext,
} from "../types/errors";

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  CRITICAL = 4,
}

/**
 * Log entry
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: WeatherEngineError;
  stackTrace?: string;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  minLevel: LogLevel;
  maxEntries: number;
  enableConsoleOutput: boolean;
  enableFileOutput: boolean;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
}

/**
 * Weather engine logger
 */
export class WeatherLogger {
  private logs: LogEntry[] = [];
  private config: LoggerConfig;
  private errorCounts: Map<string, number> = new Map();
  private performanceMetrics: Map<string, number[]> = new Map();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: LogLevel.INFO,
      maxEntries: 1000,
      enableConsoleOutput: true,
      enableFileOutput: false,
      enableRemoteLogging: false,
      ...config,
    };
  }

  /**
   * Log debug message
   */
  logDebug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  logInfo(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  logWarning(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARNING, message, context);
  }

  /**
   * Log error
   */
  logError(
    error: WeatherEngineError | Error,
    context?: Record<string, any>
  ): void {
    const isWeatherError = error instanceof WeatherEngineError;
    const level =
      isWeatherError && error.severity === ErrorSeverity.CRITICAL
        ? LogLevel.CRITICAL
        : LogLevel.ERROR;

    const logContext = {
      ...context,
      ...(isWeatherError ? error.getErrorDetails() : {}),
    };

    this.log(
      level,
      error.message,
      logContext,
      isWeatherError ? error : undefined
    );

    // Track error counts
    const errorKey = isWeatherError ? error.code : error.constructor.name;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
  }

  /**
   * Log critical error
   */
  logCritical(
    message: string,
    error?: WeatherEngineError,
    context?: Record<string, any>
  ): void {
    this.log(LogLevel.CRITICAL, message, context, error);
  }

  /**
   * Log performance metric
   */
  logPerformance(
    operation: string,
    duration: number,
    context?: Record<string, any>
  ): void {
    const metrics = this.performanceMetrics.get(operation) || [];
    metrics.push(duration);
    this.performanceMetrics.set(operation, metrics);

    this.logDebug(`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...context,
    });
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: WeatherEngineError
  ): void {
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
      stackTrace: error?.stack || new Error().stack,
    };

    // Add to logs array
    this.logs.push(entry);

    // Maintain max entries limit
    if (this.logs.length > this.config.maxEntries) {
      this.logs.shift();
    }

    // Output to console if enabled
    if (this.config.enableConsoleOutput) {
      this.outputToConsole(entry);
    }

    // Output to file if enabled
    if (this.config.enableFileOutput) {
      this.outputToFile(entry);
    }

    // Send to remote logging if enabled
    if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }
  }

  /**
   * Output log entry to console
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelName}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.context);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.context);
        break;
      case LogLevel.WARNING:
        console.warn(prefix, entry.message, entry.context);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(prefix, entry.message, entry.context);
        if (entry.error) {
          console.error("Error details:", entry.error.getErrorDetails());
        }
        break;
    }
  }

  /**
   * Output log entry to file (placeholder - would need file system access)
   */
  private outputToFile(entry: LogEntry): void {
    // In a real implementation, this would write to a file
    // For now, we'll just store it in memory
    // This could be implemented with Node.js fs module or browser storage
  }

  /**
   * Send log entry to remote endpoint
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) {
      return;
    }

    try {
      await fetch(this.config.remoteEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: entry.timestamp.toISOString(),
          level: LogLevel[entry.level],
          message: entry.message,
          context: entry.context,
          error: entry.error?.getErrorDetails(),
        }),
      });
    } catch (error) {
      // Don't log this error to avoid infinite loops
      console.error("Failed to send log to remote endpoint:", error);
    }
  }

  /**
   * Get all logs
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter((entry) => entry.level >= level);
    }
    return [...this.logs];
  }

  /**
   * Get logs for specific time range
   */
  getLogsInRange(startTime: Date, endTime: Date): LogEntry[] {
    return this.logs.filter(
      (entry) => entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStatistics(): Record<
    string,
    { count: number; average: number; min: number; max: number }
  > {
    const stats: Record<
      string,
      { count: number; average: number; min: number; max: number }
    > = {};

    for (const [operation, durations] of this.performanceMetrics) {
      const count = durations.length;
      const sum = durations.reduce((a, b) => a + b, 0);
      const average = sum / count;
      const min = Math.min(...durations);
      const max = Math.max(...durations);

      stats[operation] = { count, average, min, max };
    }

    return stats;
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.errorCounts.clear();
    this.performanceMetrics.clear();
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(
      {
        logs: this.logs,
        errorStatistics: this.getErrorStatistics(),
        performanceStatistics: this.getPerformanceStatistics(),
        exportTimestamp: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Set log level
   */
  setLogLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  /**
   * Enable/disable console output
   */
  setConsoleOutput(enabled: boolean): void {
    this.config.enableConsoleOutput = enabled;
  }

  /**
   * Get recent errors (last N errors)
   */
  getRecentErrors(count: number = 10): LogEntry[] {
    return this.logs
      .filter((entry) => entry.level >= LogLevel.ERROR)
      .slice(-count);
  }

  /**
   * Check if there are critical errors
   */
  hasCriticalErrors(): boolean {
    return this.logs.some((entry) => entry.level === LogLevel.CRITICAL);
  }

  /**
   * Get error frequency (errors per minute)
   */
  getErrorFrequency(timeWindowMinutes: number = 5): number {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const recentErrors = this.logs.filter(
      (entry) => entry.level >= LogLevel.ERROR && entry.timestamp >= cutoffTime
    );
    return recentErrors.length / timeWindowMinutes;
  }
}

/**
 * Debug utilities
 */
export class WeatherDebugger {
  private logger: WeatherLogger;
  private breakpoints: Set<string> = new Set();
  private watchedVariables: Map<string, any> = new Map();

  constructor(logger: WeatherLogger) {
    this.logger = logger;
  }

  /**
   * Add a debug breakpoint
   */
  addBreakpoint(name: string): void {
    this.breakpoints.add(name);
    this.logger.logDebug(`Breakpoint added: ${name}`);
  }

  /**
   * Remove a debug breakpoint
   */
  removeBreakpoint(name: string): void {
    this.breakpoints.delete(name);
    this.logger.logDebug(`Breakpoint removed: ${name}`);
  }

  /**
   * Check if breakpoint is active
   */
  isBreakpointActive(name: string): boolean {
    return this.breakpoints.has(name);
  }

  /**
   * Watch a variable for changes
   */
  watchVariable(name: string, value: any): void {
    const previousValue = this.watchedVariables.get(name);
    this.watchedVariables.set(name, value);

    if (previousValue !== undefined && previousValue !== value) {
      this.logger.logDebug(`Variable changed: ${name}`, {
        previousValue,
        newValue: value,
      });
    }
  }

  /**
   * Dump current state for debugging
   */
  dumpState(stateName: string, state: any): void {
    this.logger.logDebug(`State dump: ${stateName}`, {
      state: JSON.parse(JSON.stringify(state)),
    });
  }

  /**
   * Trace function execution
   */
  trace(functionName: string, args: any[], result?: any): void {
    this.logger.logDebug(`Function trace: ${functionName}`, {
      arguments: args,
      result,
    });
  }

  /**
   * Assert condition and log if false
   */
  assert(
    condition: boolean,
    message: string,
    context?: Record<string, any>
  ): void {
    if (!condition) {
      this.logger.logError(new Error(`Assertion failed: ${message}`), context);
    }
  }

  /**
   * Get watched variables
   */
  getWatchedVariables(): Record<string, any> {
    return Object.fromEntries(this.watchedVariables);
  }

  /**
   * Clear all debug data
   */
  clear(): void {
    this.breakpoints.clear();
    this.watchedVariables.clear();
  }
}

/**
 * Global logger instance (singleton pattern)
 */
let globalLogger: WeatherLogger | null = null;

/**
 * Get or create global logger instance
 */
export function getGlobalLogger(config?: Partial<LoggerConfig>): WeatherLogger {
  if (!globalLogger) {
    globalLogger = new WeatherLogger(config);
  }
  return globalLogger;
}

/**
 * Set global logger instance
 */
export function setGlobalLogger(logger: WeatherLogger): void {
  globalLogger = logger;
}
