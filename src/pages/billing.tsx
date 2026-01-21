import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Stack,
  Title,
  Grid,
  Alert,
  Button,
  Group,
  Tabs,
  Card,
  Text,
} from "@mantine/core";
import {
  IconSettings,
  IconCreditCard,
  IconReceipt,
  IconPlus,
  IconStar,
} from "@tabler/icons-react";
import { AuthGuard, useAuth } from "@/processes/auth";
import { BillingAccessGuard } from "@/shared/ui/guards/BillingAccessGuard";
import { BillingServiceDegradationBanner } from "@/shared/ui/BillingServiceDegradationBanner";
import { BillingHistoryTable } from "@/widgets/billing-history";
import { MerchantStatusCard } from "@/widgets/merchant-status-card";
import { organizationApi } from "@/shared/api/organization-api";
import { t } from "@lingui/macro";
import { useQuery } from "@tanstack/react-query";
import { canManageGatewayConfig } from "@/processes/auth/lib/billing-permissions";
import { useActiveSubscription } from "@/entities/billing";
import { SubscriptionCard } from "@/features/subscription-management";
import { InvoicesTable } from "@/features/invoice-management";
import {
  SubscriptionInfo,
  FeatureUsageList,
  FeatureErrorBoundary,
} from "@/shared/ui";
import { useFeatureContext } from "@/shared/lib";

export const Route = createFileRoute("/billing")({
  component: BillingPage,
});

function BillingPage() {
  const {
    hasBillingAccess,
    hasReadOnlyBillingAccess,
    canManageMerchants,
    user,
  } = useAuth();

  const { userFeatures, enabledFeatures } = useFeatureContext();

  const { data: orgsData } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => organizationApi.getAllOrganizations({ page: 0, size: 100 }),
    enabled: hasBillingAccess(),
  });

  const { data: activeSubscription } = useActiveSubscription();

  const organizations =
    orgsData?.content.map((org) => ({ id: org.id, name: org.name })) || [];

  return (
    <AuthGuard>
      <BillingAccessGuard>
        <FeatureErrorBoundary>
          <Container size="xl" py="xl" data-testid="page-billing">
            <Stack gap="xl">
              {/* Service Status Banner */}
              <BillingServiceDegradationBanner />

              <Group justify="space-between">
                <Title order={2}>{t`Billing & Payments`}</Title>
                <Group gap="sm">
                  <Button
                    component={Link}
                    to="/subscriptions"
                    leftSection={<IconCreditCard size={18} />}
                    variant="light"
                  >
                    {t`Manage Subscriptions`}
                  </Button>
                  {canManageGatewayConfig(user) && (
                    <Button
                      component={Link}
                      to="/gateway-config"
                      leftSection={<IconSettings size={18} />}
                      variant="light"
                    >
                      {t`Gateway Configuration`}
                    </Button>
                  )}
                </Group>
              </Group>

              {hasReadOnlyBillingAccess() && (
                <Alert color="blue">
                  {t`You have read-only access to billing information.`}
                </Alert>
              )}

            <Tabs defaultValue="overview" variant="outline">
              <Tabs.List>
                <Tabs.Tab
                  value="overview"
                  leftSection={<IconCreditCard size={16} />}
                >
                  {t`Overview`}
                </Tabs.Tab>
                <Tabs.Tab value="features" leftSection={<IconStar size={16} />}>
                  {t`Features & Usage`}
                </Tabs.Tab>
                <Tabs.Tab
                  value="payments"
                  leftSection={<IconReceipt size={16} />}
                >
                  {t`Payment History`}
                </Tabs.Tab>
                <Tabs.Tab
                  value="invoices"
                  leftSection={<IconReceipt size={16} />}
                >
                  {t`Invoices`}
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="overview" pt="md">
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    {activeSubscription ? (
                      <Stack gap="md">
                        <Text fw={600} size="lg">
                          {t`Current Subscription`}
                        </Text>
                        <SubscriptionCard subscription={activeSubscription} />
                      </Stack>
                    ) : (
                      <Card withBorder p="xl">
                        <Stack gap="md" align="center">
                          <Text fw={600} size="lg">
                            {t`No Active Subscription`}
                          </Text>
                          <Text ta="center" c="dimmed">
                            {t`Get started with a subscription plan to unlock premium features.`}
                          </Text>
                          <Button
                            component={Link}
                            to="/subscriptions"
                            leftSection={<IconPlus size={16} />}
                          >
                            {t`View Plans`}
                          </Button>
                        </Stack>
                      </Card>
                    )}
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    {canManageMerchants() && organizations.length > 0 && (
                      <MerchantStatusCard organizations={organizations} />
                    )}
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>

              <Tabs.Panel value="features" pt="md">
                <Grid>
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="md">
                      <Card withBorder p="md">
                        <Title order={3} mb="md">{t`Feature Usage`}</Title>
                        <FeatureUsageList
                          featureCodes={[
                            "api_calls",
                            "storage_gb",
                            "monthly_reports",
                            "team_members",
                            "lead_imports",
                            "email_campaigns",
                          ]}
                        />
                      </Card>

                      <Card withBorder p="md">
                        <Title order={3} mb="md">{t`Enabled Features`}</Title>
                        {enabledFeatures.length > 0 ? (
                          <Grid>
                            {enabledFeatures.map((feature) => (
                              <Grid.Col
                                key={feature}
                                span={{ base: 12, sm: 6, md: 4 }}
                              >
                                <Text size="sm">
                                  •{" "}
                                  {feature
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Text>
                              </Grid.Col>
                            ))}
                          </Grid>
                        ) : (
                          <Text size="sm" c="dimmed">
                            {t`No features enabled`}
                          </Text>
                        )}
                      </Card>
                    </Stack>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <SubscriptionInfo
                      showUpgradeButton
                      onUpgrade={() => {
                        // Navigate to subscription plans or open upgrade modal
                        window.location.href = "/subscriptions";
                      }}
                    />
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>

              <Tabs.Panel value="payments" pt="md">
                <BillingHistoryTable />
              </Tabs.Panel>

              <Tabs.Panel value="invoices" pt="md">
                <InvoicesTable />
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Container>
      </FeatureErrorBoundary>
    </BillingAccessGuard>
  </AuthGuard>
);
}
