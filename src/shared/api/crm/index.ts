// CRM API Client
// Following billing service pattern for consistency

import { apiRequest } from "../base";
import * as Types from "./types";

/**
 * CRM API client with enhanced error handling for service unavailability
 */
export const crmApi = {
  // Lead management endpoints - following existing billing API patterns
  /**
   * Get leads with optional filtering and pagination
   */
  getLeads: (params?: Types.LeadListParams) =>
    apiRequest<Types.PaginatedResponse<Types.Lead>>({
      url: "/v1/leads",
      method: "GET",
      params,
    }),

  /**
   * Create a new lead
   */
  createLead: (request: Types.CreateLeadRequest) =>
    apiRequest<Types.Lead>({
      url: "/v1/leads",
      method: "POST",
      data: request,
    }),

  /**
   * Bulk qualify leads
   */
  bulkQualifyLeads: (leadIds: string[]) =>
    apiRequest<Types.BulkOperationResponse>({
      url: "/v1/leads/bulk/qualify",
      method: "PATCH",
      data: { leadIds },
    }),

  /**
   * Export leads to CSV
   */
  exportLeads: (params?: Types.LeadListParams) =>
    apiRequest<Blob>({
      url: "/v1/leads/export",
      method: "GET",
      params,
      responseType: "blob",
    }),

  /**
   * Get lead by ID
   */
  getLead: (id: string) =>
    apiRequest<Types.Lead>({
      url: `/v1/leads/${id}`,
      method: "GET",
    }),

  /**
   * Update lead
   */
  updateLead: (id: string, request: Types.UpdateLeadRequest) =>
    apiRequest<Types.Lead>({
      url: `/v1/leads/${id}`,
      method: "PUT",
      data: request,
    }),

  /**
   * Delete lead
   */
  deleteLead: (id: string) =>
    apiRequest<void>({
      url: `/v1/leads/${id}`,
      method: "DELETE",
    }),

  /**
   * Health check endpoints for service availability monitoring
   */
  leadsHealthCheck: () =>
    apiRequest<{ status: string; timestamp: string }>({
      url: "/v1/leads/health",
      method: "GET",
    }),
  contactsHealthCheck: () =>
    apiRequest<{ status: string; timestamp: string }>({
      url: "/v1/contacts/health",
      method: "GET",
    }),
  pipelineHealthCheck: () =>
    apiRequest<{ status: string; timestamp: string }>({
      url: "/v1/pipeline/health",
      method: "GET",
    }),

  /**
   * Create a new lead
   */
  convertLead: (id: string) =>
    apiRequest<Types.ConvertLeadResponse>({
      url: `/v1/leads/${id}/convert`,
      method: "POST",
    }),
  /**
   * Qualify a lead
   */
  qualifyLead: (id: string) =>
    apiRequest<Types.Lead>({
      url: `/v1/leads/${id}/qualify`,
      method: "POST",
    }),

  /**
   * Disqualify a lead
   */
  disqualifyLead: (id: string) =>
    apiRequest<Types.Lead>({
      url: `/v1/leads/${id}/disqualify`,
      method: "POST",
    }),

  /**
   * Get lead counts by source
   */
  getLeadStatsBySource: (params?: Types.DashboardStatsParams) =>
    apiRequest<Record<string, number>>({
      url: "/v1/leads/stats/by-source",
      method: "GET",
      params,
    }),

  // Lead notes endpoints
  /**
   * Get all notes for a lead
   */
  getLeadNotes: (leadId: string) =>
    apiRequest<Types.LeadNote[]>({
      url: `/v1/leads/${leadId}/notes`,
      method: "GET",
    }),

  /**
   * Create a note for a lead
   */
  createLeadNote: (leadId: string, request: Types.CreateLeadNoteRequest) =>
    apiRequest<Types.LeadNote>({
      url: `/v1/leads/${leadId}/notes`,
      method: "POST",
      data: request,
    }),

  /**
   * Update a lead note
   */
  updateLeadNote: (
    leadId: string,
    noteId: string,
    request: Types.UpdateLeadNoteRequest
  ) =>
    apiRequest<Types.LeadNote>({
      url: `/v1/leads/${leadId}/notes/${noteId}`,
      method: "PUT",
      data: request,
    }),

  /**
   * Delete a lead note
   */
  deleteLeadNote: (leadId: string, noteId: string) =>
    apiRequest<void>({
      url: `/v1/leads/${leadId}/notes/${noteId}`,
      method: "DELETE",
    }),

  // Lead activities endpoints
  /**
   * Get all activities for a lead
   */
  getLeadActivities: (leadId: string) =>
    apiRequest<Types.ActivityLogEntry[]>({
      url: `/v1/leads/${leadId}/activities`,
      method: "GET",
    }),

  // Pipeline management endpoints
  /**
   * Get all pipeline stages
   */
  getPipelineStages: () =>
    apiRequest<Types.PipelineStage[]>({
      url: "/v1/pipeline/stages",
      method: "GET",
    }),

  /**
   * Create a pipeline stage
   */
  createPipelineStage: (request: Types.CreatePipelineStageRequest) =>
    apiRequest<Types.PipelineStage>({
      url: "/v1/pipeline/stages",
      method: "POST",
      data: request,
    }),

  /**
   * Update a pipeline stage
   */
  updatePipelineStage: (
    id: string,
    request: Types.UpdatePipelineStageRequest
  ) =>
    apiRequest<Types.PipelineStage>({
      url: `/v1/pipeline/stages/${id}`,
      method: "PUT",
      data: request,
    }),

  /**
   * Delete a pipeline stage
   */
  deletePipelineStage: (id: string) =>
    apiRequest<void>({
      url: `/v1/pipeline/stages/${id}`,
      method: "DELETE",
    }),

  /**
   * Reorder a pipeline stage
   */
  reorderStage: (id: string, newOrder: number) =>
    apiRequest<Types.PipelineStage>({
      url: `/v1/pipeline/stages/${id}/order`,
      method: "PUT",
      params: { newOrder },
    }),

  /**
   * Move a lead to a different stage
   */
  moveLeadToStage: (leadId: string, stageId: string) =>
    apiRequest<void>({
      url: `/v1/pipeline/items/${leadId}/stage`,
      method: "PUT",
      params: { stageId },
    }),

  // Follow-up management endpoints
  /**
   * Get follow-ups with optional filtering and pagination
   */
  getFollowUps: (params?: Types.FollowUpListParams) =>
    apiRequest<Types.PaginatedResponse<Types.FollowUp>>({
      url: "/v1/pipeline/follow-ups",
      method: "GET",
      params,
    }),

  /**
   * Get today's follow-ups
   */
  getTodaysFollowUps: () =>
    apiRequest<Types.FollowUp[]>({
      url: "/v1/pipeline/follow-ups/today",
      method: "GET",
    }),

  /**
   * Get overdue follow-ups
   */
  getOverdueFollowUps: () =>
    apiRequest<Types.FollowUp[]>({
      url: "/v1/pipeline/follow-ups/overdue",
      method: "GET",
    }),

  /**
   * Create a follow-up
   */
  createFollowUp: (request: Types.CreateFollowUpRequest) =>
    apiRequest<Types.FollowUp>({
      url: "/v1/pipeline/follow-ups",
      method: "POST",
      data: request,
    }),

  /**
   * Update a follow-up
   */
  updateFollowUp: (id: string, request: Types.UpdateFollowUpRequest) =>
    apiRequest<Types.FollowUp>({
      url: `/v1/pipeline/follow-ups/${id}`,
      method: "PUT",
      data: request,
    }),

  /**
   * Mark a follow-up as complete
   */
  completeFollowUp: (id: string) =>
    apiRequest<Types.FollowUp>({
      url: `/v1/pipeline/follow-ups/${id}/complete`,
      method: "PUT",
    }),

  /**
   * Delete a follow-up
   */
  deleteFollowUp: (id: string) =>
    apiRequest<void>({
      url: `/v1/pipeline/follow-ups/${id}`,
      method: "DELETE",
    }),

  // Dashboard statistics endpoints
  /**
   * Get dashboard statistics
   */
  getDashboardStats: (params?: Types.DashboardStatsParams) =>
    apiRequest<Types.DashboardStats>({
      url: "/v1/pipeline/dashboard/stats",
      method: "GET",
      params,
    }),

  /**
   * Get conversion metrics
   */
  getConversionMetrics: (params?: Types.DashboardStatsParams) =>
    apiRequest<Types.ConversionMetrics>({
      url: "/v1/pipeline/dashboard/conversion",
      method: "GET",
      params,
    }),
};
