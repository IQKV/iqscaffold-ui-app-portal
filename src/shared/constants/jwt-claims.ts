/**
 * Standard JWT claim names used across the Gripday platform.
 * Follows JWT RFC conventions using snake_case for claim names.
 */

// Standard JWT claims (RFC 7519)
export const JWT_CLAIM_SUBJECT = "sub";
export const JWT_CLAIM_ISSUER = "iss";
export const JWT_CLAIM_ISSUED_AT = "iat";
export const JWT_CLAIM_EXPIRATION = "exp";
export const JWT_CLAIM_JWT_ID = "jti";

// Custom Gripday claims
export const JWT_CLAIM_TYPE = "type";
export const JWT_CLAIM_USER_ID = "userId";
export const JWT_CLAIM_USERNAME = "username";
export const JWT_CLAIM_EMAIL = "email";
export const JWT_CLAIM_ROLES = "roles";
export const JWT_CLAIM_PERMISSIONS = "permissions";
export const JWT_CLAIM_FIRST_NAME = "firstName";
export const JWT_CLAIM_LAST_NAME = "lastName";
export const JWT_CLAIM_TENANT_ID = "tenant_id";
export const JWT_CLAIM_CUSTOM_CLAIMS = "customClaims";

// Token types
export const JWT_TOKEN_TYPE_ACCESS = "access";
export const JWT_TOKEN_TYPE_REFRESH = "refresh";
