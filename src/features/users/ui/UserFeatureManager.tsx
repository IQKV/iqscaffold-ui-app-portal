import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Text,
  Switch,
  Stack,
  Group,
  Badge,
  Loader,
  Alert,
  Button,
  Divider,
  Tooltip,
} from "@mantine/core";
import { IconInfoCircle, IconRefresh } from "@tabler/icons-react";
import {
  useFeatureContext,
  useFeatureManagement,
} from "@/shared/lib/contexts/FeatureContext";
import {
  useUserFeaturesQuery,
} from "@/entities/user";
import { notificationService } from "@/shared/lib/notifications";

interface UserFeatureManagerProps {
  userId: number;
  username: string;
}

/**
 * Component for managing user features in the admin interface.
 *
 * Provides:
 * - Toggle individual features on/off
 * - View feature descriptions and dependencies
 * - Bulk feature operations
 * - Real-time feature status updates
 */
export const UserFeatureManager: React.FC<UserFeatureManagerProps> = ({
  userId,
  username,
}) => {
  const { availableFeatures } = useFeatureContext();
  const { enableFeature, disableFeature } = useFeatureManagement();

  const {
    data: userFeatures,
    isLoading: loading,
    error: queryError,
    refetch: fetchUserFeatures,
  } = useUserFeaturesQuery(userId);

  const [updating, setUpdating] = useState<string | null>(null);

  const error = queryError ? (queryError as Error).message : null;

  const handleFeatureToggle = async (featureCode: string, enabled: boolean) => {
    setUpdating(featureCode);

    try {
      const success = enabled
        ? await enableFeature(userId, featureCode)
        : await disableFeature(userId, featureCode);

      if (success) {
        // Refresh user features to get updated state
        await fetchUserFeatures();
      }
    } finally {
      setUpdating(null);
    }
  };

  const isFeatureEnabled = (featureCode: string): boolean => {
    return userFeatures?.features.some((f) => f.code === featureCode) || false;
  };

  const getFeatureDependencies = (featureCode: string): string[] => {
    const feature = availableFeatures?.features.find(
      (f) => f.code === featureCode
    );
    return feature?.dependencies || [];
  };

  const hasUnmetDependencies = (featureCode: string): boolean => {
    const dependencies = getFeatureDependencies(featureCode);
    return dependencies.some((dep) => !isFeatureEnabled(dep));
  };

  if (loading) {
    return (
      <Card withBorder>
        <Group justify="center" p="md">
          <Loader size="sm" />
          <Text size="sm">Loading user features...</Text>
        </Group>
      </Card>
    );
  }

  if (error) {
    return (
      <Card withBorder>
        <Alert color="red" icon={<IconInfoCircle size="1rem" />}>
          <Group justify="space-between">
            <Text size="sm">{error}</Text>
            <Button size="xs" variant="light" onClick={() => fetchUserFeatures()}>
              <IconRefresh size="0.8rem" />
            </Button>
          </Group>
        </Alert>
      </Card>
    );
  }

  if (!availableFeatures || availableFeatures.features.length === 0) {
    return (
      <Card withBorder>
        <Text size="sm" c="dimmed" ta="center" p="md">
          No features available to manage
        </Text>
      </Card>
    );
  }

  const composableFeatures = availableFeatures.features.filter(
    (f) => f.composable
  );

  return (
    <Card withBorder>
      <Group justify="space-between" mb="md">
        <div>
          <Text fw={500}>Feature Access</Text>
          <Text size="sm" c="dimmed">
            Manage {username}'s access to platform features
          </Text>
        </div>
        <Group gap="xs">
          <Badge variant="light" color="blue">
            {userFeatures?.featureCount || 0} enabled
          </Badge>
          <Button
            size="xs"
            variant="light"
            onClick={() => fetchUserFeatures()}
            loading={loading}
          >
            <IconRefresh size="0.8rem" />
          </Button>
        </Group>
      </Group>

      <Divider mb="md" />

      <Stack gap="sm">
        {composableFeatures.map((feature) => {
          const enabled = isFeatureEnabled(feature.code);
          const isUpdating = updating === feature.code;
          const dependencies = getFeatureDependencies(feature.code);
          const hasUnmet = hasUnmetDependencies(feature.code);

          return (
            <Card key={feature.code} withBorder p="sm">
              <Group justify="space-between" align="flex-start">
                <div style={{ flex: 1 }}>
                  <Group gap="xs" mb="xs">
                    <Text fw={500} size="sm">
                      {feature.displayName}
                    </Text>
                    <Badge
                      size="xs"
                      variant="light"
                      color={enabled ? "green" : "gray"}
                    >
                      {enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </Group>

                  <Text size="xs" c="dimmed" mb="xs">
                    {feature.description}
                  </Text>

                  {dependencies.length > 0 && (
                    <Group gap="xs" mb="xs">
                      <Text size="xs" c="dimmed">
                        Dependencies:
                      </Text>
                      {dependencies.map((dep) => (
                        <Badge
                          key={dep}
                          size="xs"
                          variant="outline"
                          color={isFeatureEnabled(dep) ? "green" : "red"}
                        >
                          {dep}
                        </Badge>
                      ))}
                    </Group>
                  )}

                  {feature.requiredAuthorities.length > 0 && (
                    <Group gap="xs">
                      <Text size="xs" c="dimmed">
                        Authorities:
                      </Text>
                      {feature.requiredAuthorities.map((auth) => (
                        <Badge key={auth} size="xs" variant="dot">
                          {auth}
                        </Badge>
                      ))}
                    </Group>
                  )}
                </div>

                <Tooltip
                  label={
                    hasUnmet && !enabled
                      ? "Cannot enable: missing dependencies"
                      : enabled
                        ? "Disable this feature"
                        : "Enable this feature"
                  }
                >
                  <Switch
                    checked={enabled}
                    onChange={(event) =>
                      handleFeatureToggle(
                        feature.code,
                        event.currentTarget.checked
                      )
                    }
                    disabled={isUpdating || (hasUnmet && !enabled)}
                    size="sm"
                  />
                </Tooltip>
              </Group>
            </Card>
          );
        })}
      </Stack>

      {composableFeatures.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" p="md">
          No composable features available
        </Text>
      )}
    </Card>
  );
};
