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
  convertedFromLeadId?: number;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;

  // Relationship data
  company?: Company;
}

export enum ContactStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  CUSTOMER = "CUSTOMER",
  PROSPECT = "PROSPECT",
}

export interface Company {
  id: number;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  parentCompanyId?: number;
  status: CompanyStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum CompanyStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PROSPECT = "PROSPECT",
  PARTNER = "PARTNER",
  TERMINATED = "TERMINATED",
}

export interface CreateCompanyRequest {
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  parentCompanyId?: number;
  status?: CompanyStatus;
  notes?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  website?: string;
  industry?: string;
  size?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  parentCompanyId?: number;
  status?: CompanyStatus;
  notes?: string;
}

export interface CompanyListParams {
  page?: number;
  size?: number;
  search?: string;
  industry?: string;
  status?: CompanyStatus;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
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

// Contact Notes Types
export interface ContactNote {
  id: number;
  contactId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  createdByName: string;
}

export interface CreateContactNoteRequest {
  content: string;
}

export interface UpdateContactNoteRequest {
  content: string;
}

// Contact Activity Types
export interface ContactActivity {
  id: number;
  contactId: number;
  activityType: ContactActivityType;
  description: string;
  timestamp: string;
  performedByUserId: string;
  performedByName: string;
  metadata?: Record<string, any>;
}

export type ContactActivityType =
  | "CONTACT_CREATED"
  | "CONTACT_UPDATED"
  | "STATUS_CHANGED"
  | "NOTE_ADDED"
  | "NOTE_UPDATED"
  | "NOTE_DELETED"
  | "LEAD_SCORE_UPDATED"
  | "COMPANY_ASSOCIATED"
  | "EMAIL_SENT"
  | "CALL_MADE"
  | "MEETING_SCHEDULED"
  | "CONVERTED_FROM_LEAD";
