import { http, HttpResponse } from "msw";
import {
  UserFeaturesResponse,
  FeatureSummary,
  AvailableFeaturesResponse,
  FeatureDetail,
  FeatureAccessResponse,
  BulkFeatureUpdateResponse,
} from "@/shared/api/user-management-api";

// Mock available features from backend configuration
const mockAvailableFeatures: FeatureDetail[] = [
  {
    code: "crm",
    displayName: "Customer Relationship Management",
    description: "Manage leads, contacts, and sales pipeline",
    composable: true,
    requiredAuthorities: ["CRM_ACCESS"],
    dependencies: [],
  },
  {
    code: "billing",
    displayName: "Billing & Payments",
    description: "Manage subscriptions, payments, and invoicing",
    composable: true,
    requiredAuthorities: ["BILLING_ACCESS"],
    dependencies: [],
  },
  {
    code: "api",
    displayName: "Platform API Access",
    description: "Access to platform APIs and integrations",
    composable: true,
    requiredAuthorities: ["API_ACCESS"],
    dependencies: [],
  },
  {
    code: "analytics",
    displayName: "Advanced Analytics",
    description: "Access to advanced reporting and analytics dashboards",
    composable: true,
    requiredAuthorities: ["ANALYTICS_ACCESS"],
    dependencies: [],
  },
];

// Mock user features (what the current user has enabled)
const mockUserFeatures: FeatureSummary[] = [
  {
    code: "crm",
    displayName: "Customer Relationship Management",
    description: "Manage leads, contacts, and sales pipeline",
    enabled: true,
  },
  {
    code: "analytics",
    displayName: "Advanced Analytics",
    description: "Access to advanced reporting and analytics dashboards",
    enabled: true,
  },
];

// Track enabled features per user (for admin management)
const userFeatureMap = new Map<number, Set<string>>();

// Initialize some test users with features
userFeatureMap.set(1, new Set(["crm", "analytics"]));
userFeatureMap.set(2, new Set(["billing"]));
userFeatureMap.set(3, new Set(["crm", "billing", "api"]));

export const featureHandlers = [
  // Get current user's features
  http.get("/api/v1/users/features/me", () => {
    const response: UserFeaturesResponse = {
      userId: 1,
      username: "current-user",
      featureCount: mockUserFeatures.length,
      features: mockUserFeatures,
    };

    return HttpResponse.json(response);
  }),

  // Get available features (admin only)
  http.get("/api/v1/users/features/available", () => {
    const response: AvailableFeaturesResponse = {
      totalCount: mockAvailableFeatures.length,
      features: mockAvailableFeatures,
    };

    return HttpResponse.json(response);
  }),

  // Get user features by ID (admin only)
  http.get("/api/v1/users/features/:userId", ({ params }) => {
    const userId = Number(params.userId);
    const userFeatures = userFeatureMap.get(userId) || new Set();
    
    const features: FeatureSummary[] = Array.from(userFeatures).map(code => {
      const availableFeature = mockAvailableFeatures.find(f => f.code === code);
      return {
        code,
        displayName: availableFeature?.displayName || code,
        description: availableFeature?.description || "",
        enabled: true,
      };
    });

    const response: UserFeaturesResponse = {
      userId,
      username: `user-${userId}`,
      featureCount: features.length,
      features,
    };

    return HttpResponse.json(response);
  }),

  // Enable feature for user (admin only)
  http.post("/api/v1/users/features/:userId/:featureCode/enable", ({ params }) => {
    const userId = Number(params.userId);
    const featureCode = params.featureCode as string;
    
    if (!userFeatureMap.has(userId)) {
      userFeatureMap.set(userId, new Set());
    }
    
    const userFeatures = userFeatureMap.get(userId)!;
    userFeatures.add(featureCode);

    const response: FeatureAccessResponse = {
      userId,
      username: `user-${userId}`,
      featureCode,
      hasAccess: true,
      message: `Feature ${featureCode} enabled successfully`,
    };

    return HttpResponse.json(response);
  }),

  // Disable feature for user (admin only)
  http.delete("/api/v1/users/features/:userId/:featureCode/disable", ({ params }) => {
    const userId = Number(params.userId);
    const featureCode = params.featureCode as string;
    
    const userFeatures = userFeatureMap.get(userId);
    if (userFeatures) {
      userFeatures.delete(featureCode);
    }

    const response: FeatureAccessResponse = {
      userId,
      username: `user-${userId}`,
      featureCode,
      hasAccess: false,
      message: `Feature ${featureCode} disabled successfully`,
    };

    return HttpResponse.json(response);
  }),

  // Check feature access for user (admin only)
  http.get("/api/v1/users/features/:userId/:featureCode/check", ({ params }) => {
    const userId = Number(params.userId);
    const featureCode = params.featureCode as string;
    
    const userFeatures = userFeatureMap.get(userId) || new Set();
    const hasAccess = userFeatures.has(featureCode);

    const response: FeatureAccessResponse = {
      userId,
      username: `user-${userId}`,
      featureCode,
      hasAccess,
      message: hasAccess 
        ? `User has access to ${featureCode}`
        : `User does not have access to ${featureCode}`,
    };

    return HttpResponse.json(response);
  }),

  // Bulk update user features (admin only)
  http.put("/api/v1/users/features/:userId", async ({ params, request }) => {
    const userId = Number(params.userId);
    const { enableFeatures, disableFeatures } = await request.json() as {
      enableFeatures: string[];
      disableFeatures: string[];
    };
    
    if (!userFeatureMap.has(userId)) {
      userFeatureMap.set(userId, new Set());
    }
    
    const userFeatures = userFeatureMap.get(userId)!;
    
    // Enable features
    enableFeatures.forEach(code => userFeatures.add(code));
    
    // Disable features
    disableFeatures.forEach(code => userFeatures.delete(code));

    const response: BulkFeatureUpdateResponse = {
      userId,
      username: `user-${userId}`,
      featuresEnabled: enableFeatures.length,
      featuresDisabled: disableFeatures.length,
      message: `Updated ${enableFeatures.length + disableFeatures.length} features successfully`,
    };

    return HttpResponse.json(response);
  }),
];