import { createContext } from "react";
import type { UserContext } from "@/entities/user";

export interface AuthContextType {
  user: UserContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isTenantOwner: () => boolean;
  canManageUsers: () => boolean;
  
  // Billing authorization checks
  hasBillingAccess: () => boolean;
  canModifyBilling: () => boolean;
  hasReadOnlyBillingAccess: () => boolean;
  canProcessRefunds: () => boolean;
  canManageMerchants: () => boolean;
  canViewPayments: () => boolean;
  canViewPayouts: () => boolean;
  isBillingAdmin: () => boolean;
  isFinanceViewer: () => boolean;
  
  login: (tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
