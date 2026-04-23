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
  ActionIcon,
  Tooltip,
  Button,
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
import { IconAlertCircle, IconSettings } from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import { useNavigate } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";
import { useMediaQuery } from "@mantine/hooks";
import { PipelineStageColumn } from "@/features/crm-leads";
import { PipelineMetrics } from "./PipelineMetrics";
import { PipelineSettingsModal } from "./PipelineSettingsModal";
import { PipelineSkeleton } from "./skeletons";
import { LazyLoad } from "@/shared/ui";
import {
  LeadCard,
  usePipelineStagesQuery,
  useLeadsQuery,
  useMoveLeadToStageMutation,
  useConversionMetricsQuery,
} from "@/entities/crm";
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
  const [settingsOpened, setSettingsOpened] = useState(false);

  // Configure sensors for touch and mouse support
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

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
  } = usePipelineStagesQuery();

  // Fetch all leads
  const { data: leadsResponse, isLoading: leadsLoading, error: leadsError } = useLeadsQuery();

  // Fetch conversion metrics
  const { data: conversionMetrics } = useConversionMetricsQuery();

  // Move lead mutation
  const { mutate: moveLeadToStage, isPending: isMoving } = useMoveLeadToStageMutation();

  const leads = useMemo(() => {
    const content = (leadsResponse as any)?.content;
    return content || [];
  }, [leadsResponse]);

  // Group leads by stage
  const leadsByStage = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};

    stages.forEach((stage) => {
      grouped[stage.id] = [];
    });

    leads.forEach((lead: any) => {
      const stage = stages.find((s) => s.name === lead.currentStage);
      if (stage) {
        grouped[stage.id].push(lead);
      }
    });

    return grouped;
  }, [leads, stages]);

  const activeLead = useMemo(() => {
    if (!activeId) {
      return null;
    }
    return leads.find((lead: any) => lead.id === activeId);
  }, [activeId, leads]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) {
        return;
      }

      const leadId = active.id as string;
      const targetStageId = over.id as string;
      const lead = leads.find((l: any) => l.id === leadId);
      const targetStage = stages.find((s) => s.id === targetStageId);

      if (!lead || !targetStage) {
        return;
      }
      if (lead.currentStage === targetStage.name) {
        return;
      }

      const leadName = lead.name;
      const stageName = targetStage.name;

      moveLeadToStage(
        { leadId, stageId: targetStageId },
        {
          onSuccess: () => {
            notifications.show({
              title: t`Lead Moved`,
              message: t`${leadName} moved to ${stageName}`,
              color: "green",
            });
          },
          onError: (error) => {
            notifications.show({
              title: t`Failed to Move Lead`,
              message: t`Please try again`,
              color: "red",
            });
            console.error("Failed to move lead:", error);
          },
        },
      );
    },
    [leads, stages, moveLeadToStage],
  );

  const handleLeadClick = useCallback(
    (lead: Lead) => {
      navigate({ to: `/crm/leads/${lead.id}` });
    },
    [navigate],
  );

  if (stagesLoading || leadsLoading) {
    return (
      <Container size="100%" px={isMobile ? "xs" : "md"} py={isMobile ? "sm" : "lg"}>
        <PipelineSkeleton stageCount={5} cardsPerStage={3} />
      </Container>
    );
  }

  if (stagesError || leadsError) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title={t`Error Loading Pipeline`} color="red">
          {stagesError?.message || leadsError?.message || t`Failed to load pipeline data`}
        </Alert>
      </Container>
    );
  }

  if (stages.length === 0) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title={t`No Pipeline Stages`} color="blue">
          <Group justify="space-between" align="center" w="100%">
            <Text>{t`Please configure pipeline stages to start using the kanban view.`}</Text>
            <Button
              variant="light"
              leftSection={<IconSettings size={16} />}
              onClick={() => setSettingsOpened(true)}
            >
              {t`Manage Stages`}
            </Button>
          </Group>
        </Alert>
        <PipelineSettingsModal opened={settingsOpened} onClose={() => setSettingsOpened(false)} />
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
        {showConversionMetrics && !isMobile && (
          <PipelineMetrics
            stages={stages.map((stage) => ({
              ...stage,
              leadCount: leadsByStage[stage.id]?.length || 0,
            }))}
            conversionMetrics={conversionMetrics}
            showVelocity
            showConversionRates
            extraActions={
              <Tooltip label={t`Manage Pipeline Stages`}>
                <ActionIcon variant="light" onClick={() => setSettingsOpened(true)} size="lg">
                  <IconSettings size={20} />
                </ActionIcon>
              </Tooltip>
            }
          />
        )}

        {showConversionMetrics && isMobile && (
          <Box pos="relative">
            <Group justify="space-between" align="center" mb="xs">
              <Text size="sm" fw={500}>
                {t`Pipeline Overview`}
              </Text>
              <ActionIcon variant="subtle" onClick={() => setSettingsOpened(true)}>
                <IconSettings size={18} />
              </ActionIcon>
            </Group>
            <Group gap="xs">
              {stages.slice(0, 3).map((stage) => (
                <Text key={stage.id} size="xs" c="dimmed">
                  {stage.name}: {leadsByStage[stage.id]?.length || 0}
                </Text>
              ))}
            </Group>
          </Box>
        )}

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
          <ScrollArea type="auto">
            <Group
              align="flex-start"
              gap={isMobile ? "xs" : "md"}
              wrap="nowrap"
              style={{ minWidth: "max-content", paddingBottom: 16 }}
            >
              {stages
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((stage) => (
                  <LazyLoad key={stage.id} height={600} threshold={0.1}>
                    <PipelineStageColumn
                      stage={stage}
                      leads={leadsByStage[stage.id] || []}
                      onLeadMove={handleDragEnd as any}
                      onLeadClick={handleLeadClick}
                      highlightOverdue={highlightOverdueLeads}
                      isMoving={isMoving}
                      isMobile={isMobile}
                    />
                  </LazyLoad>
                ))}
            </Group>
          </ScrollArea>

          <DragOverlay dropAnimation={null}>
            {activeLead ? (
              <Box
                style={{
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

        <PipelineSettingsModal opened={settingsOpened} onClose={() => setSettingsOpened(false)} />
      </Stack>
    </Container>
  );
};
