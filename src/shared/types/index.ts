// Shared types
export type ConfigKeys = "VITE_API_URL_SERVER";

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
export type {
  Tenant,
  TenantSummary,
  TenantResolutionResult,
  TenantContext,
} from "./tenant";
