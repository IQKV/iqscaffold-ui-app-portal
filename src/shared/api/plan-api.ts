/**
 * Plan API Client
 * Handles plan-related API operations
 */

import { apiClient } from "./base";
import type { Plan } from "@/shared/types/billing";

export const planApi = {
  /**
   * Get plan by ID
   */
  async getPlanById(planId: string): Promise<Plan> {
    const response = await apiClient.get(`/api/plans/${planId}`);
    return response.data;
  },

  /**
   * Get all available plans
   */
  async getAllPlans(): Promise<Plan[]> {
    const response = await apiClient.get("/api/plans");
    return response.data;
  },

  /**
   * Get upgrade options for a current plan
   */
  async getUpgradeOptions(currentPlanId: string): Promise<Plan[]> {
    const response = await apiClient.get(
      `/api/plans/${currentPlanId}/upgrade-options`
    );
    return response.data;
  },

  /**
   * Get downgrade options for a current plan
   */
  async getDowngradeOptions(currentPlanId: string): Promise<Plan[]> {
    const response = await apiClient.get(
      `/api/plans/${currentPlanId}/downgrade-options`
    );
    return response.data;
  },

  /**
   * Compare plans
   */
  async comparePlans(planIds: string[]): Promise<{
    plans: Plan[];
    comparison: Record<string, any>;
  }> {
    const response = await apiClient.post("/api/plans/compare", { planIds });
    return response.data;
  },
};
