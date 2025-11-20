export { apiClient, apiRequest } from "./base";
// Note: authApi and related types are exposed via processes/auth public API

export { tenantApi } from "./tenant-api";
export type {
  TenantResponse,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantStatistics,
} from "./tenant-api";
