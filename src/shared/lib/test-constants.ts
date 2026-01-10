import type { UserContext } from "@/entities/user";

// Mock authenticated user for tests
export const defaultMockUser: UserContext = {
  userId: 1,
  username: "testuser",
  email: "test@example.com",
  authorities: ["ADMIN"],
  permissions: ["users:read", "users:write", "users:delete"],
  firstName: "Test",
  lastName: "User",
  tenantId: "test-tenant",
  organizationId: null,
  customClaims: {},
};
