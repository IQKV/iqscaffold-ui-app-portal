import { useEffect, useState, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { getAuthConfig } from "@/app/config";
import type { UserContext } from "@/entities/user";
import { AuthContext, type AuthContextType } from "./auth-context";

interface JWTPayload {
  sub: string;
  userId: number;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  firstName: string;
  lastName: string;
  tenantId: string;
  customClaims: Record<string, unknown>;
  exp: number;
  iat: number;
}

const decodeToken = (token: string): UserContext | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      roles: decoded.roles || [],
      permissions: decoded.permissions || [],
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      tenantId: decoded.tenantId,
      customClaims: decoded.customClaims || {},
    };
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const config = getAuthConfig();

  // Initialize user state from token on mount
  useEffect(() => {
    const initializeAuth = () => {
      const accessToken = localStorage.getItem(
        config.tokenStorage.accessTokenKey
      );

      if (accessToken) {
        const userData = decodeToken(accessToken);
        setUser(userData);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is intentional for initialization

  // Listen for storage changes (e.g., login/logout in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const accessToken = localStorage.getItem(
        config.tokenStorage.accessTokenKey
      );

      if (accessToken) {
        const userData = decodeToken(accessToken);
        setUser(userData);
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is intentional for event listener setup

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every((role) => hasRole(role));
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false;
  };

  const isAdmin = (): boolean => {
    return hasRole("ADMIN") || hasRole("SUPER_ADMIN");
  };

  const isSuperAdmin = (): boolean => {
    return hasRole("SUPER_ADMIN");
  };

  const canManageUsers = (): boolean => {
    return hasRole("ADMIN") || hasRole("SUPER_ADMIN");
  };

  const login = (tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem(
      config.tokenStorage.accessTokenKey,
      tokens.accessToken
    );
    localStorage.setItem(
      config.tokenStorage.refreshTokenKey,
      tokens.refreshToken
    );

    const userData = decodeToken(tokens.accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(config.tokenStorage.accessTokenKey);
    localStorage.removeItem(config.tokenStorage.refreshTokenKey);
    setUser(null);
  };

  const refreshUser = () => {
    const accessToken = localStorage.getItem(
      config.tokenStorage.accessTokenKey
    );

    if (accessToken) {
      const userData = decodeToken(accessToken);
      setUser(userData);
    } else {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    isAdmin,
    isSuperAdmin,
    canManageUsers,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
