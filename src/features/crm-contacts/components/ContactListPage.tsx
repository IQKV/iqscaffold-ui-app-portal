import React, { useState } from "react";
import {
  Container,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Stack,
  Pagination,
  Modal,
  Text,
  Alert,
  LoadingOverlay,
  Box,
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { contactApi, ContactStatus } from "@/shared/api";
import { ContactCard } from "@/entities/crm/ui";
import { ContactForm } from "@/entities/crm/ui";

/**
 * ContactListPage Component
 *
 * Main page for listing and managing contacts with filtering,
 * pagination, and CRUD operations.
 *
 * Features:
 * - Contact listing with pagination
 * - Search and filtering
 * - Create, edit, delete operations
 * - Responsive design
 */
export const ContactListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "">("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch contacts
  const {
    data: contactsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["contacts", page, search, statusFilter],
    queryFn: () =>
      contactApi.getContacts({
        page,
        size: 10,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  });

  // Create contact mutation
  const createMutation = useMutation({
    mutationFn: contactApi.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setCreateModalOpen(false);
      notifications.show({
        title: "Success",
        message: "Contact created successfully",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create contact",
        color: "red",
      });
    },
  });

  // Delete contact mutation
  const deleteMutation = useMutation({
    mutationFn: contactApi.deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      notifications.show({
        title: "Success",
        message: "Contact deleted successfully",
        color: "green",
      });
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
  const handleCreateContact = (values: any) => {
    createMutation.mutate(values);
  };

  const handleDeleteContact = (id: number, name: string) => {
    modals.openConfirmModal({
      title: "Delete Contact",
      children: (
        <Text size="sm">
          Are you sure you want to delete {name}? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const handleViewContact = (id: number) => {
    navigate({ to: `/contacts/${id}` });
  };

  const handleEditContact = (id: number) => {
    navigate({ to: `/contacts/${id}`, search: { edit: true } });
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Title order={2}>Contacts</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpen(true)}
          >
            New Contact
          </Button>
        </Group>

        {/* Filters */}
        <Group>
          <TextInput
            placeholder="Search contacts..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(0); // Reset to first page on search
            }}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by status"
            leftSection={<IconFilter size={16} />}
            data={[
              { value: "", label: "All Statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "ARCHIVED", label: "Archived" },
            ]}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value as ContactStatus | "");
              setPage(0); // Reset to first page on filter
            }}
            clearable
            style={{ width: 200 }}
          />
        </Group>

        {/* Error state */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
          >
            Failed to load contacts. Please try again.
          </Alert>
        )}

        {/* Loading state */}
        <Box pos="relative" mih={400}>
          <LoadingOverlay visible={isLoading} />

          {/* Contact list */}
          {contactsData && contactsData.content.length > 0 ? (
            <Stack gap="md">
              {contactsData.content.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  variant="list"
                  showQuickActions
                  onClick={() => handleViewContact(contact.id)}
                  onEdit={() => handleEditContact(contact.id)}
                  onDelete={() =>
                    handleDeleteContact(
                      contact.id,
                      `${contact.firstName} ${contact.lastName}`
                    )
                  }
                />
              ))}
            </Stack>
          ) : (
            !isLoading && (
              <Alert icon={<IconAlertCircle size={16} />} title="No contacts">
                {search || statusFilter
                  ? "No contacts match your search criteria."
                  : "No contacts yet. Create your first contact to get started."}
              </Alert>
            )
          )}
        </Box>

        {/* Pagination */}
        {contactsData && contactsData.totalPages > 1 && (
          <Group justify="center">
            <Pagination
              total={contactsData.totalPages}
              value={page + 1}
              onChange={(newPage) => setPage(newPage - 1)}
            />
          </Group>
        )}
      </Stack>

      {/* Create contact modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Contact"
        size="lg"
      >
        <ContactForm
          onSubmit={handleCreateContact}
          onCancel={() => setCreateModalOpen(false)}
          loading={createMutation.isPending}
        />
      </Modal>
    </Container>
  );
};
