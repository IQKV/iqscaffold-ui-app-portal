import { describe, it, expect } from "vitest";
import type { UserContext } from "@/entities/user";
import {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  isSuperAdmin,
  getUserDisplayName,
  getUserInitials,
  belongsToTenant,
  formatUserRoles,
  isActiveUser,
  getUserRoleLevel,
  hasRoleLevel,
  ROLE_HIERARCHY,
} from "./auth-utils";

describe("Auth Utils", () => {
  const mockUser: UserContext = {
    userId: 1,
    username: "john_doe",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    authorities: ["USER", "ADMIN"],
    permissions: ["read:users", "write:users"],
    tenantId: "tenant-123",
    organizationId: null,
    customClaims: {},
  };

  describe("hasRole", () => {
    it("returns true when user has the role", () => {
      expect(hasRole(mockUser, "USER")).toBe(true);
      expect(hasRole(mockUser, "ADMIN")).toBe(true);
    });

    it("returns false when user does not have the role", () => {
      expect(hasRole(mockUser, "SUPER_ADMIN")).toBe(false);
    });

    it("returns false for null user", () => {
      expect(hasRole(null, "USER")).toBe(false);
    });
  });

  describe("hasAnyRole", () => {
    it("returns true when user has any of the roles", () => {
      expect(hasAnyRole(mockUser, ["USER", "SUPER_ADMIN"])).toBe(true);
    });

    it("returns false when user has none of the roles", () => {
      expect(hasAnyRole(mockUser, ["SUPER_ADMIN", "MODERATOR"])).toBe(false);
    });

    it("returns false for null user", () => {
      expect(hasAnyRole(null, ["USER"])).toBe(false);
    });
  });

  describe("hasAllRoles", () => {
    it("returns true when user has all roles", () => {
      expect(hasAllRoles(mockUser, ["USER", "ADMIN"])).toBe(true);
    });

    it("returns false when user is missing a role", () => {
      expect(hasAllRoles(mockUser, ["USER", "SUPER_ADMIN"])).toBe(false);
    });

    it("returns false for null user", () => {
      expect(hasAllRoles(null, ["USER"])).toBe(false);
    });
  });

  describe("hasPermission", () => {
    it("returns true when user has the permission", () => {
      expect(hasPermission(mockUser, "read:users")).toBe(true);
    });

    it("returns false when user does not have the permission", () => {
      expect(hasPermission(mockUser, "delete:users")).toBe(false);
    });

    it("returns false for null user", () => {
      expect(hasPermission(null, "read:users")).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("returns true when user has any permission", () => {
      expect(hasAnyPermission(mockUser, ["read:users", "delete:users"])).toBe(
        true
      );
    });

    it("returns false when user has no permissions", () => {
      expect(hasAnyPermission(mockUser, ["delete:users", "admin:all"])).toBe(
        false
      );
    });
  });

  describe("hasAllPermissions", () => {
    it("returns true when user has all permissions", () => {
      expect(hasAllPermissions(mockUser, ["read:users", "write:users"])).toBe(
        true
      );
    });

    it("returns false when user is missing a permission", () => {
      expect(hasAllPermissions(mockUser, ["read:users", "delete:users"])).toBe(
        false
      );
    });
  });

  describe("isAdmin", () => {
    it("returns true for ADMIN role", () => {
      expect(isAdmin(mockUser)).toBe(true);
    });

    it("returns true for SUPER_ADMIN role", () => {
      const superAdmin = { ...mockUser, authorities: ["SUPER_ADMIN"] };
      expect(isAdmin(superAdmin)).toBe(true);
    });

    it("returns false for regular user", () => {
      const regularUser = { ...mockUser, authorities: ["USER"] };
      expect(isAdmin(regularUser)).toBe(false);
    });
  });

  describe("isSuperAdmin", () => {
    it("returns true for SUPER_ADMIN role", () => {
      const superAdmin = { ...mockUser, authorities: ["SUPER_ADMIN"] };
      expect(isSuperAdmin(superAdmin)).toBe(true);
    });

    it("returns false for ADMIN role", () => {
      expect(isSuperAdmin(mockUser)).toBe(false);
    });
  });

  describe("getUserDisplayName", () => {
    it("returns full name when available", () => {
      expect(getUserDisplayName(mockUser)).toBe("John Doe");
    });

    it("returns username when no name", () => {
      const user = { ...mockUser, firstName: "", lastName: "" };
      expect(getUserDisplayName(user)).toBe("john_doe");
    });

    it("returns email when no name or username", () => {
      const user = {
        ...mockUser,
        firstName: "",
        lastName: "",
        username: "",
      };
      expect(getUserDisplayName(user)).toBe("john@example.com");
    });

    it("returns Anonymous for null user", () => {
      expect(getUserDisplayName(null)).toBe("Anonymous");
    });
  });

  describe("getUserInitials", () => {
    it("returns initials from first and last name", () => {
      expect(getUserInitials(mockUser)).toBe("JD");
    });

    it("returns first initial only when no last name", () => {
      const user = { ...mockUser, lastName: "" };
      expect(getUserInitials(user)).toBe("J");
    });

    it("returns username initial when no name", () => {
      const user = { ...mockUser, firstName: "", lastName: "" };
      expect(getUserInitials(user)).toBe("J");
    });

    it("returns email initial when no name or username", () => {
      const user = {
        ...mockUser,
        firstName: "",
        lastName: "",
        username: "",
      };
      expect(getUserInitials(user)).toBe("J");
    });

    it("returns A for null user", () => {
      expect(getUserInitials(null)).toBe("A");
    });
  });

  describe("belongsToTenant", () => {
    it("returns true when user belongs to tenant", () => {
      expect(belongsToTenant(mockUser, "tenant-123")).toBe(true);
    });

    it("returns false when user belongs to different tenant", () => {
      expect(belongsToTenant(mockUser, "tenant-456")).toBe(false);
    });

    it("returns false for null user", () => {
      expect(belongsToTenant(null, "tenant-123")).toBe(false);
    });
  });

  describe("formatUserRoles", () => {
    it("formats authorities as comma-separated string", () => {
      expect(formatUserRoles(mockUser)).toBe("USER, ADMIN");
    });

    it("returns No roles for user without authorities", () => {
      const user = { ...mockUser, authorities: [] };
      expect(formatUserRoles(user)).toBe("No roles");
    });

    it("returns No roles for null user", () => {
      expect(formatUserRoles(null)).toBe("No roles");
    });
  });

  describe("isActiveUser", () => {
    it("returns true for user with USER role", () => {
      const user = { ...mockUser, authorities: ["USER"] };
      expect(isActiveUser(user)).toBe(true);
    });

    it("returns true for admin", () => {
      expect(isActiveUser(mockUser)).toBe(true);
    });

    it("returns false for user without USER role", () => {
      const user = { ...mockUser, authorities: ["GUEST"] };
      expect(isActiveUser(user)).toBe(false);
    });
  });

  describe("getUserRoleLevel", () => {
    it("returns correct level for USER", () => {
      const user = { ...mockUser, authorities: ["USER"] };
      expect(getUserRoleLevel(user)).toBe(ROLE_HIERARCHY.USER);
    });

    it("returns correct level for ADMIN", () => {
      expect(getUserRoleLevel(mockUser)).toBe(ROLE_HIERARCHY.ADMIN);
    });

    it("returns highest level when user has multiple authorities", () => {
      const user = {
        ...mockUser,
        authorities: ["USER", "ADMIN", "SUPER_ADMIN"],
      };
      expect(getUserRoleLevel(user)).toBe(ROLE_HIERARCHY.SUPER_ADMIN);
    });

    it("returns 0 for user without recognized authorities", () => {
      const user = { ...mockUser, authorities: ["GUEST"] };
      expect(getUserRoleLevel(user)).toBe(0);
    });

    it("returns 0 for null user", () => {
      expect(getUserRoleLevel(null)).toBe(0);
    });
  });

  describe("hasRoleLevel", () => {
    it("returns true when user has required level", () => {
      expect(hasRoleLevel(mockUser, ROLE_HIERARCHY.USER)).toBe(true);
      expect(hasRoleLevel(mockUser, ROLE_HIERARCHY.ADMIN)).toBe(true);
    });

    it("returns false when user level is below required", () => {
      expect(hasRoleLevel(mockUser, ROLE_HIERARCHY.SUPER_ADMIN)).toBe(false);
    });

    it("returns false for null user", () => {
      expect(hasRoleLevel(null, ROLE_HIERARCHY.USER)).toBe(false);
    });
  });
});
