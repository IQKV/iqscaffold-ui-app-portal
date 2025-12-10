import { Group, Title } from "@mantine/core";
import { msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { UserMenu } from "@/processes/auth";
import { ThemeToggle, LocaleSelector } from "@/shared/ui";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { _ } = useLingui();
  const defaultTitle = _(msg`IQ Scaffold Platform`);

  return (
    <Group h="100%" px="md" justify="space-between" data-testid="widget-header">
      <Title order={3} data-testid="header-title">
        {title || defaultTitle}
      </Title>
      <Group gap="md">
        <LocaleSelector variant="menu" size="sm" />
        <ThemeToggle />
        <UserMenu />
      </Group>
    </Group>
  );
}
