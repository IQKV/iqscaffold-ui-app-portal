import React from "react";
import {
  Card,
  Group,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Stack,
  Divider,
  Skeleton,
  Alert,
  Box,
} from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconDownload,
  IconRefresh,
  IconInfoCircle,
} from "@tabler/icons-react";
import classes from "./billing-card.module.css";

export interface CardAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  divider?: boolean; // Add divider before this action
}

export interface BillingCardProps {
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    color?: string;
    variant?: "filled" | "light" | "outline" | "dot";
  };

  // Content
  children?: React.ReactNode;

  // Actions
  actions?: CardAction[];
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "filled" | "light" | "outline" | "subtle";
    color?: string;
    loading?: boolean;
    disabled?: boolean;
  };

  // States
  loading?: boolean;
  error?: string;

  // Styling
  withBorder?: boolean;
  shadow?: "xs" | "sm" | "md" | "lg" | "xl";
  padding?: "xs" | "sm" | "md" | "lg" | "xl";
  radius?: "xs" | "sm" | "md" | "lg" | "xl";

  // Interaction
  clickable?: boolean;
  onClick?: () => void;

  // Layout
  compact?: boolean;
  headerOnly?: boolean;
}

export const BillingCard: React.FC<BillingCardProps> = ({
  title,
  subtitle,
  badge,
  children,
  actions = [],
  primaryAction,
  loading = false,
  error,
  withBorder = true,
  shadow = "sm",
  padding = "md",
  radius = "md",
  clickable = false,
  onClick,
  compact = false,
  headerOnly = false,
}) => {
  const renderActions = () => {
    if (actions.length === 0) return null;

    return (
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <ActionIcon variant="subtle" color="gray" size="sm">
            <IconDots size={16} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          {actions.map((action, index) => (
            <React.Fragment key={index}>
              {action.divider && index > 0 && <Menu.Divider />}
              <Menu.Item
                leftSection={action.icon}
                onClick={action.onClick}
                color={action.color}
                disabled={action.disabled}
              >
                {action.label}
              </Menu.Item>
            </React.Fragment>
          ))}
        </Menu.Dropdown>
      </Menu>
    );
  };

  const renderHeader = () => (
    <Group justify="space-between" align="flex-start" wrap="nowrap">
      <div className={classes.headerContent}>
        <Group gap="xs" align="center" wrap="nowrap">
          <Text fw={600} size={compact ? "sm" : "md"} className={classes.title}>
            {title}
          </Text>
          {badge && (
            <Badge
              color={badge.color}
              variant={badge.variant || "light"}
              size={compact ? "xs" : "sm"}
            >
              {badge.label}
            </Badge>
          )}
        </Group>

        {subtitle && (
          <Text size={compact ? "xs" : "sm"} c="dimmed" mt={2}>
            {subtitle}
          </Text>
        )}
      </div>

      <Group gap="xs" className={classes.headerActions}>
        {renderActions()}
      </Group>
    </Group>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Stack gap="xs">
          <Skeleton height={20} />
          <Skeleton height={16} width="70%" />
          <Skeleton height={16} width="50%" />
        </Stack>
      );
    }

    if (error) {
      return (
        <Alert color="red" icon={<IconInfoCircle size={16} />} variant="light">
          {error}
        </Alert>
      );
    }

    return children;
  };

  const cardProps = {
    withBorder,
    shadow,
    padding,
    radius,
    className: `${classes.billingCard} ${clickable ? classes.clickable : ""}`,
    onClick: clickable ? onClick : undefined,
    style: { cursor: clickable ? "pointer" : "default" },
  };

  if (headerOnly) {
    return <Card {...cardProps}>{renderHeader()}</Card>;
  }

  return (
    <Card {...cardProps}>
      <Stack gap={compact ? "xs" : "md"}>
        {renderHeader()}

        {!loading && !error && children && (
          <>
            <Divider />
            <Box className={classes.cardContent}>{renderContent()}</Box>
          </>
        )}

        {(loading || error) && (
          <>
            <Divider />
            <Box className={classes.cardContent}>{renderContent()}</Box>
          </>
        )}

        {primaryAction && !loading && !error && (
          <>
            <Divider />
            <Group justify="flex-end" className={classes.cardFooter}>
              <button
                className={classes.primaryActionButton}
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                data-variant={primaryAction.variant || "filled"}
                data-color={primaryAction.color || "blue"}
              >
                {primaryAction.loading ? "Loading..." : primaryAction.label}
              </button>
            </Group>
          </>
        )}
      </Stack>
    </Card>
  );
};
