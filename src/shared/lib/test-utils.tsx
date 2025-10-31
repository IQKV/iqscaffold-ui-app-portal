import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { AuthProvider } from "./auth-provider";
import { AuthContext, type AuthContextType } from "./auth-context";
import { theme } from "@/app/theme";
import type { UserContext } from "@/entities/user";

interface TestWrapperProps {
  children: ReactNode;
  mockUser?: UserContext | null;
}

// Mock authenticated user for tests
const defaultMockUser: UserContext = {
  userId: 1,
  username: "testuser",
  email: "test@example.com",
  roles: ["ADMIN"],
  permissions: ["users:read", "users:write", "users:delete"],
  firstName: "Test",
  lastName: "User",
  tenantId: "test-tenant",
  customClaims: {},
};

export function TestWrapper({
  children,
  mockUser = defaultMockUser,
}: TestWrapperProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  // Mock auth context for tests
  const mockAuthContext: AuthContextType = {
    user: mockUser,
    isAuthenticated: !!mockUser,
    isLoading: false,
    hasRole: (role: string) => mockUser?.roles?.includes(role) ?? false,
    hasAnyRole: (roles: string[]) =>
      roles.some((role) => mockUser?.roles?.includes(role) ?? false),
    hasAllRoles: (roles: string[]) =>
      roles.every((role) => mockUser?.roles?.includes(role) ?? false),
    hasPermission: (permission: string) =>
      mockUser?.permissions?.includes(permission) ?? false,
    isAdmin: () =>
      mockUser?.roles?.includes("ADMIN") ||
      mockUser?.roles?.includes("SUPER_ADMIN") ||
      false,
    isSuperAdmin: () => mockUser?.roles?.includes("SUPER_ADMIN") || false,
    canManageUsers: () =>
      mockUser?.roles?.includes("ADMIN") ||
      mockUser?.roles?.includes("SUPER_ADMIN") ||
      false,
    login: () => {},
    logout: () => {},
    refreshUser: () => {},
  };

  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <QueryClientProvider client={queryClient}>
          <AuthContext.Provider value={mockAuthContext}>
            {children}
          </AuthContext.Provider>
        </QueryClientProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}

export function createTestWrapper() {
  return ({ children }: { children: ReactNode }) => (
    <TestWrapper>{children}</TestWrapper>
  );
}
