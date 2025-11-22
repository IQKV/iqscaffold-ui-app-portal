/**
 * User Preferences Form Component
 * Allows users to manage their personal preferences
 */

import { useEffect } from "react";
import {
  Stack,
  TextInput,
  Select,
  Textarea,
  Switch,
  Button,
  Group,
  Paper,
  Title,
  Text,
  Divider,
  Grid,
  LoadingOverlay,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconAlertCircle, IconAlertTriangle } from "@tabler/icons-react";
import {
  useUserPreferences,
  useUpdateUserPreferences,
  useDeleteUserPreferences,
  type UpdateUserPreferenceRequest,
} from "@/entities/user";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto (System)" },
];

const TWO_FACTOR_OPTIONS = [
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "app", label: "Authenticator App" },
];

const LOCALE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
];

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "America/New York" },
  { value: "America/Los_Angeles", label: "America/Los Angeles" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Paris", label: "Europe/Paris" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
];

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "JPY", label: "JPY (¥)" },
];

export function UserPreferencesForm() {
  const { data: preferences, isLoading, error } = useUserPreferences();
  const updateMutation = useUpdateUserPreferences();
  const deleteMutation = useDeleteUserPreferences();

  const form = useForm<UpdateUserPreferenceRequest>({
    initialValues: {
      locale: "en",
      timezone: "UTC",
      currency: "USD",
      dateFormat: "yyyy-MM-dd",
      timeFormat: "HH:mm:ss",
      theme: "light",
      profilePhotoUrl: "",
      phoneNumber: "",
      bio: "",
      notificationEmail: true,
      notificationSms: false,
      notificationPush: true,
      twoFactorEnabled: false,
      twoFactorMethod: undefined,
    },
  });

  // Update form when preferences are loaded
  useEffect(() => {
    if (preferences) {
      form.setValues({
        locale: preferences.locale,
        timezone: preferences.timezone,
        currency: preferences.currency,
        dateFormat: preferences.dateFormat,
        timeFormat: preferences.timeFormat,
        theme: preferences.theme,
        profilePhotoUrl: preferences.profilePhotoUrl || "",
        phoneNumber: preferences.phoneNumber || "",
        bio: preferences.bio || "",
        notificationEmail: preferences.notificationEmail,
        notificationSms: preferences.notificationSms,
        notificationPush: preferences.notificationPush,
        twoFactorEnabled: preferences.twoFactorEnabled,
        twoFactorMethod: preferences.twoFactorMethod || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences]);

  const handleSubmit = (values: UpdateUserPreferenceRequest) => {
    updateMutation.mutate(values);
  };

  const handleReset = () => {
    modals.openConfirmModal({
      title: (
        <Group gap="xs">
          <IconAlertTriangle size={20} color="var(--mantine-color-red-6)" />
          <Text fw={600}>Reset Preferences</Text>
        </Group>
      ),
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to reset all preferences to defaults? This
          action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Reset to Defaults", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(),
    });
  };

  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error"
        color="red"
        variant="filled"
      >
        Failed to load preferences. Please try again later.
      </Alert>
    );
  }

  return (
    <Paper shadow="sm" p="xl" radius="md" pos="relative">
      <LoadingOverlay
        visible={
          isLoading || updateMutation.isPending || deleteMutation.isPending
        }
      />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="xl">
          {/* Localization Section */}
          <div>
            <Title order={3} mb="md">
              Localization
            </Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Language"
                  placeholder="Select language"
                  data={LOCALE_OPTIONS}
                  {...form.getInputProps("locale")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Timezone"
                  placeholder="Select timezone"
                  data={TIMEZONE_OPTIONS}
                  searchable
                  {...form.getInputProps("timezone")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Currency"
                  placeholder="Select currency"
                  data={CURRENCY_OPTIONS}
                  {...form.getInputProps("currency")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Date Format"
                  placeholder="yyyy-MM-dd"
                  {...form.getInputProps("dateFormat")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Time Format"
                  placeholder="HH:mm:ss"
                  {...form.getInputProps("timeFormat")}
                />
              </Grid.Col>
            </Grid>
          </div>

          <Divider />

          {/* Display Section */}
          <div>
            <Title order={3} mb="md">
              Display
            </Title>
            <Select
              label="Theme"
              placeholder="Select theme"
              data={THEME_OPTIONS}
              {...form.getInputProps("theme")}
            />
          </div>

          <Divider />

          {/* Profile Section */}
          <div>
            <Title order={3} mb="md">
              Profile
            </Title>
            <Stack gap="md">
              <TextInput
                label="Profile Photo URL"
                placeholder="https://example.com/photo.jpg"
                {...form.getInputProps("profilePhotoUrl")}
              />
              <TextInput
                label="Phone Number"
                placeholder="+1234567890"
                {...form.getInputProps("phoneNumber")}
              />
              <Textarea
                label="Bio"
                placeholder="Tell us about yourself..."
                minRows={3}
                maxRows={6}
                {...form.getInputProps("bio")}
              />
            </Stack>
          </div>

          <Divider />

          {/* Notifications Section */}
          <div>
            <Title order={3} mb="md">
              Notifications
            </Title>
            <Stack gap="sm">
              <Switch
                label="Email Notifications"
                description="Receive notifications via email"
                {...form.getInputProps("notificationEmail", {
                  type: "checkbox",
                })}
              />
              <Switch
                label="SMS Notifications"
                description="Receive notifications via SMS"
                {...form.getInputProps("notificationSms", { type: "checkbox" })}
              />
              <Switch
                label="Push Notifications"
                description="Receive push notifications in browser"
                {...form.getInputProps("notificationPush", {
                  type: "checkbox",
                })}
              />
            </Stack>
          </div>

          <Divider />

          {/* Security Section */}
          <div>
            <Title order={3} mb="md">
              Security
            </Title>
            <Stack gap="md">
              <Switch
                label="Two-Factor Authentication"
                description="Enable two-factor authentication for enhanced security"
                {...form.getInputProps("twoFactorEnabled", {
                  type: "checkbox",
                })}
              />
              {form.values.twoFactorEnabled && (
                <Select
                  label="Two-Factor Method"
                  placeholder="Select method"
                  data={TWO_FACTOR_OPTIONS}
                  {...form.getInputProps("twoFactorMethod")}
                />
              )}
            </Stack>
          </div>

          <Divider />

          {/* Action Buttons */}
          <Group justify="space-between">
            <Button
              variant="subtle"
              color="red"
              onClick={handleReset}
              disabled={updateMutation.isPending || deleteMutation.isPending}
            >
              Reset to Defaults
            </Button>
            <Group>
              <Button
                variant="default"
                onClick={() => form.reset()}
                disabled={updateMutation.isPending || deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={updateMutation.isPending}
                disabled={deleteMutation.isPending}
              >
                Save Preferences
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
