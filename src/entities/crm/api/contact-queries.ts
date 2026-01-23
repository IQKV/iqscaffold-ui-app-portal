// Contact Query Hooks and State Management
// Following CRM service pattern for consistency

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactApi } from "@/shared/api/contact";
import { notificationService } from "@/shared/lib/notifications";
import type {
  ContactListParams,
  CreateContactRequest,
  UpdateContactRequest,
  UpdateLeadScoreRequest,
} from "@/shared/api/contact/types";

// Query Keys
export const contactKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (params?: ContactListParams) =>
    [...contactKeys.lists(), params] as const,
  details: () => [...contactKeys.all, "detail"] as const,
  detail: (id: string | number) => [...contactKeys.details(), id] as const,
  company: (companyId: string | number) =>
    [...contactKeys.all, "company", companyId] as const,
};

// Contact Query Hooks

/**
 * Hook to fetch contacts with optional filtering and pagination
 */
export const useContacts = (params?: ContactListParams) => {
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => contactApi.getContacts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch a single contact by ID
 */
export const useContact = (id: string | number) => {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => contactApi.getContact(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch contacts by company ID
 */
export const useContactsByCompany = (companyId: string | number) => {
  return useQuery({
    queryKey: contactKeys.company(companyId),
    queryFn: () => contactApi.getContactsByCompany(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
};

// Contact Mutation Hooks

/**
 * Hook to create a new contact
 */
export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactRequest) => contactApi.createContact(data),
    onSuccess: (newContact) => {
      // Invalidate contacts list to refresh data
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });

      // Add to cache optimistically
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

/**
 * Hook to update a contact
 */
export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: UpdateContactRequest;
    }) => contactApi.updateContact(id, data),
    onSuccess: (updatedContact, { id }) => {
      // Update the contact in cache
      queryClient.setQueryData(contactKeys.detail(id), updatedContact);

      // Invalidate contacts list to refresh data
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

/**
 * Hook to delete a contact
 */
export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => contactApi.deleteContact(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: contactKeys.detail(id) });

      // Invalidate contacts list to refresh data
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

/**
 * Hook to update contact lead score
 */
export const useUpdateContactLeadScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, score }: { id: string | number; score: number }) =>
      contactApi.updateLeadScore(id, { leadScore: score }),
    onSuccess: (updatedContact, { id }) => {
      // Update the contact in cache
      queryClient.setQueryData(contactKeys.detail(id), updatedContact);

      // Invalidate contacts list to refresh data
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
