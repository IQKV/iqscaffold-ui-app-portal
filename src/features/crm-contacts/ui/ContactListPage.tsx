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
import { useNavigate } from "@tanstack/react-router";
import { modals } from "@mantine/modals";
import { ContactStatus } from "@/shared/api";
import { ContactCard, ContactForm } from "@/entities/crm";
import { useContactList } from "../model/useContactList";

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

  const {
    page,
    setPage,
    search,
    handleSearchChange,
    statusFilter,
    handleStatusFilterChange,
    selectedIds,
    setSelectedIds,
    contactsData,
    isLoading,
    error,
    isCreating,
    isBulkDeleting,
    isBulkUpdatingStatus,
    toggleSelect,
    toggleSelectAll,
    handleCreateContact: onCreateContact,
    handleDeleteContact: onDeleteContact,
    handleBulkDelete,
    handleBulkStatusUpdate,
  } = useContactList();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Handlers
  const handleCreateContact = (values: any) => {
    onCreateContact(values, () => {
      setCreateModalOpen(false);
    });
  };

  const handleViewContact = (id: number) => {
    navigate({ to: `/crm/contacts/${id}` });
  };

  const handleEditContact = (id: number) => {
    navigate({ to: `/crm/contacts/${id}` });
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
              handleSearchChange(e.currentTarget.value);
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
              { value: "PROSPECT", label: "Prospect" },
              { value: "CUSTOMER", label: "Customer" },
            ]}
            value={statusFilter}
            onChange={(value) => {
              handleStatusFilterChange(value as ContactStatus | "");
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
                      loading={isBulkUpdatingStatus}
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
                        handleBulkStatusUpdate(ContactStatus.PROSPECT)
                      }
                    >
                      {t`Set Prospect`}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
                <Button
                  variant="light"
                  color="red"
                  size="xs"
                  leftSection={<IconTrash size={16} />}
                  onClick={handleBulkDelete}
                  loading={isBulkDeleting}
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
              {contactsData.content.map((contact: any) => (
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
                    onDeleteContact(
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
          loading={isCreating}
        />
      </Modal>
    </Container>
  );
};
