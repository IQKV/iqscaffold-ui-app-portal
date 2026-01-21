// CRM Query Hooks and State Management
// Following billing service pattern for consistency

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "@/shared/api/crm";
import { useCrmServiceHealth } from "@/shared/lib/hooks/useCrmServiceHealth";
import { notificationService } from "@/shared/lib/notifications";
import type {
  LeadListParams,
  CreateLeadRequest,
  UpdateLeadRequest,
  CreateLeadNoteRequest,
  UpdateLeadNoteRequest,
  CreateFollowUpRequest,
  UpdateFollowUpRequest,
  FollowUpListParams,
  DashboardStatsParams,
  CreatePipelineStageRequest,
  UpdatePipelineStageRequest,
} from "@/shared/api/crm/types";

// Query Keys - Following billing service pattern
export const crmKeys = {
  all: ["crm"] as const,
  leads: () => [...crmKeys.all, "leads"] as const,
  leadsList: (params?: LeadListParams) =>
    [...crmKeys.leads(), "list", params] as const,
  lead: (id: string) => [...crmKeys.leads(), id] as const,
  leadNotes: (leadId: string) => [...crmKeys.lead(leadId), "notes"] as const,
  leadActivities: (leadId: string) =>
    [...crmKeys.lead(leadId), "activities"] as const,
  pipeline: () => [...crmKeys.all, "pipeline"] as const,
  pipelineStages: () => [...crmKeys.pipeline(), "stages"] as const,
  followUps: () => [...crmKeys.all, "follow-ups"] as const,
  followUpsList: (params?: FollowUpListParams) =>
    [...crmKeys.followUps(), "list", params] as const,
  todaysFollowUps: () => [...crmKeys.followUps(), "today"] as const,
  overdueFollowUps: () => [...crmKeys.followUps(), "overdue"] as const,
  dashboard: () => [...crmKeys.all, "dashboard"] as const,
  dashboardStats: (params?: DashboardStatsParams) =>
    [...crmKeys.dashboard(), "stats", params] as const,
  conversionMetrics: (params?: DashboardStatsParams) =>
    [...crmKeys.dashboard(), "conversion", params] as const,
};

// Lead Query Hooks

/**
 * Hook to fetch leads with optional filtering and pagination
 * Includes service health checks and graceful degradation
 */
export const useLeads = (params?: LeadListParams) => {
  const { isFeatureAvailable } = useCrmServiceHealth();

  return useQuery({
    queryKey: crmKeys.leadsList(params),
    queryFn: () => crmApi.getLeads(params),
    enabled: isFeatureAvailable("leads"),
    staleTime: 5 * 60 * 1000, // 5 minutes - matches billing service
    refetchOnWindowFocus: true, // Business logic: Refetch when user returns to tab
    retry: (failureCount, error: any) => {
      // Don't retry if service is known to be unavailable
      if (error?.response?.status === 503) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Hook to fetch a single lead by ID
 */
export const useLead = (id: string) => {
  const { isFeatureAvailable } = useCrmServiceHealth();

  return useQuery({
    queryKey: crmKeys.lead(id),
    queryFn: () => crmApi.getLead(id),
    enabled: !!id && isFeatureAvailable("leads"),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 503) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Hook to fetch notes for a specific lead
 */
export const useLeadNotes = (leadId: string) => {
  const { isFeatureAvailable } = useCrmServiceHealth();

  return useQuery({
    queryKey: crmKeys.leadNotes(leadId),
    queryFn: () => crmApi.getLeadNotes(leadId),
    enabled: !!leadId && isFeatureAvailable("leads"),
    staleTime: 2 * 60 * 1000, // 2 minutes for more dynamic content
  });
};

/**
 * Hook to fetch activities for a specific lead
 */
export const useLeadActivities = (leadId: string) => {
  const { isFeatureAvailable } = useCrmServiceHealth();

  return useQuery({
    queryKey: crmKeys.leadActivities(leadId),
    queryFn: () => crmApi.getLeadActivities(leadId),
    enabled: !!leadId && isFeatureAvailable("leads"),
    staleTime: 2 * 60 * 1000,
  });
};

// Lead Mutation Hooks

/**
 * Hook to create a new lead with optimistic updates
 * Includes service availability checks
 */
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadRequest) => crmApi.createLead(data),

    // Optimistic updates for better UX - following billing service pattern
    onMutate: async (newLead) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: crmKeys.leads() });

      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData(crmKeys.leadsList());

      // Optimistically update to the new value
      queryClient.setQueryData(crmKeys.leadsList(), (old: any) => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          content: [
            {
              id: `temp-${Date.now()}`,
              ...newLead,
              currentStage: "New",
              score: 0,
              isQualified: false,
              isOverdue: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...old.content,
          ],
          totalElements: old.totalElements + 1,
        };
      });

      return { previousLeads };
    },

    // Handle success - invalidate queries to refresh data
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
    },

    // Handle error - rollback optimistic update
    onError: (_error, _newLead, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(crmKeys.leadsList(), context.previousLeads);
      }
    },
  });
};

/**
 * Hook to update an existing lead
 */
export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadRequest }) =>
      crmApi.updateLead(id, data),

    onSuccess: (updatedLead) => {
      // Update individual lead cache
      queryClient.setQueryData(crmKeys.lead(updatedLead.id), updatedLead);

      // Invalidate leads list to refresh
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
    },
  });
};

/**
 * Hook to delete a lead
 */
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmApi.deleteLead(id),

    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: crmKeys.lead(id) });

      // Invalidate leads list to refresh
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
    },
  });
};

// Lead Notes Mutation Hooks

/**
 * Hook to create a new note for a lead
 */
export const useCreateLeadNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      data,
    }: {
      leadId: string;
      data: CreateLeadNoteRequest;
    }) => crmApi.createLeadNote(leadId, data),

    onSuccess: (_, variables) => {
      // Invalidate notes for this lead
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadNotes(variables.leadId),
      });

      // Invalidate activities as note creation creates an activity
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadActivities(variables.leadId),
      });
    },
  });
};

/**
 * Hook to update a lead note
 */
export const useUpdateLeadNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      noteId,
      data,
    }: {
      leadId: string;
      noteId: string;
      data: UpdateLeadNoteRequest;
    }) => crmApi.updateLeadNote(leadId, noteId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadNotes(variables.leadId),
      });
    },
  });
};

/**
 * Hook to delete a lead note
 */
export const useDeleteLeadNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, noteId }: { leadId: string; noteId: string }) =>
      crmApi.deleteLeadNote(leadId, noteId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadNotes(variables.leadId),
      });
    },
  });
};

// Pipeline Query Hooks

/**
 * Hook to fetch all pipeline stages
 */
export const usePipelineStages = () => {
  return useQuery({
    queryKey: crmKeys.pipelineStages(),
    queryFn: () => crmApi.getPipelineStages(),
    staleTime: 10 * 60 * 1000, // 10 minutes - stages change infrequently
  });
};

/**
 * Hook to move a lead to a different stage
 */
export const useMoveLeadToStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, stageId }: { leadId: string; stageId: string }) =>
      crmApi.moveLeadToStage(leadId, stageId),

    onSuccess: (_, { leadId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
      queryClient.invalidateQueries({ queryKey: crmKeys.lead(leadId) });
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadActivities(leadId),
      });
      queryClient.invalidateQueries({ queryKey: crmKeys.dashboard() });
    },
  });
};

// Pipeline Stage Mutation Hooks

/**
 * Hook to create a new pipeline stage
 */
export const useCreatePipelineStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePipelineStageRequest) =>
      crmApi.createPipelineStage(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStages() });
    },
  });
};

/**
 * Hook to update a pipeline stage
 */
export const useUpdatePipelineStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePipelineStageRequest;
    }) => crmApi.updatePipelineStage(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStages() });
    },
  });
};

/**
 * Hook to delete a pipeline stage
 */
export const useDeletePipelineStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmApi.deletePipelineStage(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStages() });
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
    },
  });
};

/**
 * Hook to reorder a pipeline stage
 */
export const useReorderPipelineStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newOrder }: { id: string; newOrder: number }) =>
      crmApi.reorderStage(id, newOrder),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStages() });
    },
  });
};

// Follow-up Query Hooks

/**
 * Hook to fetch follow-ups with optional filtering and pagination
 */
export const useFollowUps = (params?: FollowUpListParams) => {
  return useQuery({
    queryKey: crmKeys.followUpsList(params),
    queryFn: () => crmApi.getFollowUps(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for dynamic content
  });
};

/**
 * Hook to fetch today's follow-ups
 */
export const useTodaysFollowUps = () => {
  return useQuery({
    queryKey: crmKeys.todaysFollowUps(),
    queryFn: () => crmApi.getTodaysFollowUps(),
    staleTime: 1 * 60 * 1000, // 1 minute - refresh frequently for today's tasks
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch overdue follow-ups
 */
export const useOverdueFollowUps = () => {
  return useQuery({
    queryKey: crmKeys.overdueFollowUps(),
    queryFn: () => crmApi.getOverdueFollowUps(),
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

// Follow-up Mutation Hooks

/**
 * Hook to create a new follow-up
 */
export const useCreateFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFollowUpRequest) => crmApi.createFollowUp(data),

    onSuccess: (newFollowUp) => {
      // Invalidate follow-ups queries
      queryClient.invalidateQueries({ queryKey: crmKeys.followUps() });

      // Invalidate today's and overdue if applicable
      queryClient.invalidateQueries({ queryKey: crmKeys.todaysFollowUps() });
      queryClient.invalidateQueries({ queryKey: crmKeys.overdueFollowUps() });

      // Invalidate lead activities
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadActivities(newFollowUp.leadId),
      });

      // Update lead cache to reflect next follow-up date
      queryClient.invalidateQueries({
        queryKey: crmKeys.lead(newFollowUp.leadId),
      });
    },
  });
};

/**
 * Hook to update a follow-up
 */
export const useUpdateFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFollowUpRequest }) =>
      crmApi.updateFollowUp(id, data),

    onSuccess: (updatedFollowUp) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.followUps() });
      queryClient.invalidateQueries({ queryKey: crmKeys.todaysFollowUps() });
      queryClient.invalidateQueries({ queryKey: crmKeys.overdueFollowUps() });
      queryClient.invalidateQueries({
        queryKey: crmKeys.lead(updatedFollowUp.leadId),
      });
    },
  });
};

/**
 * Hook to mark a follow-up as complete
 */
export const useCompleteFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmApi.completeFollowUp(id),

    onSuccess: (completedFollowUp) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.followUps() });
      queryClient.invalidateQueries({ queryKey: crmKeys.todaysFollowUps() });
      queryClient.invalidateQueries({ queryKey: crmKeys.overdueFollowUps() });
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadActivities(completedFollowUp.leadId),
      });
      queryClient.invalidateQueries({
        queryKey: crmKeys.lead(completedFollowUp.leadId),
      });
    },
  });
};

/**
 * Hook to delete a follow-up
 */
export const useDeleteFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmApi.deleteFollowUp(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.followUps() });
      queryClient.invalidateQueries({ queryKey: crmKeys.todaysFollowUps() });
      queryClient.invalidateQueries({ queryKey: crmKeys.overdueFollowUps() });
    },
  });
};

// Dashboard Query Hooks

/**
 * Hook to fetch dashboard statistics
 */
export const useDashboardStats = (params?: DashboardStatsParams) => {
  return useQuery({
    queryKey: crmKeys.dashboardStats(params),
    queryFn: () => crmApi.getDashboardStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch conversion metrics
 */
export const useConversionMetrics = (params?: DashboardStatsParams) => {
  return useQuery({
    queryKey: crmKeys.conversionMetrics(params),
    queryFn: () => crmApi.getConversionMetrics(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to convert a lead to a contact
 */
export const useConvertLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmApi.convertLead(id),

    onSuccess: (response, id) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: crmKeys.lead(id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: crmKeys.dashboard() });
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadActivities(id),
      });

      return response;
    },
  });
};
