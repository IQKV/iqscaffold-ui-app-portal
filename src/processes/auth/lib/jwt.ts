import { jwtDecode } from "jwt-decode";
import type { UserContext } from "@/entities/user";

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

export function decodeUser(token: string): {
  user: UserContext | null;
  exp: number | null;
} {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (!decoded?.exp) {
      return { user: null, exp: null };
    }
    if (decoded.exp * 1000 < Date.now()) {
      return { user: null, exp: decoded.exp * 1000 };
    }
    return {
      user: {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        tenantId: decoded.tenantId,
        customClaims: decoded.customClaims || {},
      },
      exp: decoded.exp * 1000,
    };
  } catch {
    return { user: null, exp: null };
  }
}
