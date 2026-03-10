import { useQuery } from "@tanstack/react-query";
import { contactApi } from "@/shared/api/contact";

// Query Keys
export const contactKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (params?: any) => [...contactKeys.lists(), params] as const,
  details: () => [...contactKeys.all, "detail"] as const,
  detail: (id: string | number) => [...contactKeys.details(), id] as const,
  company: (companyId: string | number) => [...contactKeys.all, "company", companyId] as const,
  notes: (contactId: string | number) => [...contactKeys.detail(contactId), "notes"] as const,
  activities: (contactId: string | number) =>
    [...contactKeys.detail(contactId), "activities"] as const,
};

// Contact Notes Query Hooks
export const useContactNotesQuery = (contactId: string | number) => {
  return useQuery({
    queryKey: contactKeys.notes(contactId),
    queryFn: () => contactApi.getContactNotes(contactId),
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Contact Activities Query Hooks
export const useContactActivitiesQuery = (contactId: string | number) => {
  return useQuery({
    queryKey: contactKeys.activities(contactId),
    queryFn: () => contactApi.getContactActivities(contactId),
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
