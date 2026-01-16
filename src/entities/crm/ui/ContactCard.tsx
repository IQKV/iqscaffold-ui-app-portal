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
  Avatar,
  ActionIcon,
} from "@mantine/core";
import {
  IconMail,
  IconPhone,
  IconBriefcase,
  IconBuilding,
  IconStar,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { Contact, ContactStatus } from "@/shared/api/contact/types";
import { LeadScoreBadge } from "./LeadScoreBadge";

interface ContactCardProps {
  contact: Contact;
  variant?: "list" | "grid" | "compact";
  showQuickActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  tabIndex?: number;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

/**
 * ContactCard Component
 *
 * Business-focused card component for displaying contact information
 * with variants for different views (list, grid, compact).
 *
 * Features:
 * - Business-focused styling based on contact status and lead score
 * - Quick actions for common contact management tasks
 * - Visual indicators for contact status
 * - Responsive design for different contexts
 * - Keyboard navigation and ARIA support
 */
export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  variant = "list",
  showQuickActions = true,
  onEdit,
  onDelete,
  onClick,
  tabIndex = 0,
  onKeyDown,
}) => {
  // Business logic: determine card styling based on contact status
  const cardStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      cursor: onClick ? "pointer" : "default",
    };

    // Color-code border based on status
    const borderColor = getStatusColor(contact.status);
    baseStyle.borderLeft = `4px solid ${borderColor}`;

    // Dim inactive/archived contacts
    if (contact.status !== "ACTIVE") {
      baseStyle.opacity = 0.7;
    }

    return baseStyle;
  }, [contact.status, onClick]);

  // Get initials for avatar
  const initials =
    `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();

  // ARIA label for screen readers
  const ariaLabel = `Contact: ${contact.firstName} ${contact.lastName}, ${contact.jobTitle || "No title"}, ${contact.email}, Status: ${contact.status}, Lead Score: ${contact.leadScore}`;

  // Render compact variant
  if (variant === "compact") {
    return (
      <Card
        shadow="xs"
        padding="sm"
        radius="md"
        withBorder
        style={cardStyle}
        onClick={onClick}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        role={onClick ? "button" : undefined}
        aria-label={ariaLabel}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Avatar color="blue" radius="xl" size="sm">
              {initials}
            </Avatar>
            <Box style={{ minWidth: 0 }}>
              <Text size="sm" fw={500} truncate>
                {contact.firstName} {contact.lastName}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {contact.email}
              </Text>
            </Box>
          </Group>
          <Group gap="xs">
            <ContactStatusBadge status={contact.status} size="sm" />
            <LeadScoreBadge score={contact.leadScore} size="sm" />
          </Group>
        </Group>
      </Card>
    );
  }

  // Render grid variant
  if (variant === "grid") {
    return (
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={cardStyle}
        onClick={onClick}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        role={onClick ? "button" : undefined}
        aria-label={ariaLabel}
      >
        <Stack gap="md">
          {/* Header with avatar and actions */}
          <Group justify="space-between" align="flex-start">
            <Group gap="md">
              <Avatar color="blue" radius="xl" size="lg">
                {initials}
              </Avatar>
              <Box>
                <Text size="lg" fw={600}>
                  {contact.firstName} {contact.lastName}
                </Text>
                {contact.jobTitle && (
                  <Group gap={4}>
                    <IconBriefcase size={14} />
                    <Text size="sm" c="dimmed">
                      {contact.jobTitle}
                    </Text>
                  </Group>
                )}
              </Box>
            </Group>
            {showQuickActions && (
              <Group gap="xs">
                {onEdit && (
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    aria-label="Edit contact"
                  >
                    <IconEdit size={18} />
                  </ActionIcon>
                )}
                {onDelete && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    aria-label="Delete contact"
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                )}
              </Group>
            )}
          </Group>

          {/* Contact information */}
          <Stack gap="xs">
            <Group gap="xs">
              <IconMail size={16} />
              <Text size="sm">{contact.email}</Text>
            </Group>
            {contact.phone && (
              <Group gap="xs">
                <IconPhone size={16} />
                <Text size="sm">{contact.phone}</Text>
              </Group>
            )}
            {contact.companyId && (
              <Group gap="xs">
                <IconBuilding size={16} />
                <Text size="sm">Company ID: {contact.companyId}</Text>
              </Group>
            )}
          </Stack>

          {/* Status and score */}
          <Group justify="space-between">
            <ContactStatusBadge status={contact.status} />
            <LeadScoreBadge score={contact.leadScore} />
          </Group>
        </Stack>
      </Card>
    );
  }

  // Render list variant (default)
  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={cardStyle}
      onClick={onClick}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      role={onClick ? "button" : undefined}
      aria-label={ariaLabel}
    >
      <Group justify="space-between" wrap="nowrap">
        {/* Left: Contact info */}
        <Group gap="md" style={{ flex: 1, minWidth: 0 }}>
          <Avatar color="blue" radius="xl" size="md">
            {initials}
          </Avatar>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text size="md" fw={600} truncate>
              {contact.firstName} {contact.lastName}
            </Text>
            <Group gap="md" mt={4}>
              <Group gap={4}>
                <IconMail size={14} />
                <Text size="sm" c="dimmed" truncate>
                  {contact.email}
                </Text>
              </Group>
              {contact.phone && (
                <Group gap={4}>
                  <IconPhone size={14} />
                  <Text size="sm" c="dimmed">
                    {contact.phone}
                  </Text>
                </Group>
              )}
              {contact.jobTitle && (
                <Group gap={4}>
                  <IconBriefcase size={14} />
                  <Text size="sm" c="dimmed">
                    {contact.jobTitle}
                  </Text>
                </Group>
              )}
            </Group>
          </Box>
        </Group>

        {/* Right: Status, score, and actions */}
        <Group gap="md" wrap="nowrap">
          <ContactStatusBadge status={contact.status} />
          <LeadScoreBadge score={contact.leadScore} />
          {showQuickActions && (
            <Group gap="xs">
              {onEdit && (
                <Tooltip label="Edit contact">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    aria-label="Edit contact"
                  >
                    <IconEdit size={18} />
                  </ActionIcon>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip label="Delete contact">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    aria-label="Delete contact"
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          )}
        </Group>
      </Group>
    </Card>
  );
};

// Helper component for contact status badge
interface ContactStatusBadgeProps {
  status: ContactStatus;
  size?: "sm" | "md" | "lg";
}

const ContactStatusBadge: React.FC<ContactStatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const config = getStatusConfig(status);

  return (
    <Badge color={config.color} variant="light" size={size}>
      {config.label}
    </Badge>
  );
};

// Helper functions
function getStatusColor(status: ContactStatus): string {
  switch (status) {
    case "ACTIVE":
      return "#40c057"; // Green
    case "INACTIVE":
      return "#868e96"; // Gray
    case "ARCHIVED":
      return "#fa5252"; // Red
    default:
      return "#228be6"; // Blue
  }
}

function getStatusConfig(status: ContactStatus) {
  switch (status) {
    case "ACTIVE":
      return { color: "green", label: "Active" };
    case "INACTIVE":
      return { color: "gray", label: "Inactive" };
    case "ARCHIVED":
      return { color: "red", label: "Archived" };
    default:
      return { color: "blue", label: status };
  }
}
