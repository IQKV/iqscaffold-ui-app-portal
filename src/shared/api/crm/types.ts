// CRM API Type Definitions
// Following billing service pattern for consistency

// Lead Types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  currentStage: string;
  score: number; // 0-100 qualification score
  assignedToUserId?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;

  // Business context fields
  isQualified: boolean;
  isOverdue: boolean;
  lastContactedAt?: string;
  nextFollowUpDate?: string;
  conversionProbability?: number;
}

export type LeadSource =
  | "WEBSITE"
  | "REFERRAL"
  | "COLD_CALL"
  | "EMAIL_CAMPAIGN"
  | "SOCIAL_MEDIA"
  | "TRADE_SHOW"
  | "PARTNER"
  | "OTHER";

export interface LeadListParams {
  search?: string;
  source?: LeadSource;
  stage?: string;
  assignedTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateLeadRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
}

export interface UpdateLeadRequest {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
}

// Pipeline Types
export interface PipelineStage {
  id: string;
  name: string;
  orderIndex: number;
  type: "ACTIVE" | "WON" | "LOST";
  color: string;

  // Business metrics
  averageTimeInStage?: number;
  conversionRate?: number;
  leadCount?: number;
}

export interface CreatePipelineStageRequest {
  name: string;
  orderIndex: number;
  type: "ACTIVE" | "WON" | "LOST";
  color: string;
}

export interface UpdatePipelineStageRequest {
  name?: string;
  orderIndex?: number;
  type?: "ACTIVE" | "WON" | "LOST";
  color?: string;
}

// Lead Notes Types
export interface LeadNote {
  id: string;
  leadId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  createdByName: string;

  // Business features
  isPinned: boolean;
  isPrivate: boolean;
}

export interface CreateLeadNoteRequest {
  content: string;
  isPinned?: boolean;
  isPrivate?: boolean;
}

export interface UpdateLeadNoteRequest {
  content: string;
  isPinned?: boolean;
  isPrivate?: boolean;
}

// Activity Log Types
export interface ActivityLogEntry {
  id: string;
  leadId: string;
  activityType: ActivityType;
  description: string;
  timestamp: string;
  performedByUserId: string;
  performedByName: string;
  metadata?: Record<string, any>;
}

export type ActivityType =
  | "LEAD_CREATED"
  | "LEAD_UPDATED"
  | "STAGE_CHANGED"
  | "NOTE_ADDED"
  | "FOLLOWUP_SCHEDULED"
  | "FOLLOWUP_COMPLETED"
  | "LEAD_QUALIFIED"
  | "LEAD_CONVERTED";

// Follow-up Types
export interface FollowUp {
  id: string;
  leadId: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  createdByUserId: string;

  // Business context
  priority: "LOW" | "MEDIUM" | "HIGH";
  type: "CALL" | "EMAIL" | "MEETING" | "TASK";
  isOverdue: boolean;
}

export interface CreateFollowUpRequest {
  leadId: string;
  description: string;
  dueDate: string; // ISO date string
  priority?: "LOW" | "MEDIUM" | "HIGH";
  type?: "CALL" | "EMAIL" | "MEETING" | "TASK";
}

export interface UpdateFollowUpRequest {
  description?: string;
  dueDate?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  type?: "CALL" | "EMAIL" | "MEETING" | "TASK";
}

export interface FollowUpListParams {
  leadId?: string;
  completed?: boolean;
  overdue?: boolean;
  page?: number;
  size?: number;
}

// Dashboard Types
export interface DashboardStatsParams {
  startDate?: string;
  endDate?: string;
}

export interface DashboardStats {
  leadsByStage: Record<string, number>;
  leadsBySource: Record<string, number>;
  totalLeads: number;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
}

export interface ConversionMetrics {
  conversionRate: number;
  averageTimeToConvert: number;
  stageVelocity: Record<string, number>;
}

// Pagination Response Type (following billing service pattern)
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
