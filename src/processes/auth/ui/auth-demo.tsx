import React from "react";
import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Button,
  Alert,
} from "@mantine/core";
import {
  IconUser,
  IconShield,
  IconCrown,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useAuthStore } from "../model/store";

export function AuthDemo() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = status === "authenticated";
  const logout = useAuthStore((s) => s.logout);

  if (!isAuthenticated) {
    return (
      <Paper p="md" withBorder>
        <Alert icon={<IconInfoCircle size={16} />} title="Not Authenticated">
          <Text size="sm">Please log in to see the authorization demo.</Text>
        </Alert>
      </Paper>
    );
  }

  const hasRole = (role: string) => (user?.roles ?? []).includes(role);
  const isAdmin = () => hasRole("ADMIN") || hasRole("SUPER_ADMIN");
  const isSuperAdmin = () => hasRole("SUPER_ADMIN");
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
        <Button variant="outline" color="red" onClick={() => logout()}>
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
            <Text>Is Admin (ADMIN or SUPER_ADMIN):</Text>
            <Badge color={isAdmin() ? "green" : "red"}>
              {isAdmin() ? "Yes" : "No"}
            </Badge>
          </Group>
          <Group gap="md">
            <Text>Is Super Admin:</Text>
            <Badge color={isSuperAdmin() ? "green" : "red"}>
              {isSuperAdmin() ? "Yes" : "No"}
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
    </Stack>
  );
}
