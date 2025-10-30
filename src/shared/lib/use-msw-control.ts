import { useCallback, useState, useEffect } from "react";
import { configureMSW, getFinalMSWConfig } from "@/app/config";
import { worker, startMSW, stopMSW } from "@/shared/mocks";

/**
 * Hook for controlling MSW at runtime
 * Useful for development tools, admin panels, or testing interfaces
 */
export function useMSWControl() {
  const [config, setConfig] = useState(getFinalMSWConfig());
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Check if MSW is currently running
    if (typeof window !== "undefined" && worker) {
      // MSW doesn't provide a direct way to check if it's running
      // We'll track this state manually
      setIsRunning(config.enabled);
    }
  }, [config.enabled]);

  const updateConfig = useCallback((newConfig: Partial<typeof config>) => {
    configureMSW(newConfig);
    const updatedConfig = getFinalMSWConfig();
    setConfig(updatedConfig);
  }, []);

  const enableMSW = useCallback(async () => {
    updateConfig({ enabled: true });
    if (typeof window !== "undefined") {
      await startMSW();
      setIsRunning(true);
    }
  }, [updateConfig]);

  const disableMSW = useCallback(async () => {
    updateConfig({ enabled: false });
    if (typeof window !== "undefined") {
      await stopMSW();
      setIsRunning(false);
    }
  }, [updateConfig]);

  const toggleMSW = useCallback(async () => {
    if (config.enabled) {
      await disableMSW();
    } else {
      await enableMSW();
    }
  }, [config.enabled, enableMSW, disableMSW]);

  const setLogging = useCallback(
    (enabled: boolean) => {
      updateConfig({ enableLogging: enabled });
    },
    [updateConfig]
  );

  const setDelay = useCallback(
    (delay: typeof config.delay) => {
      updateConfig({ delay });
    },
    [updateConfig]
  );

  const setUnhandledRequestBehavior = useCallback(
    (behavior: typeof config.onUnhandledRequest) => {
      updateConfig({ onUnhandledRequest: behavior });
    },
    [updateConfig]
  );

  return {
    config,
    isRunning,
    enableMSW,
    disableMSW,
    toggleMSW,
    setLogging,
    setDelay,
    setUnhandledRequestBehavior,
    updateConfig,
  };
}
