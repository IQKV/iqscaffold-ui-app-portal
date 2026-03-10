import { Card, Text, Group, Stack, Badge, Button, ActionIcon, Menu, Alert } from "@mantine/core";
import { IconDots, IconCalendar, IconCreditCard } from "@tabler/icons-react";
import { t } from "@lingui/macro";
import { Subscription, SubscriptionStatusBadge } from "@/entities/billing";
import { SubscriptionActionsMenu } from "./SubscriptionActionsMenu";
import { formatCurrency } from "@/shared/lib/format";

interface SubscriptionCardProps {
  subscription: Subscription;
  onUpdate?: () => void;
}

export function SubscriptionCard({ subscription, onUpdate }: SubscriptionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isTrialing = subscription.status === "trialing";
  const isCanceled = subscription.status === "canceled";
  const isPastDue = subscription.status === "past_due";

  return (
    <Card withBorder shadow="sm" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Stack gap={4}>
            <Text fw={600} size="lg">
              {subscription.planName}
            </Text>
            <SubscriptionStatusBadge status={subscription.status} />
          </Stack>
          <SubscriptionActionsMenu subscription={subscription} onUpdate={onUpdate} />
        </Group>

        {isPastDue && (
          <Alert color="orange" title={t`Payment Past Due`}>
            {t`Your subscription payment is overdue. Please update your payment method.`}
          </Alert>
        )}

        {isCanceled && subscription.cancelAtPeriodEnd && (
          <Alert color="red" title={t`Subscription Ending`}>
            {(() => {
              const endDate = formatDate(subscription.currentPeriodEnd);
              return t`Your subscription will end on ${endDate}.`;
            })()}
          </Alert>
        )}

        <Stack gap="xs">
          <Group>
            <IconCalendar size={16} />
            <Text size="sm" c="dimmed">
              {isTrialing && subscription.trialEnd
                ? (() => {
                    const trialEndDate = formatDate(subscription.trialEnd);
                    return t`Trial ends: ${trialEndDate}`;
                  })()
                : (() => {
                    const periodStart = formatDate(subscription.currentPeriodStart);
                    const periodEnd = formatDate(subscription.currentPeriodEnd);
                    return t`Current period: ${periodStart} - ${periodEnd}`;
                  })()}
            </Text>
          </Group>

          {subscription.stripeCustomerId && (
            <Group>
              <IconCreditCard size={16} />
              <Text size="sm" c="dimmed">
                {(() => {
                  const customerId = subscription.stripeCustomerId;
                  return t`Customer ID: ${customerId}`;
                })()}
              </Text>
            </Group>
          )}
        </Stack>

        {subscription.status === "active" && !subscription.cancelAtPeriodEnd && (
          <Text size="sm" c="green">
            {t`Your subscription is active and will renew automatically.`}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
