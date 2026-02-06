import React from "react";
import {
  Loader,
  Stack,
  Text,
  Center,
  Skeleton,
  Group,
  Card,
  Progress,
  Alert,
  Button,
} from "@mantine/core";
import { IconWifi, IconRefresh } from "@tabler/icons-react";
import { type AppError } from "@/shared/lib/http-error";
import { t } from "@lingui/core/macro";
import { spacing, zIndex, colors } from "@/shared/lib/design-tokens";

interface LoadingStateProps {
  /** Loading message to display */
  message?: string;
  /** Size of the loader */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Variant of the loader */
  variant?: "oval" | "bars" | "dots";
  /** Whether to show as overlay */
  overlay?: boolean;
  /** Custom height for the loading area */
  height?: number | string;
}

interface SkeletonLoadingProps {
  /** Number of skeleton lines */
  lines?: number;
  /** Height of each skeleton line */
  height?: number;
  /** Whether to include a title skeleton */
  includeTitle?: boolean;
  /** Whether to include an avatar skeleton */
  includeAvatar?: boolean;
}

interface ProgressLoadingProps {
  /** Current progress value (0-100) */
  value: number;
  /** Loading message */
  message?: string;
  /** Whether to show percentage */
  showPercentage?: boolean;
  /** Color of the progress bar */
  color?: string;
}

interface RetryableLoadingProps {
  /** Error that occurred */
  error: AppError;
  /** Retry function */
  onRetry: () => void;
  /** Whether currently retrying */
  isRetrying?: boolean;
  /** Custom retry message */
  retryMessage?: string;
}

/**
 * Basic loading state with Mantine styling
 */
export function LoadingState({
  message = t`Loading...`,
  size = "md",
  variant = "oval",
  overlay = false,
  height = 200,
}: LoadingStateProps) {
  const content = (
    <Center h={height}>
      <Stack align="center" gap="md">
        <Loader size={size} type={variant} />
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      </Stack>
    </Center>
  );

  if (overlay) {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.background.overlay,
          zIndex: zIndex.modal,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Skeleton loading state for content placeholders
 */
export function SkeletonLoading({
  lines = 3,
  height = 12,
  includeTitle = false,
  includeAvatar = false,
}: SkeletonLoadingProps) {
  return (
    <Stack gap="sm">
      {includeTitle && <Skeleton height={24} width="60%" />}

      {includeAvatar && (
        <Group gap="md">
          <Skeleton height={40} circle />
          <Stack gap="xs" style={{ flex: 1 }}>
            <Skeleton height={12} width="40%" />
            <Skeleton height={10} width="60%" />
          </Stack>
        </Group>
      )}

      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={height}
          width={index === lines - 1 ? "80%" : "100%"}
        />
      ))}
    </Stack>
  );
}

/**
 * Progress loading state with percentage
 */
export function ProgressLoading({
  value,
  message = t`Loading...`,
  showPercentage = true,
  color = "blue",
}: ProgressLoadingProps) {
  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {message}
        </Text>
        {showPercentage && (
          <Text size="sm" fw={500}>
            {Math.round(value)}%
          </Text>
        )}
      </Group>
      <Progress value={value} color={color} size="sm" />
    </Stack>
  );
}

/**
 * Retryable loading state for failed requests
 */
export function RetryableLoading({
  error,
  onRetry,
  isRetrying = false,
  retryMessage,
}: RetryableLoadingProps) {
  const getRetryMessage = () => {
    if (retryMessage) {
      return retryMessage;
    }

    switch (error.errorType) {
      case "network":
        return t`Check your internet connection and try again`;
      case "timeout":
        return t`The request timed out. Please try again`;
      case "server":
        return t`Server is temporarily unavailable. Please try again`;
      default:
        return t`Something went wrong. Please try again`;
    }
  };

  if (isRetrying) {
    return <LoadingState message={t`Retrying...`} size="sm" />;
  }

  return (
    <Alert
      icon={<IconWifi size="1rem" />}
      title={t`Connection Issue`}
      color="orange"
      variant="light"
    >
      <Stack gap="sm">
        <Text size="sm">{getRetryMessage()}</Text>
        <Button
          leftSection={<IconRefresh size="1rem" />}
          onClick={onRetry}
          size="sm"
          variant="light"
        >
          {t`Try Again`}
        </Button>
      </Stack>
    </Alert>
  );
}

/**
 * Card-based loading state for content areas
 */
export function CardLoading({
  title,
  lines = 4,
  includeActions = false,
}: {
  title?: string;
  lines?: number;
  includeActions?: boolean;
}) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        {title && <Skeleton height={20} width="50%" />}

        <SkeletonLoading lines={lines} />

        {includeActions && (
          <Group justify="flex-end" gap="sm">
            <Skeleton height={32} width={80} />
            <Skeleton height={32} width={100} />
          </Group>
        )}
      </Stack>
    </Card>
  );
}

/**
 * Table loading state with skeleton rows
 */
export function TableLoading({
  columns = 4,
  rows = 5,
  includeHeader = true,
}: {
  columns?: number;
  rows?: number;
  includeHeader?: boolean;
}) {
  return (
    <Stack gap="xs">
      {includeHeader && (
        <Group gap="md" style={{ padding: `${spacing.sm} 0` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={`header-${index}`} height={16} width="20%" />
          ))}
        </Group>
      )}

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Group
          key={`row-${rowIndex}`}
          gap="md"
          style={{ padding: `${spacing.md} 0` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              height={14}
              width={colIndex === 0 ? "25%" : "20%"}
            />
          ))}
        </Group>
      ))}
    </Stack>
  );
}
