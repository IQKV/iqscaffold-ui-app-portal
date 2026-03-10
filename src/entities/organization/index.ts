// Organization Entity Public API

export type {
  OrganizationDto,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationPageResponse,
} from "@/shared/api/organization-api";

export type { PaymentGatewayProvider } from "@/shared/api/billing/types";

// Query Hooks
export { organizationKeys, useOrganizationsQuery, useOrganizationQuery } from "./api/queries";

// Mutation Hooks
export {
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
} from "./api/mutations";

// Legacy exports for backward compatibility (deprecated)
// TODO: Remove these after updating all consumers
export {
  useOrganizationsQuery as useOrganizations,
  useOrganizationQuery as useOrganization,
} from "./api/queries";

export {
  useCreateOrganizationMutation as useCreateOrganization,
  useUpdateOrganizationMutation as useUpdateOrganization,
  useDeleteOrganizationMutation as useDeleteOrganization,
} from "./api/mutations";

// Re-export query keys for backward compatibility
export const ORGANIZATION_QUERY_KEY = "organizations";
