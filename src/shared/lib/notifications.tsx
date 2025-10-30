import React from "react";
import { notifications, NotificationData } from "@mantine/notifications";
import { Text, Code, Stack, Group, Badge, Anchor } from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconInfoCircle,
  IconClock,
  IconWifi,
  IconShield,
  IconExclamationMark,
  IconRefresh,
  IconBug,
} from "@tabler/icons-react";
import type { AppError, AppErrorType } from "./http-error";

interface NotificationOptions {
  title?: string;
  message: string;
  autoClose?: number | false;
  withCloseButton?: boolean;
  loading?: boolean;
}

interface ProblemDetailNotificationOptions extends NotificationOptions {
  referenceId?: string;
  problemType?: string;
  errorType?: AppErrorType;
  retryAction?: () => void;
  showTechnicalDetails?: boolean;
}

interface EnhancedNotificationOptions extends NotificationOptions {
  color?: string;
  icon?: React.ReactNode;
  position?:
    | "top-left"
    | "top-right"
    | "top-center"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";
}

export const notificationService = {
  success: ({
    title = "Success",
    message,
    autoClose = 4000,
  }: NotificationOptions) => {
    notifications.show({
      title,
      message,
      color: "green",
      icon: <IconCheck size="1rem" />,
      autoClose,
    });
  },

  error: ({
    title = "Error",
    message,
    autoClose = 6000,
  }: NotificationOptions) => {
    notifications.show({
      title,
      message,
      color: "red",
      icon: <IconX size="1rem" />,
      autoClose,
    });
  },

  warning: ({
    title = "Warning",
    message,
    autoClose = 5000,
  }: NotificationOptions) => {
    notifications.show({
      title,
      message,
      color: "yellow",
      icon: <IconAlertTriangle size="1rem" />,
      autoClose,
    });
  },

  info: ({
    title = "Info",
    message,
    autoClose = 4000,
  }: NotificationOptions) => {
    notifications.show({
      title,
      message,
      color: "blue",
      icon: <IconInfoCircle size="1rem" />,
      autoClose,
    });
  },

  loading: ({
    title = "Loading",
    message,
  }: Omit<NotificationOptions, "autoClose">) => {
    return notifications.show({
      id: "loading",
      title,
      message,
      loading: true,
      autoClose: false,
      withCloseButton: false,
    });
  },

  updateLoading: (
    id: string,
    {
      title,
      message,
      type = "success",
    }: NotificationOptions & { type?: "success" | "error" }
  ) => {
    const config = {
      success: { color: "green", icon: <IconCheck size="1rem" /> },
      error: { color: "red", icon: <IconX size="1rem" /> },
    };

    notifications.update({
      id,
      title,
      message,
      loading: false,
      autoClose: 4000,
      ...config[type],
    });
  },

  hide: (id: string) => {
    notifications.hide(id);
  },

  clean: () => {
    notifications.clean();
  },

  /**
   * Show error notification with Problem Details formatting and Mantine best practices
   */
  problemError: ({
    title = "Error",
    message,
    referenceId,
    problemType,
    errorType,
    retryAction,
    showTechnicalDetails = false,
    autoClose = 8000,
    withCloseButton = true,
  }: ProblemDetailNotificationOptions) => {
    const icon = getErrorIcon(errorType);
    const color = getErrorColor(errorType);
    const severity = getErrorSeverity(errorType);

    // Create enhanced message with Mantine components
    const enhancedMessage = (
      <Stack gap="xs">
        <Text size="sm">{message}</Text>

        {referenceId && (
          <Group gap="xs" align="center">
            <Text size="xs" c="dimmed">
              Reference ID:
            </Text>
            <Code c="blue">{referenceId}</Code>
          </Group>
        )}

        {errorType && (
          <Badge size="xs" variant="light" color={color} leftSection={icon}>
            {getErrorTypeLabel(errorType)}
          </Badge>
        )}

        {retryAction &&
          (errorType === "network" || errorType === "timeout") && (
            <Anchor
              size="xs"
              onClick={retryAction}
              style={{ cursor: "pointer" }}
            >
              <Group gap={4}>
                <IconRefresh size={12} />
                Try again
              </Group>
            </Anchor>
          )}

        {showTechnicalDetails && problemType && (
          <Text size="xs" c="dimmed" fs="italic">
            Problem type: {problemType}
          </Text>
        )}
      </Stack>
    );

    const notificationId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    notifications.show({
      id: notificationId,
      title: (
        <Group gap="xs" align="center">
          <Text fw={500}>{title}</Text>
          {severity === "critical" && (
            <Badge size="xs" color="red" variant="filled">
              Critical
            </Badge>
          )}
        </Group>
      ),
      message: enhancedMessage,
      color,
      icon,
      autoClose: severity === "critical" ? false : autoClose,
      withCloseButton,
      styles: {
        root: {
          borderLeft: `4px solid var(--mantine-color-${color}-6)`,
        },
        title: {
          marginBottom: 8,
        },
        description: {
          marginTop: 0,
        },
      },
    });

    return notificationId;
  },

  /**
   * Show notification from AppError with enhanced Mantine integration
   */
  fromAppError: (
    error: AppError,
    options: Partial<ProblemDetailNotificationOptions> = {}
  ) => {
    return notificationService.problemError({
      title: options.title || error.title || "Error",
      message: options.message || error.detail || error.message,
      referenceId: error.requestId,
      problemType: error.type,
      errorType: error.errorType,
      retryAction: options.retryAction,
      showTechnicalDetails: options.showTechnicalDetails,
      autoClose: options.autoClose,
      withCloseButton: options.withCloseButton,
    });
  },

  /**
   * Show loading notification with proper Mantine styling
   */
  showLoading: (options: {
    id?: string;
    title?: string;
    message: string;
    withCloseButton?: boolean;
  }) => {
    const id = options.id || `loading-${Date.now()}`;

    notifications.show({
      id,
      title: options.title,
      message: options.message,
      loading: true,
      autoClose: false,
      withCloseButton: options.withCloseButton ?? false,
      styles: {
        root: {
          borderLeft: "4px solid var(--mantine-color-blue-6)",
        },
      },
    });

    return id;
  },

  /**
   * Update loading notification to success or error
   */
  updateLoadingNotification: (
    id: string,
    options: {
      title?: string;
      message: string;
      type: "success" | "error";
      autoClose?: number | false;
    }
  ) => {
    const config = {
      success: {
        color: "green",
        icon: <IconCheck size="1rem" />,
        borderColor: "var(--mantine-color-green-6)",
      },
      error: {
        color: "red",
        icon: <IconX size="1rem" />,
        borderColor: "var(--mantine-color-red-6)",
      },
    };

    notifications.update({
      id,
      title: options.title,
      message: options.message,
      loading: false,
      autoClose: options.autoClose ?? 4000,
      ...config[options.type],
      styles: {
        root: {
          borderLeft: `4px solid ${config[options.type].borderColor}`,
        },
      },
    });
  },

  /**
   * Show validation error notification with field details
   */
  validationError: (options: {
    title?: string;
    message?: string;
    fieldErrors: Record<string, string[]>;
    autoClose?: number | false;
  }) => {
    const fieldCount = Object.keys(options.fieldErrors).length;
    const errorCount = Object.values(options.fieldErrors).flat().length;

    const message = (
      <Stack gap="xs">
        <Text size="sm">
          {options.message ||
            `Please correct ${errorCount} validation error${errorCount > 1 ? "s" : ""} in ${fieldCount} field${fieldCount > 1 ? "s" : ""}.`}
        </Text>

        <Stack gap={4}>
          {Object.entries(options.fieldErrors).map(([field, errors]) => (
            <Group key={field} gap="xs" align="flex-start">
              <Text size="xs" fw={500} c="red" style={{ minWidth: 60 }}>
                {field}:
              </Text>
              <Stack gap={2}>
                {errors.map((error, index) => (
                  <Text key={index} size="xs" c="dimmed">
                    {error}
                  </Text>
                ))}
              </Stack>
            </Group>
          ))}
        </Stack>
      </Stack>
    );

    return notifications.show({
      title: options.title || "Validation Error",
      message,
      color: "yellow",
      icon: <IconExclamationMark size="1rem" />,
      autoClose: options.autoClose ?? 8000,
      styles: {
        root: {
          borderLeft: "4px solid var(--mantine-color-yellow-6)",
        },
      },
    });
  },
};

/**
 * Get appropriate icon for error type following Mantine design principles
 */
function getErrorIcon(errorType?: AppErrorType): React.ReactNode {
  switch (errorType) {
    case "network":
      return <IconWifi size="1rem" />;
    case "timeout":
      return <IconClock size="1rem" />;
    case "auth":
      return <IconShield size="1rem" />;
    case "validation":
      return <IconExclamationMark size="1rem" />;
    case "rate-limit":
      return <IconAlertTriangle size="1rem" />;
    case "server":
      return <IconBug size="1rem" />;
    case "canceled":
      return <IconX size="1rem" />;
    default:
      return <IconX size="1rem" />;
  }
}

/**
 * Get appropriate Mantine color for error type
 */
function getErrorColor(errorType?: AppErrorType): string {
  switch (errorType) {
    case "network":
    case "timeout":
      return "orange";
    case "auth":
      return "grape";
    case "validation":
      return "yellow";
    case "rate-limit":
      return "indigo";
    case "server":
      return "red";
    case "client":
      return "pink";
    case "canceled":
      return "gray";
    default:
      return "red";
  }
}

/**
 * Get error severity level for notification behavior
 */
function getErrorSeverity(
  errorType?: AppErrorType
): "low" | "medium" | "high" | "critical" {
  switch (errorType) {
    case "server":
      return "critical";
    case "auth":
    case "network":
      return "high";
    case "validation":
    case "rate-limit":
      return "medium";
    case "timeout":
    case "client":
    case "canceled":
      return "low";
    default:
      return "medium";
  }
}

/**
 * Get user-friendly error type label
 */
function getErrorTypeLabel(errorType: AppErrorType): string {
  switch (errorType) {
    case "network":
      return "Network Issue";
    case "timeout":
      return "Timeout";
    case "auth":
      return "Authentication";
    case "validation":
      return "Validation";
    case "rate-limit":
      return "Rate Limited";
    case "server":
      return "Server Error";
    case "client":
      return "Client Error";
    case "canceled":
      return "Canceled";
    default:
      return "Unknown Error";
  }
}
