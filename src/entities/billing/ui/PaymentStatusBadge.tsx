import { Badge, MantineColor } from "@mantine/core";
import { PaymentStatus } from "../lib/types";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

const statusConfig: Record<PaymentStatus, { color: MantineColor; label: string }> = {
  PENDING: { color: "yellow", label: "Pending" },
  SUCCEEDED: { color: "green", label: "Succeeded" },
  FAILED: { color: "red", label: "Failed" },
  REFUNDED: { color: "gray", label: "Refunded" },
  PROCESSING: { color: "blue", label: "Processing" },
  REQUIRES_PAYMENT_METHOD: { color: "orange", label: "Method Required" },
  REQUIRES_CONFIRMATION: { color: "cyan", label: "Confirmation Required" },
  REQUIRES_ACTION: { color: "grape", label: "Action Required" },
  CANCELED: { color: "dark", label: "Canceled" },
};

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const config = statusConfig[status] || { color: "gray", label: status };

  return (
    <Badge color={config.color} variant="light">
      {config.label}
    </Badge>
  );
};
