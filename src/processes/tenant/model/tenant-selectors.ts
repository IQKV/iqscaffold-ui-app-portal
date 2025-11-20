/**
 * Tenant Selectors
 * Reusable selectors for tenant state
 */

import { useTenantStore } from "./tenant-store";

/**
 * Get current tenant ID
 */
export const useCurrentTenantId = () =>
  useTenantStore((state) => state.currentTenantId);

/**
 * Get current tenant data
 */
export const useCurrentTenant = () => useTenantStore((state) => state.tenant);

/**
 * Check if tenant context is initialized
 */
export const useTenantInitialized = () =>
  useTenantStore((state) => state.isInitialized);

/**
 * Check if tenant is loading
 */
export const useTenantLoading = () =>
  useTenantStore((state) => state.isLoading);

/**
 * Get tenant error
 */
export const useTenantError = () => useTenantStore((state) => state.error);

/**
 * Check if tenant context is set
 */
export const useHasTenantContext = () =>
  useTenantStore((state) => state.currentTenantId !== null);
