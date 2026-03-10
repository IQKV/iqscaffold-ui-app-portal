import { http, HttpResponse } from "msw";
import type {
  UserFeaturesResponse as BillingUserFeaturesResponse,
  FeatureDto,
} from "@/shared/api/billing/types";
import { getConfig } from "@/app/config";
import { ENV_KEYS } from "@/shared/constants";

const API_BASE_URL = getConfig(ENV_KEYS.API_SERVER_URL) || "";

// Mock user features (billing service format)
const mockEnabledFeatures: FeatureDto[] = [
  {
    code: "crm",
    name: "Customer Relationship Management",
    description: "Manage leads, contacts, and sales pipeline",
    category: "business",
    enabled: true,
  },
  {
    code: "analytics",
    name: "Advanced Analytics",
    description: "Access to advanced reporting and analytics dashboards",
    category: "analytics",
    enabled: true,
  },
];

const mockAllFeatures: FeatureDto[] = [
  ...mockEnabledFeatures,
  {
    code: "billing",
    name: "Billing & Payments",
    description: "Manage subscriptions, payments, and invoicing",
    category: "business",
    enabled: false,
  },
  {
    code: "api",
    name: "Platform API Access",
    description: "Access to platform APIs and integrations",
    category: "integration",
    enabled: false,
  },
];

export const featureHandlers = [
  // Get current user's features (billing service endpoint)
  http.get(`${API_BASE_URL}/v1/features/my-features`, () => {
    const response: BillingUserFeaturesResponse = {
      enabledFeatures: mockEnabledFeatures,
      allFeatures: mockAllFeatures,
      planName: "Professional",
      subscriptionStatus: "active",
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isTrialPeriod: false,
      tenantId: "tenant-123",
    };

    return HttpResponse.json(response);
  }),

  // Get enabled features only (billing service endpoint)
  http.get(`${API_BASE_URL}/v1/features/enabled`, () => {
    return HttpResponse.json(mockEnabledFeatures);
  }),

  // Note: Legacy user feature management endpoints removed
  // Features are now managed through subscription plans in billing service
  // Use subscription plan management APIs instead
];
