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
  Paper,
  Checkbox,
  Menu,
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconAlertCircle,
  IconDotsVertical,
  IconTrash,
  IconCircleCheck,
} from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { ContactStatus, contactApi } from "@/shared/api";
import {
  useContacts,
  useCreateContact,
  useDeleteContact,
} from "@/entities/crm/api/contact-queries";
import { ContactCard, ContactForm } from "@/entities/crm/ui";

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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Fetch contacts using standardized hook
  const {
    data: contactsData,
    isLoading,
    error,
  } = useContacts({
    page,
    size: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  // Create contact mutation
  const { mutate: createContact, isPending: createLoading } =
    useCreateContact();

  // Delete contact mutation
  const { mutate: deleteContact } = useDeleteContact();

  // Bulk mutations
  const bulkDeleteMutation = useMutation({
    mutationFn: (contactIds: number[]) =>
      contactApi.bulkDeleteContacts({ contactIds }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["contact", "contacts"] });
      setSelectedIds([]);
      const successCount = data.successCount;
      const failureCount = data.failureCount;
      notifications.show({
        title: t`Bulk Operation Successful`,
        message: t`Deleted ${successCount} contacts. ${failureCount} failed.`,
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t`Error`,
        message: error.message || t`Bulk delete failed`,
        color: "red",
      });
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({
      contactIds,
      status,
    }: {
      contactIds: number[];
      status: ContactStatus;
    }) => contactApi.bulkUpdateStatus({ contactIds, status }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["contact", "contacts"] });
      setSelectedIds([]);
      const successCount = data.successCount;
      const failureCount = data.failureCount;
      notifications.show({
        title: t`Bulk Operation Successful`,
        message: t`Updated ${successCount} contacts. ${failureCount} failed.`,
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t`Error`,
        message: error.message || t`Bulk status update failed`,
        color: "red",
      });
    },
  });

  // Handlers
  const handleCreateContact = (values: any) => {
    createContact(values, {
      onSuccess: () => {
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
      onConfirm: () =>
        deleteContact(id, {
          onSuccess: () => {
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
        }),
    });
  };

  const handleViewContact = (id: number) => {
    navigate({ to: `/crm/contacts/${id}` });
  };

  const handleEditContact = (id: number) => {
    navigate({ to: `/crm/contacts/${id}` });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked && contactsData) {
      setSelectedIds(contactsData.content.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((prevId) => prevId !== id));
    }
  };

  const handleBulkDelete = () => {
    const count = selectedIds.length;
    modals.openConfirmModal({
      title: t`Delete Multiple Contacts`,
      children: (
        <Text size="sm">
          {t`Are you sure you want to delete ${count} contacts? This action cannot be undone.`}
        </Text>
      ),
      labels: { confirm: t`Delete`, cancel: t`Cancel` },
      confirmProps: { color: "red" },
      onConfirm: () => bulkDeleteMutation.mutate(selectedIds),
    });
  };

  const handleBulkStatusUpdate = (status: ContactStatus) => {
    bulkUpdateStatusMutation.mutate({ contactIds: selectedIds, status });
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

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <Paper
            p="sm"
            withBorder
            shadow="xs"
            bg="var(--mantine-color-blue-0)"
            style={{ borderRadius: "var(--mantine-radius-md)" }}
          >
            <Group justify="space-between">
              <Group gap="md">
                <Checkbox
                  indeterminate={
                    selectedIds.length > 0 &&
                    selectedIds.length < (contactsData?.content.length || 0)
                  }
                  checked={
                    contactsData
                      ? selectedIds.length === contactsData.content.length
                      : false
                  }
                  onChange={(e) => toggleSelectAll(e.currentTarget.checked)}
                />
                <Text size="sm" fw={500}>
                  {(() => {
                    const count = selectedIds.length;
                    return t`${count} contacts selected`;
                  })()}
                </Text>
              </Group>
              <Group gap="xs">
                <Menu position="bottom-end" withinPortal shadow="md">
                  <Menu.Target>
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconCircleCheck size={16} />}
                      loading={bulkUpdateStatusMutation.isPending}
                    >
                      {t`Update Status`}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      onClick={() =>
                        handleBulkStatusUpdate(ContactStatus.ACTIVE)
                      }
                    >
                      {t`Set Active`}
                    </Menu.Item>
                    <Menu.Item
                      onClick={() =>
                        handleBulkStatusUpdate(ContactStatus.INACTIVE)
                      }
                    >
                      {t`Set Inactive`}
                    </Menu.Item>
                    <Menu.Item
                      onClick={() =>
                        handleBulkStatusUpdate(ContactStatus.ARCHIVED)
                      }
                    >
                      {t`Set Archived`}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
                <Button
                  variant="light"
                  color="red"
                  size="xs"
                  leftSection={<IconTrash size={16} />}
                  onClick={handleBulkDelete}
                  loading={bulkDeleteMutation.isPending}
                >
                  {t`Delete Selected`}
                </Button>
              </Group>
            </Group>
          </Paper>
        )}

        {/* Error state */}
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
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
                  selected={selectedIds.includes(contact.id)}
                  onSelect={(checked) => toggleSelect(contact.id, checked)}
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
          loading={createLoading}
        />
      </Modal>
    </Container>
  );
};
