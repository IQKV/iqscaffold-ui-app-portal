export const clientBuildEnv: Record<string, string | undefined> = {
  VITE_API_URL_SERVER: import.meta.env.VITE_API_URL_SERVER,
  // Auth domain configuration
  VITE_AUTH_DOMAIN_AUTH: import.meta.env.VITE_AUTH_DOMAIN_AUTH,
  VITE_AUTH_DOMAIN_APP: import.meta.env.VITE_AUTH_DOMAIN_APP,
  // Auth redirect configuration
  VITE_AUTH_REDIRECT_AFTER_LOGIN: import.meta.env
    .VITE_AUTH_REDIRECT_AFTER_LOGIN,
  VITE_AUTH_REDIRECT_AFTER_LOGOUT: import.meta.env
    .VITE_AUTH_REDIRECT_AFTER_LOGOUT,
  VITE_AUTH_REDIRECT_AFTER_SIGNUP: import.meta.env
    .VITE_AUTH_REDIRECT_AFTER_SIGNUP,
  // MSW configuration
  VITE_ENABLE_MSW: import.meta.env.VITE_ENABLE_MSW,
  VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
};

export const getConfig = (
  key: string,
  fallback?: string
): string | undefined => {
  return clientBuildEnv[key] ?? fallback;
};

// Re-export auth configuration
export {
  configureAuth,
  getAuthConfig,
  defaultAuthConfig,
  type AuthConfig,
  type AuthEndpoints,
} from "./auth-config";

// Re-export MSW configuration
export {
  getAppMSWConfig,
  isAppMSWEnabled,
  configureMSW,
  getFinalMSWConfig,
  type AppMSWConfig,
} from "./msw-config";
