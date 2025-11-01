import { Group, Title } from "@mantine/core";
import { t } from "@lingui/core/macro";
import { UserMenu } from "@/processes/auth";

interface HeaderProps {
  title?: string;
}

export function Header({ title = t`Mantine UI Template` }: HeaderProps) {
  return (
    <Group h="100%" px="md" justify="space-between">
      <Title order={3}>{title}</Title>
      <UserMenu />
    </Group>
  );
}
