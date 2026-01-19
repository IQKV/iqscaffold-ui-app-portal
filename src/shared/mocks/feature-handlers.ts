import { http, HttpResponse } from "msw";
import { UserFeaturesResponse, FeatureDto } from "@/shared/api/billing/types";

// Mock feature data for development
const mockFeatures: FeatureDto[] = [
  {
    code: "advanced_analytics",
    name: "Advanced Analytics",
    description: "Access to advanced reporting and analytics dashboards",
    category: "ANALYTICS",
    enabled: true,
    usageLimit: undefined,
    currentUsage: 0,
  },
  {
    code: "api_calls",
    name: "API Calls",
    description: "Monthly API call quota",
    category: "API",
    enabled: true,
    usageLimit: 10000,
    currentUsage: 1250,
  },
  {
    code: "storage_gb",
    name: "Storage",
    description: "File storage quota in GB",
    category: "STORAGE",
    enabled: true,
    usageLimit: 100,
    currentUsage: 23,
  },
  {
    code: "team_members",
    name: "Team Members",
    description: "Maximum number of team members",
    category: "TEAM",
    enabled: true,
    usageLimit: 10,
    currentUsage: 3,
  },
  {
    code: "lead_management",
    name: "Lead Management",
    description: "Manage sales leads and track conversion rates",
    category: "CRM",
    enabled: true,
    usageLimit: undefined,
    currentUsage: 0,
  },
  {
    code: "contact_management",
    name: "Contact Management",
    description: "Manage customer contacts and relationships",
    category: "CRM",
    enabled: true,
    usageLimit: undefined,
    currentUsage: 0,
  },
  {
    code: "pipeline_management",
    name: "Pipeline Management",
    description: "Visual sales pipeline with drag-and-drop functionality",
    category: "CRM",
    enabled: false, // Disabled to show feature gate behavior
    usageLimit: undefined,
    currentUsage: 0,
  },
  {
    code: "follow_up_management",
    name: "Follow-up Management",
    description: "Schedule and track customer follow-ups",
    category: "CRM",
    enabled: true,
    usageLimit: undefined,
    currentUsage: 0,
  },
  {
    code: "reporting",
    name: "Advanced Reporting",
    description: "Generate detailed reports and export data",
    category: "REPORTING",
    enabled: true,
    usageLimit: undefined,
    currentUsage: 0,
  },
  {
    code: "monthly_reports",
    name: "Monthly Reports",
    description: "Number of reports generated per month",
    category: "REPORTING",
    enabled: true,
    usageLimit: 50,
    currentUsage: 12,
  },
  {
    code: "crm_access",
    name: "CRM Access",
    description: "Access to CRM functionality",
    category: "CRM",
    enabled: true,
    usageLimit: undefined,
    currentUsage: 0,
  },
];

const mockUserFeaturesResponse: UserFeaturesResponse = {
  enabledFeatures: mockFeatures.filter((f) => f.enabled),
  allFeatures: mockFeatures,
  planName: "Pro Plan",
  subscriptionStatus: "active",
  subscriptionExpiresAt: new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString(), // 30 days from now
  isTrialPeriod: false,
  trialExpiresAt: undefined,
  tenantId: "tenant-123",
};

export const featureHandlers = [
  // Get user's complete feature information
  http.get("/api/v1/features/my-features", () => {
    return HttpResponse.json(mockUserFeaturesResponse);
  }),

  // Get only enabled features (lightweight)
  http.get("/api/v1/features/enabled", () => {
    return HttpResponse.json(mockFeatures.filter((f) => f.enabled));
  }),
];
