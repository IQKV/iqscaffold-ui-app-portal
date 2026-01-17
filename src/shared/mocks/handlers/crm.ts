// CRM Service Mock Handlers
// Mocks for Leads, Pipeline Stages, Dashboard, and Follow-ups

import { http, HttpResponse, delay } from "msw";

// Mock configuration
const config = {
  delay: 300,
};

// Mock data stores
const mockLeads: any[] = [
  {
    id: "lead-1",
    name: "John Smith",
    email: "john@startup.io",
    company: "Startup Ventures",
    source: "WEBSITE",
    currentStage: "New",
    score: 85,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isQualified: true,
    isOverdue: false,
  },
  {
    id: "lead-2",
    name: "Sarah Parker",
    email: "sarah@enterprise.com",
    company: "Enterprise Corp",
    source: "REFERRAL",
    currentStage: "Discovery",
    score: 92,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isQualified: true,
    isOverdue: true,
  },
];

const mockStages: any[] = [
  { id: "stage-1", name: "New", orderIndex: 0, type: "ACTIVE", color: "blue" },
  {
    id: "stage-2",
    name: "Discovery",
    orderIndex: 1,
    type: "ACTIVE",
    color: "cyan",
  },
  {
    id: "stage-3",
    name: "Proposal",
    orderIndex: 2,
    type: "ACTIVE",
    color: "orange",
  },
  { id: "stage-4", name: "Won", orderIndex: 3, type: "WON", color: "green" },
  { id: "stage-5", name: "Lost", orderIndex: 4, type: "LOST", color: "red" },
];

const mockFollowUps: any[] = [
  {
    id: "fu-1",
    leadId: "lead-1",
    description: "Follow up on initial inquiry",
    dueDate: new Date().toISOString(),
    completed: false,
    priority: "HIGH",
    type: "CALL",
    isOverdue: false,
  },
];

export const crmHandlers = [
  // Leads
  http.get("/api/v1/leads", async () => {
    if (config.delay) {
      await delay(config.delay);
    }
    return HttpResponse.json({
      content: mockLeads,
      totalElements: mockLeads.length,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
    });
  }),

  // Pipeline Stages
  http.get("/api/v1/pipeline/stages", async () => {
    if (config.delay) {
      await delay(config.delay);
    }
    return HttpResponse.json(mockStages);
  }),

  // Dashboard (New Paths)
  http.get("/api/v1/pipeline/dashboard/stats", async () => {
    if (config.delay) {
      await delay(config.delay);
    }
    return HttpResponse.json({
      leadsByStage: { New: 5, Discovery: 3, Proposal: 2 },
      leadsBySource: { WEBSITE: 7, REFERRAL: 3 },
      totalLeads: 10,
      activeLeads: 8,
      wonLeads: 1,
      lostLeads: 1,
    });
  }),

  http.get("/api/v1/pipeline/dashboard/conversion", async () => {
    if (config.delay) {
      await delay(config.delay);
    }
    return HttpResponse.json({
      conversionRate: 0.25,
      averageTimeToConvert: 15.5,
      stageVelocity: { New: 2.5, Discovery: 4.0 },
    });
  }),

  // Follow-ups (New Paths)
  http.get("/api/v1/pipeline/follow-ups", async () => {
    if (config.delay) {
      await delay(config.delay);
    }
    return HttpResponse.json({
      content: mockFollowUps,
      totalElements: mockFollowUps.length,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
    });
  }),

  http.get("/api/v1/pipeline/follow-ups/today", async () => {
    if (config.delay) {
      await delay(config.delay);
    }
    return HttpResponse.json(mockFollowUps);
  }),

  http.get("/api/v1/pipeline/follow-ups/overdue", async () => {
    if (config.delay) {
      await delay(config.delay);
    }
    return HttpResponse.json([]);
  }),
];
