// Contact API Client
// Following CRM and billing service patterns for consistency

import { apiRequest } from "../base";
import * as Types from "./types";

export const contactApi = {
  // Contact CRUD operations
  /**
   * Get contacts with optional filtering and pagination
   */
  getContacts: (params?: Types.ContactListParams) =>
    apiRequest<Types.PaginatedResponse<Types.Contact>>({
      url: "/api/v1/contacts",
      method: "GET",
      params,
    }),

  /**
   * Get contact by ID
   */
  getContact: (id: string | number) =>
    apiRequest<Types.Contact>({
      url: `/api/v1/contacts/${id}`,
      method: "GET",
    }),

  /**
   * Create a new contact
   */
  createContact: (request: Types.CreateContactRequest) =>
    apiRequest<Types.Contact>({
      url: "/api/v1/contacts",
      method: "POST",
      data: request,
    }),

  /**
   * Update contact
   */
  updateContact: (id: string | number, request: Types.UpdateContactRequest) =>
    apiRequest<Types.Contact>({
      url: `/api/v1/contacts/${id}`,
      method: "PUT",
      data: request,
    }),

  /**
   * Delete contact
   */
  deleteContact: (id: string | number) =>
    apiRequest<void>({
      url: `/api/v1/contacts/${id}`,
      method: "DELETE",
    }),

  // Filtering operations
  /**
   * Get contacts by company ID
   */
  getContactsByCompany: (companyId: string | number) =>
    apiRequest<Types.Contact[]>({
      url: `/api/v1/contacts/company/${companyId}`,
      method: "GET",
    }),

  // Lead scoring operations
  /**
   * Update contact lead score
   */
  updateLeadScore: (
    id: string | number,
    request: Types.UpdateLeadScoreRequest
  ) =>
    apiRequest<Types.Contact>({
      url: `/api/v1/contacts/${id}/score`,
      method: "PATCH",
      data: request,
    }),

  // Bulk operations
  /**
   * Bulk create contacts
   */
  bulkCreateContacts: (request: Types.BulkCreateContactsRequest) =>
    apiRequest<Types.BulkOperationResponse>({
      url: "/api/v1/contacts/bulk",
      method: "POST",
      data: request,
    }),

  /**
   * Bulk update contact status
   */
  bulkUpdateStatus: (request: Types.BulkUpdateStatusRequest) =>
    apiRequest<Types.BulkOperationResponse>({
      url: "/api/v1/contacts/bulk/status",
      method: "PATCH",
      data: request,
    }),

  /**
   * Bulk delete contacts
   */
  bulkDeleteContacts: (request: Types.BulkDeleteContactsRequest) =>
    apiRequest<Types.BulkOperationResponse>({
      url: "/api/v1/contacts/bulk",
      method: "DELETE",
      data: request,
    }),

  /**
   * Bulk update lead scores
   */
  bulkUpdateLeadScores: (request: Types.BulkUpdateLeadScoresRequest) =>
    apiRequest<Types.BulkOperationResponse>({
      url: "/api/v1/contacts/bulk/scores",
      method: "PATCH",
      data: request,
    }),
};

// Re-export types for convenience
export * from "./types";
