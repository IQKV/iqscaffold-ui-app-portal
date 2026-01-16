import React from "react";
import { Stack, Paper, Skeleton, Group, Box, ScrollArea } from "@mantine/core";

/**
 * PipelineSkeleton Component
 *
 * Skeleton loader matching the pipeline kanban layout.
 * Provides visual feedback during pipeline data loading.
 *
 * Requirements: 13.1, 13.2, 13.4
 */

interface PipelineSkeletonProps {
  stageCount?: number;
  cardsPerStage?: number;
}

export const PipelineSkeleton: React.FC<PipelineSkeletonProps> = ({
  stageCount = 5,
  cardsPerStage = 3,
}) => {
  return (
    <Stack gap="lg">
      {/* Metrics header */}
      <Paper p="md" withBorder>
        <Group gap="xl">
          <Skeleton height={60} width={150} />
          <Skeleton height={60} width={150} />
          <Skeleton height={60} width={150} />
          <Skeleton height={60} width={150} />
        </Group>
      </Paper>

      {/* Pipeline columns */}
      <ScrollArea>
        <Group
          align="flex-start"
          gap="md"
          wrap="nowrap"
          style={{ minWidth: "max-content" }}
        >
          {Array.from({ length: stageCount }).map((_, stageIndex) => (
            <Box key={stageIndex} style={{ width: 300 }}>
              <Paper p="md" withBorder>
                <Stack gap="md">
                  {/* Stage header */}
                  <Group justify="space-between">
                    <Skeleton height={24} width={120} />
                    <Skeleton height={24} width={40} radius="xl" />
                  </Group>

                  {/* Lead cards */}
                  <Stack gap="sm">
                    {Array.from({ length: cardsPerStage }).map(
                      (_, cardIndex) => (
                        <Paper key={cardIndex} p="sm" withBorder shadow="xs">
                          <Stack gap="xs">
                            <Skeleton height={18} width="80%" />
                            <Skeleton height={14} width="60%" />
                            <Group gap="xs">
                              <Skeleton height={20} width={60} radius="xl" />
                              <Skeleton height={20} width={70} radius="xl" />
                            </Group>
                          </Stack>
                        </Paper>
                      )
                    )}
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          ))}
        </Group>
      </ScrollArea>
    </Stack>
  );
};
