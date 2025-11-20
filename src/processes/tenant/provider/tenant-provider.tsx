/**
 * Tenant Provider
 * Ensures tenant context is initialized before rendering children
 */

import { useEffect, type ReactNode } from "react";
import { useTenantStore, useTenantInitialized } from "../index";

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const initialize = useTenantStore((state) => state.initialize);
  const isInitialized = useTenantInitialized();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // Tenant initialization is synchronous, so we can render immediately
  return <>{children}</>;
}
