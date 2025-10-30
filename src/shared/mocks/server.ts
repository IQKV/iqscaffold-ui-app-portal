import { setupServer } from "msw/node";
import { handlers } from "./handlers";
import { getMSWConfig } from "@/shared/lib/msw-config";

const config = getMSWConfig();

/**
 * Node.js MSW server setup
 * This sets up MSW for testing environments (Node.js)
 */
export const server = setupServer(...handlers);

/**
 * Start MSW server for testing
 */
export function startMSWServer() {
  if (!config.enabled) {
    if (config.enableLogging) {
      console.log("🚫 MSW Server: Disabled via configuration");
    }
    return;
  }

  server.listen({
    onUnhandledRequest: config.onUnhandledRequest,
  });

  if (config.enableLogging) {
    console.log("🎭 MSW Server: Started for testing");
  }
}

/**
 * Stop MSW server
 */
export function stopMSWServer() {
  server.close();
  if (config.enableLogging) {
    console.log("🛑 MSW Server: Stopped");
  }
}

/**
 * Reset MSW handlers to initial state
 */
export function resetMSWServer() {
  server.resetHandlers();
  if (config.enableLogging) {
    console.log("🔄 MSW Server: Handlers reset");
  }
}
