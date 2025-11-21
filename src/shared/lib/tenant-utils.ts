/**
 * Tenant utility functions for multi-tenant architecture
 */

/**
 * Get tenant ID from storage (for development/testing)
 */
export function getTenantFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem("tenantId");
  } catch {
    return null;
  }
}

/**
 * Set tenant ID in storage (for development/testing)
 */
export function setTenantInStorage(tenantId: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (tenantId) {
      localStorage.setItem("tenantId", tenantId);
    } else {
      localStorage.removeItem("tenantId");
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Resolve tenant ID from storage (dev mode only)
 * In production, tenant ID comes from JWT token after authentication
 */
export function resolveTenantId(): string | null {
  // In development, allow override from storage
  if (import.meta.env.DEV) {
    return getTenantFromStorage();
  }

  return null;
}

/**
 * Create tenant-aware cache key
 */
export function createTenantCacheKey(
  tenantId: string | null,
  key: string
): string {
  const tenant = tenantId || "default";
  return `${tenant}:${key}`;
}
