/**
 * Authority Hooks
 * React hooks for authority-based access control
 */

import { useMemo, useCallback } from "react";
import { useAuth } from "@/processes/auth";
import { useTenant } from "@/processes/tenant";
import { Authority, SecurityContext } from "@/shared/types/authority";
import { billingSecurityGuard } from "./security-guard";

/**
 * Hook to get user authorities from roles
 * Maps existing roles to billing authorities
 */
export function useAuthorities(): Authority[] {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user?.roles) return [];

    const authorities: Authority[] = [];

    // Map existing roles to billing authorities
    if (user.roles.includes("ADMIN") || user.roles.includes("TENANT_ADMIN")) {
      authorities.push(Authority.TENANT_ADMIN);
    }

    if (
      user.roles.includes("SUPER_ADMIN") ||
      user.roles.includes("PLATFORM_ADMIN")
    ) {
      authorities.push(Authority.PLATFORM_ADMIN);
    }

    if (
      user.roles.includes("SUPPORT") ||
      user.roles.includes("SUPPORT_AGENT")
    ) {
      authorities.push(Authority.SUPPORT_AGENT);
    }

    if (
      user.roles.includes("BILLING_VIEWER") ||
      user.roles.includes("VIEWER")
    ) {
      authorities.push(Authority.BILLING_VIEWER);
    }

    return authorities;
  }, [user?.roles]);
}

/**
 * Hook for authority-based access control
 */
export function useAuthorityGuard() {
  const authorities = useAuthorities();
  const { user } = useAuth();
  const { tenantId } = useTenant();

  const securityContext = useMemo(
    (): SecurityContext => ({
      tenantId: tenantId || undefined,
      userId: user?.userId?.toString() || "",
      sessionId: "", // Would be populated from session
    }),
    [tenantId, user?.userId]
  );

  const canAccess = useCallback(
    (
      resource: string,
      action: string,
      context?: Partial<SecurityContext>
    ): boolean => {
      const fullContext = { ...securityContext, ...context };
      return billingSecurityGuard.canAccess(
        authorities,
        resource,
        action,
        fullContext
      );
    },
    [authorities, securityContext]
  );

  const getVisibleComponents = useCallback(() => {
    return billingSecurityGuard.getVisibleComponents(
      authorities,
      securityContext
    );
  }, [authorities, securityContext]);

  const filterData = useCallback(
    <T extends { tenantId?: string }>(data: T[]) => {
      return billingSecurityGuard.filterData(
        data,
        authorities,
        securityContext
      );
    },
    [authorities, securityContext]
  );

  const checkWidgetVisibility = useCallback(
    (widgetName: string): boolean => {
      return billingSecurityGuard.checkWidgetVisibility(
        widgetName,
        authorities
      );
    },
    [authorities]
  );

  const hasAuthority = useCallback(
    (authority: Authority): boolean => {
      return authorities.includes(authority);
    },
    [authorities]
  );

  const hasAnyAuthority = useCallback(
    (requiredAuthorities: Authority[]): boolean => {
      return requiredAuthorities.some((auth) => authorities.includes(auth));
    },
    [authorities]
  );

  const hasAllAuthorities = useCallback(
    (requiredAuthorities: Authority[]): boolean => {
      return requiredAuthorities.every((auth) => authorities.includes(auth));
    },
    [authorities]
  );

  return {
    authorities,
    canAccess,
    getVisibleComponents,
    filterData,
    checkWidgetVisibility,
    hasAuthority,
    hasAnyAuthority,
    hasAllAuthorities,
    securityContext,
  };
}

/**
 * Hook for authority-based action availability
 */
export function useAuthorizedActions(
  resource: string,
  context?: Partial<SecurityContext>
) {
  const { canAccess } = useAuthorityGuard();

  return useMemo(() => {
    const availableActions = {
      canCreate: canAccess(resource, "create", context),
      canRead: canAccess(resource, "read", context),
      canUpdate: canAccess(resource, "update", context),
      canDelete: canAccess(resource, "delete", context),
      canExport: canAccess(resource, "export", context),
      canApprove: canAccess(resource, "approve", context),
      canCancel: canAccess(resource, "cancel", context),
      canUpgrade: canAccess(resource, "upgrade", context),
      canDowngrade: canAccess(resource, "downgrade", context),
      canRefund: canAccess(resource, "refund", context),
      canSuspend: canAccess(resource, "suspend", context),
      canReactivate: canAccess(resource, "reactivate", context),
    };

    return availableActions;
  }, [canAccess, resource, context]);
}

/**
 * Hook for widget visibility checking
 */
export function useWidgetVisibility() {
  const { checkWidgetVisibility } = useAuthorityGuard();

  return useCallback(
    (widgetName: string): boolean => {
      return checkWidgetVisibility(widgetName);
    },
    [checkWidgetVisibility]
  );
}

/**
 * Hook for authority-based data fetching with automatic filtering
 */
export function useAuthorizedData<T extends { tenantId?: string }>(
  data: T[] | undefined,
  options?: {
    filterSensitive?: boolean;
    scopeToTenant?: boolean;
  }
) {
  const { filterData, authorities } = useAuthorityGuard();

  return useMemo(() => {
    if (!data) return undefined;

    // Apply tenant scoping
    let filteredData = data;
    if (options?.scopeToTenant !== false) {
      filteredData = filterData(data);
    }

    // Apply field-level filtering
    if (options?.filterSensitive !== false) {
      filteredData = billingSecurityGuard.filterSensitiveFields(
        filteredData,
        authorities
      ) as T[];
    }

    return filteredData;
  }, [data, filterData, authorities, options]);
}
