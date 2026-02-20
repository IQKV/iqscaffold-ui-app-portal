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
  IconMailForward,
} from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";
import { FeatureGate, SilentFeatureErrorBoundary } from "@/shared/ui";
import { t } from "@lingui/core/macro";
import { useAuth } from "@/processes/auth";

export function Sidebar() {
  const location = useLocation();
  const { hasAnyAuthority } = useAuth();

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

      {/* Team Section */}
      {hasAnyAuthority(["ADMIN", "TENANT_ADMIN"]) && (
        <>
          <Text size="sm" fw={500} mt="md">
            {t`Team`}
          </Text>

          <NavLink
            component={Link}
            to="/invitations"
            label={t`Invitations`}
            leftSection={<IconMailForward size="1rem" />}
            active={location.pathname === "/invitations"}
            data-testid="nav-invitations"
          />
        </>
      )}

      <NavLink
        component={Link}
        to="/examples"
        label={t`Examples`}
        leftSection={<IconExposure size="1rem" />}
        active={location.pathname === "/examples"}
        data-testid="nav-examples"
      />

      {/* Billing Section */}
      <SilentFeatureErrorBoundary>
        <FeatureGate feature="billing" showLoading={false}>
          <NavLink
            component={Link}
            to="/billing"
            label={t`Billing`}
            leftSection={<IconCreditCard size="1rem" />}
            active={location.pathname === "/billing"}
            data-testid="nav-billing"
          />
          <NavLink
            component={Link}
            to="/gateway-config"
            label={t`Gateway Config`}
            leftSection={<IconSettings size="1rem" />}
            active={location.pathname === "/gateway-config"}
            data-testid="nav-gateway-config"
          />
        </FeatureGate>
      </SilentFeatureErrorBoundary>

      <NavLink
        component={Link}
        to="/dashboard"
        label={t`Dashboard`}
        leftSection={<IconHome size="1rem" />}
        active={location.pathname === "/dashboard"}
        data-testid="nav-dashboard"
      />

      {/* CRM Section */}
      <SilentFeatureErrorBoundary>
        <FeatureGate feature="crm" showLoading={false}>
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

          <FeatureGate feature="crm" showLoading={false}>
            <NavLink
              component={Link}
              to="/crm/leads"
              label={t`Leads`}
              leftSection={<IconUsersGroup size="1rem" />}
              active={location.pathname.startsWith("/crm/leads")}
              data-testid="nav-crm-leads"
            />
          </FeatureGate>

          <FeatureGate feature="crm" showLoading={false}>
            <NavLink
              component={Link}
              to="/crm/contacts"
              label={t`Contacts`}
              leftSection={<IconUsers size="1rem" />}
              active={location.pathname.startsWith("/crm/contacts")}
              data-testid="nav-crm-contacts"
            />
          </FeatureGate>

          <FeatureGate feature="crm" showLoading={false}>
            <NavLink
              component={Link}
              to="/crm/pipeline"
              label={t`Pipeline`}
              leftSection={<IconLayoutKanban size="1rem" />}
              active={location.pathname === "/crm/pipeline"}
              data-testid="nav-crm-pipeline"
            />
          </FeatureGate>

          <FeatureGate feature="crm" showLoading={false}>
            <NavLink
              component={Link}
              to="/crm/follow-ups"
              label={t`Follow-ups`}
              leftSection={<IconCalendarEvent size="1rem" />}
              active={location.pathname === "/crm/follow-ups"}
              data-testid="nav-crm-follow-ups"
            />
          </FeatureGate>
        </FeatureGate>
      </SilentFeatureErrorBoundary>
    </Stack>
  );
}
