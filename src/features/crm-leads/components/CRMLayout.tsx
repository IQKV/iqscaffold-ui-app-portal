import React from "react";
import {
  Container,
  Stack,
  Breadcrumbs,
  Anchor,
  Title,
  Paper,
  AppShell,
  Burger,
  Group,
  Text,
  NavLink,
  ActionIcon,
  Box,
  Drawer,
} from "@mantine/core";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { t } from "@lingui/core/macro";
import { useMediaQuery, useDisclosure } from "@mantine/hooks";
import {
  IconLayoutDashboard,
  IconUsers,
  IconLayoutKanban,
  IconCalendarEvent,
  IconPlus,
} from "@tabler/icons-react";
import { CRMErrorBoundary } from "./CRMErrorBoundary";

export interface CRMLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBreadcrumbs?: boolean;
}

/**
 * CRM Layout Wrapper
 *
 * Provides consistent header, breadcrumb navigation, and error boundaries
 * for all CRM pages.
 *
 * Features:
 * - Automatic breadcrumb generation based on route
 * - CRM-specific error boundary
 * - Consistent page header styling
 * - Responsive container
 * - Mobile navigation with collapsible menu
 * - Bottom navigation bar for mobile
 * - Touch-friendly navigation elements
 *
 * Requirements: 8.6, 8.7, 12.6
 */
export function CRMLayout({
  children,
  title,
  showBreadcrumbs = true,
}: CRMLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileNavOpened, { toggle: toggleMobileNav, close: closeMobileNav }] =
    useDisclosure(false);

  // CRM navigation items
  const navItems = [
    {
      label: t`Dashboard`,
      icon: IconLayoutDashboard,
      href: "/crm/dashboard",
      color: "blue",
    },
    {
      label: t`Leads`,
      icon: IconUsers,
      href: "/crm/leads",
      color: "green",
    },
    {
      label: t`Pipeline`,
      icon: IconLayoutKanban,
      href: "/crm/pipeline",
      color: "grape",
    },
    {
      label: t`Follow-ups`,
      icon: IconCalendarEvent,
      href: "/crm/follow-ups",
      color: "orange",
    },
  ];

  // Generate breadcrumbs from current path
  const breadcrumbs = React.useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const items: Array<{ label: string; href: string }> = [
      { label: t`Home`, href: "/" },
    ];

    if (pathSegments.length > 0 && pathSegments[0] === "crm") {
      items.push({ label: t`CRM`, href: "/crm/dashboard" });

      // Add specific CRM section breadcrumbs
      if (pathSegments[1]) {
        const section = pathSegments[1];
        const sectionLabels: Record<string, string> = {
          dashboard: t`Dashboard`,
          leads: t`Leads`,
          pipeline: t`Pipeline`,
          "follow-ups": t`Follow-ups`,
        };

        const sectionLabel = sectionLabels[section] || section;
        items.push({
          label: sectionLabel,
          href: `/crm/${section}`,
        });

        // Add detail page breadcrumb if present
        if (pathSegments[2]) {
          items.push({
            label: t`Details`,
            href: location.pathname,
          });
        }
      }
    }

    return items;
  }, [location.pathname]);

  // Check if current path matches nav item
  const isActive = (href: string) => {
    return location.pathname.startsWith(href);
  };

  // Handle navigation and close mobile menu
  const handleNavigation = (href: string) => {
    navigate({ to: href });
    if (isMobile) {
      closeMobileNav();
    }
  };

  // Render navigation items
  const renderNavItems = () => (
    <Stack gap="xs">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <NavLink
            key={item.href}
            label={item.label}
            leftSection={<Icon size={20} />}
            active={active}
            onClick={() => handleNavigation(item.href)}
            color={item.color}
            variant="filled"
            style={{
              borderRadius: 8,
              // Touch-friendly height
              minHeight: isMobile ? "48px" : "40px",
            }}
          />
        );
      })}
    </Stack>
  );

  // Mobile bottom navigation
  const renderBottomNav = () => {
    if (!isMobile) return null;

    return (
      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTop: "1px solid #e9ecef",
          padding: "8px 0",
          zIndex: 100,
          // Safe area for iOS devices
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        }}
      >
        <Group justify="space-around" gap={0}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Box
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "8px 4px",
                  cursor: "pointer",
                  // Touch-friendly tap target
                  minHeight: "56px",
                  justifyContent: "center",
                }}
              >
                <Icon
                  size={24}
                  color={active ? "var(--mantine-color-blue-6)" : "#868e96"}
                />
                <Text
                  size="xs"
                  fw={active ? 600 : 400}
                  c={active ? "blue" : "dimmed"}
                  style={{ textAlign: "center" }}
                >
                  {item.label}
                </Text>
              </Box>
            );
          })}
        </Group>
      </Box>
    );
  };

  return (
    <CRMErrorBoundary>
      {/* Mobile Navigation Drawer */}
      {isMobile && (
        <Drawer
          opened={mobileNavOpened}
          onClose={closeMobileNav}
          title={t`CRM Navigation`}
          padding="md"
          size="xs"
        >
          {renderNavItems()}
        </Drawer>
      )}

      <Container 
        size="xl" 
        py={isMobile ? "xs" : "md"}
        // Add bottom padding for mobile bottom nav
        pb={isMobile ? "80px" : "md"}
      >
        <Stack gap={isMobile ? "sm" : "lg"}>
          {/* Mobile Header with Burger Menu */}
          {isMobile && (
            <Group justify="space-between" mb="xs">
              <Group gap="sm">
                <Burger
                  opened={mobileNavOpened}
                  onClick={toggleMobileNav}
                  size="sm"
                  aria-label="Toggle navigation"
                />
                <Text fw={600} size="lg">
                  {title || "CRM"}
                </Text>
              </Group>
            </Group>
          )}

          {/* Breadcrumb Navigation - Desktop only */}
          {!isMobile && showBreadcrumbs && breadcrumbs.length > 1 && (
            <Breadcrumbs>
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return isLast ? (
                  <span key={item.href}>{item.label}</span>
                ) : (
                  <Anchor
                    key={item.href}
                    component={Link}
                    to={item.href}
                    size="sm"
                  >
                    {item.label}
                  </Anchor>
                );
              })}
            </Breadcrumbs>
          )}

          {/* Page Title - Desktop only */}
          {!isMobile && title && (
            <Title order={1} size="h2">
              {title}
            </Title>
          )}

          {/* Page Content */}
          <Paper 
            shadow={isMobile ? "none" : "xs"} 
            p={isMobile ? 0 : "md"} 
            radius={isMobile ? 0 : "md"}
            withBorder={!isMobile}
          >
            {children}
          </Paper>
        </Stack>
      </Container>

      {/* Mobile Bottom Navigation */}
      {renderBottomNav()}
    </CRMErrorBoundary>
  );
}
