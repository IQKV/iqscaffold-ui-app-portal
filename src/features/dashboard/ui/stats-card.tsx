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
  const testId = `stats-card-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <Paper withBorder p="md" radius="md" data-testid={testId}>
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" fw={500} tt="uppercase" data-testid={`${testId}-title`}>
            {title}
          </Text>
          <Text size="xl" fw={700} mt="xs" data-testid={`${testId}-value`}>
            {value}
          </Text>
          {change !== undefined && (
            <Group gap="xs" mt="xs">
              <ThemeIcon color={isPositive ? "teal" : "red"} variant="light" size="sm">
                <ChangeIcon size={16} />
              </ThemeIcon>
              <Text
                size="sm"
                c={isPositive ? "teal" : "red"}
                fw={500}
                data-testid={`${testId}-change`}
              >
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
