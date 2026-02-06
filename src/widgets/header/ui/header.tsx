import { Group, Title } from "@mantine/core";
import { t } from "@lingui/core/macro";
import { UserMenu } from "@/processes/auth";
import {
  ThemeToggle,
  SilentFeatureErrorBoundary,
} from "@/shared/ui";
import { SubscriptionStatusBadgeConnected } from "@/entities/billing/ui";

interface HeaderProps {
  title?: string;
}

export function Header({ title = t`IQ Scaffold Platform` }: HeaderProps) {
  return (
    <Group h="100%" px="md" justify="space-between" data-testid="widget-header">
      <Title order={3} data-testid="header-title">
        {title}
      </Title>
      <Group gap="md">
        <SilentFeatureErrorBoundary>
          <SubscriptionStatusBadgeConnected />
        </SilentFeatureErrorBoundary>
        <ThemeToggle />
        <UserMenu />
      </Group>
    </Group>
  );
}
