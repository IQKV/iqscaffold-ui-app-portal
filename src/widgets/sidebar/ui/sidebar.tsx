import { NavLink, Stack, Text } from "@mantine/core";
import {
  IconExposure,
  IconHome,
  IconInfoCircle,
  IconUsers,
} from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";

export function Sidebar() {
  const location = useLocation();

  return (
    <Stack gap="md">
      <Text size="sm" fw={500}>
        Navigation
      </Text>

      <NavLink
        component={Link}
        to="/"
        label="Home"
        leftSection={<IconHome size="1rem" />}
        active={location.pathname === "/"}
      />

      <NavLink
        component={Link}
        to="/about"
        label="About"
        leftSection={<IconInfoCircle size="1rem" />}
        active={location.pathname === "/about"}
      />

      <NavLink
        component={Link}
        to="/users"
        label="User Management"
        leftSection={<IconUsers size="1rem" />}
        active={location.pathname === "/users"}
      />

      <NavLink
        component={Link}
        to="/examples"
        label="Examples"
        leftSection={<IconExposure size="1rem" />}
        active={location.pathname === "/examples"}
      />
    </Stack>
  );
}
