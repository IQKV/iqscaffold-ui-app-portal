import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "@/shared/api/crm";
import { contactApi } from "@/shared/api/contact";
import { notificationService } from "@/shared/lib/notifications";
import { crmKeys, contactKeys } from "./queries";
import type {
  UpdateLeadRequest,
  CreateLeadRequest,
  CreateLeadNoteRequest,
  UpdateLeadNoteRequest,
  CreatePipelineStageRequest,
  UpdatePipelineStageRequest,
  CreateFollowUpRequest,
  UpdateFollowUpRequest,
} from "@/shared/api/crm/types";
import type { CreateContactRequest, UpdateContactRequest } from "@/shared/api/contact/types";

// Lead Mutations
export const useUpdateLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadRequest }) =>
      crmApi.updateLead(id, data),
    onSuccess: (updatedLead, { id }) => {
      queryClient.setQueryData(crmKeys.lead(id), updatedLead);
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
      notificationService.success({ message: "Lead updated successfully" });
    },
    onError: (error: any) => {
      notificationService.error({
        message: error.message || "Failed to update lead",
      });
    },
  });
};

export const useBulkQualifyLeadsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadIds: string[]) => crmApi.bulkQualifyLeads(leadIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
      notificationService.success({
        message: `Successfully qualified ${data.successCount} leads${
          data.failureCount > 0 ? `, ${data.failureCount} failed` : ""
        }`,
      });
    },
    onError: (error: any) => {
      notificationService.error({
        message: error.message || "Failed to qualify leads",
      });
    },
  });
};

export const useExportLeadsMutation = () => {
  return useMutation({
    mutationFn: (params?: any) => crmApi.exportLeads(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      notificationService.success({ message: "Leads exported successfully" });
    },
    onError: (error: any) => {
      notificationService.error({
        message: error.message || "Failed to export leads",
      });
    },
  });
};

export const useCreateLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadRequest) => crmApi.createLead(data),
    onMutate: async (newLead) => {
      await queryClient.cancelQueries({ queryKey: crmKeys.leads() });
      const previousLeads = queryClient.getQueryData(crmKeys.leadsList());
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
    },
    onError: (_error, _newLead, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(crmKeys.leadsList(), context.previousLeads);
      }
    },
  });
};

export const useDeleteLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmApi.deleteLead(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: crmKeys.lead(id) });
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
    },
  });
};

// Lead Notes Mutations
export const useCreateLeadNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: CreateLeadNoteRequest }) =>
      crmApi.createLeadNote(leadId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadNotes(variables.leadId),
      });
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadActivities(variables.leadId),
      });
    },
  });
};

export const useUpdateLeadNoteMutation = () => {
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

export const useDeleteLeadNoteMutation = () => {
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

// Pipeline Mutations
export const useMoveLeadToStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, stageId }: { leadId: string; stageId: string }) =>
      crmApi.moveLeadToStage(leadId, stageId),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
      queryClient.invalidateQueries({ queryKey: crmKeys.lead(leadId) });
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadActivities(leadId),
      });
      queryClient.invalidateQueries({ queryKey: crmKeys.dashboard() });
    },
  });
};

export const useCreatePipelineStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePipelineStageRequest) => crmApi.createPipelineStage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStages() });
    },
  });
};

export const useUpdatePipelineStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePipelineStageRequest }) =>
      crmApi.updatePipelineStage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStages() });
    },
  });
};

export const useDeletePipelineStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmApi.deletePipelineStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStages() });
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
    },
  });
};

export const useReorderPipelineStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newOrder }: { id: string; newOrder: number }) =>
      crmApi.reorderStage(id, newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.pipelineStages() });
    },
  });
};

// Follow-up Mutations
export const useCreateFollowUpMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFollowUpRequest) => crmApi.createFollowUp(data),
    onSuccess: (newFollowUp) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.followUps() });
      queryClient.invalidateQueries({ queryKey: crmKeys.todaysFollowUps() });
      queryClient.invalidateQueries({ queryKey: crmKeys.overdueFollowUps() });
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadActivities(newFollowUp.leadId),
      });
      queryClient.invalidateQueries({
        queryKey: crmKeys.lead(newFollowUp.leadId),
      });
    },
  });
};

export const useUpdateFollowUpMutation = () => {
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

export const useCompleteFollowUpMutation = () => {
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

export const useDeleteFollowUpMutation = () => {
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

// Dashboard Mutations
export const useConvertLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmApi.convertLead(id),
    onSuccess: (response, id) => {
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
export const useQualifyLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmApi.qualifyLead(id),
    onSuccess: (updatedLead, id) => {
      queryClient.setQueryData(crmKeys.lead(id), updatedLead);
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadActivities(id),
      });
      notificationService.success({ message: "Lead qualified successfully" });
    },
    onError: (error: any) => {
      notificationService.error({
        message: error.message || "Failed to qualify lead",
      });
    },
  });
};

export const useDisqualifyLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmApi.disqualifyLead(id),
    onSuccess: (updatedLead, id) => {
      queryClient.setQueryData(crmKeys.lead(id), updatedLead);
      queryClient.invalidateQueries({ queryKey: crmKeys.leads() });
      queryClient.invalidateQueries({
        queryKey: crmKeys.leadActivities(id),
      });
      notificationService.success({
        message: "Lead disqualified successfully",
      });
    },
    onError: (error: any) => {
      notificationService.error({
        message: error.message || "Failed to disqualify lead",
      });
    },
  });
};

// Contact Mutations
export const useCreateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactRequest) => contactApi.createContact(data),
    onSuccess: (newContact) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.setQueryData(contactKeys.detail(newContact.id), newContact);
      notificationService.success({ message: "Contact created successfully" });
    },
    onError: (error: any) => {
      notificationService.error({
        message: error.message || "Failed to create contact",
      });
    },
  });
};

export const useUpdateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateContactRequest }) =>
      contactApi.updateContact(id, data),
    onSuccess: (updatedContact, { id }) => {
      queryClient.setQueryData(contactKeys.detail(id), updatedContact);
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      notificationService.success({ message: "Contact updated successfully" });
    },
    onError: (error: any) => {
      notificationService.error({
        message: error.message || "Failed to update contact",
      });
    },
  });
};

export const useDeleteContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => contactApi.deleteContact(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: contactKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      notificationService.success({ message: "Contact deleted successfully" });
    },
    onError: (error: any) => {
      notificationService.error({
        message: error.message || "Failed to delete contact",
      });
    },
  });
};

export const useUpdateContactLeadScoreMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, score }: { id: string | number; score: number }) =>
      contactApi.updateLeadScore(id, { leadScore: score }),
    onSuccess: (updatedContact, { id }) => {
      queryClient.setQueryData(contactKeys.detail(id), updatedContact);
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      notificationService.success({
        message: "Lead score updated successfully",
      });
    },
    onError: (error: any) => {
      notificationService.error({
        message: error.message || "Failed to update lead score",
      });
    },
  });
};

export const useBulkDeleteContactsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactIds: number[]) => contactApi.bulkDeleteContacts({ contactIds }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      notificationService.success({
        message: `Successfully deleted ${data.successCount} contacts${data.failureCount > 0 ? `, ${data.failureCount} failed` : ""}`,
      });
    },
    onError: (error: any) => {
      notificationService.error({
        message: error.message || "Bulk delete failed",
      });
    },
  });
};

export const useBulkUpdateContactStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactIds, status }: { contactIds: number[]; status: any }) =>
      contactApi.bulkUpdateStatus({ contactIds, status }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      notificationService.success({
        message: `Successfully updated ${data.successCount} contacts${data.failureCount > 0 ? `, ${data.failureCount} failed` : ""}`,
      });
    },
    onError: (error: any) => {
      notificationService.error({
        message: error.message || "Bulk status update failed",
      });
    },
  });
};
