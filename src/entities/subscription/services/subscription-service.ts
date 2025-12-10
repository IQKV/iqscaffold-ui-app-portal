import { subscriptionApi } from "../api/subscription-api";
import type {
  Subscription,
  CreateSubscriptionData,
  PlanChangeValidation,
  TrialInfo,
} from "../types/subscription-types";
import type { Plan, ProrationCalculation } from "@/shared/types/billing";
import {
  ProrationUtils,
  BillingDateUtils,
  SubscriptionUtils,
} from "@/shared/lib/billing-utils";

/**
 * Subscription business logic service
 * Contains all subscription-related business rules and calculations
 */
export class SubscriptionService {
  // Core operations
  static async create(data: CreateSubscriptionData): Promise<Subscription> {
    // Validate input data
    if (!data.tenantId || !data.planId || !data.paymentMethodId) {
      throw new Error("Missing required subscription data");
    }

    try {
      return await subscriptionApi.create(data);
    } catch (error) {
      throw new Error(
        `Failed to create subscription: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async update(
    id: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    if (!id) {
      throw new Error("Subscription ID is required");
    }

    try {
      return await subscriptionApi.update(id, updates);
    } catch (error) {
      throw new Error(
        `Failed to update subscription: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async cancel(
    id: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Subscription> {
    if (!id) {
      throw new Error("Subscription ID is required");
    }

    try {
      return await subscriptionApi.cancel(id, cancelAtPeriodEnd);
    } catch (error) {
      throw new Error(
        `Failed to cancel subscription: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async getByTenant(tenantId: string): Promise<Subscription> {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    try {
      return await subscriptionApi.getByTenant(tenantId);
    } catch (error) {
      throw new Error(
        `Failed to get subscription: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Plan management
  static async changePlan(
    subscriptionId: string,
    newPlanId: string
  ): Promise<Subscription> {
    if (!subscriptionId || !newPlanId) {
      throw new Error("Subscription ID and new plan ID are required");
    }

    try {
      return await subscriptionApi.changePlan(subscriptionId, newPlanId);
    } catch (error) {
      throw new Error(
        `Failed to change plan: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async calculateProration(
    subscriptionId: string,
    newPlanId: string
  ): Promise<ProrationCalculation> {
    if (!subscriptionId || !newPlanId) {
      throw new Error("Subscription ID and new plan ID are required");
    }

    try {
      return await subscriptionApi.calculateProration(
        subscriptionId,
        newPlanId
      );
    } catch (error) {
      throw new Error(
        `Failed to calculate proration: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Trial management
  static async extendTrial(
    subscriptionId: string,
    extensionDays: number,
    reason: string
  ): Promise<Subscription> {
    if (!subscriptionId || extensionDays <= 0 || !reason) {
      throw new Error(
        "Valid subscription ID, extension days, and reason are required"
      );
    }

    if (extensionDays > 365) {
      throw new Error("Trial extension cannot exceed 365 days");
    }

    try {
      return await subscriptionApi.extendTrial(
        subscriptionId,
        extensionDays,
        reason
      );
    } catch (error) {
      throw new Error(
        `Failed to extend trial: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Business logic methods
  static validatePlanChange(
    subscription: Subscription,
    currentPlan: Plan,
    newPlan: Plan
  ): PlanChangeValidation {
    const errors: string[] = [];

    // Check if subscription is active
    if (!SubscriptionUtils.isActive(subscription)) {
      errors.push("Subscription must be active to change plans");
    }

    // Check if it's actually a different plan
    if (currentPlan.id === newPlan.id) {
      errors.push("Cannot change to the same plan");
    }

    // Check if new plan is active
    if (!newPlan.active) {
      errors.push("Target plan is not available");
    }

    // Determine upgrade/downgrade
    const isUpgrade = newPlan.price > currentPlan.price;
    const isDowngrade = newPlan.price < currentPlan.price;

    // Calculate proration for payment requirement
    const prorationAmount = ProrationUtils.calculateProration(
      currentPlan,
      newPlan,
      new Date(subscription.currentPeriodStart),
      new Date(subscription.currentPeriodEnd)
    );

    return {
      isValid: errors.length === 0,
      canUpgrade: isUpgrade && errors.length === 0,
      canDowngrade: isDowngrade && errors.length === 0,
      requiresPayment: prorationAmount > 0,
      prorationAmount,
      errors,
    };
  }

  static getTrialInfo(subscription: Subscription): TrialInfo {
    const isInTrial = SubscriptionUtils.isInTrial(subscription);
    const daysRemaining = isInTrial
      ? SubscriptionUtils.getTrialDaysRemaining(subscription)
      : 0;

    return {
      isInTrial,
      daysRemaining,
      canExtend: isInTrial && daysRemaining > 0,
      maxExtensionDays: 365, // Business rule: max 365 days extension
    };
  }

  // Status checks
  static isActive(subscription: Subscription): boolean {
    return SubscriptionUtils.isActive(subscription);
  }

  static isInTrial(subscription: Subscription): boolean {
    return SubscriptionUtils.isInTrial(subscription);
  }

  static canUpgrade(subscription: Subscription, targetPlan: Plan): boolean {
    return SubscriptionUtils.canUpgrade(subscription, targetPlan);
  }

  static canDowngrade(subscription: Subscription, targetPlan: Plan): boolean {
    return SubscriptionUtils.canDowngrade(subscription, targetPlan);
  }

  // Billing period calculations
  static getNextBillingDate(subscription: Subscription): Date {
    return BillingDateUtils.getNextBillingDate(
      new Date(subscription.currentPeriodEnd),
      subscription.billingCycle
    );
  }

  static getDaysUntilRenewal(subscription: Subscription): number {
    return BillingDateUtils.getDaysRemaining(
      new Date(subscription.currentPeriodEnd)
    );
  }

  // Lifecycle helpers
  static getSubscriptionAge(subscription: Subscription): number {
    const now = new Date();
    const created = new Date(subscription.createdAt);
    const diffTime = now.getTime() - created.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Days
  }

  static getLifetimeValue(
    subscription: Subscription,
    currentPlan: Plan
  ): number {
    const ageInDays = this.getSubscriptionAge(subscription);
    const billingCycleDays = subscription.billingCycle === "monthly" ? 30 : 365;
    const billingCycles = Math.floor(ageInDays / billingCycleDays);

    return billingCycles * currentPlan.price;
  }

  // Validation helpers
  static validateSubscriptionData(data: CreateSubscriptionData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.tenantId) errors.push("Tenant ID is required");
    if (!data.planId) errors.push("Plan ID is required");
    if (!data.paymentMethodId) errors.push("Payment method ID is required");

    if (data.trialDays !== undefined) {
      if (data.trialDays < 0) errors.push("Trial days cannot be negative");
      if (data.trialDays > 365) errors.push("Trial days cannot exceed 365");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
