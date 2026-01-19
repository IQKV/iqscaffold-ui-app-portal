import { authHandlers } from "./auth";
import { usersHandlers } from "./users";
import { contactsHandlers } from "./contacts";
import { crmHandlers } from "./crm";
import { featureHandlers } from "../feature-handlers";

/**
 * All MSW request handlers
 * Add new handler arrays here as you create them
 */
export const handlers = [
  ...authHandlers,
  ...usersHandlers,
  ...contactsHandlers,
  ...crmHandlers,
  ...featureHandlers,
];

// Export individual handler groups for selective use
export {
  authHandlers,
  usersHandlers,
  contactsHandlers,
  crmHandlers,
  featureHandlers,
};
