export type {
  PaymentResponse as Payment,
  PaymentStatus,
  OnboardResponse as MerchantAccount,
  PayoutResponse as Payout,
  PayoutStatus,
  SubscriptionResponse as Subscription,
  SubscriptionStatus,
  SubscriptionPlanResponse as SubscriptionPlan,
  InvoiceResponse as Invoice,
  InvoiceStatus,
} from "@/shared/api/billing/types";

export interface BillingState {
  currentPayment: string | null;
  history: string[];
}
