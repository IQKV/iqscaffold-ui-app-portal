import React from "react";
import { Stack, Text, Badge, Group, Card, Box, Loader, Center } from "@mantine/core";
import { useDroppable } from "@dnd-kit/core";
import { LeadCard } from "@/entities/crm/ui";
import type { PipelineStage, Lead } from "@/shared/api/crm/types";

interface PipelineStageColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  onLeadMove: (leadId: string, targetStageId: string) => void;
  onLeadClick: (lead: Lead) => void;
  highlightOverdue?: boolean;
  isMoving?: boolean;
}

/**
 * PipelineStageColumn Component
 * 
 * Represents a single column in the pipeline kanban view.
 * Displays stage header with metrics and lead cards with drag-and-drop support.
 * 
 * Features:
 * - Stage header with lead count and metrics
 * - Droppable area for lead cards
 * - Empty state when no leads
 * - Loading state during operations
 * - Visual emphasis for overdue leads
 * 
 * Requirements: 3.2, 3.5, 3.6
 */
export const PipelineStageColumn: React.FC<PipelineStageColumnProps> = ({
  stage,
  leads,
  onLeadMove,
  onLeadClick,
  highlightOverdue = true,
  isMoving = false,
}) => {
  // Set up droppable area for this stage
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { stage },
  });

  // Filter overdue leads if highlighting is enabled
  const overdueLeads = highlightOverdue
    ? leads.filter((lead) => lead.isOverdue)
    : [];

  // Calculate stage metrics
  const leadCount = leads.length;
  const conversionRate = stage.conversionRate
    ? `${stage.conversionRate.toFixed(1)}%`
    : null;
  const avgTime = stage.averageTimeInStage
    ? `${stage.averageTimeInStage}d`
    : null;

  return (
    <Box
      style={{
        minWidth: 320,
        maxWidth: 320,
        height: "100%",
      }}
    >
      <Stack gap="md" style={{ height: "100%" }}>
        {/* Stage Header */}
        <Card
          shadow="sm"
          padding="md"
          radius="md"
          withBorder
          style={{
            backgroundColor: isOver ? "#f0f0f0" : "white",
            borderColor: stage.color,
            borderWidth: 2,
          }}
        >
          <Stack gap="xs">
            <Group justify="space-between" wrap="nowrap">
              <Text fw={600} size="md" truncate>
                {stage.name}
              </Text>
              <Badge
                size="lg"
                variant="filled"
                style={{ backgroundColor: stage.color }}
              >
                {leadCount}
              </Badge>
            </Group>

            {/* Stage Metrics */}
            {(conversionRate || avgTime) && (
              <Group gap="xs">
                {conversionRate && (
                  <Badge variant="light" size="sm" color="green">
                    {conversionRate} conv.
                  </Badge>
                )}
                {avgTime && (
                  <Badge variant="light" size="sm" color="blue">
                    {avgTime} avg.
                  </Badge>
                )}
              </Group>
            )}

            {/* Overdue indicator */}
            {overdueLeads.length > 0 && (
              <Badge variant="filled" size="sm" color="red">
                {overdueLeads.length} overdue
              </Badge>
            )}
          </Stack>
        </Card>

        {/* Droppable Area for Lead Cards */}
        <Box
          ref={setNodeRef}
          style={{
            flex: 1,
            minHeight: 200,
            padding: 8,
            borderRadius: 8,
            backgroundColor: isOver ? "#e7f5ff" : "#f8f9fa",
            border: isOver ? "2px dashed #228be6" : "2px dashed transparent",
            transition: "all 0.2s ease",
            overflowY: "auto",
          }}
        >
          {/* Loading State */}
          {isMoving && (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          )}

          {/* Empty State */}
          {!isMoving && leads.length === 0 && (
            <Center py="xl">
              <Text size="sm" c="dimmed">
                No leads in this stage
              </Text>
            </Center>
          )}

          {/* Lead Cards */}
          {!isMoving && leads.length > 0 && (
            <Stack gap="md">
              {leads.map((lead) => (
                <Box
                  key={lead.id}
                  onClick={() => onLeadClick(lead)}
                  style={{ cursor: "pointer" }}
                >
                  <LeadCard
                    lead={lead}
                    variant="kanban"
                    draggable={true}
                    showQuickActions={false}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
};
