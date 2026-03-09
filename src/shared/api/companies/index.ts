// Companies API Client

import { apiRequest } from "../base";
import * as Types from "./types";

/**
 * Companies API client
 */
export const companiesApi = {
  /**
   * Get companies with optional filtering
   */
  getCompanies: (params?: Types.CompanyListParams) =>
    apiRequest<Types.Company[]>({
      url: "/v1/companies",
      method: "GET",
      params,
    }),

  /**
   * Get company by ID
   */
  getCompany: (id: string) =>
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
};

export * from "./types";
