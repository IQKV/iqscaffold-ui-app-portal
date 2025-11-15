import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { AuthContext, type AuthContextType } from "./auth-context";
import { theme } from "@/app/theme";
import type { UserContext } from "@/entities/user";
import { defaultMockUser } from "./test-constants";

interface TestWrapperProps {
  children: ReactNode;
  mockUser?: UserContext | null;
}

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
