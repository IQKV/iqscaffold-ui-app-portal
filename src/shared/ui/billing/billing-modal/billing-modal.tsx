import React from "react";
import {
  Modal,
  Stack,
  Group,
  Button,
  Text,
  Alert,
  Divider,
  ScrollArea,
  CloseButton,
} from "@mantine/core";
import { IconInfoCircle, IconAlertTriangle } from "@tabler/icons-react";
import classes from "./billing-modal.module.css";

export interface BillingModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;

  // Action buttons
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    color?: string;
    variant?: "filled" | "light" | "outline" | "subtle";
  };

  secondaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: "filled" | "light" | "outline" | "subtle";
  };

  // Modal configuration
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  centered?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  withCloseButton?: boolean;

  // Content configuration
  scrollable?: boolean;
  maxHeight?: number | string;

  // Alert/Warning
  alert?: {
    type: "info" | "warning" | "error" | "success";
    message: string;
    title?: string;
  };

  // Loading state
  loading?: boolean;

  // Custom footer
  footer?: React.ReactNode;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  opened,
  onClose,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  size = "md",
  centered = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  withCloseButton = true,
  scrollable = true,
  maxHeight = "80vh",
  alert,
  loading = false,
  footer,
}) => {
  const getAlertIcon = () => {
    switch (alert?.type) {
      case "warning":
      case "error":
        return <IconAlertTriangle size={16} />;
      case "info":
      case "success":
      default:
        return <IconInfoCircle size={16} />;
    }
  };

  const getAlertColor = () => {
    switch (alert?.type) {
      case "warning":
        return "orange";
      case "error":
        return "red";
      case "success":
        return "green";
      case "info":
      default:
        return "blue";
    }
  };

  const modalContent = (
    <Stack gap="md" className={classes.modalContent}>
      {/* Alert */}
      {alert && (
        <Alert
          color={getAlertColor()}
          icon={getAlertIcon()}
          title={alert.title}
        >
          {alert.message}
        </Alert>
      )}

      {/* Description */}
      {description && (
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      )}

      {/* Main Content */}
      <div className={classes.contentArea}>{children}</div>
    </Stack>
  );

  const renderFooter = () => {
    if (footer) {
      return (
        <>
          <Divider />
          <div className={classes.customFooter}>{footer}</div>
        </>
      );
    }

    if (!primaryAction && !secondaryAction) {
      return null;
    }

    return (
      <>
        <Divider />
        <Group justify="flex-end" className={classes.modalFooter}>
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || "light"}
              onClick={secondaryAction.onClick}
              loading={secondaryAction.loading}
              disabled={secondaryAction.disabled || loading}
            >
              {secondaryAction.label}
            </Button>
          )}

          {primaryAction && (
            <Button
              color={primaryAction.color}
              variant={primaryAction.variant || "filled"}
              onClick={primaryAction.onClick}
              loading={primaryAction.loading || loading}
              disabled={primaryAction.disabled}
            >
              {primaryAction.label}
            </Button>
          )}
        </Group>
      </>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" w="100%">
          <Text fw={600} size="lg">
            {title}
          </Text>
          {withCloseButton && <CloseButton onClick={onClose} />}
        </Group>
      }
      size={size}
      centered={centered}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      withCloseButton={false} // We handle this manually in the title
      className={classes.billingModal}
      styles={{
        content: {
          maxHeight: scrollable ? maxHeight : undefined,
        },
      }}
    >
      <Stack gap="md" className={classes.modalStack}>
        {scrollable ? (
          <ScrollArea.Autosize mah={`calc(${maxHeight} - 120px)`}>
            {modalContent}
          </ScrollArea.Autosize>
        ) : (
          modalContent
        )}

        {renderFooter()}
      </Stack>
    </Modal>
  );
};
