import React from "react";
import { Stack, Card, Title, Text, Button, Grid, Alert } from "@mantine/core";
import { IconStar, IconLock } from "@tabler/icons-react";
import {
  FeatureGate,
  FeatureUsage,
  SubscriptionInfo,
  FeatureErrorBoundary,
} from "@/shared/ui";
import { useFeatureContext, useEnabledFeatures } from "@/shared/lib";

/**
 * Comprehensive examples of how to use the feature infrastructure.
 *
 * This component demonstrates all the different ways to implement
 * feature-based functionality in your React components.
 */
export const FeatureExamples: React.FC = () => {
  const { hasFeature } = useFeatureContext();
  const { enabledFeatures } = useEnabledFeatures();

  return (
    <FeatureErrorBoundary>
      <Stack gap="xl">
        <Title order={2}>Feature Infrastructure Examples</Title>

        {/* Basic Feature Gate */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            Basic Feature Gate
          </Title>
          <FeatureGate feature="advanced_analytics">
            <Alert color="green" icon={<IconStar size="1rem" />}>
              🎉 You have access to Advanced Analytics!
            </Alert>
          </FeatureGate>
        </Card>

        {/* Feature Gate with Fallback */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            Feature Gate with Fallback
          </Title>
          <FeatureGate
            feature="pipeline_management"
            fallback={
              <Alert color="blue" icon={<IconLock size="1rem" />}>
                <Stack gap="sm">
                  <Text>
                    Pipeline Management is available in higher tier plans.
                  </Text>
                  <Button size="sm" variant="light">
                    Upgrade to unlock this feature
                  </Button>
                </Stack>
              </Alert>
            }
          >
            <Alert color="green" icon={<IconStar size="1rem" />}>
              🎉 Pipeline Management is enabled!
            </Alert>
          </FeatureGate>
        </Card>

        {/* Usage Quota Examples */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            Feature Usage Tracking
          </Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <FeatureUsage featureCode="api_calls" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <FeatureUsage featureCode="storage_gb" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <FeatureUsage featureCode="team_members" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <FeatureUsage featureCode="monthly_reports" />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Programmatic Feature Checks */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            Programmatic Feature Checks
          </Title>
          <Stack gap="sm">
            <Text>
              <strong>Current Plan:</strong> Basic Plan
            </Text>
            <Text>
              <strong>Has Advanced Analytics:</strong>{" "}
              {hasFeature("advanced_analytics") ? "✅ Yes" : "❌ No"}
            </Text>
            <Text>
              <strong>Has Pipeline Management:</strong>{" "}
              {hasFeature("pipeline_management") ? "✅ Yes" : "❌ No"}
            </Text>
            <Text>
              <strong>API Calls Usage:</strong> Unlimited
            </Text>
          </Stack>
        </Card>

        {/* Enabled Features List */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            All Enabled Features
          </Title>
          <Grid>
            {enabledFeatures.map((feature) => (
              <Grid.Col key={feature} span={{ base: 12, sm: 6, md: 4 }}>
                <Text size="sm">
                  ✅{" "}
                  {feature
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Text>
              </Grid.Col>
            ))}
          </Grid>
        </Card>

        {/* Subscription Information */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            Subscription Information
          </Title>
          <SubscriptionInfo
            showUpgradeButton
            onUpgrade={() => {
              console.log("Redirect to subscription upgrade page");
            }}
          />
        </Card>

        {/* Conditional Rendering Examples */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            Conditional Rendering Patterns
          </Title>
          <Stack gap="md">
            {/* Simple conditional */}
            {hasFeature("reporting") && (
              <Alert color="blue">
                📊 Reporting feature is available - you can generate reports!
              </Alert>
            )}

            {/* Complex conditional with usage check */}
            {/* API usage alerts removed - no usage tracking in current implementation */}

            {/* Feature-dependent button */}
            <Button
              disabled={!hasFeature("advanced_analytics")}
              leftSection={
                hasFeature("advanced_analytics") ? (
                  <IconStar size="1rem" />
                ) : (
                  <IconLock size="1rem" />
                )
              }
            >
              {hasFeature("advanced_analytics")
                ? "Open Analytics Dashboard"
                : "Analytics (Upgrade Required)"}
            </Button>
          </Stack>
        </Card>
      </Stack>
    </FeatureErrorBoundary>
  );
};

/**
 * Example of a feature-aware navigation component
 */
export const FeatureAwareNavigation: React.FC = () => {
  return (
    <Stack gap="xs">
      {/* Always visible items */}
      <Button variant="subtle" fullWidth justify="start">
        Dashboard
      </Button>

      {/* Feature-gated items */}
      <FeatureGate feature="crm_access" showLoading={false}>
        <Button variant="subtle" fullWidth justify="start">
          CRM Dashboard
        </Button>

        <FeatureGate feature="lead_management" showLoading={false}>
          <Button variant="subtle" fullWidth justify="start" pl="xl">
            Lead Management
          </Button>
        </FeatureGate>

        <FeatureGate feature="contact_management" showLoading={false}>
          <Button variant="subtle" fullWidth justify="start" pl="xl">
            Contact Management
          </Button>
        </FeatureGate>

        <FeatureGate feature="pipeline_management" showLoading={false}>
          <Button variant="subtle" fullWidth justify="start" pl="xl">
            Sales Pipeline
          </Button>
        </FeatureGate>
      </FeatureGate>

      <FeatureGate feature="reporting" showLoading={false}>
        <Button variant="subtle" fullWidth justify="start">
          Reports
        </Button>
      </FeatureGate>
    </Stack>
  );
};

/**
 * Example of a feature-aware dashboard widget
 */
export const FeatureDashboardWidget: React.FC = () => {
  const { hasFeature } = useFeatureContext();

  return (
    <Card withBorder p="md">
      <Title order={4} mb="md">
        Quick Stats
      </Title>

      <Stack gap="sm">
        {hasFeature("api_calls") && (
          <div>
            <Text size="sm" c="dimmed">
              API Calls This Month
            </Text>
            <FeatureUsage featureCode="api_calls" showName={false} />
          </div>
        )}

        {hasFeature("storage_gb") && (
          <div>
            <Text size="sm" c="dimmed">
              Storage Used
            </Text>
            <FeatureUsage featureCode="storage_gb" showName={false} />
          </div>
        )}

        {hasFeature("team_members") && (
          <div>
            <Text size="sm" c="dimmed">
              Team Members
            </Text>
            <FeatureUsage featureCode="team_members" showName={false} />
          </div>
        )}

        {!hasFeature("api_calls") &&
          !hasFeature("storage_gb") &&
          !hasFeature("team_members") && (
            <Text size="sm" c="dimmed" ta="center">
              No usage tracking available in your current plan
            </Text>
          )}
      </Stack>
    </Card>
  );
};
