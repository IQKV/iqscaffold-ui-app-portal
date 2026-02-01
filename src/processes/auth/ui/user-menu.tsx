import { Menu, Avatar, Text } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useAuthStore } from "../model/store";
import { getAvatarUrlWithCacheBusting } from "@/entities/user/model/use-avatar";

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) {
    return null;
  }

  const initials =
    `${user.firstName?.[0] ?? user.username[0]}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const avatarUrl = getAvatarUrlWithCacheBusting(
    user.avatarUrl,
    user.avatarUpdatedAt
  );

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Avatar
          src={avatarUrl}
          color="indigo"
          radius="xl"
          data-testid="user-menu-avatar"
          style={{ cursor: "pointer" }}
        >
          {initials}
        </Avatar>
      </Menu.Target>
      <Menu.Dropdown data-testid="user-menu-dropdown">
        <Menu.Label>
          <Text size="sm" data-testid="user-menu-name">
            {user.firstName} {user.lastName}
          </Text>
          <Text size="xs" c="dimmed" data-testid="user-menu-email">
            {user.email}
          </Text>
        </Menu.Label>
        <Menu.Item
          leftSection={<IconLogout size={16} />}
          onClick={() => logout()}
          data-testid="btn-logout"
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
