import { Badge, MantineColor } from "@mantine/core";
import { PayoutStatus } from "../lib/types";

interface PayoutStatusBadgeProps {
  status: PayoutStatus;
}

const statusConfig: Record<
  PayoutStatus,
  { color: MantineColor; label: string }
> = {
  paid: { color: "green", label: "Paid" },
  pending: { color: "yellow", label: "Pending" },
  in_transit: { color: "blue", label: "In Transit" },
  canceled: { color: "gray", label: "Canceled" },
  failed: { color: "red", label: "Failed" },
};

export const PayoutStatusBadge = ({ status }: PayoutStatusBadgeProps) => {
  const config = statusConfig[status] || { color: "gray", label: status };

  return (
    <Badge color={config.color} variant="light">
      {config.label}
    </Badge>
  );
};
