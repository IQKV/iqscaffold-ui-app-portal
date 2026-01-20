import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  UserFeaturesResponse,
  FeatureSummary,
  AvailableFeaturesResponse,
  FeatureDetail,
  userManagementApi,
} from "@/shared/api/user-management-api";
import { notificationService } from "@/shared/lib/notifications";
import { useAuthStore } from "@/processes/auth";
import { hasAnyAuthorityWithInheritance } from "@/shared/constants/authorities";

interface FeatureContextValue {
  // Data
  userFeatures: UserFeaturesResponse | null;
  availableFeatures: AvailableFeaturesResponse | null;
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
  getFeature: (featureCode: string) => FeatureDetail | undefined;
  getFeatureSummary: (featureCode: string) => FeatureSummary | undefined;
  refetchFeatures: () => Promise<void>;
  refetchAvailableFeatures: () => Promise<void>;

  // Feature management (admin only)
  enableFeature: (userId: number, featureCode: string) => Promise<boolean>;
  disableFeature: (userId: number, featureCode: string) => Promise<boolean>;
  bulkUpdateFeatures: (
    userId: number,
    enableFeatures: string[],
    disableFeatures: string[]
  ) => Promise<boolean>;
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
  const [userFeatures, setUserFeatures] = useState<UserFeaturesResponse | null>(
    null
  );
  const [availableFeatures, setAvailableFeatures] =
    useState<AvailableFeaturesResponse | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const userAuthorities = useMemo(
    () => user?.authorities ?? [],
    [user?.authorities]
  );

  // Memoized enabled features list
  const enabledFeatures = useMemo(() => {
    if (!userFeatures?.features) {
      return [];
    }
    return userFeatures.features.map((f: FeatureSummary) => f.code);
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

  const getFeature = useCallback(
    (featureCode: string): FeatureDetail | undefined => {
      return availableFeatures?.features.find(
        (f: FeatureDetail) => f.code === featureCode
      );
    },
    [availableFeatures]
  );

  const getFeatureSummary = useCallback(
    (featureCode: string): FeatureSummary | undefined => {
      return userFeatures?.features.find(
        (f: FeatureSummary) => f.code === featureCode
      );
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
        userId: user.userId,
        username: user.username,
        featureCount: 0,
        features: [],
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch available features
  const refetchAvailableFeatures = useCallback(async () => {
    try {
      const response = await userManagementApi.getAvailableFeatures();
      setAvailableFeatures(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch available features";
      console.warn("Failed to fetch available features:", errorMessage);

      // Graceful degradation - set empty features
      setAvailableFeatures({
        features: [],
        totalCount: 0,
      });
    }
  }, []);

  // Feature management methods (admin only)
  const enableFeature = useCallback(
    async (userId: number, featureCode: string): Promise<boolean> => {
      try {
        await userManagementApi.enableUserFeature(userId, featureCode);
        await refetchFeatures();
        notificationService.success({
          title: "Feature enabled",
          message: `Feature ${featureCode} has been enabled`,
        });
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to enable feature";
        notificationService.error({
          title: "Failed to enable feature",
          message: errorMessage,
        });
        return false;
      }
    },
    [refetchFeatures]
  );

  const disableFeature = useCallback(
    async (userId: number, featureCode: string): Promise<boolean> => {
      try {
        await userManagementApi.disableUserFeature(userId, featureCode);
        await refetchFeatures();
        notificationService.success({
          title: "Feature disabled",
          message: `Feature ${featureCode} has been disabled`,
        });
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to disable feature";
        notificationService.error({
          title: "Failed to disable feature",
          message: errorMessage,
        });
        return false;
      }
    },
    [refetchFeatures]
  );

  const bulkUpdateFeatures = useCallback(
    async (
      userId: number,
      enableFeatures: string[],
      disableFeatures: string[]
    ): Promise<boolean> => {
      try {
        await userManagementApi.bulkUpdateUserFeatures(userId, {
          enableFeatures,
          disableFeatures,
        });
        await refetchFeatures();
        notificationService.success({
          title: "Features updated",
          message: "Bulk feature update completed",
        });
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update features";
        notificationService.error({
          title: "Failed to update features",
          message: errorMessage,
        });
        return false;
      }
    },
    [refetchFeatures]
  );

  // Auto-fetch on mount and user change
  useEffect(() => {
    if (autoFetch) {
      refetchFeatures();
      refetchAvailableFeatures();
    }
  }, [autoFetch, refetchFeatures, refetchAvailableFeatures]);

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
      availableFeatures,
      enabledFeatures,
      loading,
      error,
      hasFeature,
      canAccessFeature,
      hasFeatureWithAuthority,
      getFeature,
      getFeatureSummary,
      refetchFeatures,
      refetchAvailableFeatures,
      enableFeature,
      disableFeature,
      bulkUpdateFeatures,
    }),
    [
      userFeatures,
      availableFeatures,
      enabledFeatures,
      loading,
      error,
      hasFeature,
      canAccessFeature,
      hasFeatureWithAuthority,
      getFeature,
      getFeatureSummary,
      refetchFeatures,
      refetchAvailableFeatures,
      enableFeature,
      disableFeature,
      bulkUpdateFeatures,
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
  const { hasFeature, canAccessFeature, getFeature } = useFeatures();

  return useMemo(
    () => ({
      hasFeature: hasFeature(featureCode),
      canAccess: canAccessFeature(featureCode),
      feature: getFeature(featureCode),
    }),
    [featureCode, hasFeature, canAccessFeature, getFeature]
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

/**
 * Hook for feature management operations (admin only)
 * Returns feature management functions for admin users
 */
export const useFeatureManagement = () => {
  const {
    enableFeature,
    disableFeature,
    bulkUpdateFeatures,
    availableFeatures,
    refetchAvailableFeatures,
  } = useFeatures();

  return {
    enableFeature,
    disableFeature,
    bulkUpdateFeatures,
    availableFeatures,
    refetchAvailableFeatures,
  };
};
