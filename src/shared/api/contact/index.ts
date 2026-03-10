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
      url: "/v1/contacts",
      method: "GET",
      params,
    }),

  /**
   * Get contact by ID
   */
  getContact: (id: string | number) =>
    apiRequest<Types.Contact>({
      url: `/v1/contacts/${id}`,
      method: "GET",
    }),

  /**
   * Create a new contact
   */
  createContact: (request: Types.CreateContactRequest) =>
    apiRequest<Types.Contact>({
      url: "/v1/contacts",
      method: "POST",
      data: request,
    }),

  /**
   * Update contact
   */
  updateContact: (id: string | number, request: Types.UpdateContactRequest) =>
    apiRequest<Types.Contact>({
      url: `/v1/contacts/${id}`,
      method: "PUT",
      data: request,
    }),

  /**
   * Delete contact
   */
  deleteContact: (id: string | number) =>
    apiRequest<void>({
      url: `/v1/contacts/${id}`,
      method: "DELETE",
    }),

  // Filtering operations
  /**
   * Get contacts by company ID
   */
  getContactsByCompany: (companyId: string | number) =>
    apiRequest<Types.Contact[]>({
      url: `/v1/contacts/company/${companyId}`,
      method: "GET",
    }),

  // Lead scoring operations
  /**
   * Update contact lead score
   */
  updateLeadScore: (id: string | number, request: Types.UpdateLeadScoreRequest) =>
    apiRequest<Types.Contact>({
      url: `/v1/contacts/${id}/score`,
      method: "PATCH",
      data: request,
    }),

  // Bulk operations
  /**
   * Bulk create contacts
   */
  bulkCreateContacts: (request: Types.BulkCreateContactsRequest) =>
    apiRequest<Types.BulkOperationResponse>({
      url: "/v1/contacts/bulk",
      method: "POST",
      data: request,
    }),

  /**
   * Bulk update contact status
   */
  bulkUpdateStatus: (request: Types.BulkUpdateStatusRequest) =>
    apiRequest<Types.BulkOperationResponse>({
      url: "/v1/contacts/bulk/status",
      method: "PATCH",
      data: request,
    }),

  /**
   * Bulk delete contacts
   */
  bulkDeleteContacts: (request: Types.BulkDeleteContactsRequest) =>
    apiRequest<Types.BulkOperationResponse>({
      url: "/v1/contacts/bulk",
      method: "DELETE",
      data: request,
    }),

  /**
   * Bulk update lead scores
   */
  bulkUpdateLeadScores: (request: Types.BulkUpdateLeadScoresRequest) =>
    apiRequest<Types.BulkOperationResponse>({
      url: "/v1/contacts/bulk/scores",
      method: "PATCH",
      data: request,
    }),

  // Contact Notes operations
  /**
   * Get all notes for a contact
   */
  getContactNotes: (contactId: string | number) =>
    apiRequest<Types.ContactNote[]>({
      url: `/v1/contacts/${contactId}/notes`,
      method: "GET",
    }),

  /**
   * Create a note for a contact
   */
  createContactNote: (contactId: string | number, request: Types.CreateContactNoteRequest) =>
    apiRequest<Types.ContactNote>({
      url: `/v1/contacts/${contactId}/notes`,
      method: "POST",
      data: request,
    }),

  /**
   * Update a contact note
   */
  updateContactNote: (
    contactId: string | number,
    noteId: string | number,
    request: Types.UpdateContactNoteRequest,
  ) =>
    apiRequest<Types.ContactNote>({
      url: `/v1/contacts/${contactId}/notes/${noteId}`,
      method: "PUT",
      data: request,
    }),

  /**
   * Delete a contact note
   */
  deleteContactNote: (contactId: string | number, noteId: string | number) =>
    apiRequest<void>({
      url: `/v1/contacts/${contactId}/notes/${noteId}`,
      method: "DELETE",
    }),

  // Contact Activities operations
  /**
   * Get all activities for a contact
   */
  getContactActivities: (contactId: string | number) =>
    apiRequest<Types.ContactActivity[]>({
      url: `/v1/contacts/${contactId}/activities`,
      method: "GET",
    }),

  // Company CRUD operations
  /**
   * Get companies with optional filtering and pagination
   */
  getCompanies: (params?: Types.CompanyListParams) =>
    apiRequest<Types.PaginatedResponse<Types.Company>>({
      url: "/v1/companies",
      method: "GET",
      params,
    }),

  /**
   * Get company by ID
   */
  getCompany: (id: string | number) =>
    apiRequest<Types.Company>({
      url: `/v1/companies/${id}`,
      method: "GET",
    }),

  /**
   * Create a new company
   */
  createCompany: (request: Types.CreateCompanyRequest) =>
    apiRequest<Types.Company>({
      url: "/v1/companies",
      method: "POST",
      data: request,
    }),

  /**
   * Update company
   */
  updateCompany: (id: string | number, request: Types.UpdateCompanyRequest) =>
    apiRequest<Types.Company>({
      url: `/v1/companies/${id}`,
      method: "PUT",
      data: request,
    }),

  /**
   * Delete company
   */
  deleteCompany: (id: string | number) =>
    apiRequest<void>({
      url: `/v1/companies/${id}`,
      method: "DELETE",
    }),
};

// Re-export types for convenience
export * from "./types";
