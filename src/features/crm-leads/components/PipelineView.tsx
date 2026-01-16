import React, { useCallback, useMemo, useState } from "react";
import {
  Container,
  Stack,
  Group,
  ScrollArea,
  Loader,
  Center,
  Text,
  Alert,
} from "@mantine/core";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";
import { PipelineStageColumn } from "./PipelineStageColumn";
import { PipelineMetrics } from "./PipelineMetrics";
import { LeadCard } from "@/entities/crm/ui";
import {
  usePipelineStages,
  useLeads,
  useMoveLeadToStage,
  useConversionMetrics,
} from "@/entities/crm/api/crm-queries";
import type { Lead } from "@/shared/api/crm/types";

interface PipelineViewProps {
  showConversionMetrics?: boolean;
  enableBulkActions?: boolean;
  highlightOverdueLeads?: boolean;
}

/**
 * PipelineView Component
 * 
 * Main pipeline kanban view for visualizing and managing leads through sales stages.
 * 
 * Features:
 * - Horizontal scrollable stage columns
 * - Pipeline metrics header with conversion rates
 * - Drag-and-drop lead movement between stages
 * - Optimistic updates for better UX
 * - Automatic activity logging on stage changes
 * - Visual emphasis for overdue leads
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.7
 */
export const PipelineView: React.FC<PipelineViewProps> = ({
  showConversionMetrics = true,
  enableBulkActions = false,
  highlightOverdueLeads = true,
}) => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Fetch pipeline stages
  const {
    data: stages = [],
    isLoading: stagesLoading,
    error: stagesError,
  } = usePipelineStages();

  // Fetch all leads
  const {
    data: leadsResponse,
    isLoading: leadsLoading,
    error: leadsError,
  } = useLeads();

  // Fetch conversion metrics
  const { data: conversionMetrics } = useConversionMetrics();

  // Move lead mutation
  const { mutate: moveLeadToStage, isPending: isMoving } = useMoveLeadToStage();

  // Extract leads from paginated response
  const leads = leadsResponse?.content || [];

  // Group leads by stage
  const leadsByStage = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};

    // Initialize all stages with empty arrays
    stages.forEach((stage) => {
      grouped[stage.id] = [];
    });

    // Group leads by their current stage
    leads.forEach((lead) => {
      // Find the stage ID that matches the lead's current stage name
      const stage = stages.find((s) => s.name === lead.currentStage);
      if (stage) {
        grouped[stage.id].push(lead);
      }
    });

    return grouped;
  }, [leads, stages]);

  // Get the currently dragged lead
  const activeLead = useMemo(() => {
    if (!activeId) return null;
    return leads.find((lead) => lead.id === activeId);
  }, [activeId, leads]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Handle drag end - move lead to new stage
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);

      if (!over) return;

      const leadId = active.id as string;
      const targetStageId = over.id as string;

      // Find the lead and target stage
      const lead = leads.find((l) => l.id === leadId);
      const targetStage = stages.find((s) => s.id === targetStageId);

      if (!lead || !targetStage) return;

      // Don't move if already in the target stage
      if (lead.currentStage === targetStage.name) return;

      // Move the lead
      moveLeadToStage(
        { leadId, stageId: targetStageId },
        {
          onSuccess: () => {
            notifications.show({
              title: "Lead Moved",
              message: `${lead.name} moved to ${targetStage.name}`,
              color: "green",
            });

            // Business logic: Track conversion if moved to Won stage
            if (targetStage.type === "WON") {
              notifications.show({
                title: "Lead Converted!",
                message: `${lead.name} has been marked as Won! 🎉`,
                color: "green",
              });
            }

            // Business logic: Track lost lead if moved to Lost stage
            if (targetStage.type === "LOST") {
              notifications.show({
                title: "Lead Lost",
                message: `${lead.name} has been marked as Lost`,
                color: "red",
              });
            }
          },
          onError: (error) => {
            notifications.show({
              title: "Failed to Move Lead",
              message: "Please try again",
              color: "red",
            });
            console.error("Failed to move lead:", error);
          },
        }
      );
    },
    [leads, stages, moveLeadToStage]
  );

  // Handle lead click - navigate to detail page
  const handleLeadClick = useCallback(
    (lead: Lead) => {
      navigate({ to: `/crm/leads/${lead.id}` });
    },
    [navigate]
  );

  // Loading state
  if (stagesLoading || leadsLoading) {
    return (
      <Center h={400}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading pipeline...</Text>
        </Stack>
      </Center>
    );
  }

  // Error state
  if (stagesError || leadsError) {
    return (
      <Container size="lg" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error Loading Pipeline"
          color="red"
        >
          {stagesError?.message || leadsError?.message || "Failed to load pipeline data"}
        </Alert>
      </Container>
    );
  }

  // Empty state
  if (stages.length === 0) {
    return (
      <Container size="lg" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="No Pipeline Stages"
          color="blue"
        >
          Please configure pipeline stages to start using the kanban view.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="100%" px="md" py="lg">
      <Stack gap="lg">
        {/* Pipeline Metrics Header */}
        {showConversionMetrics && (
          <PipelineMetrics
            stages={stages.map((stage) => ({
              ...stage,
              leadCount: leadsByStage[stage.id]?.length || 0,
            }))}
            conversionMetrics={conversionMetrics}
            showVelocity={true}
            showConversionRates={true}
          />
        )}

        {/* Pipeline Kanban Board */}
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <ScrollArea>
            <Group
              align="flex-start"
              gap="md"
              wrap="nowrap"
              style={{ minWidth: "max-content", paddingBottom: 16 }}
            >
              {stages
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((stage) => (
                  <PipelineStageColumn
                    key={stage.id}
                    stage={stage}
                    leads={leadsByStage[stage.id] || []}
                    onLeadMove={handleDragEnd as any}
                    onLeadClick={handleLeadClick}
                    highlightOverdue={highlightOverdueLeads}
                    isMoving={isMoving}
                  />
                ))}
            </Group>
          </ScrollArea>

          {/* Drag Overlay - shows the dragged lead card */}
          <DragOverlay>
            {activeLead ? (
              <LeadCard lead={activeLead} variant="kanban" showQuickActions={false} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </Stack>
    </Container>
  );
};
