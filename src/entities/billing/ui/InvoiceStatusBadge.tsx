import { Badge, BadgeProps } from "@mantine/core";
import { InvoiceStatus } from "../lib/types";

interface InvoiceStatusBadgeProps extends Omit<BadgeProps, "color" | "children"> {
  status: InvoiceStatus;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: "gray", label: "Draft" },
  DRAFT: { color: "gray", label: "Draft" },
  open: { color: "orange", label: "Open" },
  OPEN: { color: "orange", label: "Open" },
  paid: { color: "green", label: "Paid" },
  PAID: { color: "green", label: "Paid" },
  uncollectible: { color: "red", label: "Uncollectible" },
  UNCOLLECTIBLE: { color: "red", label: "Uncollectible" },
  void: { color: "gray", label: "Void" },
  VOID: { color: "gray", label: "Void" },
};

export function InvoiceStatusBadge({ status, ...props }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];

  // Handle unknown status values gracefully
  if (!config) {
    console.warn(`Unknown invoice status: ${status}`);
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
