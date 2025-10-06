/**
 * Unit tests for plugin loader
 */

const {
  PluginLoader,
  PluginLoadError,
  DEFAULT_PLUGIN_CONFIG,
} = require("../extensions/plugin-loader");
const { pluginRegistry } = require("../extensions/plugin-system");

// Mock the example plugins
jest.mock("../extensions/examples/volcanic-weather-plugin", () => ({
  createVolcanicWeatherPlugin: () => ({
    name: "volcanic-weather",
    version: "1.0.0",
    description: "Mock volcanic weather plugin",
    initialize: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
  }),
}));

jest.mock("../extensions/examples/time-manipulation-plugin", () => ({
  createTimeManipulationPlugin: () => ({
    name: "time-manipulation",
    version: "1.0.0",
    description: "Mock time manipulation plugin",
    initialize: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
  }),
}));

describe("PluginLoader", () => {
  let pluginLoader;

  beforeEach(async () => {
    pluginLoader = PluginLoader.getInstance();

    // Clear any existing plugins
    const activePlugins = pluginRegistry.getActivePlugins();
    for (const plugin of activePlugins) {
      try {
        await pluginRegistry.deactivatePlugin(plugin.name);
      } catch (error) {
        // Ignore deactivation errors during cleanup
      }
    }

    // Clear the plugin registry completely by accessing private properties
    const allPlugins = pluginRegistry.getPlugins();
    for (const plugin of allPlugins) {
      try {
        pluginRegistry["plugins"].delete(plugin.name);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    // Clear plugin loader state
    pluginLoader["loadedPlugins"]?.clear();
    pluginLoader["pluginConfigs"]?.clear();
  });

  describe("plugin configuration", () => {
    test("should load plugin configuration", () => {
      const configs = [
        { name: "test-plugin", enabled: true, autoActivate: false },
        { name: "another-plugin", enabled: false, autoActivate: true },
      ];

      pluginLoader.loadPluginConfig(configs);

      const status = pluginLoader.getPluginStatus();
      expect(status.some((s) => s.name === "test-plugin" && s.enabled)).toBe(
        true
      );
      expect(
        status.some((s) => s.name === "another-plugin" && !s.enabled)
      ).toBe(true);
    });

    test("should use default plugin configuration", () => {
      expect(DEFAULT_PLUGIN_CONFIG).toBeDefined();
      expect(DEFAULT_PLUGIN_CONFIG.length).toBeGreaterThan(0);

      const volcanicConfig = DEFAULT_PLUGIN_CONFIG.find(
        (c) => c.name === "volcanic-weather"
      );
      expect(volcanicConfig).toBeDefined();
      expect(volcanicConfig.enabled).toBe(true);
    });
  });

  describe("plugin registration", () => {
    test("should register plugin instance", () => {
      const mockPlugin = {
        name: "test-plugin",
        version: "1.0.0",
        description: "Test plugin",
      };

      pluginLoader.registerPlugin(mockPlugin);

      const status = pluginLoader.getPluginStatus();
      const pluginStatus = status.find((s) => s.name === "test-plugin");

      expect(pluginStatus).toBeDefined();
      expect(pluginStatus.loaded).toBe(true);
      expect(pluginStatus.version).toBe("1.0.0");
    });

    test("should auto-activate plugin if configured", async () => {
      const mockPlugin = {
        name: "auto-activate-plugin",
        version: "1.0.0",
        description: "Auto activate test plugin",
        activate: jest.fn(),
      };

      pluginLoader.loadPluginConfig([
        { name: "auto-activate-plugin", enabled: true, autoActivate: true },
      ]);

      pluginLoader.registerPlugin(mockPlugin);

      // Wait a bit for async activation to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      const status = pluginLoader.getPluginStatus();
      const pluginStatus = status.find(
        (s) => s.name === "auto-activate-plugin"
      );

      expect(pluginStatus.active).toBe(true);
    });

    test("should load plugin from factory function", () => {
      const mockFactory = jest.fn().mockReturnValue({
        name: "factory-plugin",
        version: "1.0.0",
        description: "Factory created plugin",
      });

      pluginLoader.loadPlugin(mockFactory);

      expect(mockFactory).toHaveBeenCalled();

      const status = pluginLoader.getPluginStatus();
      const pluginStatus = status.find((s) => s.name === "factory-plugin");

      expect(pluginStatus).toBeDefined();
      expect(pluginStatus.loaded).toBe(true);
    });

    test("should throw PluginLoadError on registration failure", () => {
      const duplicatePlugin = {
        name: "duplicate-plugin",
        version: "1.0.0",
        description: "Duplicate plugin",
      };

      pluginLoader.registerPlugin(duplicatePlugin);

      expect(() => pluginLoader.registerPlugin(duplicatePlugin)).toThrow(
        PluginLoadError
      );
    });
  });

  describe("plugin activation and deactivation", () => {
    let mockPlugin;

    beforeEach(() => {
      mockPlugin = {
        name: "activation-test-plugin",
        version: "1.0.0",
        description: "Activation test plugin",
        initialize: jest.fn(),
        activate: jest.fn(),
        deactivate: jest.fn(),
      };

      pluginLoader.loadPluginConfig([
        { name: "activation-test-plugin", enabled: true, autoActivate: false },
      ]);

      pluginLoader.registerPlugin(mockPlugin);
    });

    test("should activate plugin", async () => {
      await pluginLoader.activatePlugin("activation-test-plugin");

      expect(mockPlugin.activate).toHaveBeenCalled();

      const status = pluginLoader.getPluginStatus();
      const pluginStatus = status.find(
        (s) => s.name === "activation-test-plugin"
      );

      expect(pluginStatus.active).toBe(true);
    });

    test("should deactivate plugin", async () => {
      await pluginLoader.activatePlugin("activation-test-plugin");
      await pluginLoader.deactivatePlugin("activation-test-plugin");

      expect(mockPlugin.deactivate).toHaveBeenCalled();

      const status = pluginLoader.getPluginStatus();
      const pluginStatus = status.find(
        (s) => s.name === "activation-test-plugin"
      );

      expect(pluginStatus.active).toBe(false);
    });

    test("should throw error when activating disabled plugin", async () => {
      pluginLoader.loadPluginConfig([
        { name: "activation-test-plugin", enabled: false, autoActivate: false },
      ]);

      await expect(
        pluginLoader.activatePlugin("activation-test-plugin")
      ).rejects.toThrow(PluginLoadError);
    });

    test("should throw error when activating non-existent plugin", async () => {
      await expect(
        pluginLoader.activatePlugin("non-existent-plugin")
      ).rejects.toThrow(PluginLoadError);
    });
  });

  describe("built-in plugin loading", () => {
    beforeEach(() => {
      pluginLoader.loadPluginConfig(DEFAULT_PLUGIN_CONFIG);
    });

    test("should load volcanic weather plugin", async () => {
      await pluginLoader.loadBuiltInPlugin("volcanic-weather");

      const status = pluginLoader.getPluginStatus();
      const pluginStatus = status.find((s) => s.name === "volcanic-weather");

      expect(pluginStatus).toBeDefined();
      expect(pluginStatus.loaded).toBe(true);
    });

    test("should load time manipulation plugin", async () => {
      await pluginLoader.loadBuiltInPlugin("time-manipulation");

      const status = pluginLoader.getPluginStatus();
      const pluginStatus = status.find((s) => s.name === "time-manipulation");

      expect(pluginStatus).toBeDefined();
      expect(pluginStatus.loaded).toBe(true);
    });

    test("should throw error for unknown built-in plugin", async () => {
      await expect(
        pluginLoader.loadBuiltInPlugin("unknown-plugin")
      ).rejects.toThrow(PluginLoadError);
    });

    test("should load all configured plugins", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      await pluginLoader.loadAllPlugins();

      const status = pluginLoader.getPluginStatus();
      const volcanicStatus = status.find((s) => s.name === "volcanic-weather");
      const timeStatus = status.find((s) => s.name === "time-manipulation");

      expect(volcanicStatus.loaded).toBe(true);
      expect(volcanicStatus.active).toBe(true); // autoActivate: true

      expect(timeStatus.loaded).toBe(true);
      expect(timeStatus.active).toBe(false); // autoActivate: false

      consoleSpy.mockRestore();
    });
  });

  describe("plugin status and statistics", () => {
    test("should provide plugin status", () => {
      const mockPlugin = {
        name: "status-test-plugin",
        version: "2.0.0",
        description: "Status test plugin",
      };

      pluginLoader.loadPluginConfig([
        { name: "status-test-plugin", enabled: true, autoActivate: false },
      ]);

      pluginLoader.registerPlugin(mockPlugin);

      const status = pluginLoader.getPluginStatus();
      const pluginStatus = status.find((s) => s.name === "status-test-plugin");

      expect(pluginStatus).toEqual({
        name: "status-test-plugin",
        version: "2.0.0",
        loaded: true,
        active: false,
        enabled: true,
      });
    });

    test("should provide extension statistics", () => {
      const stats = pluginLoader.getExtensionStats();

      expect(stats).toHaveProperty("customWeatherTypes");
      expect(stats).toHaveProperty("customGameModes");
      expect(stats).toHaveProperty("customWeatherCards");
      expect(stats).toHaveProperty("activePlugins");

      expect(typeof stats.customWeatherTypes).toBe("number");
      expect(typeof stats.customGameModes).toBe("number");
      expect(typeof stats.customWeatherCards).toBe("number");
      expect(typeof stats.activePlugins).toBe("number");
    });
  });

  describe("system lifecycle", () => {
    test("should initialize plugin system", () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      pluginLoader.initialize();

      expect(consoleSpy).toHaveBeenCalledWith("Plugin system initialized");

      consoleSpy.mockRestore();
    });

    test("should shutdown plugin system", async () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      // Activate a plugin first
      const mockPlugin = {
        name: "shutdown-test-plugin",
        version: "1.0.0",
        description: "Shutdown test plugin",
        deactivate: jest.fn(),
      };

      pluginLoader.registerPlugin(mockPlugin);
      await pluginLoader.activatePlugin("shutdown-test-plugin");

      await pluginLoader.shutdown();

      expect(mockPlugin.deactivate).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Plugin system shutdown complete"
      );

      consoleSpy.mockRestore();
    });

    test("should handle shutdown with no active plugins", async () => {
      // Test that shutdown completes successfully even with no active plugins
      await expect(pluginLoader.shutdown()).resolves.not.toThrow();
    });
  });

  describe("singleton pattern", () => {
    test("should return the same instance", () => {
      const instance1 = PluginLoader.getInstance();
      const instance2 = PluginLoader.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
