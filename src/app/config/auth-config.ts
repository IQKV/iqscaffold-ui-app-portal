import { getConfig } from "./index";

export interface AuthEndpoints {
  login: string;
  signup: string;
  refresh: string;
  logout: string;
  forgotPassword: string;
  resetPassword: string;
  verifyEmail: string;
  resendVerification: string;
}

export interface AuthConfig {
  endpoints: AuthEndpoints;
  tokenStorage: {
    accessTokenKey: string;
    refreshTokenKey: string;
  };
  redirects: {
    afterLogin: string;
    afterLogout: string;
    afterSignup: string;
  };
  domains: {
    auth: string;
    app: string;
  };
}

// Default hardcoded values (fallbacks)
const DEFAULT_AUTH_DOMAIN = "https://auth.gripday.com";
const DEFAULT_APP_DOMAIN = "https://app.gripday.com";

// Build auth configuration from environment variables with fallbacks
const buildAuthConfig = (): AuthConfig => {
  const authDomain = getConfig("VITE_AUTH_DOMAIN_AUTH", DEFAULT_AUTH_DOMAIN);
  const appDomain = getConfig("VITE_AUTH_DOMAIN_APP", DEFAULT_APP_DOMAIN);

  return {
    endpoints: {
      login: "/api/v1/auth/login",
      signup: "/api/v1/auth/signup",
      refresh: "/api/v1/auth/refresh",
      logout: "/api/v1/auth/logout",
      forgotPassword: "/api/v1/auth/forgot-password",
      resetPassword: "/api/v1/auth/reset-password",
      verifyEmail: "/api/v1/auth/email/verify",
      resendVerification: "/api/v1/auth/email/resend",
    },
    tokenStorage: {
      accessTokenKey: "accessToken",
      refreshTokenKey: "refreshToken",
    },
    redirects: {
      afterLogin: getConfig("VITE_AUTH_REDIRECT_AFTER_LOGIN", appDomain!),
      afterLogout: getConfig("VITE_AUTH_REDIRECT_AFTER_LOGOUT", authDomain!),
      afterSignup: getConfig("VITE_AUTH_REDIRECT_AFTER_SIGNUP", authDomain!),
    },
    domains: {
      auth: authDomain!,
      app: appDomain!,
    },
  };
};

// Default auth configuration from environment
export const defaultAuthConfig: AuthConfig = buildAuthConfig();

// Allow configuration override
let authConfig: AuthConfig = defaultAuthConfig;

export const configureAuth = (
  config: Partial<AuthConfig> & {
    endpoints?: Partial<AuthEndpoints>;
    tokenStorage?: Partial<AuthConfig["tokenStorage"]>;
    redirects?: Partial<AuthConfig["redirects"]>;
    domains?: Partial<AuthConfig["domains"]>;
  }
) => {
  authConfig = {
    ...authConfig,
    ...config,
    endpoints: {
      ...authConfig.endpoints,
      ...(config.endpoints || {}),
    },
    tokenStorage: {
      ...authConfig.tokenStorage,
      ...(config.tokenStorage || {}),
    },
    redirects: {
      ...authConfig.redirects,
      ...(config.redirects || {}),
    },
    domains: {
      ...authConfig.domains,
      ...(config.domains || {}),
    },
  };
};

export const getAuthConfig = (): AuthConfig => authConfig;
