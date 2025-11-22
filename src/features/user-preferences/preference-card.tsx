/**
 * Preference Card Component
 * Displays a summary of user preferences in a card format
 */

import { Card, Text, Group, Badge, Stack, Skeleton } from "@mantine/core";
import {
  IconWorld,
  IconClock,
  IconCurrencyDollar,
  IconPalette,
  IconBell,
  IconShield,
} from "@tabler/icons-react";
import { useUserPreferences } from "@/entities/user";

export function PreferenceCard() {
  const { data: preferences, isLoading } = useUserPreferences();

  if (isLoading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Skeleton height={20} width="60%" />
          <Skeleton height={16} />
          <Skeleton height={16} />
          <Skeleton height={16} />
        </Stack>
      </Card>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Text fw={500} size="lg">
          Your Preferences
        </Text>

        <Group gap="xs">
          <IconWorld size={16} />
          <Text size="sm" c="dimmed">
            Language:
          </Text>
          <Badge variant="light">{preferences.locale.toUpperCase()}</Badge>
        </Group>

        <Group gap="xs">
          <IconClock size={16} />
          <Text size="sm" c="dimmed">
            Timezone:
          </Text>
          <Badge variant="light">{preferences.timezone}</Badge>
        </Group>

        <Group gap="xs">
          <IconCurrencyDollar size={16} />
          <Text size="sm" c="dimmed">
            Currency:
          </Text>
          <Badge variant="light">{preferences.currency}</Badge>
        </Group>

        <Group gap="xs">
          <IconPalette size={16} />
          <Text size="sm" c="dimmed">
            Theme:
          </Text>
          <Badge
            variant="light"
            color={
              preferences.theme === "dark"
                ? "dark"
                : preferences.theme === "light"
                  ? "yellow"
                  : "blue"
            }
          >
            {preferences.theme}
          </Badge>
        </Group>

        <Group gap="xs">
          <IconBell size={16} />
          <Text size="sm" c="dimmed">
            Notifications:
          </Text>
          <Group gap={4}>
            {preferences.notificationEmail && (
              <Badge size="xs" variant="dot" color="blue">
                Email
              </Badge>
            )}
            {preferences.notificationSms && (
              <Badge size="xs" variant="dot" color="green">
                SMS
              </Badge>
            )}
            {preferences.notificationPush && (
              <Badge size="xs" variant="dot" color="violet">
                Push
              </Badge>
            )}
          </Group>
        </Group>

        <Group gap="xs">
          <IconShield size={16} />
          <Text size="sm" c="dimmed">
            2FA:
          </Text>
          <Badge
            variant="light"
            color={preferences.twoFactorEnabled ? "green" : "gray"}
          >
            {preferences.twoFactorEnabled
              ? `Enabled (${preferences.twoFactorMethod})`
              : "Disabled"}
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
}
