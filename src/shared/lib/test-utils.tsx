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
    hasAuthority: (authority: string) => mockUser?.authorities?.includes(authority) ?? false,
    hasAnyAuthority: (authorities: string[]) =>
      authorities.some((authority) => mockUser?.authorities?.includes(authority) ?? false),
    hasAllAuthorities: (authorities: string[]) =>
      authorities.every((authority) => mockUser?.authorities?.includes(authority) ?? false),
    hasPermission: (permission: string) =>
      mockUser?.permissions?.includes(permission) ?? false,
    isAdmin: () =>
      mockUser?.authorities?.includes("ADMIN") ||
      mockUser?.authorities?.includes("SUPER_ADMIN") ||
      false,
    isSuperAdmin: () => mockUser?.authorities?.includes("SUPER_ADMIN") || false,
    isTenantOwner: () => mockUser?.authorities?.includes("TENANT_OWNER") || false,
    canManageUsers: () =>
      mockUser?.authorities?.includes("ADMIN") ||
      mockUser?.authorities?.includes("SUPER_ADMIN") ||
      false,
    hasBillingAccess: () => true,
    canModifyBilling: () => true,
    hasReadOnlyBillingAccess: () => false,
    canProcessRefunds: () => true,
    canManageMerchants: () => true,
    canViewPayments: () => true,
    canViewPayouts: () => true,
    isBillingAdmin: () => true,
    isFinanceViewer: () => false,
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
