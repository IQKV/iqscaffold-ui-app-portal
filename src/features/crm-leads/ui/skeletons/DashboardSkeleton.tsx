import React from "react";
import { Container, Stack, Paper, Skeleton, Group, SimpleGrid } from "@mantine/core";

/**
 * DashboardSkeleton Component
 *
 * Skeleton loader matching the CRM dashboard layout.
 * Provides visual feedback during dashboard data loading.
 *
 * Requirements: 13.1, 13.2, 13.4
 */

export const DashboardSkeleton: React.FC = () => {
  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Skeleton height={32} width={200} />
          <Skeleton height={36} width={150} />
        </Group>

        {/* KPI Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {Array.from({ length: 4 }).map((_, index) => (
            <Paper key={index} p="md" withBorder>
              <Stack gap="xs">
                <Skeleton height={14} width="60%" />
                <Skeleton height={32} width="40%" />
                <Skeleton height={12} width="80%" />
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>

        {/* Charts */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {/* Pipeline chart */}
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Skeleton height={24} width="50%" />
              <Skeleton height={300} width="100%" />
            </Stack>
          </Paper>

          {/* Source distribution chart */}
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Skeleton height={24} width="50%" />
              <Skeleton height={300} width="100%" />
            </Stack>
          </Paper>
        </SimpleGrid>

        {/* Follow-ups panel */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Skeleton height={24} width={200} />
            <Stack gap="sm">
              {Array.from({ length: 3 }).map((_, index) => (
                <Paper key={index} p="sm" withBorder>
                  <Group justify="space-between">
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Skeleton height={16} width="60%" />
                      <Skeleton height={14} width="40%" />
                    </Stack>
                    <Skeleton height={32} width={80} />
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
