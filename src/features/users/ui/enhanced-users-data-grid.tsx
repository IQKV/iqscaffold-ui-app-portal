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
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { useUsersQuery, useDeleteUserMutation, UserDto } from "@/entities/user";
import { useAuth } from "@/processes/auth";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useDebouncedValue } from "@mantine/hooks";
import { t } from "@lingui/core/macro";

interface EnhancedUsersDataGridProps {
  onCreateUser: () => void;
  onEditUser: (user: UserDto) => void;
}

export function EnhancedUsersDataGrid({ onCreateUser, onEditUser }: EnhancedUsersDataGridProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [featureModalOpened, setFeatureModalOpened] = useState(false);
  const { canManageUsers } = useAuth();

  const size = 10;

  const { data, isLoading, error } = useUsersQuery({
    page: page - 1,
    size,
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
    [deleteUserMutation],
  );

  const handleManageFeatures = useCallback((user: UserDto) => {
    setSelectedUser(user);
    setFeatureModalOpened(true);
  }, []);

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

  const formatRoles = useCallback((authorities: string[] | undefined) => {
    if (!authorities || authorities.length === 0) {
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
  }, []);

  const columns: DataTableColumn<UserDto>[] = useMemo(
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
        render: (user) => <Text size="sm">{new Date(user.createdAt).toLocaleDateString()}</Text>,
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
    [onEditUser, handleDeleteUser, handleManageFeatures, canManageUsers, formatRoles],
  );

  if (error) {
    const errorMessage = error.message;
    return (
      <Paper p="md">
        <Text c="red">{t`Error loading users: ${errorMessage}`}</Text>
      </Paper>
    );
  }

  return (
    <>
      <Stack gap="md">
        <Paper p="md" withBorder shadow="sm">
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
            records={data?.content || []}
            fetching={isLoading}
            totalRecords={data?.totalElements || 0}
            recordsPerPage={size}
            page={page}
            onPageChange={setPage}
            emptyState={
              <Text ta="center" c="dimmed">
                {search
                  ? t`No users match your search criteria`
                  : t`No users have been created yet`}
              </Text>
            }
          />
        </Paper>
      </Stack>

      {/* Feature Management Modal */}
      <Modal
        opened={featureModalOpened}
        onClose={() => setFeatureModalOpened(false)}
        title={
          selectedUser
            ? (() => {
                const firstName = selectedUser.firstName;
                const lastName = selectedUser.lastName;
                return t`Manage Features - ${firstName} ${lastName}`;
              })()
            : t`Manage Features`
        }
        size="lg"
      >
        {selectedUser && (
          <Tabs defaultValue="authorities">
            <Tabs.List>
              <Tabs.Tab value="authorities">{t`Authorities`}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="authorities" pt="md">
              <Paper p="md" withBorder>
                <Text fw={500} mb="sm">{t`Current Authorities`}</Text>
                <Group gap="xs">
                  {selectedUser.authorities?.map((authority) => (
                    <Badge key={authority} variant="light">
                      {authority}
                    </Badge>
                  )) || (
                    <Text size="sm" c="dimmed">
                      {t`No authorities assigned`}
                    </Text>
                  )}
                </Group>
                <Text size="sm" c="dimmed" mt="sm">
                  {t`Authority management will be available in a future update.`}
                </Text>
                <Text size="sm" c="dimmed" mt="md">
                  {t`Note: User features are now managed through subscription plans in the billing service.`}
                </Text>
              </Paper>
            </Tabs.Panel>
          </Tabs>
        )}
      </Modal>
    </>
  );
}
