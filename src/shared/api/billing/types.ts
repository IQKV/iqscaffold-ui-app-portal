export interface CreatePaymentRequest {
  amount: number;
  currency: string;
}

export interface PaymentResponse {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}

export type PaymentStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "PROCESSING"
  | "REQUIRES_PAYMENT_METHOD"
  | "REQUIRES_CONFIRMATION"
  | "REQUIRES_ACTION"
  | "CANCELED";

export interface OnboardRequest {
  refreshUrl: string;
  returnUrl: string;
}

export interface OnboardResponse {
  accountLink: string;
}

export interface BillingHistoryParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
