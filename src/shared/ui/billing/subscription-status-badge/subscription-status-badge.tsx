import React from "react";
import { Badge, Tooltip, Group, Text } from "@mantine/core";
import {
  IconCheck,
  IconClock,
  IconExclamationTriangle,
  IconX,
  IconCreditCardOff,
} from "@tabler/icons-react";
import {
  SubscriptionUtils,
  BillingDateUtils,
} from "@/shared/lib/billing-utils";
import type { Subscription, SubscriptionStatus } from "@/shared/types/billing";
import classes from "./subscription-status-badge.module.css";

export interface SubscriptionStatusBadgeProps {
  subscription: Subscription;
  showDetails?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "filled" | "light" | "outline" | "dot";
}

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  {
    color: string;
    icon: React.ReactNode;
    label: string;
    description: string;
  }
> = {
  [SubscriptionStatus.ACTIVE]: {
    color: "green",
    icon: <IconCheck size={12} />,
    label: "Active",
    description: "Subscription is active and billing normally",
  },
  [SubscriptionStatus.TRIALING]: {
    color: "blue",
    icon: <IconClock size={12} />,
    label: "Trial",
    description: "Currently in trial period",
  },
  [SubscriptionStatus.PAST_DUE]: {
    color: "orange",
    icon: <IconExclamationTriangle size={12} />,
    label: "Past Due",
    description: "Payment is overdue but service is still active",
  },
  [SubscriptionStatus.CANCELED]: {
    color: "red",
    icon: <IconX size={12} />,
    label: "Canceled",
    description: "Subscription has been canceled",
  },
  [SubscriptionStatus.UNPAID]: {
    color: "red",
    icon: <IconCreditCardOff size={12} />,
    label: "Unpaid",
    description: "Payment failed and service may be suspended",
  },
};

export const SubscriptionStatusBadge: React.FC<
  SubscriptionStatusBadgeProps
> = ({
  subscription,
  showDetails = false,
  size = "sm",
  variant = "filled",
}) => {
  const config = STATUS_CONFIG[subscription.status];

  const getStatusDetails = () => {
    const details: string[] = [];

    if (SubscriptionUtils.isInTrial(subscription)) {
      const daysRemaining =
        SubscriptionUtils.getTrialDaysRemaining(subscription);
      details.push(`${daysRemaining} days left in trial`);
    }

    if (subscription.cancelAtPeriodEnd) {
      const endDate = BillingDateUtils.formatBillingDate(
        subscription.currentPeriodEnd
      );
      details.push(`Cancels on ${endDate}`);
    }

    if (subscription.status === SubscriptionStatus.PAST_DUE) {
      const daysOverdue = Math.abs(
        BillingDateUtils.getDaysRemaining(subscription.currentPeriodEnd)
      );
      details.push(`${daysOverdue} days overdue`);
    }

    return details;
  };

  const statusDetails = getStatusDetails();
  const hasDetails = statusDetails.length > 0;

  const badge = (
    <Badge
      color={config.color}
      variant={variant}
      size={size}
      leftSection={config.icon}
      className={classes.statusBadge}
    >
      {config.label}
    </Badge>
  );

  if (!showDetails && !hasDetails) {
    return (
      <Tooltip label={config.description} withArrow>
        {badge}
      </Tooltip>
    );
  }

  if (showDetails || hasDetails) {
    const tooltipContent = (
      <div>
        <Text size="sm" fw={500} mb="xs">
          {config.description}
        </Text>
        {statusDetails.map((detail, index) => (
          <Text key={index} size="xs" c="dimmed">
            • {detail}
          </Text>
        ))}
      </div>
    );

    return (
      <Tooltip label={tooltipContent} withArrow multiline w={250}>
        <Group gap="xs" className={classes.statusGroup}>
          {badge}
          {showDetails && statusDetails.length > 0 && (
            <Text size="xs" c="dimmed">
              {statusDetails[0]}
            </Text>
          )}
        </Group>
      </Tooltip>
    );
  }

  return badge;
};
