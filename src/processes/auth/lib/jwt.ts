import { jwtDecode } from "jwt-decode";
import type { UserContext } from "@/entities/user";
import {
  JWT_CLAIM_SUBJECT,
  JWT_CLAIM_USER_ID,
  JWT_CLAIM_USERNAME,
  JWT_CLAIM_EMAIL,
  JWT_CLAIM_AUTHORITIES,
  JWT_CLAIM_PERMISSIONS,
  JWT_CLAIM_FIRST_NAME,
  JWT_CLAIM_LAST_NAME,
  JWT_CLAIM_TENANT_ID,
  JWT_CLAIM_ORGANIZATION_ID,
  JWT_CLAIM_PREFERRED_LOCALE,
  JWT_CLAIM_CUSTOM_CLAIMS,
  JWT_CLAIM_EXPIRATION,
  JWT_CLAIM_ISSUED_AT,
} from "@/shared/constants/jwt-claims";

interface JWTPayload {
  [JWT_CLAIM_SUBJECT]: string;
  [JWT_CLAIM_USER_ID]: number;
  [JWT_CLAIM_USERNAME]: string;
  [JWT_CLAIM_EMAIL]: string;
  [JWT_CLAIM_AUTHORITIES]: string[];
  [JWT_CLAIM_PERMISSIONS]: string[];
  [JWT_CLAIM_FIRST_NAME]: string;
  [JWT_CLAIM_LAST_NAME]: string;
  [JWT_CLAIM_TENANT_ID]: string;
  [JWT_CLAIM_ORGANIZATION_ID]: number;
  [JWT_CLAIM_PREFERRED_LOCALE]: string;
  [JWT_CLAIM_CUSTOM_CLAIMS]: Record<string, unknown>;
  [JWT_CLAIM_EXPIRATION]: number;
  [JWT_CLAIM_ISSUED_AT]: number;
}

export function decodeUser(token: string): {
  user: UserContext | null;
  exp: number | null;
} {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const exp = decoded[JWT_CLAIM_EXPIRATION];

    if (!exp) {
      return { user: null, exp: null };
    }
    if (exp * 1000 < Date.now()) {
      return { user: null, exp: exp * 1000 };
    }
    return {
      user: {
        userId: decoded[JWT_CLAIM_USER_ID],
        username: decoded[JWT_CLAIM_USERNAME],
        email: decoded[JWT_CLAIM_EMAIL],
        authorities: decoded[JWT_CLAIM_AUTHORITIES] || [],
        permissions: decoded[JWT_CLAIM_PERMISSIONS] || [],
        firstName: decoded[JWT_CLAIM_FIRST_NAME],
        lastName: decoded[JWT_CLAIM_LAST_NAME],
        tenantId: decoded[JWT_CLAIM_TENANT_ID],
        organizationId: decoded[JWT_CLAIM_ORGANIZATION_ID] || null,
        customClaims: {
          ...(decoded[JWT_CLAIM_CUSTOM_CLAIMS] || {}),
          preferredLocale: decoded[JWT_CLAIM_PREFERRED_LOCALE],
        },
      },
      exp: exp * 1000,
    };
  } catch {
    return { user: null, exp: null };
  }
}
