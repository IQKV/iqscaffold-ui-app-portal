import { useState, useEffect, useCallback } from "react";
import { billingApi } from "@/shared/api/billing";
import { FeatureDto } from "@/shared/api/billing/types";

interface UseEnabledFeaturesReturn {
  enabledFeatures: string[];
  featuresData: FeatureDto[];
  loading: boolean;
  error: string | null;
  hasFeature: (featureCode: string) => boolean;
  refetch: () => Promise<void>;
}

/**
 * Lightweight hook for checking enabled features only.
 *
 * Optimized for:
 * - High-frequency feature checks
 * - Navigation rendering
 * - Simple feature gates
 * - Performance-critical components
 *
 * Uses the lightweight /v1/features/enabled endpoint with higher rate limits.
 * For complete feature information including quotas and subscription details, use useFeatures.
 */
export const useEnabledFeatures = (): UseEnabledFeaturesReturn => {
  const [featuresData, setFeaturesData] = useState<FeatureDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnabledFeatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const features = await billingApi.getEnabledFeatures();
      setFeaturesData(features);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch enabled features";
      setError(errorMessage);

      console.error("Failed to fetch enabled features:", err);

      // Set empty array to allow app to continue functioning
      setFeaturesData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnabledFeatures();
  }, [fetchEnabledFeatures]);

  const enabledFeatures = featuresData.map((f) => f.code);

  const hasFeature = useCallback(
    (featureCode: string): boolean => {
      return enabledFeatures.includes(featureCode);
    },
    [enabledFeatures],
  );

  const refetch = useCallback(async () => {
    await fetchEnabledFeatures();
  }, [fetchEnabledFeatures]);

  return {
    enabledFeatures,
    featuresData,
    loading,
    error,
    hasFeature,
    refetch,
  };
};
