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
  Box,
} from "@mantine/core";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";
import { useMediaQuery } from "@mantine/hooks";
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
 * - Touch-friendly drag and drop for mobile/tablet
 * - Optimistic updates for better UX
 * - Automatic activity logging on stage changes
 * - Visual emphasis for overdue leads
 * - Responsive design with mobile optimization
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.7, 12.2, 12.4
 */
export const PipelineView: React.FC<PipelineViewProps> = ({
  showConversionMetrics = true,
  enableBulkActions = false,
  highlightOverdueLeads = true,
}) => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Configure sensors for touch and mouse support
  // Touch sensor with activation constraint to prevent accidental drags
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // 250ms delay before drag starts
      tolerance: 5, // 5px movement tolerance
    },
  });

  // Mouse sensor for desktop
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // 10px movement before drag starts
    },
  });

  // Pointer sensor as fallback
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor, pointerSensor);

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

  // Extract leads from paginated response - memoized to prevent dependency issues
  const leads = useMemo(() => {
    return leadsResponse?.content || [];
  }, [leadsResponse?.content]);

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
    if (!activeId) {
      return null;
    }
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

      if (!over) {
        return;
      }

      const leadId = active.id as string;
      const targetStageId = over.id as string;

      // Find the lead and target stage
      const lead = leads.find((l) => l.id === leadId);
      const targetStage = stages.find((s) => s.id === targetStageId);

      if (!lead || !targetStage) {
        return;
      }

      // Don't move if already in the target stage
      if (lead.currentStage === targetStage.name) {
        return;
      }

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
          title={t`Error Loading Pipeline`}
          color="red"
        >
          {stagesError?.message ||
            leadsError?.message ||
            t`Failed to load pipeline data`}
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
          title={t`No Pipeline Stages`}
          color="blue"
        >
          {t`Please configure pipeline stages to start using the kanban view.`}
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      size="100%"
      px={isMobile ? "xs" : "md"}
      py={isMobile ? "sm" : "lg"}
      style={{ maxWidth: "100vw" }}
    >
      <Stack gap={isMobile ? "md" : "lg"}>
        {/* Pipeline Metrics Header */}
        {showConversionMetrics && !isMobile && (
          <PipelineMetrics
            stages={stages.map((stage) => ({
              ...stage,
              leadCount: leadsByStage[stage.id]?.length || 0,
            }))}
            conversionMetrics={conversionMetrics}
            showVelocity
            showConversionRates
          />
        )}

        {/* Mobile: Simplified metrics */}
        {showConversionMetrics && isMobile && (
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Pipeline Overview
            </Text>
            <Group gap="xs">
              {stages.slice(0, 3).map((stage) => (
                <Text key={stage.id} size="xs" c="dimmed">
                  {stage.name}: {leadsByStage[stage.id]?.length || 0}
                </Text>
              ))}
            </Group>
          </Box>
        )}

        {/* Pipeline Kanban Board */}
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <ScrollArea
            type="auto"
            styles={{
              viewport: {
                // Ensure smooth scrolling on mobile
                WebkitOverflowScrolling: "touch",
              },
            }}
          >
            <Group
              align="flex-start"
              gap={isMobile ? "xs" : "md"}
              wrap="nowrap"
              style={{
                minWidth: "max-content",
                paddingBottom: 16,
                // Touch-friendly spacing
                paddingRight: isMobile ? 8 : 0,
              }}
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
                    isMobile={isMobile}
                  />
                ))}
            </Group>
          </ScrollArea>

          {/* Drag Overlay - shows the dragged lead card */}
          <DragOverlay dropAnimation={null}>
            {activeLead ? (
              <Box
                style={{
                  // Make drag overlay more visible
                  opacity: 0.9,
                  transform: "rotate(3deg)",
                  cursor: "grabbing",
                }}
              >
                <LeadCard
                  lead={activeLead}
                  variant={isMobile ? "compact" : "kanban"}
                  showQuickActions={false}
                />
              </Box>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Stack>
    </Container>
  );
};
