import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  UserFeaturesResponse,
  FeatureDto,
  FeatureUsageInfo,
} from "@/shared/api/billing/types";
import { billingApi } from "@/shared/api/billing";
import { notificationService } from "@/shared/lib/notifications";

interface FeatureContextValue {
  // Data
  features: UserFeaturesResponse | null;
  enabledFeatures: string[];
  loading: boolean;
  error: string | null;

  // Methods
  hasFeature: (featureCode: string) => boolean;
  getFeature: (featureCode: string) => FeatureDto | undefined;
  getUsageInfo: (featureCode: string) => FeatureUsageInfo | null;
  refetchFeatures: () => Promise<void>;

  // Subscription info
  planName: string | null;
  subscriptionStatus: string | null;
  isTrialPeriod: boolean;
  trialExpiresAt: string | null;
}

const FeatureContext = createContext<FeatureContextValue | null>(null);

interface FeatureProviderProps {
  children: React.ReactNode;
  /** Whether to automatically fetch features on mount */
  autoFetch?: boolean;
  /** Interval in milliseconds to refetch features (0 to disable) */
  refetchInterval?: number;
}

/**
 * Global feature context provider.
 *
 * Provides centralized feature state management across the entire application.
 * Automatically handles:
 * - Feature loading and caching
 * - Error handling with graceful degradation
 * - Subscription status tracking
 * - Optional automatic refetching
 *
 * Place this high in your component tree, typically in App.tsx.
 */
export const FeatureProvider: React.FC<FeatureProviderProps> = ({
  children,
  autoFetch = true,
  refetchInterval = 0, // Disabled by default
}) => {
  const [features, setFeatures] = useState<UserFeaturesResponse | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await billingApi.getMyFeatures();

      // Handle fallback responses from gateway circuit breaker
      if (response.planName === "Service Unavailable") {
        console.warn("Feature service unavailable, using fallback data");
        setError("Feature service temporarily unavailable");
      }

      setFeatures(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch features";
      setError(errorMessage);

      console.error("Failed to fetch features:", err);

      // Set empty features to allow app to continue functioning
      setFeatures({
        enabledFeatures: [],
        allFeatures: [],
        planName: "Unknown",
        subscriptionStatus: "UNKNOWN",
        isTrialPeriod: false,
        tenantId: "unknown",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchFeatures();
    }
  }, [autoFetch, fetchFeatures]);

  // Optional periodic refetch
  useEffect(() => {
    if (refetchInterval > 0) {
      const interval = setInterval(fetchFeatures, refetchInterval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [refetchInterval, fetchFeatures]);

  // Derived state
  const enabledFeatures = features?.enabledFeatures.map((f) => f.code) || [];

  // Helper methods
  const hasFeature = (featureCode: string): boolean => {
    return enabledFeatures.includes(featureCode);
  };

  const getFeature = useCallback(
    (featureCode: string): FeatureDto | undefined => {
      return features?.enabledFeatures.find((f) => f.code === featureCode);
    },
    [features]
  );

  const getUsageInfo = useCallback(
    (featureCode: string): FeatureUsageInfo | null => {
      const feature = getFeature(featureCode);
      if (!feature || !feature.usageLimit) {
        return null;
      }

      const current = feature.currentUsage || 0;
      const limit = feature.usageLimit;

      return {
        current,
        limit,
        percentage: (current / limit) * 100,
        remaining: Math.max(0, limit - current),
      };
    },
    [getFeature]
  );

  const contextValue: FeatureContextValue = {
    // Data
    features,
    enabledFeatures,
    loading,
    error,

    // Methods
    hasFeature,
    getFeature,
    getUsageInfo,
    refetchFeatures: fetchFeatures,

    // Subscription info
    planName: features?.planName || null,
    subscriptionStatus: features?.subscriptionStatus || null,
    isTrialPeriod: features?.isTrialPeriod || false,
    trialExpiresAt: features?.trialExpiresAt || null,
  };

  return (
    <FeatureContext.Provider value={contextValue}>
      {children}
    </FeatureContext.Provider>
  );
};

/**
 * Hook to access the feature context.
 *
 * Must be used within a FeatureProvider.
 *
 * @example
 * ```tsx
 * const { hasFeature, getUsageInfo, planName } = useFeatureContext();
 *
 * if (hasFeature('advanced_analytics')) {
 *   // Show advanced analytics
 * }
 * ```
 */
export const useFeatureContext = (): FeatureContextValue => {
  const context = useContext(FeatureContext);

  if (!context) {
    throw new Error("useFeatureContext must be used within a FeatureProvider");
  }

  return context;
};

/**
 * Hook that returns only the hasFeature function for performance-critical components.
 *
 * Optimized for components that only need to check feature enablement without
 * triggering re-renders when other feature data changes.
 */
export const useHasFeature = () => {
  const { hasFeature } = useFeatureContext();
  return hasFeature;
};
