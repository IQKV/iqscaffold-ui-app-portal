import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { getMSWConfig } from "@/shared/lib/msw-config";

const config = getMSWConfig();

/**
 * Browser MSW worker setup
 * This sets up MSW for development and browser environments
 */
let workerInstance: ReturnType<typeof setupWorker> | undefined;

// Check if we're in a real browser environment (not jsdom)
const isBrowser =
  typeof window !== "undefined" &&
  typeof window.navigator !== "undefined" &&
  window.navigator.userAgent !== "node.js" &&
  !window.navigator.userAgent.includes("jsdom");

function getWorker() {
  if (!workerInstance && isBrowser) {
    try {
      workerInstance = setupWorker(...handlers);
    } catch (error) {
      console.warn("MSW: Failed to setup worker in this environment:", error);
      return undefined;
    }
  }
  return workerInstance;
}

export const worker = isBrowser ? getWorker() : undefined;

/**
 * Start MSW in browser environment
 */
export async function startMSW() {
  if (!config.enabled) {
    if (config.enableLogging) {
      console.log("🚫 MSW: Disabled via configuration");
    }
    return;
  }

  const workerInstance = getWorker();
  if (!workerInstance) {
    console.warn("MSW: Cannot start worker in non-browser environment");
    return;
  }

  try {
    await workerInstance.start({
      onUnhandledRequest: config.onUnhandledRequest,
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    });

    if (config.enableLogging) {
      console.log("🎭 MSW: Started successfully");
      console.log("📋 MSW: Mocking the following APIs:");
      handlers.forEach((handler) => {
        const method =
          typeof handler.info.method === "string"
            ? handler.info.method.toUpperCase()
            : handler.info.method?.toString() || "ALL";
        console.log(`  - ${method} ${handler.info.path}`);
      });
    }
  } catch (error) {
    console.error("❌ MSW: Failed to start", error);
  }
}

/**
 * Stop MSW worker
 */
export async function stopMSW() {
  const workerInstance = getWorker();
  if (workerInstance) {
    workerInstance.stop();
    if (config.enableLogging) {
      console.log("🛑 MSW: Stopped");
    }
  }
}
