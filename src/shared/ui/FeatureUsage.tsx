import React from "react";
import { Progress, Text, Stack, Group, Badge, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useFeatures } from "@/shared/lib/hooks/useFeatures";

interface FeatureUsageProps {
  /** Feature code to display usage for */
  featureCode: string;
  /** Whether to show the feature name */
  showName?: boolean;
  /** Whether to show detailed usage text */
  showDetails?: boolean;
  /** Custom label for the usage display */
  label?: string;
  /** Size of the progress bar */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * Component for displaying feature usage information with progress bars.
 *
 * Shows:
 * - Current usage vs limit
 * - Progress bar with color coding
 * - Remaining quota
 * - Usage percentage
 *
 * @example
 * ```tsx
 * // Basic usage display
 * <FeatureUsage featureCode="api_calls" />
 *
 * // With custom label and details
 * <FeatureUsage
 *   featureCode="storage_gb"
 *   label="Storage Usage"
 *   showDetails={true}
 * />
 * ```
 */
export const FeatureUsage: React.FC<FeatureUsageProps> = ({
  featureCode,
  showName = true,
  showDetails = true,
  label,
  size = "sm",
}) => {
  const { getFeature, getUsageInfo, loading, error } = useFeatures();

  const feature = getFeature(featureCode);
  const usageInfo = getUsageInfo(featureCode);

  // Don't render if loading, error, feature not found, or no usage limit
  if (loading || error || !feature || !usageInfo) {
    return null;
  }

  // Determine progress bar color based on usage percentage
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) {
      return "red";
    }
    if (percentage >= 75) {
      return "orange";
    }
    if (percentage >= 50) {
      return "yellow";
    }
    return "blue";
  };

  const progressColor = getProgressColor(usageInfo.percentage);
  const displayLabel = label || feature.name || featureCode;

  return (
    <Stack gap="xs">
      {showName && (
        <Group gap="xs">
          <Text size="sm" fw={500}>
            {displayLabel}
          </Text>

          {feature.description && (
            <Tooltip label={feature.description} multiline w={200}>
              <IconInfoCircle size="1rem" style={{ opacity: 0.6 }} />
            </Tooltip>
          )}

          {usageInfo && usageInfo.percentage !== undefined && (
            <Badge size="xs" variant="light" color={progressColor || "blue"}>
              {Math.round(usageInfo.percentage)}%
            </Badge>
          )}
        </Group>
      )}

      {usageInfo && usageInfo.percentage !== undefined && (
        <Progress
          value={usageInfo.percentage}
          color={progressColor || "blue"}
          size={size}
          radius="sm"
        />
      )}

      {showDetails && usageInfo && (
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {(usageInfo.current || 0).toLocaleString()} /{" "}
            {(usageInfo.limit || 0).toLocaleString()} used
          </Text>
          <Text size="xs" c="dimmed">
            {(usageInfo.remaining || 0).toLocaleString()} remaining
          </Text>
        </Group>
      )}
    </Stack>
  );
};

/**
 * Compact version of FeatureUsage for dashboard widgets and cards.
 */
export const CompactFeatureUsage: React.FC<
  Omit<FeatureUsageProps, "showName" | "showDetails">
> = (props) => (
  <FeatureUsage {...props} showName={false} showDetails={false} size="xs" />
);

/**
 * Component for displaying multiple feature usages in a grid or list.
 */
interface FeatureUsageListProps {
  /** Array of feature codes to display */
  featureCodes: string[];
  /** Whether to show as a compact list */
  compact?: boolean;
}

export const FeatureUsageList: React.FC<FeatureUsageListProps> = ({
  featureCodes,
  compact = false,
}) => {
  const { getFeature, getUsageInfo, loading, error } = useFeatures();

  // Show loading state
  if (loading) {
    return (
      <Text size="sm" c="dimmed">
        Loading feature usage...
      </Text>
    );
  }

  // Show error state
  if (error) {
    return (
      <Text size="sm" c="red">
        Unable to load feature usage information
      </Text>
    );
  }

  // Filter to only features with usage limits
  const usageFeatures = featureCodes.filter((code) => {
    const feature = getFeature(code);
    const usage = getUsageInfo(code);
    return feature && usage;
  });

  if (usageFeatures.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No usage-based features available
      </Text>
    );
  }

  return (
    <Stack gap={compact ? "xs" : "md"}>
      {usageFeatures.map((featureCode) =>
        compact ? (
          <CompactFeatureUsage key={featureCode} featureCode={featureCode} />
        ) : (
          <FeatureUsage key={featureCode} featureCode={featureCode} />
        )
      )}
    </Stack>
  );
};
