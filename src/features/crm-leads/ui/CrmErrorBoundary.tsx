import React from "react";
import {
  Container,
  Text,
  Button,
  Stack,
  Alert,
  Group,
  Paper,
  Badge,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconRefresh,
  IconHome,
  IconDatabase,
} from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import {
  ErrorBoundary,
  type ErrorBoundaryProps,
} from "@/shared/ui/error-boundary";
import { errorFromAxios, formatErrorForDisplay } from "@/shared/lib/http-error";
import { notificationService } from "@/shared/lib/notifications";

/**
 * CRM-specific error fallback component
 *
 * Provides business-focused error messages and recovery options
 * for CRM-related errors
 *
 * Requirements: Error handling and user experience
 */
interface CrmErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function CrmErrorFallback({ error, resetError }: CrmErrorFallbackProps) {
  const appError = errorFromAxios(error);
  const displayError = formatErrorForDisplay(appError);

  // Determine if this is a CRM-specific business error
  const isCrmBusinessError =
    displayError.message?.toLowerCase().includes("lead") ||
    displayError.message?.toLowerCase().includes("follow-up") ||
    displayError.message?.toLowerCase().includes("pipeline") ||
    displayError.message?.toLowerCase().includes("crm");

  const handleGoToDashboard = () => {
    window.location.href = "/crm/dashboard";
  };

  const handleGoToLeads = () => {
    window.location.href = "/crm/leads";
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  // Business-focused error messages
  const getBusinessErrorMessage = () => {
    if (appError.errorType === "network") {
      return t`Unable to connect to CRM services. Please check your internet connection and try again.`;
    }

    if (appError.errorType === "server") {
      return t`The CRM service is temporarily unavailable. Our team has been notified and is working on a fix.`;
    }

    if (appError.errorType === "validation") {
      return t`There was a problem with the data you submitted. Please check your input and try again.`;
    }

    if (appError.errorType === "auth") {
      return t`You don't have permission to access this CRM feature. Please contact your administrator.`;
    }

    if (isCrmBusinessError) {
      return (
        displayError.message ||
        t`An error occurred while processing your CRM request.`
      );
    }

    return t`Something went wrong with the CRM system. Please try again or contact support if the problem persists.`;
  };

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="lg">
        <Alert
          icon={<IconAlertTriangle size="1.5rem" />}
          title={t`CRM Error`}
          color="red"
          variant="light"
          style={{ width: "100%" }}
        >
          <Stack gap="sm">
            <Text size="sm">{getBusinessErrorMessage()}</Text>

            {displayError.referenceId && (
              <Paper p="xs" withBorder>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    {t`Error Reference ID:`}
                  </Text>
                  <Text size="xs" fw={500} ff="monospace">
                    {displayError.referenceId}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed" mt="xs">
                  {t`Please provide this ID when contacting support.`}
                </Text>
              </Paper>
            )}

            {appError.errorType && (
              <Badge
                size="sm"
                variant="light"
                color="red"
                leftSection={<IconDatabase size={12} />}
              >
                {appError.errorType.toUpperCase()}
              </Badge>
            )}
          </Stack>
        </Alert>

        {/* Business-focused recovery actions */}
        <Stack gap="sm" style={{ width: "100%" }}>
          <Text size="sm" fw={500} ta="center" c="dimmed">
            {t`What would you like to do?`}
          </Text>

          <Group justify="center" gap="md">
            <Button
              leftSection={<IconRefresh size="1rem" />}
              onClick={resetError}
              variant="filled"
            >
              {t`Try Again`}
            </Button>

            <Button
              leftSection={<IconDatabase size="1rem" />}
              onClick={handleGoToDashboard}
              variant="light"
            >
              {t`Go to Dashboard`}
            </Button>
          </Group>

          <Group justify="center" gap="md">
            <Button onClick={handleGoToLeads} variant="subtle" size="sm">
              {t`View Leads`}
            </Button>

            <Button
              leftSection={<IconHome size="1rem" />}
              onClick={handleGoHome}
              variant="subtle"
              size="sm"
            >
              {t`Go Home`}
            </Button>
          </Group>
        </Stack>

        {/* Help text for common issues */}
        {appError.errorType === "network" && (
          <Paper p="md" withBorder style={{ width: "100%" }}>
            <Text size="sm" fw={500} mb="xs">
              {t`Troubleshooting Tips:`}
            </Text>
            <Stack gap="xs">
              <Text size="xs" c="dimmed">
                • {t`Check your internet connection`}
              </Text>
              <Text size="xs" c="dimmed">
                • {t`Refresh the page`}
              </Text>
              <Text size="xs" c="dimmed">
                • {t`Clear your browser cache`}
              </Text>
              <Text size="xs" c="dimmed">
                • {t`Try again in a few minutes`}
              </Text>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}

/**
 * CRM Error Boundary Component
 *
 * Wraps CRM features with business-specific error handling
 * following existing platform patterns
 *
 * Usage:
 * ```tsx
 * <CrmErrorBoundary>
 *   <LeadListPage />
 * </CrmErrorBoundary>
 * ```
 *
 * Requirements: Error handling and user experience
 */
export function CrmErrorBoundary({
  children,
  ...props
}: Omit<ErrorBoundaryProps, "fallback" | "onError">) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log CRM-specific errors for monitoring
    console.error("CRM Error Boundary caught an error:", {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    // Track CRM errors for analytics
    if (typeof window !== "undefined" && (window as any).trackEvent) {
      (window as any).trackEvent("crm_error", {
        error: error.message,
        component: errorInfo.componentStack,
        errorType: errorFromAxios(error).errorType,
      });
    }

    // Show notification for non-critical errors
    const appError = errorFromAxios(error);
    if (appError.errorType !== "server") {
      notificationService.fromAppError(appError, {
        title: t`CRM Error`,
        showTechnicalDetails: false,
      });
    }
  };

  return (
    <ErrorBoundary
      {...props}
      fallback={CrmErrorFallback}
      onError={handleError}
      showReportButton={false}
      showTechnicalDetails={process.env.NODE_ENV === "development"}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Higher-order component for wrapping CRM components with error boundary
 *
 * Usage:
 * ```tsx
 * export const LeadListPage = withCrmErrorBoundary(LeadListPageComponent);
 * ```
 */
// eslint-disable-next-line react-refresh/only-export-components
export function withCrmErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => (
    <CrmErrorBoundary>
      <Component {...props} />
    </CrmErrorBoundary>
  );

  WrappedComponent.displayName = `withCrmErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
