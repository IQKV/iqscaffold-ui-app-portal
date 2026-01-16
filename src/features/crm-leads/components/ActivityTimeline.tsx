import React from "react";
import {
  Timeline,
  Text,
  Paper,
  Stack,
  Group,
  Badge,
  Alert,
  Loader,
  Center,
  ThemeIcon,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconArrowRight,
  IconNote,
  IconCalendar,
  IconCheck,
  IconStar,
  IconUserCheck,
} from "@tabler/icons-react";
import { useLeadActivities } from "@/entities/crm/api/crm-queries";
import { ActivityLogEntry, ActivityType } from "@/shared/api/crm/types";

interface ActivityTimelineProps {
  leadId: string;
}

/**
 * ActivityTimeline Component
 *
 * Displays activity history for a lead with:
 * - Activities sorted by timestamp descending
 * - Different activity types with appropriate icons
 * - User context and metadata display
 *
 * Requirements: 4.3, 7.1, 7.2, 7.3
 */
export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  leadId,
}) => {
  // Fetch activities
  const { data: activities, isLoading, error } = useLeadActivities(leadId);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get icon for activity type
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "LEAD_CREATED":
        return <IconPlus size={16} />;
      case "LEAD_UPDATED":
        return <IconEdit size={16} />;
      case "STAGE_CHANGED":
        return <IconArrowRight size={16} />;
      case "NOTE_ADDED":
        return <IconNote size={16} />;
      case "FOLLOWUP_SCHEDULED":
        return <IconCalendar size={16} />;
      case "FOLLOWUP_COMPLETED":
        return <IconCheck size={16} />;
      case "LEAD_QUALIFIED":
        return <IconStar size={16} />;
      case "LEAD_CONVERTED":
        return <IconUserCheck size={16} />;
      default:
        return <IconEdit size={16} />;
    }
  };

  // Get color for activity type
  const getActivityColor = (type: ActivityType): string => {
    switch (type) {
      case "LEAD_CREATED":
        return "blue";
      case "LEAD_UPDATED":
        return "gray";
      case "STAGE_CHANGED":
        return "violet";
      case "NOTE_ADDED":
        return "cyan";
      case "FOLLOWUP_SCHEDULED":
        return "orange";
      case "FOLLOWUP_COMPLETED":
        return "green";
      case "LEAD_QUALIFIED":
        return "yellow";
      case "LEAD_CONVERTED":
        return "teal";
      default:
        return "gray";
    }
  };

  // Get human-readable label for activity type
  const getActivityLabel = (type: ActivityType): string => {
    switch (type) {
      case "LEAD_CREATED":
        return "Lead Created";
      case "LEAD_UPDATED":
        return "Lead Updated";
      case "STAGE_CHANGED":
        return "Stage Changed";
      case "NOTE_ADDED":
        return "Note Added";
      case "FOLLOWUP_SCHEDULED":
        return "Follow-up Scheduled";
      case "FOLLOWUP_COMPLETED":
        return "Follow-up Completed";
      case "LEAD_QUALIFIED":
        return "Lead Qualified";
      case "LEAD_CONVERTED":
        return "Lead Converted";
      default:
        return type;
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert color="red" title={t`Error loading activities`}>
        {t`Failed to load activity history. Please try again.`}
      </Alert>
    );
  }

  // Sort activities by timestamp descending
  const sortedActivities = [...(activities || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Render empty state
  if (sortedActivities.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Center>
          <Text c="dimmed">No activity history yet.</Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Timeline active={sortedActivities.length} bulletSize={32} lineWidth={2}>
      {sortedActivities.map((activity) => (
        <Timeline.Item
          key={activity.id}
          bullet={
            <ThemeIcon
              size={32}
              variant="light"
              color={getActivityColor(activity.activityType)}
            >
              {getActivityIcon(activity.activityType)}
            </ThemeIcon>
          }
        >
          <Paper p="md" withBorder>
            <Stack gap="xs">
              {/* Activity header */}
              <Group justify="space-between">
                <Badge color={getActivityColor(activity.activityType)}>
                  {getActivityLabel(activity.activityType)}
                </Badge>
                <Text size="xs" c="dimmed">
                  {formatDate(activity.timestamp)}
                </Text>
              </Group>

              {/* Activity description */}
              <Text size="sm">{activity.description}</Text>

              {/* User context */}
              <Text size="xs" c="dimmed">
                by {activity.performedByName}
              </Text>

              {/* Metadata (if any) */}
              {activity.metadata &&
                Object.keys(activity.metadata).length > 0 && (
                  <Paper p="xs" bg="gray.0" withBorder>
                    <Stack gap={4}>
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <Group key={key} gap="xs">
                          <Text size="xs" fw={500}>
                            {key}:
                          </Text>
                          <Text size="xs" c="dimmed">
                            {String(value)}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  </Paper>
                )}
            </Stack>
          </Paper>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};
