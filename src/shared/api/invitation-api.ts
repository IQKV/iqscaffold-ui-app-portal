import { apiRequest } from "./base";

/**
 * Invitation types
 */
export enum InvitationType {
  EMAIL = "EMAIL",
  LINK = "LINK",
  CODE = "CODE",
}

/**
 * Invitation status
 */
export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
}

/**
 * Organization invitation DTO
 */
export interface OrganizationInvitationDto {
  id: number;
  organizationId: number;
  organizationName: string;
  tenantId: string;
  invitationCode: string;
  type: InvitationType;
  inviteeEmail: string | null;
  invitedByUsername: string;
  authority: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  maxUses: number | null;
  currentUses: number;
  createdAt: string;
}

/**
 * Create invitation request
 */
export interface CreateInvitationRequest {
  type: InvitationType;
  inviteeEmail?: string;
  authority?: string;
  expirationHours: number;
  maxUses?: number;
  customMessage?: string;
}

/**
 * Invitation link response
 */
export interface InvitationLinkResponse {
  invitationCode: string;
  fullUrl: string;
  shortCode: string | null;
  expiresAt: string;
}

/**
 * Paginated invitation response
 */
export interface InvitationPageResponse {
  content: OrganizationInvitationDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * Invitation list parameters
 */
export interface InvitationListParams {
  status?: InvitationStatus;
  page?: number;
  size?: number;
  sort?: string[];
}

/**
 * Invitation API
 * Requires ADMIN or TENANT_ADMIN authority for all operations
 */
export const invitationApi = {
  /**
   * Create a new invitation
   */
  async createInvitation(data: CreateInvitationRequest): Promise<OrganizationInvitationDto> {
    return apiRequest<OrganizationInvitationDto>({
      url: "/api/v1/invitations",
      method: "POST",
      data,
    });
  },

  /**
   * Get paginated list of invitations
   */
  async listInvitations(params?: InvitationListParams): Promise<InvitationPageResponse> {
    return apiRequest<InvitationPageResponse>({
      url: "/api/v1/invitations",
      method: "GET",
      params,
    });
  },

  /**
   * Revoke an invitation
   */
  async revokeInvitation(invitationId: number): Promise<void> {
    return apiRequest<void>({
      url: `/api/v1/invitations/${invitationId}`,
      method: "DELETE",
    });
  },

  /**
   * Get invitation link
   */
  async getInvitationLink(invitationId: number): Promise<InvitationLinkResponse> {
    return apiRequest<InvitationLinkResponse>({
      url: `/api/v1/invitations/${invitationId}/link`,
      method: "GET",
    });
  },
};
