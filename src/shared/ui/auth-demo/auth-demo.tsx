import React from "react";
import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Button,
  Divider,
  Alert,
} from "@mantine/core";
import {
  IconUser,
  IconShield,
  IconCrown,
  IconInfoCircle,
} from "@tabler/icons-react";
import {
  useAuth,
  RoleGuard,
  AdminGuard,
  SuperAdminGuard,
  UserManagementGuard,
  useAuthOperations,
} from "@/shared/lib";

export function AuthDemo() {
  const {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    canManageUsers,
    logout,
  } = useAuth();

  const { canReadUsers, canCreateUsers, canUpdateUsers, canDeleteUsers } =
    useAuthOperations();

  if (!isAuthenticated) {
    return (
      <Paper p="md" withBorder>
        <Alert icon={<IconInfoCircle size={16} />} title="Not Authenticated">
          <Text size="sm">Please log in to see the authorization demo.</Text>
        </Alert>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          Current User Information
        </Title>

        <Group gap="md" mb="md">
          <Text>
            <strong>Name:</strong> {user?.firstName} {user?.lastName}
          </Text>
          <Text>
            <strong>Username:</strong> {user?.username}
          </Text>
          <Text>
            <strong>Email:</strong> {user?.email}
          </Text>
        </Group>

        <Group gap="xs" mb="md">
          <Text>
            <strong>Roles:</strong>
          </Text>
          {user?.roles?.map((role) => (
            <Badge key={role} color="blue" variant="light">
              {role}
            </Badge>
          ))}
        </Group>

        <Button variant="outline" color="red" onClick={logout}>
          Logout
        </Button>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          Role Checks
        </Title>

        <Stack gap="sm">
          <Group gap="md">
            <Text>Has USER role:</Text>
            <Badge color={hasRole("USER") ? "green" : "red"}>
              {hasRole("USER") ? "Yes" : "No"}
            </Badge>
          </Group>

          <Group gap="md">
            <Text>Has ADMIN role:</Text>
            <Badge color={hasRole("ADMIN") ? "green" : "red"}>
              {hasRole("ADMIN") ? "Yes" : "No"}
            </Badge>
          </Group>

          <Group gap="md">
            <Text>Has SUPER_ADMIN role:</Text>
            <Badge color={hasRole("SUPER_ADMIN") ? "green" : "red"}>
              {hasRole("SUPER_ADMIN") ? "Yes" : "No"}
            </Badge>
          </Group>

          <Group gap="md">
            <Text>Is Admin (ADMIN or SUPER_ADMIN):</Text>
            <Badge color={isAdmin() ? "green" : "red"}>
              {isAdmin() ? "Yes" : "No"}
            </Badge>
          </Group>

          <Group gap="md">
            <Text>Can Manage Users:</Text>
            <Badge color={canManageUsers() ? "green" : "red"}>
              {canManageUsers() ? "Yes" : "No"}
            </Badge>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          User Management Permissions
        </Title>

        <Stack gap="sm">
          <Group gap="md">
            <Text>Can Read Users:</Text>
            <Badge color={canReadUsers ? "green" : "red"}>
              {canReadUsers ? "Yes" : "No"}
            </Badge>
          </Group>

          <Group gap="md">
            <Text>Can Create Users:</Text>
            <Badge color={canCreateUsers ? "green" : "red"}>
              {canCreateUsers ? "Yes" : "No"}
            </Badge>
          </Group>

          <Group gap="md">
            <Text>Can Update Users:</Text>
            <Badge color={canUpdateUsers ? "green" : "red"}>
              {canUpdateUsers ? "Yes" : "No"}
            </Badge>
          </Group>

          <Group gap="md">
            <Text>Can Delete Users:</Text>
            <Badge color={canDeleteUsers ? "green" : "red"}>
              {canDeleteUsers ? "Yes" : "No"}
            </Badge>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          Authorization Guards Demo
        </Title>

        <Stack gap="md">
          <div>
            <Text fw={500} mb="xs">
              USER Role Guard:
            </Text>
            <RoleGuard roles="USER">
              <Alert color="green" icon={<IconUser size={16} />}>
                ✅ You have USER role - this content is visible!
              </Alert>
            </RoleGuard>
          </div>

          <div>
            <Text fw={500} mb="xs">
              ADMIN Role Guard:
            </Text>
            <RoleGuard roles="ADMIN">
              <Alert color="blue" icon={<IconShield size={16} />}>
                ✅ You have ADMIN role - this admin content is visible!
              </Alert>
            </RoleGuard>
          </div>

          <div>
            <Text fw={500} mb="xs">
              SUPER_ADMIN Role Guard:
            </Text>
            <RoleGuard roles="SUPER_ADMIN">
              <Alert color="red" icon={<IconCrown size={16} />}>
                ✅ You have SUPER_ADMIN role - this super admin content is
                visible!
              </Alert>
            </RoleGuard>
          </div>

          <Divider />

          <div>
            <Text fw={500} mb="xs">
              Admin Guard (ADMIN or SUPER_ADMIN):
            </Text>
            <AdminGuard>
              <Alert color="orange" icon={<IconShield size={16} />}>
                ✅ You are an administrator - this admin-only content is
                visible!
              </Alert>
            </AdminGuard>
          </div>

          <div>
            <Text fw={500} mb="xs">
              Super Admin Guard (SUPER_ADMIN only):
            </Text>
            <SuperAdminGuard>
              <Alert color="red" icon={<IconCrown size={16} />}>
                ✅ You are a super administrator - this super admin-only content
                is visible!
              </Alert>
            </SuperAdminGuard>
          </div>

          <div>
            <Text fw={500} mb="xs">
              User Management Guard:
            </Text>
            <UserManagementGuard>
              <Alert color="purple" icon={<IconUser size={16} />}>
                ✅ You can manage users - user management features are
                available!
              </Alert>
            </UserManagementGuard>
          </div>
        </Stack>
      </Paper>
    </Stack>
  );
}
