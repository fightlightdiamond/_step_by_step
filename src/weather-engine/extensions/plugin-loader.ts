/**
 * Plugin loader utility for loading and managing plugins
 */

import { WeatherEnginePlugin, pluginRegistry } from "./plugin-system";
import { extensionManager } from "./extension-points";

/**
 * Plugin loading configuration
 */
export interface PluginLoadConfig {
  name: string;
  enabled: boolean;
  autoActivate?: boolean;
  config?: Record<string, any>;
}

/**
 * Plugin loader error
 */
export class PluginLoadError extends Error {
  constructor(
    message: string,
    public readonly pluginName: string,
    public readonly cause?: Error
  ) {
    super(`Plugin loading error (${pluginName}): ${message}`);
    this.name = "PluginLoadError";
  }
}

/**
 * Plugin loader for managing plugin lifecycle
 */
export class PluginLoader {
  private static instance: PluginLoader;
  private loadedPlugins: Map<string, WeatherEnginePlugin> = new Map();
  private pluginConfigs: Map<string, PluginLoadConfig> = new Map();

  private constructor() {}

  public static getInstance(): PluginLoader {
    if (!PluginLoader.instance) {
      PluginLoader.instance = new PluginLoader();
    }
    return PluginLoader.instance;
  }

  /**
   * Load plugin configuration
   */
  public loadPluginConfig(configs: PluginLoadConfig[]): void {
    for (const config of configs) {
      this.pluginConfigs.set(config.name, config);
    }
  }

  /**
   * Register a plugin instance
   */
  public registerPlugin(plugin: WeatherEnginePlugin): void {
    try {
      pluginRegistry.registerPlugin(plugin);
      this.loadedPlugins.set(plugin.name, plugin);

      // Auto-activate if configured
      const config = this.pluginConfigs.get(plugin.name);
      if (config?.enabled && config?.autoActivate) {
        // Note: Auto-activation is async, so we don't await here
        // The plugin will be activated asynchronously
        this.activatePlugin(plugin.name).catch((error) => {
          console.error(
            `Failed to auto-activate plugin ${plugin.name}:`,
            error
          );
        });
      }
    } catch (error) {
      throw new PluginLoadError(
        `Failed to register plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        plugin.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Load plugin from factory function
   */
  public loadPlugin(pluginFactory: () => WeatherEnginePlugin): void {
    try {
      const plugin = pluginFactory();
      this.registerPlugin(plugin);
    } catch (error) {
      throw new PluginLoadError(
        `Failed to create plugin instance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "unknown",
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Activate a plugin
   */
  public async activatePlugin(pluginName: string): Promise<void> {
    const config = this.pluginConfigs.get(pluginName);
    if (config && !config.enabled) {
      throw new PluginLoadError(
        `Plugin ${pluginName} is disabled in configuration`,
        pluginName
      );
    }

    try {
      await pluginRegistry.activatePlugin(pluginName);
    } catch (error) {
      throw new PluginLoadError(
        `Failed to activate plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        pluginName,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Deactivate a plugin
   */
  public async deactivatePlugin(pluginName: string): Promise<void> {
    try {
      await pluginRegistry.deactivatePlugin(pluginName);
    } catch (error) {
      throw new PluginLoadError(
        `Failed to deactivate plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        pluginName,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Load all configured plugins
   */
  public async loadAllPlugins(): Promise<void> {
    const errors: PluginLoadError[] = [];

    for (const [pluginName, config] of this.pluginConfigs) {
      if (!config.enabled) {
        continue;
      }

      try {
        // Try to load built-in example plugins
        await this.loadBuiltInPlugin(pluginName);

        if (config.autoActivate) {
          await this.activatePlugin(pluginName);
        }
      } catch (error) {
        const pluginError =
          error instanceof PluginLoadError
            ? error
            : new PluginLoadError(
                `Unexpected error: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
                pluginName,
                error instanceof Error ? error : undefined
              );
        errors.push(pluginError);
      }
    }

    if (errors.length > 0) {
      console.warn(`Failed to load ${errors.length} plugins:`, errors);
    }
  }

  /**
   * Load built-in example plugins
   */
  private async loadBuiltInPlugin(pluginName: string): Promise<void> {
    switch (pluginName) {
      case "volcanic-weather":
        const { createVolcanicWeatherPlugin } = await import(
          "./examples/volcanic-weather-plugin"
        );
        this.loadPlugin(createVolcanicWeatherPlugin);
        break;

      case "time-manipulation":
        const { createTimeManipulationPlugin } = await import(
          "./examples/time-manipulation-plugin"
        );
        this.loadPlugin(createTimeManipulationPlugin);
        break;

      default:
        throw new PluginLoadError(
          `Unknown built-in plugin: ${pluginName}`,
          pluginName
        );
    }
  }

  /**
   * Get plugin status
   */
  public getPluginStatus(): {
    name: string;
    version: string;
    loaded: boolean;
    active: boolean;
    enabled: boolean;
  }[] {
    const allPlugins = new Set([
      ...this.loadedPlugins.keys(),
      ...this.pluginConfigs.keys(),
    ]);

    const activePlugins = new Set(
      pluginRegistry.getActivePlugins().map((p) => p.name)
    );

    return Array.from(allPlugins).map((name) => {
      const plugin = this.loadedPlugins.get(name);
      const config = this.pluginConfigs.get(name);

      return {
        name,
        version: plugin?.version || "unknown",
        loaded: !!plugin,
        active: activePlugins.has(name),
        enabled: config?.enabled || false,
      };
    });
  }

  /**
   * Get extension statistics
   */
  public getExtensionStats() {
    return extensionManager.getExtensionStats();
  }

  /**
   * Initialize the plugin system
   */
  public initialize(): void {
    extensionManager.initialize();
    console.log("Plugin system initialized");
  }

  /**
   * Shutdown the plugin system
   */
  public async shutdown(): Promise<void> {
    const activePlugins = pluginRegistry.getActivePlugins();

    for (const plugin of activePlugins) {
      try {
        await this.deactivatePlugin(plugin.name);
      } catch (error) {
        console.error(`Error deactivating plugin ${plugin.name}:`, error);
      }
    }

    console.log("Plugin system shutdown complete");
  }
}

/**
 * Default plugin configuration
 */
export const DEFAULT_PLUGIN_CONFIG: PluginLoadConfig[] = [
  {
    name: "volcanic-weather",
    enabled: true,
    autoActivate: true,
    config: {
      enableSpecialEffects: true,
      volcanicIntensity: 1.0,
    },
  },
  {
    name: "time-manipulation",
    enabled: true,
    autoActivate: false,
    config: {
      maxTimeLoops: 5,
      enableForecast: true,
    },
  },
];

/**
 * Global plugin loader instance
 */
export const pluginLoader = PluginLoader.getInstance();
