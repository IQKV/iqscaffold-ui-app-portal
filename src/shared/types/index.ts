import { ENV_KEYS } from "@/shared/constants";

// Shared types
export type ConfigKeys = (typeof ENV_KEYS)[keyof typeof ENV_KEYS];

export interface GenericDataResponse<T> {
  data: T;
  errors?: Record<string, string>;
}

export interface GenericPaginatedResponse<T> {
  data: T[];
  meta: import("../lib/pagination").PaginationData;
}

export interface SortableItem {
  id: string | number;
  order: number;
}

// Tenant types
export type { Tenant, TenantSummary, TenantResolutionResult, TenantContext } from "./tenant";
