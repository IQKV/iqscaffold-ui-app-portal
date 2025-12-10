import { billingApi } from "@/shared/api/billing-api";
import type {
  Subscription,
  CreateSubscriptionData,
} from "../types/subscription-types";
import type { ProrationCalculation } from "@/shared/types/billing";

/**
 * Subscription-specific API client
 * Wraps the shared billing API with subscription-focused methods
 */
export class SubscriptionApiClient {
  // Core CRUD operations
  async getById(subscriptionId: string): Promise<Subscription> {
    // Note: The shared billing API doesn't have a direct getById for subscriptions
    // This would need to be implemented in the backend or we use getByTenant
    throw new Error(
      "Direct subscription lookup by ID not implemented in backend API"
    );
  }

  async getByTenant(tenantId: string): Promise<Subscription> {
    return billingApi.getSubscription(tenantId);
  }

  async getActiveSubscription(tenantId: string): Promise<Subscription> {
    return billingApi.getSubscription(tenantId);
  }

  async create(data: CreateSubscriptionData): Promise<Subscription> {
    return billingApi.createSubscription({
      tenantId: data.tenantId,
      planId: data.planId,
      paymentMethodId: data.paymentMethodId,
      trialDays: data.trialDays,
    });
  }

  async update(
    subscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    return billingApi.updateSubscription(subscriptionId, updates);
  }

  async cancel(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Subscription> {
    return billingApi.cancelSubscription(subscriptionId, cancelAtPeriodEnd);
  }

  // Plan management operations
  async changePlan(
    subscriptionId: string,
    newPlanId: string
  ): Promise<Subscription> {
    const response = await billingApi.changePlan({
      subscriptionId,
      newPlanId,
    });
    return response.subscription;
  }

  async calculateProration(
    subscriptionId: string,
    newPlanId: string
  ): Promise<ProrationCalculation> {
    return billingApi.calculateProration(subscriptionId, newPlanId);
  }

  // Trial management operations
  async extendTrial(
    subscriptionId: string,
    extensionDays: number,
    reason: string
  ): Promise<Subscription> {
    return billingApi.extendTrial(subscriptionId, extensionDays, reason);
  }

  // Support operations
  async suspend(subscriptionId: string, reason: string): Promise<Subscription> {
    return billingApi.suspendSubscription(subscriptionId, reason);
  }

  async reactivate(subscriptionId: string): Promise<Subscription> {
    return billingApi.reactivateSubscription(subscriptionId);
  }

  // Plan information
  async getPlan(planId: string): Promise<any> {
    return billingApi.getPlan(planId);
  }

  async getAvailablePlans(): Promise<any[]> {
    return billingApi.getPlans();
  }

  async getUpgradeOptions(currentPlanId: string): Promise<any[]> {
    return billingApi.getUpgradeOptions(currentPlanId);
  }
}

// Export singleton instance
export const subscriptionApi = new SubscriptionApiClient();
