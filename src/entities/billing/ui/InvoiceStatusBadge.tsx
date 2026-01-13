import { Badge, BadgeProps } from "@mantine/core";
import { InvoiceStatus } from "../model/types";

interface InvoiceStatusBadgeProps extends Omit<
  BadgeProps,
  "color" | "children"
> {
  status: InvoiceStatus;
}

const statusConfig: Record<InvoiceStatus, { color: string; label: string }> = {
  draft: { color: "gray", label: "Draft" },
  open: { color: "orange", label: "Open" },
  paid: { color: "green", label: "Paid" },
  uncollectible: { color: "red", label: "Uncollectible" },
  void: { color: "gray", label: "Void" },
};

export function InvoiceStatusBadge({
  status,
  ...props
}: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge color={config.color} variant="light" {...props}>
      {config.label}
    </Badge>
  );
}
