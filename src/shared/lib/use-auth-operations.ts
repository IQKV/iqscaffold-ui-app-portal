import { useAuth } from "./use-auth-hook";
import {
  canCreateUsers,
  canUpdateUsers,
  canDeleteUsers,
  canReadUsers,
  canManageUsers as canManageUsersUtil,
} from "./auth-utils";

/**
 * Hook that provides authorization checks for common operations
 */
export function useAuthOperations() {
  const { user } = useAuth();

  return {
    // User management operations
    canReadUsers: canReadUsers(user),
    canCreateUsers: canCreateUsers(user),
    canUpdateUsers: canUpdateUsers(user),
    canDeleteUsers: canDeleteUsers(user),
    canManageUsers: canManageUsersUtil(user),

    // Quick role checks
    isUser: user?.roles?.includes("USER") ?? false,
    isAdmin: user?.roles?.includes("ADMIN") ?? false,
    isSuperAdmin: user?.roles?.includes("SUPER_ADMIN") ?? false,

    // Current user info
    currentUser: user,
    userId: user?.userId,
    username: user?.username,
    email: user?.email,
    tenantId: user?.tenantId,
  };
}
