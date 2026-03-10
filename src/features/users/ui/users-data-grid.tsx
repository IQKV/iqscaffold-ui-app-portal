import { useState, useMemo, useCallback } from "react";
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
  Alert,
} from "@mantine/core";
import { IconEdit, IconTrash, IconPlus, IconSearch, IconAlertCircle } from "@tabler/icons-react";
import { DataTable, type DataTableColumn } from "@/shared/ui/data-table";
import { useUsersQuery, useDeleteUserMutation, UserDto } from "@/entities/user";
import { useAuth } from "@/processes/auth";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useDebouncedValue } from "@mantine/hooks";
import { t } from "@lingui/core/macro";

interface UsersDataGridProps {
  onCreateUser: () => void;
  onEditUser: (user: UserDto) => void;
}

export function UsersDataGrid({ onCreateUser, onEditUser }: UsersDataGridProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const { canManageUsers } = useAuth();

  const pageSize = 10;

  const { data, isLoading, error } = useUsersQuery({
    page: page - 1,
    size: pageSize,
    search: debouncedSearch,
  });

  const deleteUserMutation = useDeleteUserMutation();

  const handleDeleteUser = useCallback(
    (user: UserDto) => {
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
            onError: (err: any) => {
              const errorMessage = err.message;
              notifications.show({
                title: t`Error`,
                message: t`Failed to delete user: ${errorMessage}`,
                color: "red",
              });
            },
          });
        },
      });
    },
    [deleteUserMutation],
  );

  const getRoleBadgeColor = (authorities: string[] | undefined) => {
    if (!authorities || authorities.length === 0) {
      return "gray";
    }
    if (authorities.includes("SUPER_ADMIN")) {
      return "red";
    }
    if (authorities.includes("ADMIN")) {
      return "orange";
    }
    if (authorities.includes("USER")) {
      return "blue";
    }
    return "gray";
  };

  const formatRoles = (authorities: string[] | undefined) => {
    return authorities?.length ? authorities.join(", ") : "No authorities";
  };

  const columns = useMemo<DataTableColumn<UserDto>[]>(
    () => [
      {
        key: "name",
        title: t`User`,
        sortable: true,
        render: (_, user) => (
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
        key: "roles",
        title: t`Authorities`,
        sortable: true,
        render: (_, user) => (
          <Badge color={getRoleBadgeColor(user.authorities)} variant="light">
            {formatRoles(user.authorities)}
          </Badge>
        ),
      },
      {
        key: "status",
        title: t`Status`,
        sortable: true,
        render: (_, user) => (
          <Group gap="xs">
            <Badge color={user.enabled ? "green" : "red"} variant="light" size="sm">
              {user.enabled ? t`Enabled` : t`Disabled`}
            </Badge>
            <Badge color={user.emailVerified ? "green" : "yellow"} variant="light" size="sm">
              {user.emailVerified ? t`Verified` : t`Unverified`}
            </Badge>
          </Group>
        ),
      },
      {
        key: "createdAt",
        title: t`Created`,
        sortable: true,
        render: (_, user) => <Text size="sm">{new Date(user.createdAt).toLocaleDateString()}</Text>,
      },
      {
        key: "actions",
        title: t`Actions`,
        align: "center",
        render: (_, user) => (
          <Group gap="xs" justify="center">
            {canManageUsers() && (
              <>
                <Tooltip label={t`Edit user`}>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => onEditUser(user)}
                    data-testid={`btn-edit-user-${user.id}`}
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
                    data-testid={`btn-delete-user-${user.id}`}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </>
            )}
          </Group>
        ),
      },
    ],
    [onEditUser, deleteUserMutation.isPending, handleDeleteUser, canManageUsers],
  );

  return (
    <Stack gap="md" data-testid="feature-users-data-grid">
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title={t`Error`} color="red">
          {t`Error loading users`}: {error.message}
        </Alert>
      )}
      <Paper p="md" withBorder shadow="sm">
        <Group justify="space-between" mb="md">
          <Title order={2} data-testid="users-title">{t`User Management`}</Title>
          {canManageUsers() && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={onCreateUser}
              data-testid="btn-add-user"
            >
              {t`Add User`}
            </Button>
          )}
        </Group>

        <TextInput
          placeholder={t`Search users...`}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          mb="md"
          data-testid="input-search-users"
        />

        <DataTable
          columns={columns}
          data={data?.content || []}
          loading={isLoading}
          pagination={{
            page,
            total: data?.totalElements || 0,
            pageSize,
            onChange: setPage,
          }}
          emptyText={t`No users found`}
        />
      </Paper>
    </Stack>
  );
}
