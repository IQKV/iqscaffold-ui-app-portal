import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  UserFeaturesResponse,
  FeatureSummary,
  AvailableFeaturesResponse,
  FeatureDetail,
} from "@/shared/api/user-management-api";
import { userManagementApi } from "@/shared/api/user-management-api";
import { notificationService } from "@/shared/lib/notifications";
import { useAuthStore } from "@/processes/auth";

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
  getFeature: (featureCode: string) => FeatureDetail | undefined;
  getFeatureSummary: (featureCode: string) => FeatureSummary | undefined;
  refetchFeatures: () => Promise<void>;
  refetchAvailableFeatures: () => Promise<void>;

  // Feature management (admin only)
  enableFeature: (userId: number, featureCode: string) => Promise<boolean>;
  disableFeature: (userId: number, featureCode: string) => Promise<boolean>;
  bulkUpdateFeatures: (userId: number, enableFeatures: string[], disableFeatures: string[]) => Promise<boolean>;
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
 * Global feature context provider for configuration-driven feature management.
 *
 * Provides centralized feature state management across the entire application.
 * Automatically handles:
 * - Dynamic feature loading from backend configuration
 * - Feature access validation based on user authorities
 * - Error handling with graceful degradation
 * - Feature management operations (admin only)
 * - Optional automatic refetching
 *
 * Place this high in your component tree, typically in App.tsx.
 */
export const FeatureProvider: React.FC<FeatureProviderProps> = ({
  children,
  autoFetch = true,
  refetchInterval = 0, // Disabled by default
}) => {
  const [userFeatures, setUserFeatures] = useState<UserFeaturesResponse | null>(null);
  const [availableFeatures, setAvailableFeatures] = useState<AvailableFeaturesResponse | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  const fetchUserFeatures = useCallback(async () => {
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
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch user features";
      console.warn("Feature service unavailable, using fallback", err);
      setError(errorMessage);
      
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

  const fetchAvailableFeatures = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const response = await userManagementApi.getAvailableFeatures();
      setAvailableFeatures(response);
    } catch (err) {
      console.warn("Failed to fetch available features", err);
      // Don't set error for available features - it's not critical
    }
  }, [user]);

  const refetchFeatures = useCallback(async () => {
    await fetchUserFeatures();
  }, [fetchUserFeatures]);

  const refetchAvailableFeatures = useCallback(async () => {
    await fetchAvailableFeatures();
  }, [fetchAvailableFeatures]);

  // Fetch features on mount and user change
  useEffect(() => {
    if (autoFetch && user) {
      fetchUserFeatures();
      fetchAvailableFeatures();
    }
  }, [autoFetch, user, fetchUserFeatures, fetchAvailableFeatures]);

  // Set up refetch interval
  useEffect(() => {
    if (refetchInterval > 0 && user) {
      const interval = setInterval(() => {
        fetchUserFeatures();
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, user, fetchUserFeatures]);

  // Derived state
  const enabledFeatures = userFeatures?.features.map(f => f.code) || [];

  // Feature access methods
  const hasFeature = useCallback((featureCode: string): boolean => {
    return enabledFeatures.includes(featureCode);
  }, [enabledFeatures]);

  const canAccessFeature = useCallback((featureCode: string): boolean => {
    if (!user || !availableFeatures) {
      return false;
    }

    // Check if user has the feature enabled
    if (!hasFeature(featureCode)) {
      return false;
    }

    // Check if user has required authorities for the feature
    const featureDetail = availableFeatures.features.find(f => f.code === featureCode);
    if (!featureDetail) {
      return false;
    }

    // Admin authorities have universal access
    const adminAuthorities = ["SUPER_ADMIN", "ADMIN"];
    if (user.authorities?.some(auth => adminAuthorities.includes(auth))) {
      return true;
    }

    // Check if user has any of the required authorities
    return featureDetail.requiredAuthorities.some(reqAuth => 
      user.authorities?.includes(reqAuth)
    );
  }, [user, availableFeatures, hasFeature]);

  const getFeature = useCallback((featureCode: string): FeatureDetail | undefined => {
    return availableFeatures?.features.find(f => f.code === featureCode);
  }, [availableFeatures]);

  const getFeatureSummary = useCallback((featureCode: string): FeatureSummary | undefined => {
    return userFeatures?.features.find(f => f.code === featureCode);
  }, [userFeatures]);

  // Feature management methods (admin only)
  const enableFeature = useCallback(async (userId: number, featureCode: string): Promise<boolean> => {
    try {
      await userManagementApi.enableUserFeature(userId, featureCode);
      notificationService.success(`Feature ${featureCode} enabled successfully`);
      
      // Refresh features if it's the current user
      if (user && userId === user.userId) {
        await fetchUserFeatures();
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to enable feature";
      notificationService.error(errorMessage);
      return false;
    }
  }, [user, fetchUserFeatures]);

  const disableFeature = useCallback(async (userId: number, featureCode: string): Promise<boolean> => {
    try {
      await userManagementApi.disableUserFeature(userId, featureCode);
      notificationService.success(`Feature ${featureCode} disabled successfully`);
      
      // Refresh features if it's the current user
      if (user && userId === user.userId) {
        await fetchUserFeatures();
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to disable feature";
      notificationService.error(errorMessage);
      return false;
    }
  }, [user, fetchUserFeatures]);

  const bulkUpdateFeatures = useCallback(async (
    userId: number, 
    enableFeatures: string[], 
    disableFeatures: string[]
  ): Promise<boolean> => {
    try {
      await userManagementApi.bulkUpdateUserFeatures(userId, {
        enableFeatures,
        disableFeatures,
      });
      
      notificationService.success(
        `Updated ${enableFeatures.length + disableFeatures.length} features successfully`
      );
      
      // Refresh features if it's the current user
      if (user && userId === user.userId) {
        await fetchUserFeatures();
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update features";
      notificationService.error(errorMessage);
      return false;
    }
  }, [user, fetchUserFeatures]);

  const value: FeatureContextValue = {
    userFeatures,
    availableFeatures,
    enabledFeatures,
    loading,
    error,
    hasFeature,
    canAccessFeature,
    getFeature,
    getFeatureSummary,
    refetchFeatures,
    refetchAvailableFeatures,
    enableFeature,
    disableFeature,
    bulkUpdateFeatures,
  };

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
};

/**
 * Hook to access feature context
 * Must be used within a FeatureProvider
 */
export const useFeatureContext = (): FeatureContextValue => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error("useFeatureContext must be used within a FeatureProvider");
  }
  return context;
};

/**
 * Hook for lightweight feature checks (optimized for frequent use)
 * Returns only the essential feature checking functions
 */
export const useEnabledFeatures = () => {
  const { hasFeature, canAccessFeature, enabledFeatures, loading, error } = useFeatureContext();
  
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
  } = useFeatureContext();
  
  return {
    enableFeature,
    disableFeature,
    bulkUpdateFeatures,
    availableFeatures,
    refetchAvailableFeatures,
  };
};