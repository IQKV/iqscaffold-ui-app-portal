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
  Modal,
  Tabs,
} from "@mantine/core";
import { IconEdit, IconTrash, IconPlus, IconSearch, IconSettings } from "@tabler/icons-react";
import { DataTable, type DataTableColumn } from "@/shared/ui/data-table";
import { useUsersQuery, useDeleteUserMutation } from "../hooks/use-users-query";
import { User } from "../api/users-api";
import { UserFeatureManager } from "./UserFeatureManager";
import { useAuth } from "@/processes/auth";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useDebouncedValue } from "@mantine/hooks";
import { t } from "@lingui/core/macro";

interface EnhancedUsersDataGridProps {
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
}

export function EnhancedUsersDataGrid({
  onCreateUser,
  onEditUser,
}: EnhancedUsersDataGridProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [featureModalOpened, setFeatureModalOpened] = useState(false);
  const { canManageUsers } = useAuth();

  const limit = 10;

  const { data, isLoading, error } = useUsersQuery({
    page,
    limit,
    search: debouncedSearch,
  });

  const deleteUserMutation = useDeleteUserMutation();

  const handleDeleteUser = useCallback(
    (user: User) => {
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
              const errorMessage = error.message;
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
    [deleteUserMutation]
  );

  const handleManageFeatures = useCallback((user: User) => {
    setSelectedUser(user);
    setFeatureModalOpened(true);
  }, []);

  const getRoleBadgeColor = (authorities: string[]) => {
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

  const formatRoles = (authorities: string[]) => {
    if (authorities.length === 0) {
      return <Badge color="gray" size="sm">{t`No roles`}</Badge>;
    }

    const primaryRole = authorities.includes("SUPER_ADMIN")
      ? "SUPER_ADMIN"
      : authorities.includes("ADMIN")
      ? "ADMIN"
      : authorities.includes("USER")
      ? "USER"
      : authorities[0];

    return (
      <Group gap="xs">
        <Badge color={getRoleBadgeColor(authorities)} size="sm">
          {primaryRole}
        </Badge>
        {authorities.length > 1 && (
          <Tooltip label={authorities.join(", ")}>
            <Badge color="gray" size="sm" variant="outline">
              +{authorities.length - 1}
            </Badge>
          </Tooltip>
        )}
      </Group>
    );
  };

  const columns: DataTableColumn<User>[] = useMemo(
    () => [
      {
        accessor: "fullName",
        title: t`Name`,
        render: (user) => (
          <div>
            <Text fw={500} size="sm">
              {user.firstName} {user.lastName}
            </Text>
            <Text size="xs" c="dimmed">
              {user.username}
            </Text>
          </div>
        ),
      },
      {
        accessor: "email",
        title: t`Email`,
        render: (user) => (
          <div>
            <Text size="sm">{user.email}</Text>
            {user.emailVerified && (
              <Badge color="green" size="xs" variant="light">
                {t`Verified`}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessor: "authorities",
        title: t`Roles`,
        render: (user) => formatRoles(user.authorities),
      },
      {
        accessor: "enabled",
        title: t`Status`,
        render: (user) => (
          <Badge color={user.enabled ? "green" : "red"} variant="light">
            {user.enabled ? t`Active` : t`Disabled`}
          </Badge>
        ),
      },
      {
        accessor: "createdAt",
        title: t`Created`,
        render: (user) => (
          <Text size="sm">
            {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        ),
      },
      {
        accessor: "actions",
        title: t`Actions`,
        textAlign: "right",
        render: (user) => (
          <Group gap="xs" justify="flex-end">
            <Tooltip label={t`Manage Features`}>
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={() => handleManageFeatures(user)}
                disabled={!canManageUsers()}
              >
                <IconSettings size="1rem" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t`Edit User`}>
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={() => onEditUser(user)}
                disabled={!canManageUsers()}
              >
                <IconEdit size="1rem" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t`Delete User`}>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => handleDeleteUser(user)}
                disabled={!canManageUsers()}
              >
                <IconTrash size="1rem" />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
      },
    ],
    [onEditUser, handleDeleteUser, handleManageFeatures, canManageUsers]
  );

  if (error) {
    return (
      <Paper p="md">
        <Text c="red">{t`Error loading users: ${error.message}`}</Text>
      </Paper>
    );
  }

  return (
    <>
      <Stack gap="md">
        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={2}>{t`User Management`}</Title>
            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={onCreateUser}
              disabled={!canManageUsers()}
            >
              {t`Add User`}
            </Button>
          </Group>

          <Group mb="md">
            <TextInput
              placeholder={t`Search users...`}
              leftSection={<IconSearch size="1rem" />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              style={{ flex: 1 }}
            />
          </Group>

          <DataTable
            columns={columns}
            data={data?.data || []}
            loading={isLoading}
            pagination={{
              page,
              total: Math.ceil((data?.total || 0) / limit),
              onPageChange: setPage,
            }}
            emptyState={{
              title: t`No users found`,
              description: search
                ? t`No users match your search criteria`
                : t`No users have been created yet`,
            }}
          />
        </Paper>
      </Stack>

      {/* Feature Management Modal */}
      <Modal
        opened={featureModalOpened}
        onClose={() => setFeatureModalOpened(false)}
        title={
          selectedUser
            ? t`Manage Features - ${selectedUser.firstName} ${selectedUser.lastName}`
            : t`Manage Features`
        }
        size="lg"
      >
        {selectedUser && (
          <Tabs defaultValue="features">
            <Tabs.List>
              <Tabs.Tab value="features">{t`Features`}</Tabs.Tab>
              <Tabs.Tab value="authorities">{t`Authorities`}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="features" pt="md">
              <UserFeatureManager
                userId={selectedUser.id}
                username={selectedUser.username}
              />
            </Tabs.Panel>

            <Tabs.Panel value="authorities" pt="md">
              <Paper p="md" withBorder>
                <Text fw={500} mb="sm">{t`Current Authorities`}</Text>
                <Group gap="xs">
                  {selectedUser.authorities.map((authority) => (
                    <Badge key={authority} variant="light">
                      {authority}
                    </Badge>
                  ))}
                </Group>
                <Text size="sm" c="dimmed" mt="sm">
                  {t`Authority management will be available in a future update.`}
                </Text>
              </Paper>
            </Tabs.Panel>
          </Tabs>
        )}
      </Modal>
    </>
  );
}