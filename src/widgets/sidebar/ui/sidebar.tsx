import { NavLink, Stack, Text } from "@mantine/core";
import {
  IconExposure,
  IconHome,
  IconInfoCircle,
  IconUsers,
} from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";
import { t } from "@lingui/core/macro";

export function Sidebar() {
  const location = useLocation();

  return (
    <Stack gap="md">
      <Text size="sm" fw={500}>
        {t`Navigation`}
      </Text>

      <NavLink
        component={Link}
        to="/"
        label={t`Home`}
        leftSection={<IconHome size="1rem" />}
        active={location.pathname === "/"}
      />

      <NavLink
        component={Link}
        to="/about"
        label={t`About`}
        leftSection={<IconInfoCircle size="1rem" />}
        active={location.pathname === "/about"}
      />

      <NavLink
        component={Link}
        to="/users"
        label={t`User Management`}
        leftSection={<IconUsers size="1rem" />}
        active={location.pathname === "/users"}
      />

      <NavLink
        component={Link}
        to="/examples"
        label={t`Examples`}
        leftSection={<IconExposure size="1rem" />}
        active={location.pathname === "/examples"}
      />
    </Stack>
  );
}
