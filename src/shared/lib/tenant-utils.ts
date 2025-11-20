/**
 * Tenant utility functions for multi-tenant architecture
 */

/**
 * Extract tenant from subdomain
 * e.g., "acme.gripday.com" -> "acme"
 */
export function extractTenantFromSubdomain(hostname: string): string | null {
  if (!hostname) {
    return null;
  }

  // Skip localhost and IP addresses
  if (
    hostname.startsWith("localhost") ||
    /^\d+\.\d+\.\d+\.\d+/.test(hostname)
  ) {
    return null;
  }

  const parts = hostname.toLowerCase().split(".");

  // Need at least 3 parts for subdomain (e.g., tenant.example.com)
  if (parts.length >= 3) {
    const subdomain = parts[0];

    // Validate subdomain format
    if (isValidSubdomainFormat(subdomain)) {
      return subdomain;
    }
  }

  return null;
}

/**
 * Validate subdomain format
 */
export function isValidSubdomainFormat(subdomain: string): boolean {
  if (!subdomain || subdomain.trim().length === 0) {
    return false;
  }

  const trimmed = subdomain.trim();

  // Basic subdomain validation: alphanumeric and hyphens, 2-63 chars
  return (
    /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/.test(trimmed) &&
    trimmed.length >= 2 &&
    trimmed.length <= 63
  );
}

/**
 * Get tenant ID from current location
 */
export function getTenantFromLocation(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return extractTenantFromSubdomain(window.location.hostname);
}

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
 * Resolve tenant ID from multiple sources
 * Priority: subdomain > storage (dev mode only)
 */
export function resolveTenantId(): string | null {
  // Try subdomain first
  const subdomainTenant = getTenantFromLocation();
  if (subdomainTenant) {
    return subdomainTenant;
  }

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
