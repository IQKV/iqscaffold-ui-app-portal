/**
 * Tenant Store
 * Centralized tenant state management using Zustand
 */

import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { resolveTenantId, setTenantInStorage } from "@/shared/lib/tenant-utils";
import type { Tenant } from "@/shared/types/tenant";

export interface TenantState {
  currentTenantId: string | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface TenantActions {
  initialize: () => void;
  setTenantId: (tenantId: string | null) => void;
  setTenant: (tenant: Tenant | null) => void;
  clearTenant: () => void;
  setError: (error: string | null) => void;
}

export type TenantStore = TenantState & TenantActions;

const initialState: TenantState = {
  currentTenantId: null,
  tenant: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

type TenantStoreCreator = StateCreator<
  TenantStore,
  [["zustand/devtools", never], ["zustand/immer", never]],
  [],
  TenantStore
>;

const createTenantStore: TenantStoreCreator = (set) => ({
  ...initialState,

  /**
   * Initialize tenant context from subdomain or storage
   */
  initialize: () => {
    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const tenantId = resolveTenantId();

      set((state) => {
        state.currentTenantId = tenantId;
        state.isLoading = false;
        state.isInitialized = true;
      });

      // Store in localStorage for dev mode
      if (import.meta.env.DEV) {
        setTenantInStorage(tenantId);
      }
    } catch (error) {
      console.error("Tenant initialization failed:", error);
      set((state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = "Failed to initialize tenant context";
      });
    }
  },

  /**
   * Set current tenant ID
   */
  setTenantId: (tenantId: string | null) => {
    set((state) => {
      state.currentTenantId = tenantId;
    });

    // Store in localStorage for dev mode
    if (import.meta.env.DEV) {
      setTenantInStorage(tenantId);
    }
  },

  /**
   * Set tenant data
   */
  setTenant: (tenant: Tenant | null) => {
    set((state) => {
      state.tenant = tenant;
      if (tenant) {
        state.currentTenantId = tenant.tenantId;
      }
    });
  },

  /**
   * Clear tenant context
   */
  clearTenant: () => {
    set((state) => {
      state.currentTenantId = null;
      state.tenant = null;
      state.error = null;
    });

    if (import.meta.env.DEV) {
      setTenantInStorage(null);
    }
  },

  /**
   * Set error state
   */
  setError: (error: string | null) => {
    set((state) => {
      state.error = error;
    });
  },
});

export const useTenantStore = create<TenantStore>()(
  devtools(immer(createTenantStore), {
    name: "tenant-store",
  })
);
