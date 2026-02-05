import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/shared/api/crm";
import { contactApi } from "@/shared/api/contact";
import { useCrmServiceHealth } from "@/shared/lib/hooks/useCrmServiceHealth";
import type {
  LeadListParams,
  FollowUpListParams,
  DashboardStatsParams,
} from "@/shared/api/crm/types";
import type { ContactListParams } from "@/shared/api/contact/types";

// Query Keys
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

// Lead Query Hooks
export const useLeads = (params?: LeadListParams) => {
  const { isFeatureAvailable } = useCrmServiceHealth();

  return useQuery({
    queryKey: crmKeys.leadsList(params),
    queryFn: () => crmApi.getLeads(params),
    enabled: isFeatureAvailable("leads"),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 503) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

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

export const useLeadNotes = (leadId: string) => {
  const { isFeatureAvailable } = useCrmServiceHealth();

  return useQuery({
    queryKey: crmKeys.leadNotes(leadId),
    queryFn: () => crmApi.getLeadNotes(leadId),
    enabled: !!leadId && isFeatureAvailable("leads"),
    staleTime: 2 * 60 * 1000,
  });
};

export const useLeadActivities = (leadId: string) => {
  const { isFeatureAvailable } = useCrmServiceHealth();

  return useQuery({
    queryKey: crmKeys.leadActivities(leadId),
    queryFn: () => crmApi.getLeadActivities(leadId),
    enabled: !!leadId && isFeatureAvailable("leads"),
    staleTime: 2 * 60 * 1000,
  });
};

// Pipeline Query Hooks
export const usePipelineStages = () => {
  return useQuery({
    queryKey: crmKeys.pipelineStages(),
    queryFn: () => crmApi.getPipelineStages(),
    staleTime: 10 * 60 * 1000,
  });
};

// Follow-up Query Hooks
export const useFollowUps = (params?: FollowUpListParams) => {
  return useQuery({
    queryKey: crmKeys.followUpsList(params),
    queryFn: () => crmApi.getFollowUps(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useTodaysFollowUps = () => {
  return useQuery({
    queryKey: crmKeys.todaysFollowUps(),
    queryFn: () => crmApi.getTodaysFollowUps(),
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useOverdueFollowUps = () => {
  return useQuery({
    queryKey: crmKeys.overdueFollowUps(),
    queryFn: () => crmApi.getOverdueFollowUps(),
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

// Dashboard Query Hooks
export const useDashboardStats = (params?: DashboardStatsParams) => {
  return useQuery({
    queryKey: crmKeys.dashboardStats(params),
    queryFn: () => crmApi.getDashboardStats(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useConversionMetrics = (params?: DashboardStatsParams) => {
  return useQuery({
    queryKey: crmKeys.conversionMetrics(params),
    queryFn: () => crmApi.getConversionMetrics(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Contact Query Hooks
export const useContacts = (params?: ContactListParams) => {
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => contactApi.getContacts(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useContact = (id: string | number) => {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => contactApi.getContact(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useContactsByCompany = (companyId: string | number) => {
  return useQuery({
    queryKey: contactKeys.company(companyId),
    queryFn: () => contactApi.getContactsByCompany(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
};
