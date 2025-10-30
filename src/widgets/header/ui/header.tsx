import { Group, Title } from "@mantine/core";
import { t } from "@lingui/core/macro";

interface HeaderProps {
  title?: string;
}

export function Header({ title = t`Mantine UI Template` }: HeaderProps) {
  return (
    <Group h="100%" px="md" justify="space-between">
      <Title order={3}>{title}</Title>
    </Group>
  );
}
