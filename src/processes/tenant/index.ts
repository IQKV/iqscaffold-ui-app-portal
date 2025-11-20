/**
 * Tenant Process Layer
 * Public API for tenant management
 */

// Store and state management
export { useTenantStore } from "./model/tenant-store";
export type {
  TenantState,
  TenantActions,
  TenantStore,
} from "./model/tenant-store";

// Selectors and hooks
export {
  useCurrentTenantId,
  useCurrentTenant,
  useTenantInitialized,
  useTenantLoading,
  useTenantError,
  useHasTenantContext,
} from "./model/tenant-selectors";

// UI Components
export { TenantProvider } from "./provider/tenant-provider";
