/**
 * Security Guard Tests
 * Tests for the authority-based access control system
 */

import { describe, it, expect, beforeEach } from "vitest";
import { BillingSecurityGuard } from "./security-guard";
import { Authority, SecurityContext } from "@/shared/types/authority";

describe("BillingSecurityGuard", () => {
  let securityGuard: BillingSecurityGuard;
  let mockContext: SecurityContext;

  beforeEach(() => {
    securityGuard = new BillingSecurityGuard();
    mockContext = {
      userId: "user123",
      tenantId: "tenant456",
      sessionId: "session789",
    };
  });

  describe("canAccess", () => {
    it("should allow tenant admin to read subscription in their tenant", () => {
      const result = securityGuard.canAccess(
        [Authority.TENANT_ADMIN],
        "subscription",
        "read",
        mockContext
      );
      expect(result).toBe(true);
    });

    it("should allow platform admin to access any resource", () => {
      const result = securityGuard.canAccess(
        [Authority.PLATFORM_ADMIN],
        "subscription",
        "delete",
        mockContext
      );
      expect(result).toBe(true);
    });

    it("should deny billing viewer from updating subscription", () => {
      const result = securityGuard.canAccess(
        [Authority.BILLING_VIEWER],
        "subscription",
        "update",
        mockContext
      );
      expect(result).toBe(false);
    });

    it("should allow billing viewer to read subscription", () => {
      const result = securityGuard.canAccess(
        [Authority.BILLING_VIEWER],
        "subscription",
        "read",
        mockContext
      );
      expect(result).toBe(true);
    });

    it("should allow support agent to read subscription", () => {
      const result = securityGuard.canAccess(
        [Authority.SUPPORT_AGENT],
        "subscription",
        "read",
        mockContext
      );
      expect(result).toBe(true);
    });

    it("should deny access when no authorities match", () => {
      const result = securityGuard.canAccess(
        [],
        "subscription",
        "read",
        mockContext
      );
      expect(result).toBe(false);
    });

    it("should deny access for unknown resource", () => {
      const result = securityGuard.canAccess(
        [Authority.TENANT_ADMIN],
        "unknown_resource",
        "read",
        mockContext
      );
      expect(result).toBe(false);
    });

    it("should deny access for unknown action", () => {
      const result = securityGuard.canAccess(
        [Authority.TENANT_ADMIN],
        "subscription",
        "unknown_action",
        mockContext
      );
      expect(result).toBe(false);
    });
  });

  describe("checkWidgetVisibility", () => {
    it("should show BillingOverview to tenant admin", () => {
      const result = securityGuard.checkWidgetVisibility("BillingOverview", [
        Authority.TENANT_ADMIN,
      ]);
      expect(result).toBe(true);
    });

    it("should show RevenueAnalytics to platform admin", () => {
      const result = securityGuard.checkWidgetVisibility("RevenueAnalytics", [
        Authority.PLATFORM_ADMIN,
      ]);
      expect(result).toBe(true);
    });

    it("should hide PaymentMethods from billing viewer", () => {
      const result = securityGuard.checkWidgetVisibility("PaymentMethods", [
        Authority.BILLING_VIEWER,
      ]);
      expect(result).toBe(false);
    });

    it("should hide unknown widget", () => {
      const result = securityGuard.checkWidgetVisibility("UnknownWidget", [
        Authority.PLATFORM_ADMIN,
      ]);
      expect(result).toBe(false);
    });
  });

  describe("filterData", () => {
    const mockData = [
      { id: "1", tenantId: "tenant456", name: "Item 1" },
      { id: "2", tenantId: "tenant789", name: "Item 2" },
      { id: "3", tenantId: "tenant456", name: "Item 3" },
    ];

    it("should return all data for platform admin", () => {
      const result = securityGuard.filterData(
        mockData,
        [Authority.PLATFORM_ADMIN],
        mockContext
      );
      expect(result).toHaveLength(3);
    });

    it("should filter data by tenant for tenant admin", () => {
      const result = securityGuard.filterData(
        mockData,
        [Authority.TENANT_ADMIN],
        mockContext
      );
      expect(result).toHaveLength(2);
      expect(result.every((item) => item.tenantId === "tenant456")).toBe(true);
    });

    it("should filter data by tenant for billing viewer", () => {
      const result = securityGuard.filterData(
        mockData,
        [Authority.BILLING_VIEWER],
        mockContext
      );
      expect(result).toHaveLength(2);
      expect(result.every((item) => item.tenantId === "tenant456")).toBe(true);
    });

    it("should return empty array for no authorities", () => {
      const result = securityGuard.filterData(mockData, [], mockContext);
      expect(result).toHaveLength(0);
    });
  });

  describe("getVisibleComponents", () => {
    it("should return appropriate components for tenant admin", () => {
      const result = securityGuard.getVisibleComponents(
        [Authority.TENANT_ADMIN],
        mockContext
      );

      expect(result.pages).toContain("billing-overview");
      expect(result.pages).toContain("subscription-management");
      expect(result.pages).not.toContain("admin-revenue-dashboard");
      expect(result.widgets).toContain("BillingOverview");
      expect(result.widgets).toContain("SubscriptionCard");
    });

    it("should return appropriate components for platform admin", () => {
      const result = securityGuard.getVisibleComponents(
        [Authority.PLATFORM_ADMIN],
        mockContext
      );

      expect(result.pages).toContain("admin-revenue-dashboard");
      expect(result.pages).toContain("tenant-management");
      expect(result.widgets).toContain("RevenueAnalytics");
      expect(result.widgets).toContain("TenantManagement");
    });

    it("should return limited components for billing viewer", () => {
      const result = securityGuard.getVisibleComponents(
        [Authority.BILLING_VIEWER],
        mockContext
      );

      expect(result.pages).toContain("billing-reports");
      expect(result.pages).toContain("usage-analytics");
      expect(result.pages).not.toContain("subscription-management");
      expect(result.widgets).toContain("UsageMetrics");
      expect(result.widgets).not.toContain("PaymentMethods");
    });
  });

  describe("filterSensitiveFields", () => {
    const mockDataWithSensitive = [
      {
        id: "1",
        name: "Item 1",
        paymentMethodDetails: "sensitive",
        personalInfo: "sensitive",
        publicInfo: "public",
      },
    ];

    it("should filter sensitive fields for support agent", () => {
      const result = securityGuard.filterSensitiveFields(
        mockDataWithSensitive,
        [Authority.SUPPORT_AGENT]
      );

      expect(result[0]).not.toHaveProperty("paymentMethodDetails");
      expect(result[0]).toHaveProperty("publicInfo");
    });

    it("should filter personal info for billing viewer", () => {
      const result = securityGuard.filterSensitiveFields(
        mockDataWithSensitive,
        [Authority.BILLING_VIEWER]
      );

      expect(result[0]).not.toHaveProperty("personalInfo");
      expect(result[0]).toHaveProperty("publicInfo");
    });

    it("should not filter fields for platform admin", () => {
      const result = securityGuard.filterSensitiveFields(
        mockDataWithSensitive,
        [Authority.PLATFORM_ADMIN]
      );

      expect(result[0]).toHaveProperty("paymentMethodDetails");
      expect(result[0]).toHaveProperty("personalInfo");
      expect(result[0]).toHaveProperty("publicInfo");
    });
  });
});
