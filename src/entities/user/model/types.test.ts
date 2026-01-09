import { describe, it, expect } from "vitest";
import type { User, UserContext, UserRegistration, UserProfile } from "./types";

describe("User entity types", () => {
  describe("User type", () => {
    it("should accept valid user object", () => {
      const user: User = {
        userId: 1,
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        roles: ["USER"],
        permissions: ["READ_PROFILE"],
        tenantId: "default",
        organizationId: null,
        emailVerified: true,
        customClaims: {},
      };

      expect(user.userId).toBe(1);
      expect(user.username).toBe("testuser");
      expect(user.email).toBe("test@example.com");
      expect(user.roles).toContain("USER");
    });

    it("should allow emailVerified to be optional", () => {
      const user: User = {
        userId: 1,
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        roles: ["USER"],
        permissions: [],
        tenantId: "default",
        organizationId: null,
        customClaims: {},
      };

      expect(user.emailVerified).toBeUndefined();
    });

    it("should allow multiple roles", () => {
      const user: User = {
        userId: 1,
        username: "admin",
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "User",
        roles: ["USER", "ADMIN"],
        permissions: ["READ_PROFILE", "WRITE_PROFILE"],
        tenantId: "default",
        organizationId: null,
        customClaims: {},
      };

      expect(user.roles).toHaveLength(2);
      expect(user.roles).toContain("ADMIN");
    });

    it("should allow custom claims", () => {
      const user: User = {
        userId: 1,
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        roles: ["USER"],
        permissions: [],
        tenantId: "default",
        organizationId: null,
        customClaims: {
          department: "Engineering",
          level: 5,
        },
      };

      expect(user.customClaims.department).toBe("Engineering");
      expect(user.customClaims.level).toBe(5);
    });
  });

  describe("UserContext type", () => {
    it("should accept valid user context object", () => {
      const context: UserContext = {
        userId: 1,
        username: "testuser",
        email: "test@example.com",
        roles: ["USER"],
        permissions: ["READ_PROFILE"],
        firstName: "Test",
        lastName: "User",
        tenantId: "default",
        organizationId: null,
        customClaims: {},
      };

      expect(context.userId).toBe(1);
      expect(context.tenantId).toBe("default");
    });
  });

  describe("UserRegistration type", () => {
    it("should accept valid registration data", () => {
      const registration: UserRegistration = {
        username: "newuser",
        email: "new@example.com",
        password: "Password123!",
        firstName: "New",
        lastName: "User",
      };

      expect(registration.username).toBe("newuser");
      expect(registration.password).toBe("Password123!");
    });

    it("should allow optional tenantId", () => {
      const registration: UserRegistration = {
        username: "newuser",
        email: "new@example.com",
        password: "Password123!",
        firstName: "New",
        lastName: "User",
        tenantId: "custom-tenant",
      };

      expect(registration.tenantId).toBe("custom-tenant");
    });

    it("should work without tenantId", () => {
      const registration: UserRegistration = {
        username: "newuser",
        email: "new@example.com",
        password: "Password123!",
        firstName: "New",
        lastName: "User",
      };

      expect(registration.tenantId).toBeUndefined();
    });
  });

  describe("UserProfile type", () => {
    it("should accept valid user profile", () => {
      const profile: UserProfile = {
        userId: 1,
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        emailVerified: true,
        createdAt: "2024-01-01T00:00:00Z",
      };

      expect(profile.emailVerified).toBe(true);
      expect(profile.createdAt).toBe("2024-01-01T00:00:00Z");
    });

    it("should allow optional updatedAt", () => {
      const profile: UserProfile = {
        userId: 1,
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        emailVerified: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
      };

      expect(profile.updatedAt).toBe("2024-01-15T00:00:00Z");
    });

    it("should work without updatedAt", () => {
      const profile: UserProfile = {
        userId: 1,
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        emailVerified: false,
        createdAt: "2024-01-01T00:00:00Z",
      };

      expect(profile.updatedAt).toBeUndefined();
    });
  });

  describe("Type compatibility", () => {
    it("should allow User to be used where UserContext is expected for common fields", () => {
      const user: User = {
        userId: 1,
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        roles: ["USER"],
        permissions: [],
        tenantId: "default",
        organizationId: null,
        customClaims: {},
      };

      // Extract UserContext from User
      const context: UserContext = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        customClaims: user.customClaims,
      };

      expect(context.userId).toBe(user.userId);
      expect(context.username).toBe(user.username);
    });
  });
});
