import { ENV_KEYS } from "@/shared/constants";

export const ENV_KEYS_ARRAY = [
  ENV_KEYS.API_URL_SERVER,
  ENV_KEYS.AUTH_DOMAIN_AUTH,
  ENV_KEYS.AUTH_DOMAIN_APP,
  ENV_KEYS.AUTH_REDIRECT_AFTER_LOGIN,
  ENV_KEYS.AUTH_REDIRECT_AFTER_LOGOUT,
  ENV_KEYS.AUTH_REDIRECT_AFTER_SIGNUP,
  ENV_KEYS.ENABLE_MSW,
  ENV_KEYS.LOG_LEVEL,
] as const;

// Export the array as ENV_KEYS for backward compatibility
export { ENV_KEYS_ARRAY as ENV_KEYS };

export type EnvKey = (typeof ENV_KEYS_ARRAY)[number];
