// Contact and Company Query Hooks
// Following CRM and billing service patterns for consistency

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactApi } from "@/shared/api/contact";
import type {
  ContactListParams,
  CreateContactRequest,
  UpdateContactRequest,
  UpdateLeadScoreRequest,
  BulkCreateContactsRequest,
  BulkUpdateStatusRequest,
  BulkDeleteContactsRequest,
  BulkUpdateLeadScoresRequest,
  CompanyListParams,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "@/shared/api/contact/types";

// Query Keys
export const contactKeys = {
  all: ["contact"] as const,
  contacts: () => [...contactKeys.all, "contacts"] as const,
  contactsList: (params?: ContactListParams) =>
    [...contactKeys.contacts(), "list", params] as const,
  contact: (id: string | number) => [...contactKeys.contacts(), id] as const,
  contactsByCompany: (companyId: string | number) =>
    [...contactKeys.contacts(), "by-company", companyId] as const,

  companies: () => [...contactKeys.all, "companies"] as const,
  companiesList: (params?: CompanyListParams) =>
    [...contactKeys.companies(), "list", params] as const,
  company: (id: string | number) => [...contactKeys.companies(), id] as const,
};

// Contact Query Hooks

/**
 * Hook to fetch contacts with optional filtering and pagination
 */
export const useContacts = (params?: ContactListParams) => {
  return useQuery({
    queryKey: contactKeys.contactsList(params),
    queryFn: () => contactApi.getContacts(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch a single contact by ID
 */
export const useContact = (id: string | number) => {
  return useQuery({
    queryKey: contactKeys.contact(id),
    queryFn: () => contactApi.getContact(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch contacts belonging to a specific company
 */
export const useContactsByCompany = (companyId: string | number) => {
  return useQuery({
    queryKey: contactKeys.contactsByCompany(companyId),
    queryFn: () => contactApi.getContactsByCompany(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
};

// Contact Mutation Hooks

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contactApi.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.contacts() });
    },
  });
};

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
    onSuccess: (data) => {
      queryClient.setQueryData(contactKeys.contact(data.id), data);
      queryClient.invalidateQueries({ queryKey: contactKeys.contacts() });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contactApi.deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.contacts() });
    },
  });
};

// Company Query Hooks

/**
 * Hook to fetch companies with optional filtering and pagination
 */
export const useCompanies = (params?: CompanyListParams) => {
  return useQuery({
    queryKey: contactKeys.companiesList(params),
    queryFn: () => contactApi.getCompanies(params),
    staleTime: 10 * 60 * 1000, // Companies change less frequently
  });
};

/**
 * Hook to fetch a single company by ID
 */
export const useCompany = (id: string | number) => {
  return useQuery({
    queryKey: contactKeys.company(id),
    queryFn: () => contactApi.getCompany(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

// Company Mutation Hooks

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contactApi.createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.companies() });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: UpdateCompanyRequest;
    }) => contactApi.updateCompany(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(contactKeys.company(data.id), data);
      queryClient.invalidateQueries({ queryKey: contactKeys.companies() });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contactApi.deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.companies() });
      // Also invalidate contacts as their company info might change
      queryClient.invalidateQueries({ queryKey: contactKeys.contacts() });
    },
  });
};
