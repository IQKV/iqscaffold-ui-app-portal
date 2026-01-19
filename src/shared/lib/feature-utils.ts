/**
 * Utility functions for feature management
 */

/**
 * Hook that returns only the hasFeature function for performance-critical components.
 *
 * Optimized for components that only need to check feature enablement without
 * triggering re-renders when other feature data changes.
 */
export { useHasFeature } from "./contexts/FeatureContext";
