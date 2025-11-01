import { Menu, Avatar, Text } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useAuthStore } from "../model/store";

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  if (!user) {
    return null;
  }
  const initials =
    `${user.firstName?.[0] ?? user.username[0]}${user.lastName?.[0] ?? ""}`.toUpperCase();
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Avatar color="indigo" radius="xl">
          {initials}
        </Avatar>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          <Text size="sm">
            {user.firstName} {user.lastName}
          </Text>
          <Text size="xs" c="dimmed">
            {user.email}
          </Text>
        </Menu.Label>
        <Menu.Item
          leftSection={<IconLogout size={16} />}
          onClick={() => logout()}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
