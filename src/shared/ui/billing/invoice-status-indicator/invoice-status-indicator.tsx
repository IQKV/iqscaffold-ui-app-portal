import React from "react";
import { Badge, Tooltip, Group, Text, ThemeIcon } from "@mantine/core";
import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconX,
  IconFileText,
  IconCreditCardOff,
} from "@tabler/icons-react";
import { BillingDateUtils } from "@/shared/lib/billing-utils";
import type { Invoice, InvoiceStatus } from "@/shared/types/billing";
import classes from "./invoice-status-indicator.module.css";

export interface InvoiceStatusIndicatorProps {
  invoice: Invoice;
  showDetails?: boolean;
  showAmount?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "filled" | "light" | "outline" | "dot";
  iconOnly?: boolean;
}

const STATUS_CONFIG: Record<
  InvoiceStatus,
  {
    color: string;
    icon: React.ReactNode;
    label: string;
    description: string;
  }
> = {
  [InvoiceStatus.DRAFT]: {
    color: "gray",
    icon: <IconFileText size={12} />,
    label: "Draft",
    description: "Invoice is being prepared",
  },
  [InvoiceStatus.OPEN]: {
    color: "blue",
    icon: <IconClock size={12} />,
    label: "Open",
    description: "Invoice sent and awaiting payment",
  },
  [InvoiceStatus.PAID]: {
    color: "green",
    icon: <IconCheck size={12} />,
    label: "Paid",
    description: "Invoice has been paid in full",
  },
  [InvoiceStatus.VOID]: {
    color: "red",
    icon: <IconX size={12} />,
    label: "Void",
    description: "Invoice has been voided",
  },
  [InvoiceStatus.UNCOLLECTIBLE]: {
    color: "red",
    icon: <IconCreditCardOff size={12} />,
    label: "Uncollectible",
    description: "Invoice marked as uncollectible",
  },
};

export const InvoiceStatusIndicator: React.FC<InvoiceStatusIndicatorProps> = ({
  invoice,
  showDetails = false,
  showAmount = false,
  size = "sm",
  variant = "filled",
  iconOnly = false,
}) => {
  const config = STATUS_CONFIG[invoice.status];

  const isOverdue = () => {
    return (
      invoice.status === InvoiceStatus.OPEN &&
      new Date(invoice.dueDate) < new Date()
    );
  };

  const getDaysOverdue = () => {
    if (!isOverdue()) return 0;
    return Math.abs(
      BillingDateUtils.getDaysRemaining(new Date(invoice.dueDate))
    );
  };

  const getStatusDetails = () => {
    const details: string[] = [];

    if (invoice.status === InvoiceStatus.PAID && invoice.paidAt) {
      const paidDate = BillingDateUtils.formatBillingDate(
        new Date(invoice.paidAt)
      );
      details.push(`Paid on ${paidDate}`);
    }

    if (invoice.status === InvoiceStatus.OPEN) {
      const dueDate = BillingDateUtils.formatBillingDate(
        new Date(invoice.dueDate)
      );
      if (isOverdue()) {
        const daysOverdue = getDaysOverdue();
        details.push(`${daysOverdue} days overdue (due ${dueDate})`);
      } else {
        details.push(`Due ${dueDate}`);
      }
    }

    if (invoice.paymentAttempts.length > 0) {
      const failedAttempts = invoice.paymentAttempts.filter(
        (attempt) => attempt.status === "failed"
      ).length;
      if (failedAttempts > 0) {
        details.push(
          `${failedAttempts} failed payment attempt${failedAttempts > 1 ? "s" : ""}`
        );
      }
    }

    return details;
  };

  const statusDetails = getStatusDetails();
  const overdueStatus = isOverdue();

  // Override color for overdue invoices
  const displayColor = overdueStatus ? "red" : config.color;
  const displayIcon = overdueStatus ? (
    <IconAlertTriangle size={12} />
  ) : (
    config.icon
  );
  const displayLabel = overdueStatus ? "Overdue" : config.label;

  if (iconOnly) {
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
        <ThemeIcon
          color={displayColor}
          variant={variant}
          size={size}
          className={classes.iconIndicator}
        >
          {displayIcon}
        </ThemeIcon>
      </Tooltip>
    );
  }

  const badge = (
    <Badge
      color={displayColor}
      variant={variant}
      size={size}
      leftSection={displayIcon}
      className={classes.statusBadge}
    >
      {displayLabel}
    </Badge>
  );

  if (!showDetails && !showAmount && statusDetails.length === 0) {
    return (
      <Tooltip label={config.description} withArrow>
        {badge}
      </Tooltip>
    );
  }

  const tooltipContent =
    statusDetails.length > 0 ? (
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
    ) : (
      config.description
    );

  return (
    <Tooltip label={tooltipContent} withArrow multiline w={250}>
      <Group gap="xs" className={classes.statusGroup}>
        {badge}

        {showAmount && (
          <Text size="sm" fw={500} c={displayColor}>
            ${invoice.amount.toFixed(2)}
          </Text>
        )}

        {showDetails && statusDetails.length > 0 && (
          <Text size="xs" c="dimmed" className={classes.statusDetail}>
            {statusDetails[0]}
          </Text>
        )}

        {overdueStatus && (
          <Badge color="red" size="xs" variant="dot">
            {getDaysOverdue()}d overdue
          </Badge>
        )}
      </Group>
    </Tooltip>
  );
};
