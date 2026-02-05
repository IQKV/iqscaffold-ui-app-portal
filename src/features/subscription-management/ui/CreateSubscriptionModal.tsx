import { useState } from "react";
import {
  Modal,
  Stack,
  Text,
  Button,
  Group,
  NumberInput,
  Textarea,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { t } from "@lingui/macro";
import { notifications } from "@mantine/notifications";
import {
  SubscriptionPlan,
  useCreateSubscriptionMutation,
} from "@/entities/billing";
import { CreateSubscriptionRequest } from "@/shared/api/billing/types";
import { formatCurrency } from "@/shared/lib/format";

interface CreateSubscriptionModalProps {
  opened: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  onSuccess?: () => void;
}

export function CreateSubscriptionModal({
  opened,
  onClose,
  plan,
  onSuccess,
}: CreateSubscriptionModalProps) {
  const createSubscription = useCreateSubscriptionMutation();

  const form = useForm<{
    trialDays?: number;
    notes?: string;
  }>({
    initialValues: {
      trialDays: plan.trialDays || undefined,
      notes: "",
    },
    validate: {
      trialDays: (value) =>
        value !== undefined && value < 0
          ? t`Trial days must be positive`
          : null,
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const request: CreateSubscriptionRequest = {
      planId: plan.id,
      trialDays: values.trialDays,
      metadata: values.notes ? { notes: values.notes } : undefined,
    };

    createSubscription.mutate(request, {
      onSuccess: () => {
        notifications.show({
          title: t`Subscription Created`,
          message: (() => {
            const planName = plan.name;
            return t`Your subscription to ${planName} has been created successfully.`;
          })(),
          color: "green",
        });
        onSuccess?.();
        onClose();
        form.reset();
      },
      onError: (error: any) => {
        notifications.show({
          title: t`Error`,
          message:
            error.message ||
            t`Failed to create subscription. Please try again.`,
          color: "red",
        });
      },
    });
  };

  const formatInterval = (interval: string, count: number) => {
    if (count === 1) {
      return interval === "month" ? t`monthly` : t`yearly`;
    }
    return interval === "month"
      ? t`every ${count} months`
      : t`every ${count} years`;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t`Create Subscription`}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Alert color="blue" title={t`Selected Plan`}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={600}>{plan.name}</Text>
                <Text fw={600}>
                  {formatCurrency(plan.priceAmount / 100, plan.currency)} /{" "}
                  {formatInterval(plan.interval, plan.intervalCount)}
                </Text>
              </Group>
              {plan.description && (
                <Text size="sm" c="dimmed">
                  {plan.description}
                </Text>
              )}
            </Stack>
          </Alert>

          <NumberInput
            label={t`Trial Days`}
            description={t`Override the default trial period for this subscription`}
            placeholder={plan.trialDays?.toString() || "0"}
            min={0}
            max={365}
            {...form.getInputProps("trialDays")}
          />

          <Textarea
            label={t`Notes`}
            description={t`Optional notes about this subscription`}
            placeholder={t`Add any notes about this subscription...`}
            rows={3}
            {...form.getInputProps("notes")}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={onClose}>
              {t`Cancel`}
            </Button>
            <Button type="submit" loading={createSubscription.isPending}>
              {t`Create Subscription`}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
