import React from "react";
import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Alert,
  Divider,
} from "@mantine/core";
import { IconUser, IconShield, IconCrown } from "@tabler/icons-react";
import { useAuthStore } from "../model/store";
import {
  RoleGuard,
  AdminGuard,
  SuperAdminGuard,
  UserManagementGuard,
} from "../lib/guards";

export function AuthExamples() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = status === "authenticated";

  if (!isAuthenticated) {
    return (
      <Paper p="md" withBorder>
        <Alert title="Not Authenticated">
          <Text size="sm">Please log in to see the authorization demo.</Text>
        </Alert>
      </Paper>
    );
  }

  const hasRole = (role: string) => (user?.roles ?? []).includes(role);
  const isAdmin = () => hasRole("ADMIN") || hasRole("SUPER_ADMIN");
  const canManageUsers = () => isAdmin();

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
          Authorization Guards Demo
        </Title>
        <Stack gap="md">
          <div>
            <Text fw={500} mb="xs">
              USER Role Guard:
            </Text>
            <RoleGuard roles={["USER"]}>
              <Alert color="green" icon={<IconUser size={16} />}>
                ✅ You have USER role - this content is visible!
              </Alert>
            </RoleGuard>
          </div>
          <div>
            <Text fw={500} mb="xs">
              ADMIN Guard (ADMIN or SUPER_ADMIN):
            </Text>
            <AdminGuard>
              <Alert color="orange" icon={<IconShield size={16} />}>
                ✅ Admin-only content is visible!
              </Alert>
            </AdminGuard>
          </div>
          <div>
            <Text fw={500} mb="xs">
              SUPER_ADMIN Guard:
            </Text>
            <SuperAdminGuard>
              <Alert color="red" icon={<IconCrown size={16} />}>
                ✅ Super admin-only content is visible!
              </Alert>
            </SuperAdminGuard>
          </div>
          <div>
            <Text fw={500} mb="xs">
              User Management Guard:
            </Text>
            <UserManagementGuard>
              <Alert color="purple" icon={<IconUser size={16} />}>
                ✅ You can manage users!
              </Alert>
            </UserManagementGuard>
          </div>
        </Stack>
      </Paper>
    </Stack>
  );
}
