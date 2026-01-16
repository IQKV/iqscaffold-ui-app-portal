import React from "react";
import { Stack, Paper, Skeleton, Group, Box } from "@mantine/core";

/**
 * LeadListSkeleton Component
 *
 * Skeleton loader matching the lead list layout.
 * Provides visual feedback during data loading.
 *
 * Requirements: 13.1, 13.2, 13.4
 */

interface LeadListSkeletonProps {
  count?: number;
  variant?: "list" | "compact";
}

export const LeadListSkeleton: React.FC<LeadListSkeletonProps> = ({
  count = 5,
  variant = "list",
}) => {
  const isCompact = variant === "compact";

  return (
    <Stack gap={isCompact ? "sm" : "md"}>
      {Array.from({ length: count }).map((_, index) => (
        <Paper key={index} p={isCompact ? "sm" : "md"} withBorder shadow="sm">
          <Stack gap="xs">
            {/* Header with name and badge */}
            <Group justify="space-between">
              <Skeleton height={isCompact ? 16 : 20} width="40%" />
              <Skeleton height={isCompact ? 20 : 24} width={80} radius="xl" />
            </Group>

            {/* Company and email */}
            <Skeleton height={isCompact ? 12 : 14} width="60%" />
            <Skeleton height={isCompact ? 12 : 14} width="50%" />

            {/* Badges */}
            <Group gap="xs">
              <Skeleton height={20} width={60} radius="xl" />
              <Skeleton height={20} width={80} radius="xl" />
            </Group>

            {/* Quick actions (only for list variant) */}
            {!isCompact && (
              <Group gap="xs" mt="xs">
                <Skeleton height={28} width={80} />
                <Skeleton height={28} width={100} />
                <Skeleton height={28} width={70} />
              </Group>
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};
