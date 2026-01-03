export type {
  PaymentResponse as Payment,
  PaymentStatus,
  OnboardResponse as MerchantAccount,
} from "@/shared/api/billing/types";

export interface BillingState {
  currentPayment: string | null;
  history: string[];
}
