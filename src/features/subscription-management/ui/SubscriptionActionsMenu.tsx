import { ActionIcon, Menu, Text } from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconPlayerPause,
  IconPlayerPlay,
  IconX,
  IconTrash,
} from "@tabler/icons-react";
import { t } from "@lingui/macro";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import {
  Subscription,
  useCancelSubscription,
  useCancelSubscriptionImmediately,
  usePauseSubscription,
  useResumeSubscription,
} from "@/entities/billing";

interface SubscriptionActionsMenuProps {
  subscription: Subscription;
  onUpdate?: () => void;
}

export function SubscriptionActionsMenu({
  subscription,
  onUpdate,
}: SubscriptionActionsMenuProps) {
  const cancelSubscription = useCancelSubscription();
  const cancelImmediately = useCancelSubscriptionImmediately();
  const pauseSubscription = usePauseSubscription();
  const resumeSubscription = useResumeSubscription();

  const handleCancel = () => {
    modals.openConfirmModal({
      title: t`Cancel Subscription`,
      children: (
        <Text size="sm">
          {t`Are you sure you want to cancel your subscription? It will remain active until the end of your current billing period.`}
        </Text>
      ),
      labels: { confirm: t`Cancel Subscription`, cancel: t`Keep Subscription` },
      confirmProps: { color: "red" },
      onConfirm: () => {
        cancelSubscription.mutate(subscription.id, {
          onSuccess: () => {
            notifications.show({
              title: t`Subscription Canceled`,
              message: t`Your subscription has been canceled and will end at the current period.`,
              color: "orange",
            });
            onUpdate?.();
          },
          onError: () => {
            notifications.show({
              title: t`Error`,
              message: t`Failed to cancel subscription. Please try again.`,
              color: "red",
            });
          },
        });
      },
    });
  };

  const handleCancelImmediately = () => {
    modals.openConfirmModal({
      title: t`Cancel Subscription Immediately`,
      children: (
        <Text size="sm">
          {t`Are you sure you want to cancel your subscription immediately? This action cannot be undone and you will lose access right away.`}
        </Text>
      ),
      labels: { confirm: t`Cancel Now`, cancel: t`Keep Subscription` },
      confirmProps: { color: "red" },
      onConfirm: () => {
        cancelImmediately.mutate(subscription.id, {
          onSuccess: () => {
            notifications.show({
              title: t`Subscription Canceled`,
              message: t`Your subscription has been canceled immediately.`,
              color: "red",
            });
            onUpdate?.();
          },
          onError: () => {
            notifications.show({
              title: t`Error`,
              message: t`Failed to cancel subscription. Please try again.`,
              color: "red",
            });
          },
        });
      },
    });
  };

  const handlePause = () => {
    pauseSubscription.mutate(subscription.id, {
      onSuccess: () => {
        notifications.show({
          title: t`Subscription Paused`,
          message: t`Your subscription has been paused.`,
          color: "blue",
        });
        onUpdate?.();
      },
      onError: () => {
        notifications.show({
          title: t`Error`,
          message: t`Failed to pause subscription. Please try again.`,
          color: "red",
        });
      },
    });
  };

  const handleResume = () => {
    resumeSubscription.mutate(subscription.id, {
      onSuccess: () => {
        notifications.show({
          title: t`Subscription Resumed`,
          message: t`Your subscription has been resumed.`,
          color: "green",
        });
        onUpdate?.();
      },
      onError: () => {
        notifications.show({
          title: t`Error`,
          message: t`Failed to resume subscription. Please try again.`,
          color: "red",
        });
      },
    });
  };

  const canPause = subscription.status === "active";
  const canResume = subscription.status === "paused";
  const canCancel = ["active", "trialing", "past_due"].includes(
    subscription.status
  );

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray">
          <IconDots size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t`Subscription Actions`}</Menu.Label>

        {canPause && (
          <Menu.Item
            leftSection={<IconPlayerPause size={14} />}
            onClick={handlePause}
            disabled={pauseSubscription.isPending}
          >
            {t`Pause Subscription`}
          </Menu.Item>
        )}

        {canResume && (
          <Menu.Item
            leftSection={<IconPlayerPlay size={14} />}
            onClick={handleResume}
            disabled={resumeSubscription.isPending}
          >
            {t`Resume Subscription`}
          </Menu.Item>
        )}

        {canCancel && (
          <>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconX size={14} />}
              onClick={handleCancel}
              disabled={cancelSubscription.isPending}
            >
              {t`Cancel at Period End`}
            </Menu.Item>
            <Menu.Item
              leftSection={<IconTrash size={14} />}
              color="red"
              onClick={handleCancelImmediately}
              disabled={cancelImmediately.isPending}
            >
              {t`Cancel Immediately`}
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
