export type {
  PaymentResponse as Payment,
  PaymentStatus,
  OnboardResponse as MerchantAccount,
  PayoutResponse as Payout,
  PayoutStatus,
} from "@/shared/api/billing/types";

export interface BillingState {
  currentPayment: string | null;
  history: string[];
}
