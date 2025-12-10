/**
 * Security Guard Service
 * Implements authority-based access control for billing operations
 */

import {
  Authority,
  AuthorityCheck,
  SecurityContext,
  ComponentVisibility,
  AUTHORITY_RULES,
  WIDGET_VISIBILITY_MATRIX,
  type AuthorityRule,
} from "@/shared/types/authority";
import { auditLogger } from "./audit-logger";

export interface SecurityGuard {
  canAccess: (
    authorities: Authority[],
    resource: string,
    action: string,
    context?: SecurityContext
  ) => boolean;
  getVisibleComponents: (
    authorities: Authority[],
    context?: SecurityContext
  ) => ComponentVisibility;
  filterData: <T extends { tenantId?: string }>(
    data: T[],
    authorities: Authority[],
    context?: SecurityContext
  ) => T[];
  checkWidgetVisibility: (
    widgetName: string,
    authorities: Authority[]
  ) => boolean;
}

export class BillingSecurityGuard implements SecurityGuard {
  private authorityRules: Map<string, AuthorityRule[]>;

  constructor() {
    this.authorityRules = new Map();
    this.initializeRules();
  }

  private initializeRules(): void {
    AUTHORITY_RULES.forEach((rule) => {
      const key = `${rule.authority}:${rule.resource}`;
      const existing = this.authorityRules.get(key) || [];
      this.authorityRules.set(key, [...existing, rule]);
    });
  }

  canAccess(
    authorities: Authority[],
    resource: string,
    action: string,
    context?: SecurityContext
  ): boolean {
    let hasAccess = false;

    // Check each authority for access
    for (const authority of authorities) {
      const key = `${authority}:${resource}`;
      const rules = this.authorityRules.get(key) || [];

      for (const rule of rules) {
        if (rule.actions.includes(action)) {
          // Check tenant scoping
          if (rule.tenantScoped && context?.tenantId) {
            // For tenant-scoped authorities, ensure context matches
            if (
              authority === Authority.TENANT_ADMIN ||
              authority === Authority.BILLING_VIEWER
            ) {
              // These authorities are always tenant-scoped
              hasAccess = true;
              break;
            }
            if (authority === Authority.SUPPORT_AGENT) {
              // Support agents can access assigned tenants
              hasAccess = this.canAccessTenant(
                context.userId,
                context.tenantId
              );
              if (hasAccess) {
                break;
              }
            }
          } else if (!rule.tenantScoped) {
            // Platform admin has cross-tenant access
            if (authority === Authority.PLATFORM_ADMIN) {
              hasAccess = true;
              break;
            }
          }

          // Check additional conditions
          if (rule.conditions) {
            if (!this.checkConditions(rule.conditions, context)) {
              continue;
            }
          }

          hasAccess = true;
          break;
        }
      }

      if (hasAccess) {
        break;
      }
    }

    // Log the access attempt
    if (context) {
      auditLogger.logAccessAttempt(
        context,
        authorities,
        resource,
        action,
        hasAccess,
        { requestedAction: action, availableAuthorities: authorities }
      );
    }

    return hasAccess;
  }

  getVisibleComponents(
    authorities: Authority[],
    context?: SecurityContext
  ): ComponentVisibility {
    const visibility: ComponentVisibility = {
      pages: [],
      widgets: [],
      actions: [],
      fields: [],
    };

    // Determine visible pages based on authorities
    if (authorities.includes(Authority.TENANT_ADMIN)) {
      visibility.pages.push(
        "billing-overview",
        "subscription-management",
        "payment-methods",
        "invoice-management",
        "usage-analytics"
      );
    }

    if (authorities.includes(Authority.PLATFORM_ADMIN)) {
      visibility.pages.push(
        "admin-revenue-dashboard",
        "tenant-management",
        "system-analytics",
        "audit-logs"
      );
    }

    if (authorities.includes(Authority.SUPPORT_AGENT)) {
      visibility.pages.push(
        "support-billing-tools",
        "customer-search",
        "ticket-management"
      );
    }

    if (authorities.includes(Authority.BILLING_VIEWER)) {
      visibility.pages.push("billing-reports", "usage-analytics");
    }

    // Determine visible widgets
    Object.entries(WIDGET_VISIBILITY_MATRIX).forEach(
      ([widget, requiredAuthorities]) => {
        if (authorities.some((auth) => requiredAuthorities.includes(auth))) {
          visibility.widgets.push(widget);
        }
      }
    );

    // Determine available actions based on authorities
    authorities.forEach((authority) => {
      const authorityActions = this.getAuthorityActions(authority);
      visibility.actions.push(...authorityActions);
    });

    return visibility;
  }

  filterData<T extends { tenantId?: string }>(
    data: T[],
    authorities: Authority[],
    context?: SecurityContext
  ): T[] {
    // Platform admins see all data
    if (authorities.includes(Authority.PLATFORM_ADMIN)) {
      return data;
    }

    // Tenant-scoped authorities only see their tenant's data
    if (
      authorities.includes(Authority.TENANT_ADMIN) ||
      authorities.includes(Authority.BILLING_VIEWER)
    ) {
      return data.filter((item) => item.tenantId === context?.tenantId);
    }

    // Support agents see data for assigned tenants
    if (authorities.includes(Authority.SUPPORT_AGENT)) {
      const assignedTenants = this.getAssignedTenants(context?.userId || "");
      return data.filter((item) =>
        assignedTenants.includes(item.tenantId || "")
      );
    }

    return [];
  }

  checkWidgetVisibility(widgetName: string, authorities: Authority[]): boolean {
    const requiredAuthorities = WIDGET_VISIBILITY_MATRIX[widgetName];
    if (!requiredAuthorities) {
      return false;
    }

    return authorities.some((authority) =>
      requiredAuthorities.includes(authority)
    );
  }

  // Apply field-level restrictions
  filterSensitiveFields<T>(data: T[], authorities: Authority[]): Partial<T>[] {
    const sensitiveFields = this.getSensitiveFields(authorities);

    return data.map((item) => {
      const filtered = { ...item };
      sensitiveFields.forEach((field) => {
        delete (filtered as any)[field];
      });
      return filtered;
    });
  }

  private getSensitiveFields(authorities: Authority[]): string[] {
    // Support agents can't see payment method details
    if (
      authorities.includes(Authority.SUPPORT_AGENT) &&
      !authorities.includes(Authority.PLATFORM_ADMIN)
    ) {
      return ["paymentMethodDetails", "bankAccountInfo", "cardDetails"];
    }

    // Billing viewers can't see personal information
    if (
      authorities.includes(Authority.BILLING_VIEWER) &&
      !authorities.includes(Authority.TENANT_ADMIN)
    ) {
      return ["personalInfo", "contactDetails", "paymentMethods"];
    }

    return [];
  }

  private checkConditions(
    conditions: Record<string, any>,
    context?: SecurityContext
  ): boolean {
    // Implement condition checking logic
    if (conditions.requiresApproval) {
      // For now, return true - in real implementation, check approval status
      return true;
    }

    if (conditions.maxAmount && context) {
      // Check if operation is within allowed amount limits
      return true;
    }

    return true;
  }

  private canAccessTenant(userId: string, tenantId: string): boolean {
    // In real implementation, check if support agent is assigned to tenant
    // For now, return true
    return true;
  }

  private getAssignedTenants(userId: string): string[] {
    // In real implementation, fetch assigned tenants for support agent
    // For now, return empty array
    return [];
  }

  private getAuthorityActions(authority: Authority): string[] {
    const actions: string[] = [];

    switch (authority) {
      case Authority.TENANT_ADMIN:
        actions.push(
          "create",
          "read",
          "update",
          "cancel",
          "upgrade",
          "download"
        );
        break;
      case Authority.PLATFORM_ADMIN:
        actions.push(
          "create",
          "read",
          "update",
          "delete",
          "cancel",
          "upgrade",
          "suspend",
          "refund",
          "export"
        );
        break;
      case Authority.SUPPORT_AGENT:
        actions.push("read", "extend_trial", "retry_payment", "create_ticket");
        break;
      case Authority.BILLING_VIEWER:
        actions.push("read", "download", "export");
        break;
    }

    return actions;
  }
}

// Singleton instance
export const billingSecurityGuard = new BillingSecurityGuard();
