import {
  Container,
  Title,
  Stack,
  Group,
  Paper,
  Text,
  Divider,
} from "@mantine/core";
import { AvatarUpload } from "@/entities/user/ui/avatar-upload";
import { useAuthStore } from "@/processes/auth/model/store";
import { useAvatarUrl } from "@/entities/user/model/use-avatar";

export function AvatarDemoPage() {
  const user = useAuthStore((s) => s.user);
  const { data: avatarData, isLoading, error } = useAvatarUrl();

  if (!user) {
    return (
      <Container size="md" py="xl">
        <Text>Please log in to view this page.</Text>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Title order={1}>Avatar Management Demo</Title>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Current User</Title>
            <Group>
              <Text>
                <strong>Name:</strong> {user.firstName} {user.lastName}
              </Text>
              <Text>
                <strong>Email:</strong> {user.email}
              </Text>
            </Group>

            <Divider />

            <Title order={4}>Avatar Status</Title>
            <Group>
              <Text>
                <strong>Has Avatar:</strong> {user.avatarUrl ? "Yes" : "No"}
              </Text>
              {user.avatarUrl && (
                <Text>
                  <strong>Avatar URL:</strong> {user.avatarUrl}
                </Text>
              )}
              {user.avatarUpdatedAt && (
                <Text>
                  <strong>Last Updated:</strong>{" "}
                  {new Date(user.avatarUpdatedAt).toLocaleString()}
                </Text>
              )}
            </Group>

            {isLoading && <Text c="blue">Loading avatar...</Text>}
            {error && (
              <Text c="red">Error loading avatar: {error.message}</Text>
            )}
            {avatarData && (
              <Text c="green">Avatar URL from API: {avatarData.avatarUrl}</Text>
            )}
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Avatar Upload - Menu Variant</Title>
            <Text size="sm" c="dimmed">
              Click on the avatar to see upload/delete options in a menu
            </Text>
            <Group>
              <AvatarUpload size={60} variant="menu" />
            </Group>
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Avatar Upload - Inline Variant</Title>
            <Text size="sm" c="dimmed">
              Inline buttons for upload and delete operations
            </Text>
            <AvatarUpload size={60} variant="inline" />
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Avatar Upload - Large Size</Title>
            <Text size="sm" c="dimmed">
              Large avatar with upload functionality
            </Text>
            <Group>
              <AvatarUpload size={120} variant="menu" />
            </Group>
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Avatar Upload - Upload Only</Title>
            <Text size="sm" c="dimmed">
              Avatar with upload functionality but no delete button
            </Text>
            <Group>
              <AvatarUpload
                size={60}
                variant="inline"
                showDeleteButton={false}
              />
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
