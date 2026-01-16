// Contact Service Types
// Following CRM and billing service patterns

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  companyId?: number;
  status: ContactStatus;
  leadScore: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export enum ContactStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  companyId?: number;
  status?: ContactStatus;
  leadScore?: number;
  notes?: string;
}

export interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  companyId?: number;
  status?: ContactStatus;
  notes?: string;
}

export interface ContactListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: ContactStatus;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface UpdateLeadScoreRequest {
  leadScore: number;
}

export interface BulkCreateContactsRequest {
  contacts: CreateContactRequest[];
}

export interface BulkUpdateStatusRequest {
  contactIds: number[];
  status: ContactStatus;
}

export interface BulkDeleteContactsRequest {
  contactIds: number[];
}

export interface BulkUpdateLeadScoresRequest {
  updates: Array<{ contactId: number; leadScore: number }>;
}

export interface BulkOperationResponse {
  successCount: number;
  failureCount: number;
  errors: Array<{ id: number; error: string }>;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}
