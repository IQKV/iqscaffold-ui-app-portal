import React, { useState } from "react";
import {
  Container,
  Title,
  Group,
  Button,
  Stack,
  Paper,
  Text,
  Badge,
  Alert,
  LoadingOverlay,
  Box,
  Divider,
  Modal,
  Avatar,
  Grid,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconBuilding,
  IconStar,
  IconAlertCircle,
  IconNotes,
  IconCalendar,
  IconUser,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { contactApi } from "@/shared/api";
import { ContactForm } from "@/entities/crm/ui";
import { LeadScoreBadge } from "@/entities/crm/ui";

/**
 * ContactDetailPage Component
 *
 * Detailed view of a single contact with edit and delete capabilities.
 *
 * Features:
 * - Contact information display
 * - Edit contact
 * - Delete contact
 * - Responsive design
 */
export const ContactDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams({ strict: false }) as { id: string };
  const search = useSearch({ strict: false }) as { edit?: boolean };

  const [editModalOpen, setEditModalOpen] = useState(search?.edit || false);

  // Fetch contact
  const {
    data: contact,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["contact", id],
    queryFn: () => contactApi.getContact(id),
    enabled: !!id,
  });

  // Update contact mutation
  const updateMutation = useMutation({
    mutationFn: (values: any) => contactApi.updateContact(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact", id] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setEditModalOpen(false);
      notifications.show({
        title: "Success",
        message: "Contact updated successfully",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update contact",
        color: "red",
      });
    },
  });

  // Delete contact mutation
  const deleteMutation = useMutation({
    mutationFn: () => contactApi.deleteContact(id),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Contact deleted successfully",
        color: "green",
      });
      navigate({ to: "/contacts" });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete contact",
        color: "red",
      });
    },
  });

  // Handlers
  const handleUpdateContact = (values: any) => {
    updateMutation.mutate(values);
  };

  const handleDeleteContact = () => {
    if (!contact) return;

    modals.openConfirmModal({
      title: "Delete Contact",
      children: (
        <Text size="sm">
          Are you sure you want to delete {contact.firstName}{" "}
          {contact.lastName}? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "INACTIVE":
        return "gray";
      case "ARCHIVED":
        return "red";
      default:
        return "blue";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
        >
          Failed to load contact. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Box pos="relative" mih={400}>
        <LoadingOverlay visible={isLoading} />

        {contact && (
          <Stack gap="lg">
            {/* Header */}
            <Group justify="space-between">
              <Group>
                <Button
                  variant="subtle"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => navigate({ to: "/contacts" })}
                >
                  Back to Contacts
                </Button>
              </Group>
              <Group>
                <Button
                  variant="light"
                  leftSection={<IconEdit size={16} />}
                  onClick={() => setEditModalOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="light"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={handleDeleteContact}
                  loading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </Group>
            </Group>

            {/* Contact header */}
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Group align="flex-start">
                <Avatar
                  size={80}
                  radius="xl"
                  color="blue"
                  styles={{ placeholder: { fontSize: 32 } }}
                >
                  {contact.firstName[0]}
                  {contact.lastName[0]}
                </Avatar>
                <Box style={{ flex: 1 }}>
                  <Group justify="space-between" align="flex-start">
                    <Box>
                      <Title order={2}>
                        {contact.firstName} {contact.lastName}
                      </Title>
                      {contact.jobTitle && (
                        <Group gap={4} mt={4}>
                          <IconBriefcase size={16} />
                          <Text size="lg" c="dimmed">
                            {contact.jobTitle}
                          </Text>
                        </Group>
                      )}
                    </Box>
                    <Group>
                      <Badge
                        color={getStatusColor(contact.status)}
                        variant="light"
                        size="lg"
                      >
                        {contact.status}
                      </Badge>
                      <LeadScoreBadge score={contact.leadScore} size="lg" />
                    </Group>
                  </Group>
                </Box>
              </Group>
            </Paper>

            {/* Contact information */}
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper shadow="sm" p="lg" radius="md" withBorder>
                  <Title order={4} mb="md">
                    Contact Information
                  </Title>
                  <Stack gap="md">
                    <Group gap="xs">
                      <IconMail size={18} />
                      <Box>
                        <Text size="xs" c="dimmed">
                          Email
                        </Text>
                        <Text size="sm">{contact.email}</Text>
                      </Box>
                    </Group>
                    {contact.phone && (
                      <Group gap="xs">
                        <IconPhone size={18} />
                        <Box>
                          <Text size="xs" c="dimmed">
                            Phone
                          </Text>
                          <Text size="sm">{contact.phone}</Text>
                        </Box>
                      </Group>
                    )}
                    {contact.companyId && (
                      <Group gap="xs">
                        <IconBuilding size={18} />
                        <Box>
                          <Text size="xs" c="dimmed">
                            Company ID
                          </Text>
                          <Text size="sm">{contact.companyId}</Text>
                        </Box>
                      </Group>
                    )}
                    <Group gap="xs">
                      <IconStar size={18} />
                      <Box>
                        <Text size="xs" c="dimmed">
                          Lead Score
                        </Text>
                        <Text size="sm">{contact.leadScore}/100</Text>
                      </Box>
                    </Group>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper shadow="sm" p="lg" radius="md" withBorder>
                  <Title order={4} mb="md">
                    Metadata
                  </Title>
                  <Stack gap="md">
                    <Group gap="xs">
                      <IconCalendar size={18} />
                      <Box>
                        <Text size="xs" c="dimmed">
                          Created
                        </Text>
                        <Text size="sm">{formatDate(contact.createdAt)}</Text>
                      </Box>
                    </Group>
                    <Group gap="xs">
                      <IconUser size={18} />
                      <Box>
                        <Text size="xs" c="dimmed">
                          Created By
                        </Text>
                        <Text size="sm">{contact.createdBy}</Text>
                      </Box>
                    </Group>
                    <Group gap="xs">
                      <IconCalendar size={18} />
                      <Box>
                        <Text size="xs" c="dimmed">
                          Last Updated
                        </Text>
                        <Text size="sm">{formatDate(contact.updatedAt)}</Text>
                      </Box>
                    </Group>
                    <Group gap="xs">
                      <IconUser size={18} />
                      <Box>
                        <Text size="xs" c="dimmed">
                          Last Modified By
                        </Text>
                        <Text size="sm">{contact.lastModifiedBy}</Text>
                      </Box>
                    </Group>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>

            {/* Notes */}
            {contact.notes && (
              <Paper shadow="sm" p="lg" radius="md" withBorder>
                <Group gap="xs" mb="md">
                  <IconNotes size={18} />
                  <Title order={4}>Notes</Title>
                </Group>
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {contact.notes}
                </Text>
              </Paper>
            )}
          </Stack>
        )}
      </Box>

      {/* Edit contact modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Contact"
        size="lg"
      >
        {contact && (
          <ContactForm
            contact={contact}
            onSubmit={handleUpdateContact}
            onCancel={() => setEditModalOpen(false)}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>
    </Container>
  );
};
