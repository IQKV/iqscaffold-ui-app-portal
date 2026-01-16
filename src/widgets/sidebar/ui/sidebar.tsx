import { NavLink, Stack, Text } from "@mantine/core";
import {
  IconExposure,
  IconHome,
  IconInfoCircle,
  IconUsers,
  IconCreditCard,
  IconSettings,
  IconUsersGroup,
  IconLayoutKanban,
  IconChartBar,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/processes/auth";
import { canManageGatewayConfigs } from "@/processes/auth/lib/billing-permissions";
import { t } from "@lingui/core/macro";

export function Sidebar() {
  const location = useLocation();
  const { hasBillingAccess, user } = useAuth();

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
        <>
          <NavLink
            component={Link}
            to="/billing"
            label={t`Billing`}
            leftSection={<IconCreditCard size="1rem" />}
            active={location.pathname === "/billing"}
            data-testid="nav-billing"
          />
          {canManageGatewayConfigs(user) && (
            <NavLink
              component={Link}
              to="/gateway-config"
              label={t`Gateway Config`}
              leftSection={<IconSettings size="1rem" />}
              active={location.pathname === "/gateway-config"}
              data-testid="nav-gateway-config"
            />
          )}
        </>
      )}

      <NavLink
        component={Link}
        to="/dashboard"
        label={t`Dashboard`}
        leftSection={<IconHome size="1rem" />}
        active={location.pathname === "/dashboard"}
        data-testid="nav-dashboard"
      />

      {/* CRM Section */}
      <Text size="sm" fw={500} mt="md">
        {t`CRM`}
      </Text>

      <NavLink
        component={Link}
        to="/crm/dashboard"
        label={t`CRM Dashboard`}
        leftSection={<IconChartBar size="1rem" />}
        active={location.pathname === "/crm/dashboard"}
        data-testid="nav-crm-dashboard"
      />

      <NavLink
        component={Link}
        to="/crm/leads"
        label={t`Leads`}
        leftSection={<IconUsersGroup size="1rem" />}
        active={location.pathname.startsWith("/crm/leads")}
        data-testid="nav-crm-leads"
      />

      <NavLink
        component={Link}
        to="/crm/contacts"
        label={t`Contacts`}
        leftSection={<IconUsers size="1rem" />}
        active={location.pathname.startsWith("/crm/contacts")}
        data-testid="nav-crm-contacts"
      />

      <NavLink
        component={Link}
        to="/crm/pipeline"
        label={t`Pipeline`}
        leftSection={<IconLayoutKanban size="1rem" />}
        active={location.pathname === "/crm/pipeline"}
        data-testid="nav-crm-pipeline"
      />

      <NavLink
        component={Link}
        to="/crm/follow-ups"
        label={t`Follow-ups`}
        leftSection={<IconCalendarEvent size="1rem" />}
        active={location.pathname === "/crm/follow-ups"}
        data-testid="nav-crm-follow-ups"
      />
    </Stack>
  );
}
