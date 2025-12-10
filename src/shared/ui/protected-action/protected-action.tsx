/**
 * Protected Action Components
 * UI components that are protected by authority checks
 */

import React, { type ReactNode } from "react";
import { Button, type ButtonProps } from "@mantine/core";
import { useAuthorizedActions } from "@/shared/lib/use-authority";
import { SecurityContext } from "@/shared/types/authority";

interface ProtectedActionButtonProps extends Omit<ButtonProps, "onClick"> {
  action: string;
  resource: string;
  onClick: () => void;
  children: ReactNode;
  context?: Partial<SecurityContext>;
}

/**
 * Protected Action Button
 * Button that only renders if user has permission for the action
 */
export function ProtectedActionButton({
  action,
  resource,
  onClick,
  children,
  context,
  ...buttonProps
}: ProtectedActionButtonProps) {
  const actions = useAuthorizedActions(resource, context);

  // Map action names to permission checks
  const canPerformAction = () => {
    switch (action) {
      case "create":
        return actions.canCreate;
      case "read":
        return actions.canRead;
      case "update":
        return actions.canUpdate;
      case "delete":
        return actions.canDelete;
      case "export":
        return actions.canExport;
      case "approve":
        return actions.canApprove;
      case "cancel":
        return actions.canCancel;
      case "upgrade":
        return actions.canUpgrade;
      case "downgrade":
        return actions.canDowngrade;
      case "refund":
        return actions.canRefund;
      case "suspend":
        return actions.canSuspend;
      case "reactivate":
        return actions.canReactivate;
      default:
        return false;
    }
  };

  if (!canPerformAction()) {
    return null;
  }

  return (
    <Button onClick={onClick} {...buttonProps}>
      {children}
    </Button>
  );
}

/**
 * Action Group Component
 * Container for multiple protected actions
 */
interface ActionGroupProps {
  children: ReactNode;
  className?: string;
}

export function ActionGroup({ children, className }: ActionGroupProps) {
  return <div className={`flex gap-2 ${className || ""}`}>{children}</div>;
}

/**
 * Subscription Action Buttons
 * Pre-configured action buttons for subscription operations
 */
interface SubscriptionActionsProps {
  subscriptionId: string;
  onUpgrade: () => void;
  onDowngrade: () => void;
  onCancel: () => void;
  onSuspend: () => void;
  onReactivate: () => void;
}

export function SubscriptionActions({
  subscriptionId,
  onUpgrade,
  onDowngrade,
  onCancel,
  onSuspend,
  onReactivate,
}: SubscriptionActionsProps) {
  return (
    <ActionGroup>
      <ProtectedActionButton
        action="upgrade"
        resource="subscription"
        onClick={onUpgrade}
        variant="filled"
        color="blue"
      >
        Upgrade Plan
      </ProtectedActionButton>

      <ProtectedActionButton
        action="downgrade"
        resource="subscription"
        onClick={onDowngrade}
        variant="light"
        color="blue"
      >
        Downgrade Plan
      </ProtectedActionButton>

      <ProtectedActionButton
        action="cancel"
        resource="subscription"
        onClick={onCancel}
        variant="light"
        color="red"
      >
        Cancel Subscription
      </ProtectedActionButton>

      <ProtectedActionButton
        action="suspend"
        resource="subscription"
        onClick={onSuspend}
        variant="light"
        color="orange"
      >
        Suspend
      </ProtectedActionButton>

      <ProtectedActionButton
        action="reactivate"
        resource="subscription"
        onClick={onReactivate}
        variant="light"
        color="green"
      >
        Reactivate
      </ProtectedActionButton>
    </ActionGroup>
  );
}

/**
 * Payment Method Action Buttons
 * Pre-configured action buttons for payment method operations
 */
interface PaymentMethodActionsProps {
  paymentMethodId: string;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

export function PaymentMethodActions({
  paymentMethodId,
  onEdit,
  onDelete,
  onSetDefault,
}: PaymentMethodActionsProps) {
  return (
    <ActionGroup>
      <ProtectedActionButton
        action="update"
        resource="payment_method"
        onClick={onEdit}
        variant="light"
        size="sm"
      >
        Edit
      </ProtectedActionButton>

      <ProtectedActionButton
        action="update"
        resource="payment_method"
        onClick={onSetDefault}
        variant="light"
        size="sm"
      >
        Set as Default
      </ProtectedActionButton>

      <ProtectedActionButton
        action="delete"
        resource="payment_method"
        onClick={onDelete}
        variant="light"
        color="red"
        size="sm"
      >
        Delete
      </ProtectedActionButton>
    </ActionGroup>
  );
}

/**
 * Invoice Action Buttons
 * Pre-configured action buttons for invoice operations
 */
interface InvoiceActionsProps {
  invoiceId: string;
  onDownload: () => void;
  onRetryPayment: () => void;
  onRefund: () => void;
}

export function InvoiceActions({
  invoiceId,
  onDownload,
  onRetryPayment,
  onRefund,
}: InvoiceActionsProps) {
  return (
    <ActionGroup>
      <ProtectedActionButton
        action="read"
        resource="invoice"
        onClick={onDownload}
        variant="light"
        size="sm"
      >
        Download PDF
      </ProtectedActionButton>

      <ProtectedActionButton
        action="retry_payment"
        resource="invoice"
        onClick={onRetryPayment}
        variant="light"
        color="blue"
        size="sm"
      >
        Retry Payment
      </ProtectedActionButton>

      <ProtectedActionButton
        action="refund"
        resource="invoice"
        onClick={onRefund}
        variant="light"
        color="red"
        size="sm"
      >
        Process Refund
      </ProtectedActionButton>
    </ActionGroup>
  );
}
