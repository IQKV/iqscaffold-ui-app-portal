import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getTenantFromStorage,
  setTenantInStorage,
  resolveTenantId,
  createTenantCacheKey,
} from "./tenant-utils";

describe("Tenant Utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv("DEV", true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getTenantFromStorage", () => {
    it("returns null when no tenant is stored", () => {
      expect(getTenantFromStorage()).toBeNull();
    });

    it("returns tenant ID when stored", () => {
      localStorage.setItem("tenantId", "tenant-123");
      expect(getTenantFromStorage()).toBe("tenant-123");
    });

    it("returns null on storage error", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage error");
      });
      expect(getTenantFromStorage()).toBeNull();
    });
  });

  describe("setTenantInStorage", () => {
    it("stores tenant ID in localStorage", () => {
      vi.restoreAllMocks();
      setTenantInStorage("tenant-456");
      expect(localStorage.getItem("tenantId")).toBe("tenant-456");
    });

    it("removes tenant ID when null is provided", () => {
      vi.restoreAllMocks();
      localStorage.setItem("tenantId", "tenant-789");
      setTenantInStorage(null);
      expect(localStorage.getItem("tenantId")).toBeNull();
    });

    it("handles storage errors gracefully", () => {
      vi.restoreAllMocks();
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage error");
      });
      expect(() => setTenantInStorage("tenant-error")).not.toThrow();
      vi.restoreAllMocks();
    });
  });

  describe("resolveTenantId", () => {
    it("returns tenant ID from storage in dev mode", () => {
      vi.restoreAllMocks();
      localStorage.setItem("tenantId", "dev-tenant");
      expect(resolveTenantId()).toBe("dev-tenant");
    });

    it("returns default tenant in production mode", () => {
      vi.restoreAllMocks();
      vi.stubEnv("DEV", false);
      localStorage.setItem("tenantId", "prod-tenant");
      expect(resolveTenantId()).toBe("default");
    });

    it("returns default tenant when no tenant in dev mode", () => {
      vi.restoreAllMocks();
      expect(resolveTenantId()).toBe("default");
    });
  });

  describe("createTenantCacheKey", () => {
    it("creates cache key with tenant ID", () => {
      expect(createTenantCacheKey("tenant-123", "users")).toBe("tenant-123:users");
    });

    it("uses default when tenant ID is null", () => {
      expect(createTenantCacheKey(null, "users")).toBe("default:users");
    });

    it("handles complex keys", () => {
      expect(createTenantCacheKey("tenant-456", "users:list:page:1")).toBe(
        "tenant-456:users:list:page:1",
      );
    });
  });
});
