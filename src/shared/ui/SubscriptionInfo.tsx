import React from "react";
import { Card, Text, Badge, Group, Stack, Alert, Button } from "@mantine/core";
import {
  IconCrown,
  IconAlertTriangle,
  IconCalendar,
} from "@tabler/icons-react";
import { useFeatureContext } from "@/shared/lib/contexts/FeatureContext";

interface SubscriptionInfoProps {
  /** Whether to show as a compact card */
  compact?: boolean;
  /** Whether to show upgrade button for trial users */
  showUpgradeButton?: boolean;
  /** Callback when upgrade button is clicked */
  onUpgrade?: () => void;
}

/**
 * Component for displaying subscription and plan information.
 *
 * Shows:
 * - Current plan name
 * - Subscription status
 * - Trial period information
 * - Expiration dates
 * - Upgrade prompts for trial users
 */
export const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({
  compact = false,
  showUpgradeButton = true,
  onUpgrade,
}) => {
  const {
    userFeatures,
    loading,
  } = useFeatureContext();

  // Mock subscription data for now - this should be replaced with actual subscription context
  const planName = "Basic Plan";
  const subscriptionStatus: "active" | "past_due" | "canceled" | "trial" = "active";
  const isTrialPeriod = false;
  const trialExpiresAt = null;

  if (loading || !userFeatures) {
    return null;
  }

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "green";
      case "trialing":
        return "blue";
      case "past_due":
        return "orange";
      case "canceled":
        return "red";
      case "unpaid":
        return "red";
      case "paused":
        return "gray";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <IconCrown size="1rem" />;
      case "trialing":
        return <IconCalendar size="1rem" />;
      default:
        return null;
    }
  };

  const formatExpirationDate = (dateString: string | null) => {
    if (!dateString) {
      return null;
    }

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return `expired ${Math.abs(diffDays)} days ago`;
      }
      if (diffDays === 0) {
        return "expires today";
      }
      if (diffDays === 1) {
        return "expires tomorrow";
      }
      if (diffDays < 30) {
        return `expires in ${diffDays} days`;
      }
      return `expires ${date.toLocaleDateString()}`;
    } catch {
      return null;
    }
  };

  const trialExpiration = formatExpirationDate(trialExpiresAt || null);
  const subscriptionExpiration = formatExpirationDate(null);

  if (compact) {
    return (
      <Group gap="xs">
        <Badge
          color={getStatusColor(subscriptionStatus)}
          leftSection={getStatusIcon(subscriptionStatus)}
          variant="light"
        >
          {planName}
        </Badge>

        {isTrialPeriod && trialExpiration && (
          <Text size="xs" c="dimmed">
            Trial {trialExpiration}
          </Text>
        )}
      </Group>
    );
  }

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={600}>
            Subscription Plan
          </Text>

          <Badge
            color={getStatusColor(subscriptionStatus)}
            leftSection={getStatusIcon(subscriptionStatus)}
            size="lg"
          >
            {subscriptionStatus}
          </Badge>
        </Group>

        <Group gap="md">
          <div>
            <Text size="sm" c="dimmed">
              Plan
            </Text>
            <Text fw={500}>{planName}</Text>
          </div>

          {subscriptionExpiration && (
            <div>
              <Text size="sm" c="dimmed">
                Expires
              </Text>
              <Text fw={500}>{subscriptionExpiration}</Text>
            </div>
          )}
        </Group>

        {isTrialPeriod && (
          <Alert
            icon={<IconAlertTriangle size="1rem" />}
            title="Trial Period"
            color="blue"
            variant="light"
          >
            <Stack gap="sm">
              <Text size="sm">
                {trialExpiration ? (
                  <>Your trial period {trialExpiration}.</>
                ) : (
                  <>You are currently in a trial period.</>
                )}
              </Text>

              {showUpgradeButton && onUpgrade && (
                <Button size="sm" onClick={onUpgrade}>
                  Upgrade Now
                </Button>
              )}
            </Stack>
          </Alert>
        )}
        {/* Subscription alerts removed - using mock data */}
      </Stack>
    </Card>
  );
};

/**
 * Minimal subscription status indicator for headers and navigation.
 */
export const SubscriptionStatusBadge: React.FC = () => {
  // Mock subscription data for now - this should be replaced with actual subscription context
  const planName = "Basic Plan";
  const subscriptionStatus: "active" | "past_due" | "canceled" | "trial" = "active";
  const isTrialPeriod = false;

  if (!planName) {
    return null;
  }

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "green";
      case "trialing":
        return "blue";
      case "past_due":
        return "orange";
      case "canceled":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Badge color={getStatusColor(subscriptionStatus)} variant="light" size="sm">
      {isTrialPeriod ? "Trial" : planName}
    </Badge>
  );
};
