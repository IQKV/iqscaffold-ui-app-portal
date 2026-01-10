import { NavLink, Stack, Text } from "@mantine/core";
import {
  IconExposure,
  IconHome,
  IconInfoCircle,
  IconUsers,
  IconCreditCard,
} from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/processes/auth";
import { t } from "@lingui/core/macro";

export function Sidebar() {
  const location = useLocation();
  const { hasBillingAccess } = useAuth();

  return (
    <Stack gap="md" data-testid="widget-sidebar">
      <Text size="sm" fw={500}>
        {t`Navigation`}
      </Text>

      <NavLink
        component={Link}
        to="/"
        label={t`Home`}
        leftSection={<IconHome size="1rem" />}
        active={location.pathname === "/"}
        data-testid="nav-home"
      />

      <NavLink
        component={Link}
        to="/about"
        label={t`About`}
        leftSection={<IconInfoCircle size="1rem" />}
        active={location.pathname === "/about"}
        data-testid="nav-about"
      />

      <NavLink
        component={Link}
        to="/users"
        label={t`User Management`}
        leftSection={<IconUsers size="1rem" />}
        active={location.pathname === "/users"}
        data-testid="nav-users"
      />

      <NavLink
        component={Link}
        to="/examples"
        label={t`Examples`}
        leftSection={<IconExposure size="1rem" />}
        active={location.pathname === "/examples"}
        data-testid="nav-examples"
      />

      {hasBillingAccess() && (
        <NavLink
          component={Link}
          to="/billing"
          label={t`Billing`}
          leftSection={<IconCreditCard size="1rem" />}
          active={location.pathname === "/billing"}
          data-testid="nav-billing"
        />
      )}

      <NavLink
        component={Link}
        to="/dashboard"
        label={t`Dashboard`}
        leftSection={<IconHome size="1rem" />}
        active={location.pathname === "/dashboard"}
        data-testid="nav-dashboard"
      />
    </Stack>
  );
}
