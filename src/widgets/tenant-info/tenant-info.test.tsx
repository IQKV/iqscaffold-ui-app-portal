import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestWrapper } from "@/shared/lib/test-utils";
import { TenantInfo } from "./tenant-info";
import * as tenantHooks from "@/processes/tenant";

vi.mock("@/processes/tenant", () => ({
  useCurrentTenantId: vi.fn(),
  useCurrentTenant: vi.fn(),
}));

describe("TenantInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("DEV", true);
  });

  describe("in development mode", () => {
    it("renders tenant info when tenant ID exists", () => {
      vi.mocked(tenantHooks.useCurrentTenantId).mockReturnValue("tenant-123");
      vi.mocked(tenantHooks.useCurrentTenant).mockReturnValue({
        id: 123,
        tenantId: "tenant-123",
        name: "Test Tenant",
        enabled: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      });

      render(<TenantInfo />, { wrapper: TestWrapper });

      expect(screen.getByText("Tenant Context")).toBeInTheDocument();
      expect(screen.getByText("tenant-123")).toBeInTheDocument();
      expect(screen.getByText("Test Tenant")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("renders disabled status for disabled tenant", () => {
      vi.mocked(tenantHooks.useCurrentTenantId).mockReturnValue("tenant-456");
      vi.mocked(tenantHooks.useCurrentTenant).mockReturnValue({
        id: 456,
        tenantId: "tenant-456",
        name: "Disabled Tenant",
        enabled: false,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      });

      render(<TenantInfo />, { wrapper: TestWrapper });

      expect(screen.getByText("Disabled")).toBeInTheDocument();
    });

    it("renders no tenant message when tenant ID is null", () => {
      vi.mocked(tenantHooks.useCurrentTenantId).mockReturnValue(null);
      vi.mocked(tenantHooks.useCurrentTenant).mockReturnValue(null);

      render(<TenantInfo />, { wrapper: TestWrapper });

      expect(
        screen.getByText("No tenant context (system mode)")
      ).toBeInTheDocument();
    });

    it("shows dev hint in development mode", () => {
      vi.mocked(tenantHooks.useCurrentTenantId).mockReturnValue(null);
      vi.mocked(tenantHooks.useCurrentTenant).mockReturnValue(null);

      render(<TenantInfo />, { wrapper: TestWrapper });

      expect(
        screen.getByText(/Dev: Set tenant via localStorage/)
      ).toBeInTheDocument();
    });
  });

  describe("in production mode", () => {
    beforeEach(() => {
      vi.stubEnv("DEV", false);
    });

    it("does not render by default in production", () => {
      vi.mocked(tenantHooks.useCurrentTenantId).mockReturnValue("tenant-123");
      vi.mocked(tenantHooks.useCurrentTenant).mockReturnValue({
        id: 123,
        tenantId: "tenant-123",
        name: "Test Tenant",
        enabled: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      });

      render(<TenantInfo />, { wrapper: TestWrapper });

      expect(screen.queryByText("Tenant Context")).not.toBeInTheDocument();
    });

    it("renders when showInProduction is true", () => {
      vi.mocked(tenantHooks.useCurrentTenantId).mockReturnValue("tenant-123");
      vi.mocked(tenantHooks.useCurrentTenant).mockReturnValue({
        id: 123,
        tenantId: "tenant-123",
        name: "Test Tenant",
        enabled: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      });

      render(<TenantInfo showInProduction />, { wrapper: TestWrapper });

      expect(screen.getByText("Tenant Context")).toBeInTheDocument();
    });

    it("does not show dev hint in production", () => {
      vi.mocked(tenantHooks.useCurrentTenantId).mockReturnValue(null);
      vi.mocked(tenantHooks.useCurrentTenant).mockReturnValue(null);

      render(<TenantInfo showInProduction />, { wrapper: TestWrapper });

      expect(
        screen.queryByText(/Dev: Set tenant via localStorage/)
      ).not.toBeInTheDocument();
    });
  });
});
