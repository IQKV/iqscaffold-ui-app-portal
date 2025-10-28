import { Paper, Text, Group, ThemeIcon } from "@mantine/core";
import { IconArrowUpRight, IconArrowDownRight } from "@tabler/icons-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
}

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const isPositive = change && change > 0;
  const ChangeIcon = isPositive ? IconArrowUpRight : IconArrowDownRight;

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" fw={500} tt="uppercase">
            {title}
          </Text>
          <Text size="xl" fw={700} mt="xs">
            {value}
          </Text>
          {change !== undefined && (
            <Group gap="xs" mt="xs">
              <ThemeIcon
                color={isPositive ? "teal" : "red"}
                variant="light"
                size="sm"
              >
                <ChangeIcon size={16} />
              </ThemeIcon>
              <Text size="sm" c={isPositive ? "teal" : "red"} fw={500}>
                {Math.abs(change)}%
              </Text>
            </Group>
          )}
        </div>
        <ThemeIcon size="xl" radius="md" variant="light">
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}
