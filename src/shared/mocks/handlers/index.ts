import { authHandlers } from "./auth";
import { usersHandlers } from "./users";

/**
 * All MSW request handlers
 * Add new handler arrays here as you create them
 */
export const handlers = [...authHandlers, ...usersHandlers];

// Export individual handler groups for selective use
export { authHandlers, usersHandlers };
