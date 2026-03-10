import { ENV_KEYS, type EnvKey } from "./env-keys";

type EnvDict = Partial<Record<EnvKey, string>>;

export { ENV_KEYS };

export function getBuildEnv(keys: readonly EnvKey[] = ENV_KEYS): EnvDict {
  const out: EnvDict = {};
  const src: Record<string, any> = import.meta.env as any;
  for (const k of keys) {
    out[k] = src[k];
  }
  return out;
}

function getGlobal(): any {
  const g: any = typeof globalThis !== "undefined" ? (globalThis as any) : {};
  return g.window ?? g;
}

export function getDirectRuntimeOverrides(
  keys: readonly string[] = ENV_KEYS,
  w: any = getGlobal(),
): EnvDict {
  const out: EnvDict = {};
  for (const k of keys) {
    const v = w?.[k];
    if (typeof v === "string") {
      out[k as EnvKey] = v as string;
    }
  }
  return out;
}

export function resolveClientBuildEnv(): EnvDict {
  const base = getBuildEnv();
  const direct = getDirectRuntimeOverrides(Object.keys(base));
  return { ...base, ...direct };
}

export const clientBuildEnv: Readonly<EnvDict> = Object.freeze(resolveClientBuildEnv());

export const getConfig = (key: string, fallback?: string): string | undefined => {
  return (clientBuildEnv as Record<string, string | undefined>)[key] ?? fallback;
};

export const hasConfig = (key: string): boolean => {
  return (clientBuildEnv as Record<string, string | undefined>)[key] !== undefined;
};

export const getConfigOrThrow = (key: string): string => {
  const v = (clientBuildEnv as Record<string, string | undefined>)[key];
  if (v === undefined) {
    throw new Error(`Missing required config: ${key}`);
  }
  return v;
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
