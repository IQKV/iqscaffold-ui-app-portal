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
 * Resolve tenant ID for unauthenticated requests
 * For authenticated requests, tenant comes from JWT token
 */
export function resolveTenantId(): string | null {
  // In development, allow override from storage for testing
  if (import.meta.env.DEV) {
    const storedTenant = getTenantFromStorage();
    if (storedTenant) {
      return storedTenant;
    }
  }

  // For unauthenticated requests (like login), use default tenant
  // After authentication, tenant will come from JWT token
  return "default";
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
