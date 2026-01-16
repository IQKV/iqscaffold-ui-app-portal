import React from "react";
import {
  Container,
  Stack,
  Breadcrumbs,
  Anchor,
  Title,
  Paper,
} from "@mantine/core";
import { Link, useLocation } from "@tanstack/react-router";
import { t } from "@lingui/core/macro";
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
 *
 * Requirements: 8.6, 8.7
 */
export function CRMLayout({
  children,
  title,
  showBreadcrumbs = true,
}: CRMLayoutProps) {
  const location = useLocation();

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

  return (
    <CRMErrorBoundary>
      <Container size="xl" py="md">
        <Stack gap="lg">
          {/* Breadcrumb Navigation */}
          {showBreadcrumbs && breadcrumbs.length > 1 && (
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

          {/* Page Title */}
          {title && (
            <Title order={1} size="h2">
              {title}
            </Title>
          )}

          {/* Page Content */}
          <Paper shadow="xs" p="md" radius="md">
            {children}
          </Paper>
        </Stack>
      </Container>
    </CRMErrorBoundary>
  );
}
