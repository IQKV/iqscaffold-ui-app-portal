import { useState, useMemo } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Text,
  TextInput,
  Tooltip,
  Stack,
  Paper,
  Title,
} from "@mantine/core";
import { IconEdit, IconTrash, IconPlus, IconSearch } from "@tabler/icons-react";
import { DataTable, type DataTableColumn } from "@/shared/ui/data-table";
import { useUsersQuery, useDeleteUserMutation } from "../hooks/use-users-query";
import { User } from "../api/users-api";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useDebouncedValue } from "@mantine/hooks";
import { t } from "@lingui/core/macro";

interface UsersDataGridProps {
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
}

export function UsersDataGrid({
  onCreateUser,
  onEditUser,
}: UsersDataGridProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const limit = 10;

  const { data, isLoading, error } = useUsersQuery({
    page,
    limit,
    search: debouncedSearch,
  });

  const deleteUserMutation = useDeleteUserMutation();

  const handleDeleteUser = (user: User) => {
    openConfirmModal({
      title: t`Delete User`,
      children: (
        <Text size="sm">
          {t`Are you sure you want to delete user`}{" "}
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          ? {t`This action cannot be undone.`}
        </Text>
      ),
      labels: { confirm: t`Delete`, cancel: t`Cancel` },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteUserMutation.mutate(user.id, {
          onSuccess: () => {
            notifications.show({
              title: t`Success`,
              message: t`User deleted successfully`,
              color: "green",
            });
          },
          onError: (error) => {
            notifications.show({
              title: t`Error`,
              message: t`Failed to delete user: ${error.message}`,
              color: "red",
            });
          },
        });
      },
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "red";
      case "manager":
        return "blue";
      case "user":
        return "green";
      default:
        return "gray";
    }
  };

  const columns = useMemo<DataTableColumn<User>[]>(
    () => [
      {
        key: "name",
        title: t`User`,
        sortable: true,
        render: (_, user: User) => (
          <Group gap="sm">
            <div>
              <Text fw={500}>
                {user.firstName} {user.lastName}
              </Text>
              <Text size="xs" c="dimmed">
                @{user.username} • {user.email}
              </Text>
            </div>
          </Group>
        ),
      },
      {
        key: "role",
        title: t`Role`,
        sortable: true,
        render: (_, user: User) => (
          <Badge color={getRoleBadgeColor(user.role)} variant="light">
            {user.role}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        title: t`Created`,
        sortable: true,
        render: (_, user: User) => (
          <Text size="sm">{new Date(user.createdAt).toLocaleDateString()}</Text>
        ),
      },
      {
        key: "actions",
        title: t`Actions`,
        align: "center" as const,
        render: (_, user: User) => (
          <Group gap="xs" justify="center">
            <Tooltip label={t`Edit user`}>
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={() => onEditUser(user)}
              >
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t`Delete user`}>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => handleDeleteUser(user)}
                loading={deleteUserMutation.isPending}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
      },
    ],
    [onEditUser, deleteUserMutation.isPending]
  );

  if (error) {
    return (
      <Paper p="md" withBorder>
        <Text c="red">{t`Error loading users: ${error.message}`}</Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2}>{t`User Management`}</Title>
          <Button leftSection={<IconPlus size={16} />} onClick={onCreateUser}>
            {t`Add User`}
          </Button>
        </Group>

        <TextInput
          placeholder={t`Search users...`}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          mb="md"
        />

        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          pagination={{
            page,
            total: data?.pagination.total || 0,
            pageSize: limit,
            onChange: setPage,
          }}
          emptyText={t`No users found`}
        />
      </Paper>
    </Stack>
  );
}
