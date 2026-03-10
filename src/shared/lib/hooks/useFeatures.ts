import { useState, useEffect, useCallback } from "react";
import { billingApi } from "@/shared/api/billing";
import { UserFeaturesResponse, FeatureDto, FeatureUsageInfo } from "@/shared/api/billing/types";
import { notificationService } from "@/shared/lib/notifications";

interface UseFeaturesReturn {
  features: UserFeaturesResponse | null;
  loading: boolean;
  error: string | null;
  hasFeature: (featureCode: string) => boolean;
  getFeature: (featureCode: string) => FeatureDto | undefined;
  getUsageInfo: (featureCode: string) => FeatureUsageInfo | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing complete user feature information including subscription details.
 *
 * Provides:
 * - Complete feature data with subscription info
 * - Feature enablement checks
 * - Usage quota information
 * - Error handling with graceful degradation
 *
 * Use this hook when you need:
 * - Subscription plan information
 * - Feature usage quotas and limits
 * - Complete feature metadata
 *
 * For simple feature gates, consider useEnabledFeatures for better performance.
 */
export const useFeatures = (): UseFeaturesReturn => {
  const [features, setFeatures] = useState<UserFeaturesResponse | null>(null);
  const [loading, setLoading] = useState(true);
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
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch features";
      setError(errorMessage);

      // Don't show notification for initial load failures to avoid spam
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

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const hasFeature = useCallback(
    (featureCode: string): boolean => {
      return features?.enabledFeatures.some((f) => f.code === featureCode) ?? false;
    },
    [features],
  );

  const getFeature = useCallback(
    (featureCode: string): FeatureDto | undefined => {
      return features?.enabledFeatures.find((f) => f.code === featureCode);
    },
    [features],
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
    [getFeature],
  );

  const refetch = useCallback(async () => {
    await fetchFeatures();
  }, [fetchFeatures]);

  return {
    features,
    loading,
    error,
    hasFeature,
    getFeature,
    getUsageInfo,
    refetch,
  };
};
