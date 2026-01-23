import React from "react";
import { Paper, Text, Stack, Timeline, Group, Badge } from "@mantine/core";
import {
  IconActivity,
  IconUserPlus,
  IconEdit,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";
import { t } from "@lingui/core/macro";

interface ContactActivityTimelineProps {
  contactId: string;
}

/**
 * ContactActivityTimeline Component
 *
 * Placeholder component for contact activity timeline.
 * This would typically include:
 * - Chronological list of all contact interactions
 * - Activity types (created, updated, email sent, call made, etc.)
 * - Timestamps and user attribution
 * - Activity details and context
 */
export const ContactActivityTimeline: React.FC<
  ContactActivityTimelineProps
> = ({ contactId }) => {
  // Mock data for demonstration
  const mockActivities = [
    {
      id: "1",
      type: "created",
      title: "Contact created",
      description: "Contact was added to the system",
      timestamp: "2024-01-23T10:30:00Z",
      user: "John Doe",
      icon: IconUserPlus,
      color: "green",
    },
    {
      id: "2",
      type: "updated",
      title: "Contact updated",
      description: "Lead score updated to 85",
      timestamp: "2024-01-22T14:15:00Z",
      user: "Jane Smith",
      icon: IconEdit,
      color: "blue",
    },
    {
      id: "3",
      type: "email",
      title: "Email sent",
      description: "Welcome email sent to contact",
      timestamp: "2024-01-21T09:45:00Z",
      user: "System",
      icon: IconMail,
      color: "orange",
    },
  ];

  return (
    <Stack gap="md">
      <Text size="lg" fw={600}>
        {t`Activity Timeline`}
      </Text>

      <Paper p="lg" withBorder>
        {mockActivities.length > 0 ? (
          <Timeline
            active={mockActivities.length}
            bulletSize={24}
            lineWidth={2}
          >
            {mockActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <Timeline.Item
                  key={activity.id}
                  bullet={<IconComponent size={12} />}
                  title={activity.title}
                  color={activity.color}
                >
                  <Text size="sm" c="dimmed" mb="xs">
                    {activity.description}
                  </Text>
                  <Group gap="xs">
                    <Badge variant="light" size="xs">
                      {activity.user}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {new Date(activity.timestamp).toLocaleString()}
                    </Text>
                  </Group>
                </Timeline.Item>
              );
            })}
          </Timeline>
        ) : (
          <Stack gap="md" align="center" py="xl">
            <IconActivity size={48} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed" ta="center">
              {t`No activities yet for this contact.`}
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              {t`Activities will appear here as you interact with this contact.`}
            </Text>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
};
