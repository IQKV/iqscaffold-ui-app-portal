/**
 * Locale Demo Component
 *
 * Demonstrates the unified i18n approach with:
 * - Frontend locale switching
 * - Backend API integration
 * - Locale header inspection
 * - Error message localization
 */

import {
  Stack,
  Title,
  Text,
  Paper,
  Group,
  Badge,
  Code,
  Button,
  Alert,
} from "@mantine/core";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher";
import { getCurrentLocale, resetLocale } from "@/shared/lib/locale-manager";
import {
  getUserLocalePreference,
  hasUserLocalePreference,
} from "@/shared/lib/locale-preference";
import { useState } from "react";
import { IconInfoCircle, IconLanguage } from "@tabler/icons-react";

export function LocaleDemo() {
  const { i18n, _ } = useLingui();
  const [refreshKey, setRefreshKey] = useState(0);

  const currentLocale = getCurrentLocale();
  const userPreference = getUserLocalePreference();
  const hasPreference = hasUserLocalePreference();

  const handleReset = async () => {
    await resetLocale();
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>{_(msg`Internationalization (i18n) Demo`)}</Title>
        <Text c="dimmed" size="sm">
          {_(
            msg`This demo shows the unified i18n approach across frontend and backend`
          )}
        </Text>
      </div>

      <Alert
        icon={<IconInfoCircle size={16} />}
        title={_(msg`How it works`)}
        color="blue"
      >
        <Stack gap="xs">
          <Text size="sm">
            {_(msg`When you change the language, the following happens:`)}
          </Text>
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            <li>
              <Text size="sm">
                {_(msg`Frontend UI updates to the selected language`)}
              </Text>
            </li>
            <li>
              <Text size="sm">
                {_(msg`Backend user preference is updated via API`)}
              </Text>
            </li>
            <li>
              <Text size="sm">
                {_(
                  msg`All API requests include Accept-Language and X-User-Locale headers`
                )}
              </Text>
            </li>
            <li>
              <Text size="sm">
                {_(
                  msg`Backend responses (errors, validation messages) are in your language`
                )}
              </Text>
            </li>
            <li>
              <Text size="sm">
                {_(
                  msg`Email notifications are sent in your preferred language`
                )}
              </Text>
            </li>
          </ul>
        </Stack>
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <div style={{ flex: 1 }}>
              <LocaleSwitcher updateBackend />
            </div>
            <Button
              variant="light"
              size="sm"
              onClick={handleReset}
              leftSection={<IconLanguage size={16} />}
            >
              {_(msg`Reset to Browser Default`)}
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder key={refreshKey}>
        <Stack gap="md">
          <Title order={4}>{_(msg`Current Locale Status`)}</Title>

          <Group gap="md">
            <div>
              <Text size="sm" c="dimmed">
                {_(msg`Active Locale`)}
              </Text>
              <Badge size="lg" variant="filled" color="blue">
                {currentLocale.toUpperCase()}
              </Badge>
            </div>

            <div>
              <Text size="sm" c="dimmed">
                {_(msg`User Preference`)}
              </Text>
              <Badge
                size="lg"
                variant={hasPreference ? "filled" : "light"}
                color={hasPreference ? "green" : "gray"}
              >
                {userPreference
                  ? userPreference.toUpperCase()
                  : _(msg`Not Set`)}
              </Badge>
            </div>
          </Group>

          <div>
            <Text size="sm" fw={500} mb="xs">
              {_(msg`API Request Headers`)}
            </Text>
            <Code block>
              {`Accept-Language: ${currentLocale}\n${userPreference ? `X-User-Locale: ${userPreference}` : "// X-User-Locale: (not set)"}`}
            </Code>
          </div>

          <div>
            <Text size="sm" fw={500} mb="xs">
              {_(msg`Backend Locale Resolution Priority`)}
            </Text>
            <Stack gap="xs">
              <Group gap="xs">
                <Badge size="sm" color="blue">
                  1
                </Badge>
                <Text size="sm">
                  {_(msg`X-User-Locale header (from user preference)`)}
                </Text>
              </Group>
              <Group gap="xs">
                <Badge size="sm" color="blue">
                  2
                </Badge>
                <Text size="sm">
                  {_(msg`Accept-Language header (from browser)`)}
                </Text>
              </Group>
              <Group gap="xs">
                <Badge size="sm" color="blue">
                  3
                </Badge>
                <Text size="sm">{_(msg`Default locale (English)`)}</Text>
              </Group>
            </Stack>
          </div>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Title order={4}>{_(msg`Localized Content Examples`)}</Title>

          <div>
            <Text size="sm" fw={500}>
              {_(msg`Welcome Message`)}
            </Text>
            <Text>
              {_(
                msg`Welcome to IQ Scaffold! Your language preference is active.`
              )}
            </Text>
          </div>

          <div>
            <Text size="sm" fw={500}>
              {_(msg`Date Formatting`)}
            </Text>
            <Text>
              {new Date().toLocaleDateString(currentLocale, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </div>

          <div>
            <Text size="sm" fw={500}>
              {_(msg`Number Formatting`)}
            </Text>
            <Text>
              {(1234567.89).toLocaleString(currentLocale, {
                style: "currency",
                currency: "USD",
              })}
            </Text>
          </div>
        </Stack>
      </Paper>

      <Alert icon={<IconInfoCircle size={16} />} color="teal">
        <Text size="sm">
          {_(
            msg`Your language preference is synchronized across all devices when you're logged in. Backend services will send emails and API responses in your preferred language.`
          )}
        </Text>
      </Alert>
    </Stack>
  );
}
