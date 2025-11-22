/**
 * User Preferences Demo Page
 * Demonstrates all user preference features and components
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Title,
  Text,
  Stack,
  Grid,
  Paper,
  Group,
  Code,
  Divider,
} from "@mantine/core";
import {
  UserPreferencesForm,
  QuickThemeSwitcher,
  PreferenceCard,
} from "@/features/user-preferences";
import {
  useTheme,
  useLocale,
  useTimezone,
  useCurrency,
  useNotificationSettings,
  useTwoFactorStatus,
} from "@/entities/user";

export const Route = createFileRoute("/preferences-demo")({
  component: PreferencesDemoPage,
});

function PreferencesDemoPage() {
  const theme = useTheme();
  const locale = useLocale();
  const timezone = useTimezone();
  const currency = useCurrency();
  const notifications = useNotificationSettings();
  const twoFactor = useTwoFactorStatus();

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1}>User Preferences Demo</Title>
          <Text c="dimmed" mt="xs">
            Complete demonstration of the user preferences API integration
          </Text>
        </div>

        {/* Quick Actions */}
        <Paper shadow="sm" p="md" radius="md">
          <Group justify="space-between" align="center">
            <div>
              <Text fw={500}>Quick Theme Switcher</Text>
              <Text size="sm" c="dimmed">
                Change your theme preference instantly
              </Text>
            </div>
            <QuickThemeSwitcher />
          </Group>
        </Paper>

        {/* Current Values Display */}
        <Paper shadow="sm" p="md" radius="md">
          <Title order={3} mb="md">
            Current Preference Values
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            These values are fetched using custom hooks
          </Text>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Theme
                </Text>
                <Code>{theme}</Code>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Locale
                </Text>
                <Code>{locale}</Code>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Timezone
                </Text>
                <Code>{timezone}</Code>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Currency
                </Text>
                <Code>{currency}</Code>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Notifications
                </Text>
                <Code>
                  Email: {notifications.email ? "✓" : "✗"}, SMS:{" "}
                  {notifications.sms ? "✓" : "✗"}, Push:{" "}
                  {notifications.push ? "✓" : "✗"}
                </Code>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Two-Factor Auth
                </Text>
                <Code>
                  {twoFactor.enabled
                    ? `Enabled (${twoFactor.method})`
                    : "Disabled"}
                </Code>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        <Divider />

        {/* Side by Side Layout */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              <div>
                <Title order={2}>Full Preferences Form</Title>
                <Text c="dimmed" size="sm" mt="xs">
                  Manage all your preferences in one place
                </Text>
              </div>
              <UserPreferencesForm />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              <div>
                <Title order={2}>Preference Summary</Title>
                <Text c="dimmed" size="sm" mt="xs">
                  Quick overview of your settings
                </Text>
              </div>
              <PreferenceCard />
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Usage Examples */}
        <Paper shadow="sm" p="md" radius="md">
          <Title order={3} mb="md">
            Usage Examples
          </Title>
          <Stack gap="md">
            <div>
              <Text size="sm" fw={500} mb="xs">
                1. Using the full form component:
              </Text>
              <Code block>
                {`import { UserPreferencesForm } from "@/features/user-preferences";

function MyPage() {
  return <UserPreferencesForm />;
}`}
              </Code>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                2. Using the quick theme switcher:
              </Text>
              <Code block>
                {`import { QuickThemeSwitcher } from "@/features/user-preferences";

function Header() {
  return (
    <header>
      <QuickThemeSwitcher />
    </header>
  );
}`}
              </Code>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                3. Using custom hooks:
              </Text>
              <Code block>
                {`import { useTheme, useLocale } from "@/entities/user";

function MyComponent() {
  const theme = useTheme();
  const locale = useLocale();
  
  return <div>Theme: {theme}, Locale: {locale}</div>;
}`}
              </Code>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                4. Using React Query hooks directly:
              </Text>
              <Code block>
                {`import { useUserPreferences, useUpdateUserPreferences } from "@/entities/user";

function MyComponent() {
  const { data, isLoading } = useUserPreferences();
  const updateMutation = useUpdateUserPreferences();
  
  const handleUpdate = () => {
    updateMutation.mutate({ theme: "dark" });
  };
  
  return <button onClick={handleUpdate}>Switch to Dark</button>;
}`}
              </Code>
            </div>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
