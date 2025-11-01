import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";
import {
  getTokens,
  setTokens,
  clearTokens,
  subscribe as subscribeTokens,
} from "@/shared/lib/auth-tokens";
import { getAuthConfig } from "@/app/config";
import { authApi } from "@/shared/api/auth-api";
import { decodeUser } from "../lib/jwt";
import type { AuthStore, LoginCredentials } from "./types";

let refreshTimer: number | null = null;

function scheduleRefresh(msUntilExpiry: number, action: () => void) {
  if (refreshTimer) {
    window.clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  // Refresh 30 seconds before expiry, but not sooner than 1s
  const delay = Math.max(msUntilExpiry - 30_000, 1000);
  refreshTimer = window.setTimeout(action, delay);
}

function clearRefreshTimer() {
  if (refreshTimer) {
    window.clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      status: "idle",
      user: null,
      tokens: { accessToken: null, refreshToken: null },
      expiresAt: null,
      lastRefreshAt: null,
      error: null,

      initialize: () => {
        if (get().status !== "idle") {
          return;
        }
        set((s) => {
          s.status = "initializing";
          s.error = null;
        });

        const t = getTokens();
        if (t.accessToken) {
          const { user, exp } = decodeUser(t.accessToken);
          set((s) => {
            s.user = user;
            s.tokens = {
              accessToken: t.accessToken,
              refreshToken: t.refreshToken,
            };
            s.expiresAt = exp ?? null;
            s.status = user ? "authenticated" : "unauthenticated";
          });
          if (exp) {
            scheduleRefresh(exp - Date.now(), () => get().refresh());
          }
        } else {
          set((s) => {
            s.status = "unauthenticated";
            s.user = null;
            s.tokens = { accessToken: null, refreshToken: t.refreshToken };
            s.expiresAt = null;
          });
        }

        // Sync with token storage changes (multi-tab)
        subscribeTokens((tokens) => {
          const { user, exp } = tokens.accessToken
            ? decodeUser(tokens.accessToken)
            : { user: null, exp: null };
          set((s) => {
            s.user = user;
            s.tokens = {
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            };
            s.expiresAt = exp ?? null;
            s.status = user ? "authenticated" : "unauthenticated";
          });
          clearRefreshTimer();
          if (exp) {
            scheduleRefresh(exp - Date.now(), () => get().refresh());
          }
        });
      },

      login: async (credentials: LoginCredentials) => {
        set((s) => {
          s.error = null;
        });
        const res = await authApi.login({
          username: credentials.username,
          password: credentials.password,
          rememberMe: !!credentials.rememberMe,
        });
        const { user, exp } = decodeUser(res.accessToken);
        setTokens({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          expiresAt: exp ?? null,
        });
        set((s) => {
          s.user = user;
          s.tokens = {
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          };
          s.expiresAt = exp ?? null;
          s.status = user ? "authenticated" : "unauthenticated";
          s.lastRefreshAt = Date.now();
        });
        clearRefreshTimer();
        if (exp) {
          scheduleRefresh(exp - Date.now(), () => get().refresh());
        }
      },

      loginWithTokens: (tokens) => {
        const { user, exp } = decodeUser(tokens.accessToken);
        setTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: exp ?? null,
        });
        set((s) => {
          s.user = user;
          s.tokens = { ...tokens };
          s.expiresAt = exp ?? null;
          s.status = user ? "authenticated" : "unauthenticated";
        });
        clearRefreshTimer();
        if (exp) {
          scheduleRefresh(exp - Date.now(), () => get().refresh());
        }
      },

      refresh: async () => {
        const refreshToken = get().tokens.refreshToken;
        if (!refreshToken) {
          await get().logout({ silent: true });
          return;
        }
        try {
          const res = await authApi.refresh({ refreshToken });
          const { user, exp } = decodeUser(res.accessToken);
          setTokens({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expiresAt: exp ?? null,
          });
          set((s) => {
            s.user = user;
            s.tokens = {
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
            };
            s.expiresAt = exp ?? null;
            s.status = user ? "authenticated" : "unauthenticated";
            s.lastRefreshAt = Date.now();
            s.error = null;
          });
          clearRefreshTimer();
          if (exp) {
            scheduleRefresh(exp - Date.now(), () => get().refresh());
          }
        } catch (e: any) {
          set((s) => {
            s.error = e?.message ?? "Failed to refresh token";
          });
          await get().logout({ silent: true });
        }
      },

      logout: async ({ silent } = {}) => {
        try {
          await authApi.logout();
        } catch {
          // ignore
        }
        clearTokens();
        clearRefreshTimer();
        set((s) => {
          s.status = "unauthenticated";
          s.user = null;
          s.tokens = { accessToken: null, refreshToken: null };
          s.expiresAt = null;
          s.error = null;
        });
        if (!silent) {
          const cfg = getAuthConfig();
          window.location.href = cfg.redirects.afterLogout;
        }
      },
    }))
  )
);
