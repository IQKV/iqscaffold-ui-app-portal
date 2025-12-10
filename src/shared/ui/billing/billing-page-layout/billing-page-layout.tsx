import React from "react";
import {
  AppShell,
  Container,
  Group,
  Text,
  Breadcrumbs,
  Anchor,
  ActionIcon,
  Menu,
  Button,
  Stack,
  Divider,
} from "@mantine/core";
import {
  IconChevronRight,
  IconDots,
  IconRefresh,
  IconDownload,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import classes from "./billing-page-layout.module.css";

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

export interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
  variant?: "filled" | "light" | "outline" | "subtle";
  loading?: boolean;
  disabled?: boolean;
}

export interface BillingPageLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  quickActions?: QuickAction[];
  showRefresh?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  headerActions?: React.ReactNode;
  maxWidth?: number | string;
}

export const BillingPageLayout: React.FC<BillingPageLayoutProps> = ({
  title,
  description,
  breadcrumbs = [],
  quickActions = [],
  showRefresh = true,
  onRefresh,
  refreshing = false,
  children,
  sidebar,
  headerActions,
  maxWidth = 1200,
}) => {
  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) return null;

    const items = breadcrumbs.map((item, index) => {
      if (item.href && index < breadcrumbs.length - 1) {
        return (
          <Anchor key={index} component={Link} to={item.href} size="sm">
            {item.title}
          </Anchor>
        );
      }
      return (
        <Text key={index} size="sm" c="dimmed">
          {item.title}
        </Text>
      );
    });

    return (
      <Breadcrumbs separator={<IconChevronRight size={14} />} mb="xs">
        {items}
      </Breadcrumbs>
    );
  };

  const renderQuickActions = () => {
    if (quickActions.length === 0) return null;

    const visibleActions = quickActions.slice(0, 3);
    const hiddenActions = quickActions.slice(3);

    return (
      <Group gap="xs">
        {visibleActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "light"}
            color={action.color}
            size="sm"
            leftSection={action.icon}
            onClick={action.onClick}
            loading={action.loading}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        ))}

        {hiddenActions.length > 0 && (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="light" size="sm">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {hiddenActions.map((action, index) => (
                <Menu.Item
                  key={index}
                  leftSection={action.icon}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    );
  };

  return (
    <AppShell className={classes.billingLayout}>
      <AppShell.Main>
        <Container size={maxWidth} className={classes.container}>
          {/* Page Header */}
          <div className={classes.pageHeader}>
            {renderBreadcrumbs()}

            <Group justify="space-between" align="flex-start" mb="md">
              <div>
                <Group gap="md" align="center">
                  <Text size="xl" fw={700}>
                    {title}
                  </Text>

                  {showRefresh && onRefresh && (
                    <ActionIcon
                      variant="light"
                      size="sm"
                      onClick={onRefresh}
                      loading={refreshing}
                      className={classes.refreshButton}
                    >
                      <IconRefresh size={16} />
                    </ActionIcon>
                  )}
                </Group>

                {description && (
                  <Text size="sm" c="dimmed" mt="xs">
                    {description}
                  </Text>
                )}
              </div>

              <Group gap="md">
                {renderQuickActions()}
                {headerActions}
              </Group>
            </Group>

            <Divider mb="lg" />
          </div>

          {/* Page Content */}
          <div className={classes.pageContent}>
            {sidebar ? (
              <div className={classes.contentWithSidebar}>
                <aside className={classes.sidebar}>{sidebar}</aside>
                <main className={classes.mainContent}>{children}</main>
              </div>
            ) : (
              <main className={classes.fullContent}>{children}</main>
            )}
          </div>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};
