import { authHandlers } from "./auth";
import { usersHandlers } from "./users";
import { contactsHandlers } from "./contacts";

/**
 * All MSW request handlers
 * Add new handler arrays here as you create them
 */
export const handlers = [
  ...authHandlers,
  ...usersHandlers,
  ...contactsHandlers,
];

// Export individual handler groups for selective use
export { authHandlers, usersHandlers, contactsHandlers };
