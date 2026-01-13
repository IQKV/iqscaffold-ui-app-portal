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
} from "@tabler/icons-react";
import { AuthGuard, useAuth } from "@/processes/auth";
import { BillingHistoryTable } from "@/widgets/billing-history";
import { MerchantStatusCard } from "@/widgets/merchant-status-card";
import { organizationApi } from "@/shared/api/organization-api";
import { t } from "@lingui/macro";
import { useQuery } from "@tanstack/react-query";
import { canManageGatewayConfigs } from "@/processes/auth/lib/billing-permissions";
import { useActiveSubscription } from "@/entities/billing";
import { SubscriptionCard } from "@/features/subscription-management";
import { InvoicesTable } from "@/features/invoice-management";

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

  const { data: orgsData } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => organizationApi.getAllOrganizations({ page: 0, size: 100 }),
    enabled: hasBillingAccess(),
  });

  const { data: activeSubscription } = useActiveSubscription();

  const organizations =
    orgsData?.content.map((org) => ({ id: org.id, name: org.name })) || [];

  if (!hasBillingAccess()) {
    return (
      <AuthGuard>
        <Container size="xl" py="xl" data-testid="page-billing">
          <Alert color="red" title={t`Access Denied`}>
            {t`You don't have permission to access billing information. Please contact your administrator.`}
          </Alert>
        </Container>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Container size="xl" py="xl" data-testid="page-billing">
        <Stack gap="xl">
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
              {canManageGatewayConfigs(user) && (
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

            <Tabs.Panel value="payments" pt="md">
              <BillingHistoryTable />
            </Tabs.Panel>

            <Tabs.Panel value="invoices" pt="md">
              <InvoicesTable />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    </AuthGuard>
  );
}
