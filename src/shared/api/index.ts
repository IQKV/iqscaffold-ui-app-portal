export { apiClient, apiRequest } from "./base";
// Note: authApi and related types are exposed via processes/auth public API

export { avatarApi } from "./avatar-api";
export type { AvatarUrlResponse, AvatarUploadResponse } from "./avatar-api";

export { tenantApi } from "./tenant-api";
export type {
  TenantResponse,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantStatistics,
} from "./tenant-api";

export { userPreferenceApi } from "./user-preference-api";

export { billingApi } from "./billing";
export type * from "./billing/types";

export { organizationApi } from "./organization-api";
export type {
  OrganizationDto,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationPageResponse,
} from "./organization-api";

export { userManagementApi } from "./user-management-api";
export type {
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
  UserPageResponse,
} from "./user-management-api";

export { crmApi } from "./crm";
export type {
  Lead,
  LeadSource,
  LeadListParams,
  CreateLeadRequest,
  UpdateLeadRequest,
  ConvertLeadResponse,
  PipelineStage,
  CreatePipelineStageRequest,
  UpdatePipelineStageRequest,
  LeadNote,
  CreateLeadNoteRequest,
  UpdateLeadNoteRequest,
  ActivityLogEntry,
  ActivityType,
  FollowUp,
  CreateFollowUpRequest,
  UpdateFollowUpRequest,
  FollowUpListParams,
  DashboardStatsParams,
  DashboardStats,
  ConversionMetrics,
  PaginatedResponse,
} from "./crm/types";

export { contactApi } from "./contact";
export * from "./contact/types";
