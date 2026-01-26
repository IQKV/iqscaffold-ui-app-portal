import { authHandlers } from "./auth";
import { usersHandlers } from "./users";
import { featureHandlers } from "../feature-handlers";

/**
 * All MSW request handlers
 * Add new handler arrays here as you create them
 */
export const handlers = [...authHandlers, ...usersHandlers, ...featureHandlers];

// Export individual handler groups for selective use
export { authHandlers, usersHandlers, featureHandlers };
