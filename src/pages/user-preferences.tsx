/**
 * User Preferences Page
 */

import { createFileRoute } from "@tanstack/react-router";
import { Container, Title, Text, Stack } from "@mantine/core";
import { UserPreferencesForm } from "@/features/user-preferences";

export const Route = createFileRoute("/user-preferences")({
  component: UserPreferencesPage,
});

function UserPreferencesPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>User Preferences</Title>
          <Text c="dimmed" mt="xs">
            Manage your personal settings and preferences
          </Text>
        </div>
        <UserPreferencesForm />
      </Stack>
    </Container>
  );
}
