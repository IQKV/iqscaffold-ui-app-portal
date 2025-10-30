import { getFinalMSWConfig } from "@/app/config";

/**
 * MSW (Mock Service Worker) configuration
 * Provides centralized configuration for enabling/disabling mocks
 */

export interface MSWConfig {
  enabled: boolean;
  enableLogging: boolean;
  onUnhandledRequest: "bypass" | "warn" | "error";
  delay?: number | "real" | { min: number; max: number };
}

/**
 * Get MSW configuration from app config (includes env vars + runtime config)
 */
export function getMSWConfig(): MSWConfig {
  return getFinalMSWConfig();
}

/**
 * Check if MSW should be enabled
 */
export function isMSWEnabled(): boolean {
  return getMSWConfig().enabled;
}
