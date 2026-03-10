import { useState, useCallback } from "react";
import {
  useContactsQuery,
  useCreateContactMutation,
  useDeleteContactMutation,
  useBulkDeleteContactsMutation,
  useBulkUpdateContactStatusMutation,
} from "@/entities/crm";
import { ContactStatus } from "@/shared/api";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { t } from "@lingui/core/macro";

export function useContactList() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "">("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Fetch contacts
  const {
    data: contactsData,
    isLoading,
    error,
  } = useContactsQuery({
    page,
    size: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  // Mutations
  const { mutate: createContact, isPending: isCreating } = useCreateContactMutation();
  const { mutate: deleteContact } = useDeleteContactMutation();
  const bulkDeleteMutation = useBulkDeleteContactsMutation();
  const bulkUpdateStatusMutation = useBulkUpdateContactStatusMutation();

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(0);
  }, []);

  const handleStatusFilterChange = useCallback((value: ContactStatus | "") => {
    setStatusFilter(value);
    setPage(0);
  }, []);

  const toggleSelect = useCallback((id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((prevId) => prevId !== id)));
  }, []);

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && contactsData) {
        setSelectedIds(contactsData.content.map((c) => c.id));
      } else {
        setSelectedIds([]);
      }
    },
    [contactsData],
  );

  const handleCreateContact = useCallback(
    (values: any, onSuccess?: () => void) => {
      createContact(values, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    },
    [createContact],
  );

  const handleDeleteContact = useCallback(
    (id: number, name: string) => {
      modals.openConfirmModal({
        title: t`Delete Contact`,
        children: t`Are you sure you want to delete ${name}? This action cannot be undone.`,
        labels: { confirm: t`Delete`, cancel: t`Cancel` },
        confirmProps: { color: "red" },
        onConfirm: () => deleteContact(id),
      });
    },
    [deleteContact],
  );

  const handleBulkDelete = useCallback(() => {
    const count = selectedIds.length;
    modals.openConfirmModal({
      title: t`Delete Multiple Contacts`,
      children: t`Are you sure you want to delete ${count} contacts? This action cannot be undone.`,
      labels: { confirm: t`Delete`, cancel: t`Cancel` },
      confirmProps: { color: "red" },
      onConfirm: () => {
        bulkDeleteMutation.mutate(selectedIds, {
          onSuccess: () => setSelectedIds([]),
        });
      },
    });
  }, [selectedIds, bulkDeleteMutation]);

  const handleBulkStatusUpdate = useCallback(
    (status: ContactStatus) => {
      bulkUpdateStatusMutation.mutate(
        { contactIds: selectedIds, status },
        {
          onSuccess: () => setSelectedIds([]),
        },
      );
    },
    [selectedIds, bulkUpdateStatusMutation],
  );

  return {
    // State
    page,
    setPage,
    search,
    handleSearchChange,
    statusFilter,
    handleStatusFilterChange,
    selectedIds,
    setSelectedIds,

    // Data
    contactsData,
    isLoading,
    error,

    // Mutations
    isCreating,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isBulkUpdatingStatus: bulkUpdateStatusMutation.isPending,

    // Handlers
    toggleSelect,
    toggleSelectAll,
    handleCreateContact,
    handleDeleteContact,
    handleBulkDelete,
    handleBulkStatusUpdate,
  };
}
