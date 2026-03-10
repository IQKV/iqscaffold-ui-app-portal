import React from "react";
import { Container, Stack, Group, Skeleton, Paper, Box, Divider } from "@mantine/core";

/**
 * ContactDetailSkeleton Component
 *
 * Loading skeleton for contact detail page
 */
export const ContactDetailSkeleton: React.FC = () => {
  return (
    <Stack gap="lg">
      {/* Header Skeleton */}
      <Group justify="space-between">
        <Group>
          <Skeleton height={40} width={40} radius="md" />
          <div>
            <Skeleton height={28} width={200} mb="xs" />
            <Skeleton height={16} width={120} />
          </div>
        </Group>
        <Group>
          <Skeleton height={36} width={36} radius="md" />
          <Skeleton height={36} width={36} radius="md" />
          <Skeleton height={36} width={120} />
        </Group>
      </Group>

      {/* Contact Overview Card Skeleton */}
      <Paper p="xl" withBorder>
        <Group align="flex-start" wrap="nowrap">
          <Skeleton height={80} width={80} radius="md" />

          <Box style={{ flex: 1 }}>
            <Group justify="space-between" align="flex-start" mb="md">
              <div>
                <Skeleton height={24} width={180} mb="xs" />
                <Skeleton height={18} width={140} mb="xs" />
                <Group gap="xs" mb="xs">
                  <Skeleton height={16} width={16} />
                  <Skeleton height={16} width={120} />
                </Group>
              </div>

              <Group gap="xs">
                <Skeleton height={24} width={60} radius="xl" />
                <Skeleton height={24} width={40} radius="xl" />
              </Group>
            </Group>

            <Divider mb="md" />

            <Group gap="xl">
              <Group gap="xs">
                <Skeleton height={16} width={16} />
                <Skeleton height={16} width={150} />
              </Group>
              <Group gap="xs">
                <Skeleton height={16} width={16} />
                <Skeleton height={16} width={120} />
              </Group>
              <Group gap="xs">
                <Skeleton height={16} width={16} />
                <Skeleton height={16} width={100} />
              </Group>
            </Group>
          </Box>
        </Group>
      </Paper>

      {/* Tabs Skeleton */}
      <div>
        <Group gap="md" mb="lg">
          <Skeleton height={36} width={80} />
          <Skeleton height={36} width={60} />
          <Skeleton height={36} width={80} />
        </Group>

        {/* Tab Content Skeleton */}
        <Stack gap="lg">
          <Paper p="lg" withBorder>
            <Skeleton height={20} width={150} mb="md" />
            <Stack gap="sm">
              <Group>
                <Skeleton height={16} width={80} />
                <Skeleton height={16} width={120} />
              </Group>
              <Group>
                <Skeleton height={16} width={80} />
                <Skeleton height={16} width={160} />
              </Group>
              <Group>
                <Skeleton height={16} width={80} />
                <Skeleton height={16} width={100} />
              </Group>
            </Stack>
          </Paper>

          <Paper p="lg" withBorder>
            <Skeleton height={20} width={100} mb="md" />
            <Skeleton height={60} />
          </Paper>
        </Stack>
      </div>
    </Stack>
  );
};
