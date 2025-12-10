import type {
  Subscription as BaseSubscription,
  SubscriptionStatus,
  BillingCycle,
  Plan,
  ProrationCalculation,
} from "@/shared/types/billing";

// Re-export base types
export type { SubscriptionStatus, BillingCycle, Plan, ProrationCalculation };
export type Subscription = BaseSubscription;

// Subscription-specific business operations
export interface SubscriptionOperations {
  // Lifecycle operations
  create: (data: CreateSubscriptionData) => Promise<Subscription>;
  update: (id: string, updates: Partial<Subscription>) => Promise<Subscription>;
  cancel: (id: string, cancelAtPeriodEnd?: boolean) => Promise<Subscription>;

  // Plan management
  changePlan: (id: string, newPlanId: string) => Promise<Subscription>;
  calculateProration: (
    id: string,
    newPlanId: string
  ) => Promise<ProrationCalculation>;

  // Trial management
  extendTrial: (
    id: string,
    extensionDays: number,
    reason: string
  ) => Promise<Subscription>;
  convertTrial: (id: string) => Promise<Subscription>;

  // Status management
  suspend: (id: string, reason: string) => Promise<Subscription>;
  reactivate: (id: string) => Promise<Subscription>;
}

export interface CreateSubscriptionData {
  tenantId: string;
  planId: string;
  paymentMethodId: string;
  trialDays?: number;
  billingCycle?: BillingCycle;
  metadata?: Record<string, any>;
}

export interface SubscriptionState {
  subscriptions: Subscription[];
  currentSubscription: Subscription | null;
  availablePlans: Plan[];
  loading: boolean;
  error: string | null;

  // UI state
  showUpgradeModal: boolean;
  showCancelModal: boolean;
  planChangeInProgress: boolean;
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  planId?: string;
  tenantId?: string;
  startDate?: Date;
  endDate?: Date;
}

// Business logic interfaces
export interface PlanChangeValidation {
  isValid: boolean;
  canUpgrade: boolean;
  canDowngrade: boolean;
  requiresPayment: boolean;
  prorationAmount: number;
  errors: string[];
}

export interface TrialInfo {
  isInTrial: boolean;
  daysRemaining: number;
  canExtend: boolean;
  maxExtensionDays: number;
}

export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  canceledSubscriptions: number;
  churnRate: number;
  conversionRate: number;
}
