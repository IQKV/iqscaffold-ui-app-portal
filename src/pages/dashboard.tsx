import { createFileRoute } from "@tanstack/react-router";
import { Title, Paper, Text, Grid, Stack } from "@mantine/core";
import { AuthGuard } from "@/processes/auth";
import { FeatureGate, SubscriptionInfo, FeatureUsageList, FeatureErrorBoundary } from "@/shared/ui";
import { useFeatureContext, usePageTitle } from "@/shared/lib";
import { t } from "@lingui/core/macro";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { enabledFeatures } = useFeatureContext();
  const pageTitle = usePageTitle(t`Dashboard`);

  return (
    <AuthGuard>
      {pageTitle}
      <FeatureErrorBoundary>
        <Stack gap="lg" data-testid="page-dashboard">
          <Paper p="lg" withBorder>
            <Title order={2} data-testid="dashboard-title">
              {t`Dashboard`}
            </Title>
            <Text c="dimmed" data-testid="dashboard-description">
              {t`Welcome to your dashboard. Here's what you have access to:`}
            </Text>
          </Paper>

          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                {/* Feature-gated content examples */}
                <FeatureGate
                  feature="advanced_analytics"
                  fallback={
                    <Paper p="md" withBorder style={{ opacity: 0.6 }}>
                      <Text size="sm" c="dimmed">
                        {t`Advanced Analytics - Upgrade to Pro to unlock this feature`}
                      </Text>
                    </Paper>
                  }
                >
                  <Paper p="md" withBorder>
                    <Title order={3}>{t`Advanced Analytics`}</Title>
                    <Text size="sm" c="dimmed">
                      {t`Premium analytics dashboard with detailed insights and reporting.`}
                    </Text>
                  </Paper>
                </FeatureGate>

                <FeatureGate
                  feature="lead_management"
                  fallback={
                    <Paper p="md" withBorder style={{ opacity: 0.6 }}>
                      <Text size="sm" c="dimmed">
                        {t`Lead Management - Available in Business plan`}
                      </Text>
                    </Paper>
                  }
                >
                  <Paper p="md" withBorder>
                    <Title order={3}>{t`Lead Management`}</Title>
                    <Text size="sm" c="dimmed">
                      {t`Manage your sales leads and track conversion rates.`}
                    </Text>
                  </Paper>
                </FeatureGate>

                <FeatureGate
                  feature="pipeline_management"
                  fallback={
                    <Paper p="md" withBorder style={{ opacity: 0.6 }}>
                      <Text size="sm" c="dimmed">
                        {t`Sales Pipeline - Enterprise feature`}
                      </Text>
                    </Paper>
                  }
                >
                  <Paper p="md" withBorder>
                    <Title order={3}>{t`Sales Pipeline`}</Title>
                    <Text size="sm" c="dimmed">
                      {t`Visual sales pipeline with drag-and-drop functionality.`}
                    </Text>
                  </Paper>
                </FeatureGate>

                <FeatureGate feature="reporting">
                  <Paper p="md" withBorder>
                    <Title order={3}>{t`Reports`}</Title>
                    <Text size="sm" c="dimmed">
                      {t`Generate detailed reports and export data.`}
                    </Text>
                  </Paper>
                </FeatureGate>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="md">
                {/* Subscription information */}
                <SubscriptionInfo />

                {/* Feature usage information */}
                <Paper p="md" withBorder>
                  <Title order={4} mb="md">
                    {t`Feature Usage`}
                  </Title>
                  <FeatureUsageList
                    featureCodes={["api_calls", "storage_gb", "monthly_reports", "team_members"]}
                    compact
                  />
                </Paper>

                {/* Enabled features list */}
                <Paper p="md" withBorder>
                  <Title order={4} mb="md">
                    {t`Enabled Features`}
                  </Title>
                  {enabledFeatures.length > 0 ? (
                    <Stack gap="xs">
                      {enabledFeatures.map((feature) => (
                        <Text key={feature} size="sm">
                          • {feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Text>
                      ))}
                    </Stack>
                  ) : (
                    <Text size="sm" c="dimmed">
                      {t`No features enabled`}
                    </Text>
                  )}
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </FeatureErrorBoundary>
    </AuthGuard>
  );
}
