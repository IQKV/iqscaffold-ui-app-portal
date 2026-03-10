import { Container, Title, Text, Button, Group, Stack, ThemeIcon } from "@mantine/core";
import { IconHome, IconArrowLeft, IconError404 } from "@tabler/icons-react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { t } from "@lingui/core/macro";
import { usePageTitle } from "@/shared/lib";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

function NotFoundPage() {
  const router = useRouter();
  const pageTitle = usePageTitle(t`Page Not Found`);

  return (
    <>
      {pageTitle}
      <Container size="md" py={80} data-testid="page-404">
        <Stack align="center" gap="xl">
          <ThemeIcon size={120} radius="xl" variant="light" color="red">
            <IconError404 size={80} />
          </ThemeIcon>

          <div style={{ textAlign: "center" }}>
            <Title order={1} size="3rem" mb="md" data-testid="404-code">
              404
            </Title>
            <Title order={2} mb="md" data-testid="404-title">
              {t`Page Not Found`}
            </Title>
            <Text size="lg" c="dimmed" mb="xl" data-testid="404-message">
              {t`The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.`}
            </Text>
          </div>

          <Group>
            <Button
              leftSection={<IconArrowLeft size="1rem" />}
              variant="outline"
              onClick={() => router.history.back()}
              data-testid="btn-go-back"
            >
              {t`Go Back`}
            </Button>
            <Button
              leftSection={<IconHome size="1rem" />}
              component={Link}
              to="/"
              data-testid="btn-go-home"
            >
              {t`Go Home`}
            </Button>
          </Group>
        </Stack>
      </Container>
    </>
  );
}
