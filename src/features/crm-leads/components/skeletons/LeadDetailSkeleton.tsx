import React from "react";
import { Container, Stack, Paper, Skeleton, Group, Tabs } from "@mantine/core";

/**
 * LeadDetailSkeleton Component
 *
 * Skeleton loader matching the lead detail page layout.
 * Provides visual feedback during lead data loading.
 *
 * Requirements: 13.1, 13.2, 13.4
 */

export const LeadDetailSkeleton: React.FC = () => {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Lead Header */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            {/* Name and stage */}
            <Group justify="space-between">
              <Skeleton height={32} width="40%" />
              <Skeleton height={32} width={100} radius="xl" />
            </Group>

            {/* Contact info */}
            <Group gap="xl">
              <Skeleton height={16} width={200} />
              <Skeleton height={16} width={150} />
              <Skeleton height={16} width={180} />
            </Group>

            {/* Quick actions */}
            <Group gap="xs">
              <Skeleton height={36} width={100} />
              <Skeleton height={36} width={100} />
              <Skeleton height={36} width={80} />
            </Group>
          </Stack>
        </Paper>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <Tabs.List>
            <Skeleton height={36} width={100} mr="md" />
            <Skeleton height={36} width={80} mr="md" />
            <Skeleton height={36} width={100} mr="md" />
            <Skeleton height={36} width={110} />
          </Tabs.List>

          {/* Tab content */}
          <Paper p="md" mt="md" withBorder>
            <Stack gap="md">
              <Skeleton height={20} width="30%" />
              <Skeleton height={16} width="80%" />
              <Skeleton height={16} width="70%" />
              <Skeleton height={16} width="75%" />
              <Skeleton height={100} width="100%" mt="md" />
            </Stack>
          </Paper>
        </Tabs>
      </Stack>
    </Container>
  );
};
