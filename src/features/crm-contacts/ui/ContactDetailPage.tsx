import React, { useState } from "react";
import {
  Container,
  Stack,
  Group,
  Text,
  Button,
  Paper,
  Badge,
  Tabs,
  Loader,
  Center,
  Alert,
  ActionIcon,
  Tooltip,
  Box,
  Avatar,
  Divider,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconEdit,
  IconMail,
  IconPhone,
  IconBuilding,
  IconUser,
  IconCalendar,
  IconNotes,
  IconTrash,
} from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useContactQuery, LeadScoreBadge, useDeleteContactMutation } from "@/entities/crm";
import { ContactDetailSkeleton } from "./skeletons";
import { ContactEditModal } from "./ContactEditModal";
import { ContactNotesSection } from "./ContactNotesSection";
import { ContactActivityTimeline } from "./ContactActivityTimeline";
import { formatDate } from "@/shared/lib/utils";

/**
 * ContactDetailPage Component
 *
 * Comprehensive contact detail view with:
 * - Contact header with quick actions (edit, email, call)
 * - Tabbed interface (Overview, Notes, Activities)
 * - Company information display
 * - Lead score and status indicators
 * - Contact history and conversion tracking
 *
 * Requirements: Contact management, CRM integration
 */
export const ContactDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { contactId } = useParams({ strict: false }) as { contactId: string };
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  const [editModalOpened, setEditModalOpened] = useState(false);

  // Fetch contact data
  const {
    data: contact,
    isLoading,
    error,
    refetch,
  } = useContactQuery(contactId);

  // Delete mutation
  const deleteContactMutation = useDeleteContactMutation();

  // Handle edit contact
  const handleEditContact = () => {
    setEditModalOpened(true);
  };

  // Handle delete contact
  const handleDeleteContact = () => {
    if (!contact) return;

    modals.openConfirmModal({
      title: t`Delete Contact`,
      children: (
        <Text>
          {t`Are you sure you want to delete`} <strong>{contact.firstName} {contact.lastName}</strong>?
          {" "}{t`This action cannot be undone.`}
        </Text>
      ),
      labels: { confirm: t`Delete`, cancel: t`Cancel` },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteContactMutation.mutateAsync(contact.id);
          notifications.show({
            title: t`Success`,
            message: t`Contact deleted successfully`,
            color: "green",
          });
          navigate({ to: "/crm/contacts" });
        } catch (error: any) {
          notifications.show({
            title: t`Error`,
            message: error.message || t`Failed to delete contact`,
            color: "red",
          });
        }
      },
    });
  };

  // Handle email contact
  const handleEmailContact = () => {
    if (contact?.email) {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  // Handle call contact
  const handleCallContact = () => {
    if (contact?.phone) {
      window.location.href = `tel:${contact.phone}`;
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate({ to: "/crm/contacts" });
  };

  // Loading state
  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <ContactDetailSkeleton />
      </Container>
    );
  }

  // Error state
  if (error || !contact) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" title={t`Error loading contact`}>
          <Stack gap="sm">
            <Text>{t`Failed to load contact details. Please try again.`}</Text>
            <Group>
              <Button onClick={() => refetch()} variant="light">
                {t`Retry`}
              </Button>
              <Button onClick={handleBack} variant="outline">
                {t`Back to Contacts`}
              </Button>
            </Group>
          </Stack>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <ActionIcon
              variant="subtle"
              onClick={handleBack}
              size="lg"
              aria-label="Back to contacts"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <div>
              <Text size="xl" fw={700}>
                {contact.firstName} {contact.lastName}
              </Text>
              <Text size="sm" c="dimmed">
                Contact Details
              </Text>
            </div>
          </Group>

          <Group>
            {contact.email && (
              <Tooltip label={t`Send email`}>
                <ActionIcon
                  variant="light"
                  color="blue"
                  size="lg"
                  onClick={handleEmailContact}
                >
                  <IconMail size={18} />
                </ActionIcon>
              </Tooltip>
            )}
            {contact.phone && (
              <Tooltip label={t`Call contact`}>
                <ActionIcon
                  variant="light"
                  color="green"
                  size="lg"
                  onClick={handleCallContact}
                >
                  <IconPhone size={18} />
                </ActionIcon>
              </Tooltip>
            )}
            <Button
              leftSection={<IconEdit size={16} />}
              onClick={handleEditContact}
              variant="default"
            >
              {t`Edit Contact`}
            </Button>
            <Button
              leftSection={<IconTrash size={16} />}
              onClick={handleDeleteContact}
              color="red"
              variant="light"
              loading={deleteContactMutation.isPending}
            >
              {t`Delete`}
            </Button>
          </Group>
        </Group>

        {/* Contact Overview Card */}
        <Paper p="xl" withBorder>
          <Group align="flex-start" wrap="nowrap">
            <Avatar
              size="xl"
              radius="md"
              color="blue"
              name={`${contact.firstName} ${contact.lastName}`}
            >
              <IconUser size={32} />
            </Avatar>

            <Box style={{ flex: 1 }}>
              <Group justify="space-between" align="flex-start" mb="md">
                <div>
                  <Text size="xl" fw={600} mb="xs">
                    {contact.firstName} {contact.lastName}
                  </Text>
                  {contact.jobTitle && (
                    <Text size="md" c="dimmed" mb="xs">
                      {contact.jobTitle}
                    </Text>
                  )}
                  {contact.company?.name && (
                    <Group gap="xs" mb="xs">
                      <IconBuilding size={16} />
                      <Text size="sm">{contact.company.name}</Text>
                    </Group>
                  )}
                </div>

                <Group gap="xs">
                  <Badge
                    color={
                      contact.status === "ACTIVE"
                        ? "green"
                        : contact.status === "INACTIVE"
                          ? "gray"
                          : "blue"
                    }
                    variant="light"
                  >
                    {contact.status}
                  </Badge>
                  <LeadScoreBadge score={contact.leadScore} />
                </Group>
              </Group>

              <Divider mb="md" />

              <Group gap="xl">
                {contact.email && (
                  <Group gap="xs">
                    <IconMail size={16} />
                    <Text size="sm">{contact.email}</Text>
                  </Group>
                )}
                {contact.phone && (
                  <Group gap="xs">
                    <IconPhone size={16} />
                    <Text size="sm">{contact.phone}</Text>
                  </Group>
                )}
                <Group gap="xs">
                  <IconCalendar size={16} />
                  <Text size="sm">Created {formatDate(contact.createdAt)}</Text>
                </Group>
              </Group>

              {contact.convertedFromLeadId && (
                <Group gap="xs" mt="md">
                  <Badge color="blue" variant="outline">
                    Converted from Lead #{contact.convertedFromLeadId}
                  </Badge>
                  {contact.convertedAt && (
                    <Text size="xs" c="dimmed">
                      on {formatDate(contact.convertedAt)}
                    </Text>
                  )}
                </Group>
              )}
            </Box>
          </Group>
        </Paper>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconUser size={16} />}>
              {t`Overview`}
            </Tabs.Tab>
            <Tabs.Tab value="notes" leftSection={<IconNotes size={16} />}>
              {t`Notes`}
            </Tabs.Tab>
            <Tabs.Tab
              value="activities"
              leftSection={<IconCalendar size={16} />}
            >
              {t`Activities`}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="lg">
            <Stack gap="lg">
              {/* Company Information */}
              {contact.company && (
                <Paper p="lg" withBorder>
                  <Text size="lg" fw={600} mb="md">
                    Company Information
                  </Text>
                  <Stack gap="sm">
                    <Group>
                      <Text fw={500} w={120}>
                        Company:
                      </Text>
                      <Text>{contact.company.name}</Text>
                    </Group>
                    {contact.company.website && (
                      <Group>
                        <Text fw={500} w={120}>
                          Website:
                        </Text>
                        <Text
                          component="a"
                          href={contact.company.website}
                          target="_blank"
                          c="blue"
                        >
                          {contact.company.website}
                        </Text>
                      </Group>
                    )}
                    {contact.company.industry && (
                      <Group>
                        <Text fw={500} w={120}>
                          Industry:
                        </Text>
                        <Text>{contact.company.industry}</Text>
                      </Group>
                    )}
                    {contact.company.size && (
                      <Group>
                        <Text fw={500} w={120}>
                          Size:
                        </Text>
                        <Text>{contact.company.size}</Text>
                      </Group>
                    )}
                  </Stack>
                </Paper>
              )}

              {/* Additional Notes */}
              {contact.notes && (
                <Paper p="lg" withBorder>
                  <Text size="lg" fw={600} mb="md">
                    Notes
                  </Text>
                  <Text style={{ whiteSpace: "pre-wrap" }}>
                    {contact.notes}
                  </Text>
                </Paper>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="notes" pt="lg">
            <ContactNotesSection contactId={contactId} />
          </Tabs.Panel>

          <Tabs.Panel value="activities" pt="lg">
            <ContactActivityTimeline contactId={contactId} />
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Edit Modal */}
      <ContactEditModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        contact={contact}
        onSuccess={() => {
          refetch();
          setEditModalOpened(false);
        }}
      />
    </Container>
  );
};
