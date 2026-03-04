import { Badge, BadgeProps } from "@mantine/core";
import { SubscriptionStatus } from "../lib/types";

interface SubscriptionStatusBadgeProps extends Omit<
  BadgeProps,
  "color" | "children"
> {
  status: SubscriptionStatus;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: "green", label: "Active" },
  ACTIVE: { color: "green", label: "Active" },
  trialing: { color: "blue", label: "Trial" },
  TRIALING: { color: "blue", label: "Trial" },
  past_due: { color: "orange", label: "Past Due" },
  PAST_DUE: { color: "orange", label: "Past Due" },
  canceled: { color: "red", label: "Canceled" },
  CANCELED: { color: "red", label: "Canceled" },
  unpaid: { color: "red", label: "Unpaid" },
  UNPAID: { color: "red", label: "Unpaid" },
  paused: { color: "gray", label: "Paused" },
  PAUSED: { color: "gray", label: "Paused" },
};

export function SubscriptionStatusBadge({
  status,
  ...props
}: SubscriptionStatusBadgeProps) {
  const config = statusConfig[status];

  // Handle unknown status values gracefully
  if (!config) {
    console.warn(`Unknown subscription status: ${status}`);
    return (
      <Badge color="gray" variant="light" {...props}>
        {status || "Unknown"}
      </Badge>
    );
  }

  return (
    <Badge color={config.color} variant="light" {...props}>
      {config.label}
    </Badge>
  );
}
