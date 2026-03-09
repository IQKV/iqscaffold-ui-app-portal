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
  IconNote,
  IconStar,
  IconUserCheck,
  IconBuilding,
  IconMail,
  IconPhone,
  IconCalendar,
  IconTrash,
} from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import { useContactActivitiesQuery } from "@/entities/contact";
import type {
  ContactActivity,
  ContactActivityType,
} from "@/shared/api/contact/types";

interface ContactActivityTimelineProps {
  contactId: string;
}

/**
 * ContactActivityTimeline Component
 *
 * Displays activity history for a contact with:
 * - Activities sorted by timestamp descending
 * - Different activity types with appropriate icons
 * - User context and metadata display
 *
 * Follows the same pattern as LeadActivityTimeline for consistency
 */
export const ContactActivityTimeline: React.FC<
  ContactActivityTimelineProps
> = ({ contactId }) => {
  // Fetch activities
  const { data: activities, isLoading, error } =
    useContactActivitiesQuery(contactId);

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
  const getActivityIcon = (type: ContactActivityType) => {
    switch (type) {
      case "CONTACT_CREATED":
        return <IconPlus size={16} />;
      case "CONTACT_UPDATED":
        return <IconEdit size={16} />;
      case "STATUS_CHANGED":
        return <IconUserCheck size={16} />;
      case "NOTE_ADDED":
      case "NOTE_UPDATED":
        return <IconNote size={16} />;
      case "NOTE_DELETED":
        return <IconTrash size={16} />;
      case "LEAD_SCORE_UPDATED":
        return <IconStar size={16} />;
      case "COMPANY_ASSOCIATED":
        return <IconBuilding size={16} />;
      case "EMAIL_SENT":
        return <IconMail size={16} />;
      case "CALL_MADE":
        return <IconPhone size={16} />;
      case "MEETING_SCHEDULED":
        return <IconCalendar size={16} />;
      case "CONVERTED_FROM_LEAD":
        return <IconUserCheck size={16} />;
      default:
        return <IconEdit size={16} />;
    }
  };

  // Get color for activity type
  const getActivityColor = (type: ContactActivityType): string => {
    switch (type) {
      case "CONTACT_CREATED":
        return "blue";
      case "CONTACT_UPDATED":
        return "gray";
      case "STATUS_CHANGED":
        return "violet";
      case "NOTE_ADDED":
      case "NOTE_UPDATED":
        return "cyan";
      case "NOTE_DELETED":
        return "red";
      case "LEAD_SCORE_UPDATED":
        return "yellow";
      case "COMPANY_ASSOCIATED":
        return "grape";
      case "EMAIL_SENT":
        return "orange";
      case "CALL_MADE":
        return "green";
      case "MEETING_SCHEDULED":
        return "pink";
      case "CONVERTED_FROM_LEAD":
        return "teal";
      default:
        return "gray";
    }
  };

  // Get human-readable label for activity type
  const getActivityLabel = (type: ContactActivityType): string => {
    switch (type) {
      case "CONTACT_CREATED":
        return t`Contact Created`;
      case "CONTACT_UPDATED":
        return t`Contact Updated`;
      case "STATUS_CHANGED":
        return t`Status Changed`;
      case "NOTE_ADDED":
        return t`Note Added`;
      case "NOTE_UPDATED":
        return t`Note Updated`;
      case "NOTE_DELETED":
        return t`Note Deleted`;
      case "LEAD_SCORE_UPDATED":
        return t`Lead Score Updated`;
      case "COMPANY_ASSOCIATED":
        return t`Company Associated`;
      case "EMAIL_SENT":
        return t`Email Sent`;
      case "CALL_MADE":
        return t`Call Made`;
      case "MEETING_SCHEDULED":
        return t`Meeting Scheduled`;
      case "CONVERTED_FROM_LEAD":
        return t`Converted from Lead`;
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
          <Text c="dimmed">{t`No activity history yet.`}</Text>
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
                {t`by`} {activity.performedByName}
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
