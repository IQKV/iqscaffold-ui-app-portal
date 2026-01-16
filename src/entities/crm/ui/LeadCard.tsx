import React, { useMemo } from "react";
import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Tooltip,
  Box,
} from "@mantine/core";
import { Lead } from "@/shared/api/crm/types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { LeadScoreBadge } from "./LeadScoreBadge";
import { LeadSourceBadge } from "./LeadSourceBadge";

interface LeadCardProps {
  lead: Lead;
  variant?: "list" | "kanban" | "compact";
  showQuickActions?: boolean;
  onQuickActions?: {
    qualify: () => void;
    scheduleFollowUp: () => void;
    viewDetails: () => void;
  };
  // Drag and drop support for kanban view
  draggable?: boolean;
  // Keyboard navigation support
  tabIndex?: number;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

/**
 * LeadCard Component
 *
 * Business-focused card component for displaying lead information
 * with variants for different views (list, kanban, compact).
 *
 * Features:
 * - Business-focused styling based on lead quality (score)
 * - Quick actions for common sales tasks
 * - Drag-and-drop support for kanban view
 * - Visual indicators for overdue leads
 * - Responsive design for different contexts
 * - Keyboard navigation and ARIA support (Requirements: 14.1, 14.2, 14.6, 14.7)
 */
export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  variant = "list",
  showQuickActions = true,
  onQuickActions,
  draggable = false,
  tabIndex = 0,
  onKeyDown,
}) => {
  // Drag and drop setup for kanban view
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: lead.id,
      disabled: !draggable,
      data: { lead },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    // Touch-friendly: ensure card is grabbable
    touchAction: draggable ? "none" : "auto",
  };

  // Business logic: determine card styling based on lead quality
  const cardStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      cursor: draggable ? "grab" : "default",
    };

    // Color-code border based on lead score (quality)
    const borderColor = getLeadQualityColor(lead.score);
    baseStyle.borderLeft = `4px solid ${borderColor}`;

    // Highlight overdue leads with background color
    if (lead.isOverdue) {
      baseStyle.backgroundColor = "#fff5f5";
    }

    return baseStyle;
  }, [lead.score, lead.isOverdue, draggable]);

  // Get stage color for badge
  const stageColor = getStageColor(lead.currentStage);

  // ARIA label for screen readers
  const ariaLabel = `Lead: ${lead.name}, ${lead.company || "No company"}, Email: ${lead.email}, Stage: ${lead.currentStage}, Score: ${lead.score}${lead.isOverdue ? ", Overdue" : ""}`;

  // Render different variants
  if (variant === "compact") {
    return (
      <Card
        ref={setNodeRef}
        style={{ ...cardStyle, ...style }}
        shadow="xs"
        padding="xs"
        data-testid="lead-card"
        onKeyDown={onKeyDown}
        aria-label={ariaLabel}
        {...attributes}
        {...listeners}
        tabIndex={tabIndex}
        role="article"
      >
        <Group justify="space-between" wrap="nowrap">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" fw={500} truncate>
              {lead.name}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {lead.company || lead.email}
            </Text>
          </Box>
          <Group gap="xs" wrap="nowrap">
            <LeadScoreBadge score={lead.score} size="sm" />
            {lead.isOverdue && (
              <Badge color="red" size="xs" aria-label="Overdue">
                !
              </Badge>
            )}
          </Group>
        </Group>
      </Card>
    );
  }

  if (variant === "kanban") {
    return (
      <Card
        ref={setNodeRef}
        style={{ ...cardStyle, ...style }}
        shadow="sm"
        padding="md"
        data-testid="lead-card"
        onKeyDown={onKeyDown}
        aria-label={ariaLabel}
        {...attributes}
        {...listeners}
        tabIndex={tabIndex}
        role="article"
      >
        <Stack gap="xs">
          {/* Lead name and stage */}
          <Group justify="space-between" wrap="nowrap">
            <Text fw={500} size="sm" truncate style={{ flex: 1 }}>
              {lead.name}
            </Text>
            <Badge color={stageColor} size="sm">
              {lead.currentStage}
            </Badge>
          </Group>

          {/* Company and email */}
          {lead.company && (
            <Text size="xs" c="dimmed" truncate>
              {lead.company}
            </Text>
          )}
          <Text size="xs" truncate>
            {lead.email}
          </Text>

          {/* Business metrics */}
          <Group gap="xs">
            <LeadScoreBadge score={lead.score} />
            <LeadSourceBadge source={lead.source} />
            {lead.isOverdue && (
              <Badge color="red" size="xs" aria-label="Overdue">
                Overdue
              </Badge>
            )}
          </Group>

          {/* Quick actions */}
          {showQuickActions && onQuickActions && (
            <Group gap="xs" mt="xs" role="group" aria-label="Lead actions">
              <Button
                size="xs"
                variant="light"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickActions.qualify();
                }}
                aria-label={`Qualify ${lead.name}`}
              >
                Qualify
              </Button>
              <Button
                size="xs"
                variant="light"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickActions.scheduleFollowUp();
                }}
                aria-label={`Schedule follow-up for ${lead.name}`}
              >
                Follow-up
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickActions.viewDetails();
                }}
                aria-label={`View details for ${lead.name}`}
              >
                Details
              </Button>
            </Group>
          )}
        </Stack>
      </Card>
    );
  }

  // Default: list variant
  return (
    <Card
      ref={setNodeRef}
      style={{ ...cardStyle, ...style }}
      shadow="sm"
      padding="md"
      data-testid="lead-card"
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      {...attributes}
      {...listeners}
      tabIndex={tabIndex}
      role="article"
    >
      <Stack gap="xs">
        {/* Lead name and stage */}
        <Group justify="space-between">
          <Text fw={500}>{lead.name}</Text>
          <Badge color={stageColor}>{lead.currentStage}</Badge>
        </Group>

        {/* Company */}
        {lead.company && (
          <Text size="sm" c="dimmed">
            {lead.company}
          </Text>
        )}

        {/* Contact information */}
        <Group gap="md">
          <Text size="sm">{lead.email}</Text>
          {lead.phone && (
            <Text size="sm" c="dimmed">
              {lead.phone}
            </Text>
          )}
        </Group>

        {/* Assigned user */}
        {lead.assignedToName && (
          <Text size="xs" c="dimmed">
            Assigned to: {lead.assignedToName}
          </Text>
        )}

        {/* Business metrics */}
        <Group gap="xs">
          <LeadScoreBadge score={lead.score} />
          <LeadSourceBadge source={lead.source} />
          {lead.isQualified && (
            <Badge color="green" variant="light" aria-label="Qualified">
              Qualified
            </Badge>
          )}
          {lead.isOverdue && (
            <Badge color="red" variant="filled" aria-label="Overdue">
              Overdue
            </Badge>
          )}
          {lead.nextFollowUpDate && (
            <Tooltip label={`Next follow-up: ${lead.nextFollowUpDate}`}>
              <Badge
                color="blue"
                variant="light"
                aria-label={`Follow-up scheduled for ${lead.nextFollowUpDate}`}
              >
                Follow-up scheduled
              </Badge>
            </Tooltip>
          )}
        </Group>

        {/* Quick actions for efficiency */}
        {showQuickActions && onQuickActions && (
          <Group gap="xs" mt="xs" role="group" aria-label="Lead actions">
            <Button
              size="xs"
              variant="light"
              onClick={(e) => {
                e.stopPropagation();
                onQuickActions.qualify();
              }}
              aria-label={`Qualify ${lead.name}`}
            >
              Qualify
            </Button>
            <Button
              size="xs"
              variant="light"
              onClick={(e) => {
                e.stopPropagation();
                onQuickActions.scheduleFollowUp();
              }}
              aria-label={`Schedule follow-up for ${lead.name}`}
            >
              Schedule Follow-up
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onQuickActions.viewDetails();
              }}
              aria-label={`View details for ${lead.name}`}
            >
              View Details
            </Button>
          </Group>
        )}
      </Stack>
    </Card>
  );
};

/**
 * Business logic: Get color based on lead quality score
 * - High quality (80-100): Green
 * - Medium quality (50-79): Blue
 * - Low quality (0-49): Orange
 */
function getLeadQualityColor(score: number): string {
  if (score >= 80) {
    return "#40c057";
  } // Green
  if (score >= 50) {
    return "#228be6";
  } // Blue
  return "#fd7e14"; // Orange
}

/**
 * Business logic: Get color for pipeline stage badge
 * This can be customized based on stage types
 */
function getStageColor(stage: string): string {
  const stageLower = stage.toLowerCase();

  if (stageLower.includes("new") || stageLower.includes("lead")) {
    return "blue";
  }
  if (stageLower.includes("qualified") || stageLower.includes("contacted")) {
    return "cyan";
  }
  if (stageLower.includes("proposal") || stageLower.includes("negotiation")) {
    return "grape";
  }
  if (stageLower.includes("won") || stageLower.includes("closed")) {
    return "green";
  }
  if (stageLower.includes("lost")) {
    return "red";
  }

  return "gray";
}
