import { getConfig } from "./index";

export interface AppMSWConfig {
  enabled: boolean;
  enableLogging: boolean;
  onUnhandledRequest: "bypass" | "warn" | "error";
  delay?: number | "real" | { min: number; max: number };
}

/**
 * Get MSW configuration from app config
 * This allows runtime configuration of MSW behavior
 */
export function getAppMSWConfig(): AppMSWConfig {
  const isTest =
    import.meta.env.MODE === "test" || process.env.NODE_ENV === "test";
  const isDev = import.meta.env.DEV;

  // Enable MSW by default in test environment, or when explicitly enabled
  const enabled = isTest || getConfig("VITE_ENABLE_MSW") === "true";
  const logLevel = getConfig("VITE_LOG_LEVEL", "info");

  return {
    enabled,
    enableLogging: isDev && enabled && logLevel !== "silent",
    onUnhandledRequest: isDev ? "warn" : "bypass",
    delay: isDev ? { min: 100, max: 500 } : undefined,
  };
}

/**
 * Check if MSW should be enabled based on app config
 */
export function isAppMSWEnabled(): boolean {
  return getAppMSWConfig().enabled;
}

/**
 * Runtime MSW configuration that can be modified
 */
let runtimeMSWConfig: Partial<AppMSWConfig> = {};

/**
 * Configure MSW at runtime
 */
export function configureMSW(config: Partial<AppMSWConfig>) {
  runtimeMSWConfig = { ...runtimeMSWConfig, ...config };
}

/**
 * Get final MSW configuration (app config + runtime overrides)
 */
export function getFinalMSWConfig(): AppMSWConfig {
  const appConfig = getAppMSWConfig();
  return { ...appConfig, ...runtimeMSWConfig };
}
