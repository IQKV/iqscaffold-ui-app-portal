import { Card, Stack, Text, Badge, Group, Loader, Alert } from "@mantine/core";
import { IconMail, IconCheck, IconX, IconAlertCircle } from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import { useEmailStatus } from "@/shared/lib/use-auth-api";

interface EmailStatusCheckerFeatureProps {
  email: string;
  showTitle?: boolean;
}

export function EmailStatusCheckerFeature({
  email,
  showTitle = true,
}: EmailStatusCheckerFeatureProps) {
  const { data, isLoading, error } = useEmailStatus(email, !!email);

  if (!email) {
    return null;
  }

  return (
    <Card shadow="md" padding="xl" radius="md" withBorder>
      <Stack gap="md">
        {showTitle && (
          <Group gap="xs">
            <IconMail size={24} />
            <Text size="lg" fw={600}>
              {t`Email Verification Status`}
            </Text>
          </Group>
        )}

        {isLoading && (
          <Group gap="sm">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">
              {t`Checking email status...`}
            </Text>
          </Group>
        )}

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {t`Failed to check email status. Please try again.`}
          </Alert>
        )}

        {data && (
          <Stack gap="sm">
            <Card withBorder padding="md" radius="sm">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    {t`Email Address`}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {data.email}
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    {t`Status`}
                  </Text>
                  <Badge
                    color={data.emailVerified ? "green" : "yellow"}
                    variant="light"
                    leftSection={data.emailVerified ? <IconCheck size={12} /> : <IconX size={12} />}
                  >
                    {data.emailVerified ? t`Verified` : t`Not Verified`}
                  </Badge>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    {t`Registered`}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {new Date(data.registrationDate).toLocaleDateString()}
                  </Text>
                </Group>
              </Stack>
            </Card>

            {data.message && (
              <Alert
                icon={data.emailVerified ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
                color={data.emailVerified ? "green" : "yellow"}
                variant="light"
              >
                <Text size="sm">{data.message}</Text>
              </Alert>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
