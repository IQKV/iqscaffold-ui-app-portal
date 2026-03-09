import { useQuery } from "@tanstack/react-query";
import { companiesApi } from "@/shared/api/companies";
import type { CompanyListParams } from "@/shared/api/companies/types";

export const companiesKeys = {
  all: ["companies"] as const,
  lists: () => [...companiesKeys.all, "list"] as const,
  list: (params?: CompanyListParams) =>
    [...companiesKeys.lists(), params] as const,
  details: () => [...companiesKeys.all, "detail"] as const,
  detail: (id: string) => [...companiesKeys.details(), id] as const,
};

/**
 * Hook to fetch companies list
 */
export const useCompaniesQuery = (params?: CompanyListParams) => {
  return useQuery({
    queryKey: companiesKeys.list(params),
    queryFn: () => companiesApi.getCompanies(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single company
 */
export const useCompanyQuery = (id: string) => {
  return useQuery({
    queryKey: companiesKeys.detail(id),
    queryFn: () => companiesApi.getCompany(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
