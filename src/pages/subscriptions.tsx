import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
import { IconPlus, IconCreditCard, IconReceipt } from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import { AuthGuard, useAuth } from "@/processes/auth";
import { useActiveSubscriptionQuery, SubscriptionPlan } from "@/entities/billing";
import {
  SubscriptionCard,
  SubscriptionPlansGrid,
  CreateSubscriptionModal,
} from "@/features/subscription-management";
import { InvoicesTable } from "@/features/invoice-management";
import { usePageTitle } from "@/shared/lib";

export const Route = createFileRoute("/subscriptions")({
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const { hasBillingAccess } = useAuth();
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const pageTitle = usePageTitle(t`Subscriptions`);

  const { data: activeSubscription, isLoading, refetch } = useActiveSubscriptionQuery();

  if (!hasBillingAccess()) {
    return (
      <AuthGuard>
        {pageTitle}
        <Container size="xl" py="xl" data-testid="page-subscriptions">
          <Alert color="red" title={t`Access Denied`}>
            {t`You don't have permission to access subscription information. Please contact your administrator.`}
          </Alert>
        </Container>
      </AuthGuard>
    );
  }

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCreateModalOpened(true);
  };

  const handleSubscriptionUpdate = () => {
    refetch();
  };

  return (
    <AuthGuard>
      {pageTitle}
      <Container size="xl" py="xl" data-testid="page-subscriptions">
        <Stack gap="xl">
          <Group justify="space-between">
            <Title order={2}>{t`Subscriptions`}</Title>
          </Group>

          <Tabs defaultValue="current" variant="outline">
            <Tabs.List>
              <Tabs.Tab value="current" leftSection={<IconCreditCard size={16} />}>
                {t`Current Subscription`}
              </Tabs.Tab>
              <Tabs.Tab value="plans" leftSection={<IconPlus size={16} />}>
                {t`Available Plans`}
              </Tabs.Tab>
              <Tabs.Tab value="invoices" leftSection={<IconReceipt size={16} />}>
                {t`Invoices`}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="current" pt="md">
              <Stack gap="md">
                {isLoading ? (
                  <Card withBorder p="xl">
                    <Text ta="center" c="dimmed">
                      {t`Loading subscription...`}
                    </Text>
                  </Card>
                ) : activeSubscription ? (
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 8 }}>
                      <SubscriptionCard
                        subscription={activeSubscription}
                        onUpdate={handleSubscriptionUpdate}
                      />
                    </Grid.Col>
                  </Grid>
                ) : (
                  <Alert color="blue" title={t`No Active Subscription`}>
                    <Stack gap="md">
                      <Text>
                        {t`You don't have an active subscription. Browse our available plans to get started.`}
                      </Text>
                      <Button
                        variant="light"
                        onClick={() => {
                          const tabsElement = document.querySelector('[data-value="plans"]');
                          if (tabsElement) {
                            (tabsElement as HTMLElement).click();
                          }
                        }}
                      >
                        {t`View Available Plans`}
                      </Button>
                    </Stack>
                  </Alert>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="plans" pt="md">
              <Stack gap="md">
                <Text c="dimmed">
                  {t`Choose a subscription plan that fits your needs. You can upgrade or downgrade at any time.`}
                </Text>
                <SubscriptionPlansGrid
                  onSelectPlan={handlePlanSelect}
                  currentPlanId={activeSubscription?.planId}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="invoices" pt="md">
              <Stack gap="md">
                <Text c="dimmed">{t`View and download your subscription invoices.`}</Text>
                <InvoicesTable />
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>

        {selectedPlan && (
          <CreateSubscriptionModal
            opened={createModalOpened}
            onClose={() => {
              setCreateModalOpened(false);
              setSelectedPlan(null);
            }}
            plan={selectedPlan}
            onSuccess={handleSubscriptionUpdate}
          />
        )}
      </Container>
    </AuthGuard>
  );
}
