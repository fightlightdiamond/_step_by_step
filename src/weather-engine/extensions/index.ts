/**
 * Weather Engine Extensions
 * Main entry point for the extensibility system
 */

// Core plugin system
export * from "./plugin-system";
export * from "./extension-points";
export * from "./plugin-loader";

// Example plugins
export * from "./examples/volcanic-weather-plugin";
export * from "./examples/time-manipulation-plugin";

// Re-export commonly used types and instances
export { pluginRegistry } from "./plugin-system";
export { extensionManager } from "./extension-points";
export { pluginLoader, DEFAULT_PLUGIN_CONFIG } from "./plugin-loader";
