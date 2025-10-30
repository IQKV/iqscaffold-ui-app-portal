import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import { IconHome, IconArrowLeft, IconError404 } from "@tabler/icons-react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { t } from "@lingui/core/macro";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

function NotFoundPage() {
  const router = useRouter();

  return (
    <Container size="md" py={80}>
      <Stack align="center" gap="xl">
        <ThemeIcon size={120} radius="xl" variant="light" color="red">
          <IconError404 size={80} />
        </ThemeIcon>

        <div style={{ textAlign: "center" }}>
          <Title order={1} size="3rem" mb="md">
            404
          </Title>
          <Title order={2} mb="md">
            {t`Page Not Found`}
          </Title>
          <Text size="lg" c="dimmed" mb="xl">
            {t`The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.`}
          </Text>
        </div>

        <Group>
          <Button
            leftSection={<IconArrowLeft size="1rem" />}
            variant="outline"
            onClick={() => router.history.back()}
          >
            {t`Go Back`}
          </Button>
          <Button
            leftSection={<IconHome size="1rem" />}
            component={Link}
            to="/"
          >
            {t`Go Home`}
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
