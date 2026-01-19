import React from "react";
import { Alert, Button, Stack, Text } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

interface Props {
  children: React.ReactNode;
  /** Custom fallback component to render on error */
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary specifically for feature-related errors.
 *
 * Provides graceful error handling when:
 * - Feature API calls fail
 * - Feature hooks throw errors
 * - Feature components crash
 *
 * Includes automatic retry functionality and user-friendly error messages.
 */
export class FeatureErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Feature loading error:", error, errorInfo);

    // Log to monitoring service if available
    if (typeof window !== "undefined" && (window as any).analytics) {
      (window as any).analytics.track("Feature Error", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            retry={this.handleRetry}
          />
        );
      }

      // Default error UI
      return (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Feature Loading Error"
          color="red"
          variant="light"
        >
          <Stack gap="sm">
            <Text size="sm">
              Something went wrong while loading features. This might be a
              temporary issue.
            </Text>

            {this.state.error && (
              <Text size="xs" color="dimmed">
                Error: {this.state.error.message}
              </Text>
            )}

            <Button
              leftSection={<IconRefresh size="1rem" />}
              variant="light"
              size="sm"
              onClick={this.handleRetry}
            >
              Try Again
            </Button>
          </Stack>
        </Alert>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight error boundary for navigation and non-critical feature components.
 * Fails silently to avoid disrupting the user experience.
 */
export class SilentFeatureErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("Silent feature error (non-critical):", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return null to render nothing (silent failure)
      return null;
    }

    return this.props.children;
  }
}
