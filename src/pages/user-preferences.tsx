/**
 * User Preferences Page
 */

import { createFileRoute } from "@tanstack/react-router";
import { Container, Title, Text, Stack } from "@mantine/core";
import { UserPreferencesForm } from "@/features/user-preferences";
import { usePageTitle } from "@/shared/lib";
import { t } from "@lingui/core/macro";

export const Route = createFileRoute("/user-preferences")({
  component: UserPreferencesPage,
});

function UserPreferencesPage() {
  const pageTitle = usePageTitle(t`User Preferences`);

  return (
    <>
      {pageTitle}
      <Container size="lg" py="xl" data-testid="page-user-preferences">
        <Stack gap="lg">
          <div>
            <Title order={1} data-testid="preferences-title">
              {t`User Preferences`}
            </Title>
            <Text c="dimmed" mt="xs" data-testid="preferences-description">
              {t`Manage your personal settings and preferences`}
            </Text>
          </div>
          <UserPreferencesForm />
        </Stack>
      </Container>
    </>
  );
}
