import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";
import {
  getTokens,
  setTokens,
  clearTokens,
  subscribe as subscribeTokens,
} from "@/processes/auth/lib/auth-tokens";
import { getAuthConfig } from "@/app/config";
import { authApi } from "@/processes/auth/lib/auth-api";
import { decodeUser } from "../lib/jwt";
import { useTenantStore } from "@/processes/tenant";
import type { AuthStore, LoginCredentials } from "./types";
import type { UserContext } from "@/entities/user";

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
          // Set tenant context from user data
          if (user?.tenantId) {
            useTenantStore.getState().setTenantId(user.tenantId);
          }
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
          // Sync tenant context from user data
          if (user?.tenantId) {
            useTenantStore.getState().setTenantId(user.tenantId);
          } else {
            useTenantStore.getState().clearTenant();
          }
          clearRefreshTimer();
          if (exp) {
            scheduleRefresh(exp - Date.now(), () => get().refresh());
          }
        });
      },

      login: async (credentials: LoginCredentials) => {
        // Login is handled by the auth portal
        // This method should not be called directly
        throw new Error("Login should be handled by the auth portal at auth.iqkv.site");
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
        // Set tenant context from user data
        if (user?.tenantId) {
          useTenantStore.getState().setTenantId(user.tenantId);
        }
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
          // Update tenant context from refreshed user data
          if (user?.tenantId) {
            useTenantStore.getState().setTenantId(user.tenantId);
          }
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
        // Clear tenant context on logout
        useTenantStore.getState().clearTenant();
        if (!silent) {
          const cfg = getAuthConfig();
          window.location.href = cfg.redirects.afterLogout;
        }
      },

      updateUser: (updates: Partial<UserContext>) => {
        set((s) => {
          if (s.user) {
            s.user = { ...s.user, ...updates };
          }
        });
      },
    })),
  ),
);
