import React from "react";
import {
  Container,
  Text,
  Button,
  Stack,
  Alert,
  Code,
  Group,
  ActionIcon,
  Collapse,
  Paper,
  Badge,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconRefresh,
  IconBug,
  IconChevronDown,
  IconChevronUp,
  IconHome,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { errorFromAxios, formatErrorForDisplay } from "@/shared/lib/http-error";
import { notificationService } from "@/shared/lib/notifications";
import { spacing, typography, shadows } from "@/shared/lib/design-tokens";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showReportButton?: boolean;
  showTechnicalDetails?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  showReportButton?: boolean;
  showTechnicalDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Mantine-styled error fallback component
 */
export function DefaultErrorFallback({
  error,
  resetError,
  showReportButton = true,
  showTechnicalDetails = false,
}: ErrorFallbackProps) {
  const [detailsOpened, { toggle: toggleDetails }] = useDisclosure(false);
  const appError = errorFromAxios(error);
  const displayError = formatErrorForDisplay(appError);

  const handleReportError = () => {
    notificationService.info({
      title: "Error Reported",
      message: "Thank you for reporting this issue. Our team has been notified.",
    });

    // Here you would typically send the error to your error reporting service
    console.error("Error reported:", { error, appError });
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="lg">
        <Alert
          icon={<IconAlertTriangle size="1.5rem" />}
          title="Something went wrong"
          color="red"
          variant="light"
          style={{ width: "100%" }}
        >
          <Stack gap="sm">
            <Text size="sm">
              {displayError.message || "An unexpected error occurred while loading this page."}
            </Text>

            {displayError.referenceId && (
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  Error ID:
                </Text>
                <Code>{displayError.referenceId}</Code>
              </Group>
            )}

            {appError.errorType && (
              <Badge size="sm" variant="light" color="red">
                {appError.errorType.toUpperCase()} ERROR
              </Badge>
            )}
          </Stack>
        </Alert>

        <Group gap="md">
          <Button leftSection={<IconRefresh size="1rem" />} onClick={resetError} variant="filled">
            Try Again
          </Button>

          <Button leftSection={<IconHome size="1rem" />} onClick={handleGoHome} variant="light">
            Go Home
          </Button>

          {showReportButton && (
            <Button
              leftSection={<IconBug size="1rem" />}
              onClick={handleReportError}
              variant="subtle"
              color="gray"
            >
              Report Issue
            </Button>
          )}
        </Group>

        {showTechnicalDetails && (
          <Paper w="100%" p="md" withBorder>
            <Group justify="space-between" mb="sm">
              <Text size="sm" fw={500}>
                Technical Details
              </Text>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={toggleDetails}
                aria-label="Toggle technical details"
              >
                {detailsOpened ? <IconChevronUp /> : <IconChevronDown />}
              </ActionIcon>
            </Group>

            <Collapse in={detailsOpened}>
              <Stack gap="xs">
                <div>
                  <Text size="xs" fw={500} c="dimmed">
                    Error Message:
                  </Text>
                  <Code block>{error.message}</Code>
                </div>

                {error.stack && (
                  <div>
                    <Text size="xs" fw={500} c="dimmed">
                      Stack Trace:
                    </Text>
                    <Code
                      block
                      style={{
                        fontSize: typography.fontSize.xs,
                        maxHeight: "200px",
                        overflow: "auto",
                      }}
                    >
                      {error.stack}
                    </Code>
                  </div>
                )}

                {displayError.type && (
                  <div>
                    <Text size="xs" fw={500} c="dimmed">
                      Problem Type:
                    </Text>
                    <Code>{displayError.type}</Code>
                  </div>
                )}
              </Stack>
            </Collapse>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}

/**
 * Enhanced Error Boundary with Mantine integration
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error for monitoring
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Show notification for non-critical errors
    const appError = errorFromAxios(error);
    if (appError.errorType !== "server") {
      notificationService.fromAppError(appError, {
        title: "Component Error",
        showTechnicalDetails: false,
      });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          showReportButton={this.props.showReportButton}
          showTechnicalDetails={this.props.showTechnicalDetails}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for handling errors in functional components
 */
export function useErrorHandler() {
  return React.useCallback((error: unknown, context?: string) => {
    const appError = errorFromAxios(error);

    console.error(`Error in ${context || "component"}:`, error);

    notificationService.fromAppError(appError, {
      title: context ? `Error in ${context}` : "Component Error",
      showTechnicalDetails: process.env.NODE_ENV === "development",
    });
  }, []);
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
