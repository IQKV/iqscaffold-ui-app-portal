import {
  API_ENDPOINTS,
  DEFAULTS,
  STORAGE_KEYS,
  ENV_KEYS,
} from "@/shared/constants";

export interface AuthEndpoints {
  refresh: string;
  logout: string;
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

// Build auth configuration from environment variables with fallbacks
const buildAuthConfig = (): AuthConfig => {
  const authDomain =
    import.meta.env[ENV_KEYS.AUTH_DOMAIN_AUTH] ?? DEFAULTS.AUTH_DOMAIN;
  const appDomain =
    import.meta.env[ENV_KEYS.AUTH_DOMAIN_APP] ?? DEFAULTS.APP_DOMAIN;

  return {
    endpoints: {
      refresh: API_ENDPOINTS.AUTH.REFRESH,
      logout: API_ENDPOINTS.AUTH.LOGOUT,
      validateToken: API_ENDPOINTS.AUTH.VALIDATE_TOKEN,
      changePassword: API_ENDPOINTS.USERS.CHANGE_PASSWORD,
      logoutAll: API_ENDPOINTS.AUTH.LOGOUT_ALL,
      emailStatus: API_ENDPOINTS.AUTH.EMAIL_STATUS,
    },
    tokenStorage: {
      accessTokenKey: STORAGE_KEYS.ACCESS_TOKEN,
      refreshTokenKey: STORAGE_KEYS.REFRESH_TOKEN,
    },
    redirects: {
      afterLogin:
        import.meta.env[ENV_KEYS.AUTH_REDIRECT_AFTER_LOGIN] ?? appDomain,
      afterLogout:
        import.meta.env[ENV_KEYS.AUTH_REDIRECT_AFTER_LOGOUT] ?? authDomain,
      afterSignup:
        import.meta.env[ENV_KEYS.AUTH_REDIRECT_AFTER_SIGNUP] ?? authDomain,
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
