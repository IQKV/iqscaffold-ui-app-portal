import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { userManagementApi } from "@/shared/api/user-management-api";
import type { UserFeaturesResponse as BillingUserFeaturesResponse } from "@/shared/api/billing/types";
import { notificationService } from "@/shared/lib/notifications";
import { useAuthStore } from "@/processes/auth";
import { hasAnyAuthorityWithInheritance } from "@/shared/constants/authorities";

interface FeatureContextValue {
  // Data
  userFeatures: BillingUserFeaturesResponse | null;
  enabledFeatures: string[];
  loading: boolean;
  error: string | null;

  // Methods
  hasFeature: (featureCode: string) => boolean;
  canAccessFeature: (featureCode: string) => boolean;
  hasFeatureWithAuthority: (
    featureCode: string,
    requiredAuthorities: string[]
  ) => boolean;
  getFeatureSummary: (
    featureCode: string
  ) =>
    | { code: string; name: string; description: string; enabled: boolean }
    | undefined;
  refetchFeatures: () => Promise<void>;
}

/**
 * Feature-authority mapping for access control validation
 * Maps feature codes to required authorities
 */
const FEATURE_AUTHORITY_MAPPING: Record<string, string[]> = {
  // Billing features
  billing: [
    "BILLING_ACCESS",
    "BILLING_MANAGER",
    "BILLING_ADMIN",
    "ADMIN",
    "SUPER_ADMIN",
  ],
  payments: [
    "BILLING_ACCESS",
    "BILLING_MANAGER",
    "BILLING_ADMIN",
    "ADMIN",
    "SUPER_ADMIN",
  ],
  subscriptions: [
    "BILLING_ACCESS",
    "BILLING_MANAGER",
    "BILLING_ADMIN",
    "ADMIN",
    "SUPER_ADMIN",
  ],
  invoices: ["BILLING_MANAGER", "BILLING_ADMIN", "ADMIN", "SUPER_ADMIN"],
  refunds: ["BILLING_MANAGER", "BILLING_ADMIN", "ADMIN", "SUPER_ADMIN"],
  gateway_config: ["BILLING_ADMIN", "ADMIN", "SUPER_ADMIN"],
  merchant_onboarding: ["BILLING_ADMIN", "ADMIN", "SUPER_ADMIN"],

  // CRM features
  crm: [
    "CRM_ACCESS",
    "CRM_LEAD_MANAGER",
    "CRM_CONTACT_MANAGER",
    "CRM_PIPELINE_MANAGER",
    "CRM_ADMIN",
    "ADMIN",
    "SUPER_ADMIN",
  ],
  leads: [
    "CRM_ACCESS",
    "CRM_LEAD_MANAGER",
    "CRM_ADMIN",
    "ADMIN",
    "SUPER_ADMIN",
  ],
  contacts: [
    "CRM_ACCESS",
    "CRM_CONTACT_MANAGER",
    "CRM_ADMIN",
    "ADMIN",
    "SUPER_ADMIN",
  ],
  pipeline: [
    "CRM_ACCESS",
    "CRM_PIPELINE_MANAGER",
    "CRM_ADMIN",
    "ADMIN",
    "SUPER_ADMIN",
  ],
  lead_management: ["CRM_LEAD_MANAGER", "CRM_ADMIN", "ADMIN", "SUPER_ADMIN"],
  contact_management: [
    "CRM_CONTACT_MANAGER",
    "CRM_ADMIN",
    "ADMIN",
    "SUPER_ADMIN",
  ],
  pipeline_management: [
    "CRM_PIPELINE_MANAGER",
    "CRM_ADMIN",
    "ADMIN",
    "SUPER_ADMIN",
  ],

  // API features
  api_access: ["API_ACCESS", "ADMIN", "SUPER_ADMIN"],

  // Admin features
  user_management: ["ADMIN", "SUPER_ADMIN", "TENANT_OWNER"],
  platform_config: ["SUPER_ADMIN", "TENANT_OWNER"],
};

const FeatureContext = createContext<FeatureContextValue | null>(null);

interface FeatureProviderProps {
  children: React.ReactNode;
  /** Whether to automatically fetch features on mount */
  autoFetch?: boolean;
  /** Interval in milliseconds to refetch features (0 to disable) */
  refetchInterval?: number;
}

/**
 * Global feature context provider for configuration-driven feature management.
 *
 * Provides centralized feature state management across the entire application.
 * Automatically handles:
 * - Dynamic feature loading from backend configuration
 * - Feature access validation based on user authorities with inheritance
 * - Error handling with graceful degradation
 * - Feature management operations (admin only)
 * - Optional automatic refetching
 * - Authority-based feature access control
 *
 * Place this high in your component tree, typically in App.tsx.
 */
export const FeatureProvider: React.FC<FeatureProviderProps> = ({
  children,
  autoFetch = true,
  refetchInterval = 0, // Disabled by default
}) => {
  const [userFeatures, setUserFeatures] =
    useState<BillingUserFeaturesResponse | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const userAuthorities = useMemo(
    () => user?.authorities ?? [],
    [user?.authorities]
  );

  // Memoized enabled features list from billing service response
  // Memoized enabled features list from billing service response
  const enabledFeatures = useMemo(() => {
    if (!userFeatures?.enabledFeatures) {
      return [];
    }
    return userFeatures.enabledFeatures.map((f) => f.code);
  }, [userFeatures]);

  // Feature access methods with authority validation
  const hasFeature = useCallback(
    (featureCode: string): boolean => {
      return enabledFeatures.includes(featureCode);
    },
    [enabledFeatures]
  );

  const canAccessFeature = useCallback(
    (featureCode: string): boolean => {
      // SUPER_ADMIN bypass: Always grant access to SUPER_ADMIN users
      if (userAuthorities.includes("SUPER_ADMIN")) {
        return true;
      }

      // Check if user has the feature enabled
      if (!hasFeature(featureCode)) {
        return false;
      }

      // Check if user has required authorities for this feature
      const requiredAuthorities = FEATURE_AUTHORITY_MAPPING[featureCode];
      if (!requiredAuthorities) {
        // If no authority mapping exists, allow access if feature is enabled
        return true;
      }

      return hasAnyAuthorityWithInheritance(
        userAuthorities,
        requiredAuthorities
      );
    },
    [hasFeature, userAuthorities]
  );

  const hasFeatureWithAuthority = useCallback(
    (featureCode: string, requiredAuthorities: string[]): boolean => {
      // SUPER_ADMIN bypass: Always grant access to SUPER_ADMIN users
      if (userAuthorities.includes("SUPER_ADMIN")) {
        return true;
      }

      // Check if user has the feature enabled
      if (!hasFeature(featureCode)) {
        return false;
      }

      // Check if user has any of the required authorities
      return hasAnyAuthorityWithInheritance(
        userAuthorities,
        requiredAuthorities
      );
    },
    [hasFeature, userAuthorities]
  );

  const getFeatureSummary = useCallback(
    (featureCode: string) => {
      const feature = userFeatures?.enabledFeatures.find(
        (f) => f.code === featureCode
      );
      if (!feature) {
        return undefined;
      }
      return {
        code: feature.code,
        name: feature.name,
        description: feature.description,
        enabled: feature.enabled,
      };
    },
    [userFeatures]
  );

  // Fetch user features
  const refetchFeatures = useCallback(async () => {
    if (!user) {
      setUserFeatures(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await userManagementApi.getMyFeatures();
      setUserFeatures(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch user features";
      setError(errorMessage);
      notificationService.error({
        title: "Failed to load user features",
        message: errorMessage,
      });

      // Graceful degradation - set empty features
      setUserFeatures({
        enabledFeatures: [],
        allFeatures: [],
        planName: "Unknown",
        subscriptionStatus: "unknown",
        subscriptionExpiresAt: "",
        isTrialPeriod: false,
        tenantId: user.tenantId || "unknown",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Auto-fetch on mount and user change
  useEffect(() => {
    if (autoFetch) {
      refetchFeatures();
    }
  }, [autoFetch, refetchFeatures]);

  // Auto-refetch interval
  useEffect(() => {
    if (refetchInterval > 0) {
      const interval = setInterval(() => {
        refetchFeatures();
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, refetchFeatures]);

  const contextValue: FeatureContextValue = useMemo(
    () => ({
      userFeatures,
      enabledFeatures,
      loading,
      error,
      hasFeature,
      canAccessFeature,
      hasFeatureWithAuthority,
      getFeatureSummary,
      refetchFeatures,
    }),
    [
      userFeatures,
      enabledFeatures,
      loading,
      error,
      hasFeature,
      canAccessFeature,
      hasFeatureWithAuthority,
      getFeatureSummary,
      refetchFeatures,
    ]
  );

  return (
    <FeatureContext.Provider value={contextValue}>
      {children}
    </FeatureContext.Provider>
  );
};

/**
 * Hook to access feature context
 */
export const useFeatures = (): FeatureContextValue => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error("useFeatures must be used within a FeatureProvider");
  }
  return context;
};

/**
 * Hook to check if a feature is available and user has access
 */
export const useFeatureAccess = (featureCode: string) => {
  const { hasFeature, canAccessFeature } = useFeatures();

  return useMemo(
    () => ({
      hasFeature: hasFeature(featureCode),
      canAccess: canAccessFeature(featureCode),
    }),
    [featureCode, hasFeature, canAccessFeature]
  );
};

/**
 * Hook to check multiple features at once
 */
export const useMultipleFeatureAccess = (featureCodes: string[]) => {
  const { canAccessFeature } = useFeatures();

  return useMemo(() => {
    const results: Record<string, boolean> = {};
    featureCodes.forEach((code) => {
      results[code] = canAccessFeature(code);
    });
    return results;
  }, [featureCodes, canAccessFeature]);
};

/**
 * Hook to access feature context (alias for useFeatures)
 * Must be used within a FeatureProvider
 */
export const useFeatureContext = (): FeatureContextValue => {
  return useFeatures();
};

/**
 * Hook for lightweight feature checks (optimized for frequent use)
 * Returns only the essential feature checking functions
 */
export const useEnabledFeatures = () => {
  const { hasFeature, canAccessFeature, enabledFeatures, loading, error } =
    useFeatures();

  return {
    hasFeature,
    canAccessFeature,
    enabledFeatures,
    loading,
    error,
  };
};
