export interface AuthEndpoints {
  login: string;
  signup: string;
  refresh: string;
  logout: string;
  forgotPassword: string;
  resetPassword: string;
  verifyEmail: string;
  resendVerification: string;
  validateToken: string;
  changePassword: string;
  logoutAll: string;
  emailStatus: string;
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
const DEFAULT_AUTH_DOMAIN = "https://auth.iqkv.com";
const DEFAULT_APP_DOMAIN = "https://app.iqkv.com";

// Build auth configuration from environment variables with fallbacks
const buildAuthConfig = (): AuthConfig => {
  const authDomain =
    import.meta.env.VITE_AUTH_DOMAIN_AUTH ?? DEFAULT_AUTH_DOMAIN;
  const appDomain = import.meta.env.VITE_AUTH_DOMAIN_APP ?? DEFAULT_APP_DOMAIN;

  return {
    endpoints: {
      login: "/api/v1/auth/login",
      signup: "/api/v1/auth/signup",
      refresh: "/api/v1/auth/refresh",
      logout: "/api/v1/auth/logout",
      forgotPassword: "/api/v1/password/forgot",
      resetPassword: "/api/v1/password/reset",
      verifyEmail: "/api/v1/auth/email/verify",
      resendVerification: "/api/v1/auth/email/resend",
      validateToken: "/api/v1/auth/validate",
      changePassword: "/api/v1/password/change",
      logoutAll: "/api/v1/auth/logout-all",
      emailStatus: "/api/v1/auth/email/status",
    },
    tokenStorage: {
      accessTokenKey: "accessToken",
      refreshTokenKey: "refreshToken",
    },
    redirects: {
      afterLogin: import.meta.env.VITE_AUTH_REDIRECT_AFTER_LOGIN ?? appDomain,
      afterLogout:
        import.meta.env.VITE_AUTH_REDIRECT_AFTER_LOGOUT ?? authDomain,
      afterSignup:
        import.meta.env.VITE_AUTH_REDIRECT_AFTER_SIGNUP ?? authDomain,
    },
    domains: {
      auth: authDomain,
      app: appDomain,
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
