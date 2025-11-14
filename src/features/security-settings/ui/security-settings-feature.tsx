import { Button, Card, Stack, Text, Group, Alert } from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconShieldLock,
  IconDevices,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import { useLogoutAll } from "@/shared/lib/use-auth-api";
import { useAuthStore } from "@/processes/auth";

interface SecuritySettingsFeatureProps {
  showTitle?: boolean;
}

export function SecuritySettingsFeature({
  showTitle = true,
}: SecuritySettingsFeatureProps) {
  const logoutAll = useLogoutAll();
  const logout = useAuthStore((state) => state.logout);

  const handleLogoutAllDevices = () => {
    modals.openConfirmModal({
      title: t`Logout from All Devices`,
      children: (
        <Stack gap="md">
          <Text size="sm">
            {t`This will log you out from all devices where you're currently signed in, including this device.`}
          </Text>
          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="yellow"
            variant="light"
          >
            {t`You will need to sign in again on all devices.`}
          </Alert>
        </Stack>
      ),
      labels: {
        confirm: t`Logout from All Devices`,
        cancel: t`Cancel`,
      },
      confirmProps: { color: "red" },
      onConfirm: () => {
        logoutAll.mutate(undefined, {
          onSuccess: () => {
            // Also logout from current device
            setTimeout(() => {
              logout();
            }, 1000);
          },
        });
      },
    });
  };

  return (
    <Card shadow="md" padding="xl" radius="md" withBorder>
      <Stack gap="md">
        {showTitle && (
          <>
            <Group gap="xs">
              <IconShieldLock size={24} />
              <Text size="lg" fw={600}>
                {t`Security Settings`}
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              {t`Manage your account security and active sessions.`}
            </Text>
          </>
        )}

        <Card withBorder padding="md" radius="sm">
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start">
              <div>
                <Group gap="xs" mb="xs">
                  <IconDevices size={20} />
                  <Text fw={500}>{t`Active Sessions`}</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  {t`Logout from all devices where you're currently signed in. This is useful if you've lost a device or suspect unauthorized access.`}
                </Text>
              </div>
            </Group>

            <Button
              color="red"
              variant="light"
              onClick={handleLogoutAllDevices}
              loading={logoutAll.isPending}
              leftSection={<IconDevices size={16} />}
            >
              {t`Logout from All Devices`}
            </Button>
          </Stack>
        </Card>

        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="blue"
          variant="light"
        >
          <Text size="sm">
            {t`For additional security, we recommend changing your password regularly and enabling two-factor authentication when available.`}
          </Text>
        </Alert>
      </Stack>
    </Card>
  );
}
