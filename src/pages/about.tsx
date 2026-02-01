import {
  Anchor,
  Badge,
  Card,
  Container,
  Group,
  List,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconBrandGithub, IconInfoCircle } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { t } from "@lingui/core/macro";
import { usePageTitle } from "@/shared/lib";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const pageTitle = usePageTitle(t`About`);

  return (
    <AuthGuard>
      {pageTitle}
      <Container size="md" data-testid="page-about">
        <Stack gap="xl">
          <div>
            <Group mb="md">
              <IconInfoCircle size="2rem" color="var(--mantine-color-blue-6)" />
              <Title
                order={1}
                data-testid="about-title"
              >{t`About This Template`}</Title>
            </Group>
            <Text size="lg" c="dimmed" data-testid="about-description">
              {t`Learn more about the technologies and architecture used in this project`}
            </Text>
          </div>

          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            data-testid="card-tech-stack"
          >
            <Group justify="space-between" mb="xs">
              <Text fw={500}>{t`Technology Stack`}</Text>
              <Badge color="blue" variant="light">
                {t`Modern`}
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" mb="md">
              {t`This template is built with cutting-edge technologies for optimal developer experience and performance.`}
            </Text>

            <List spacing="sm" size="sm">
              <List.Item>
                <strong>{t`React 19:`}</strong>{" "}
                {t`Latest React with concurrent features and improved performance`}
              </List.Item>
              <List.Item>
                <strong>{t`TypeScript:`}</strong>{" "}
                {t`Type-safe development with enhanced developer experience`}
              </List.Item>
              <List.Item>
                <strong>{t`Vite:`}</strong>{" "}
                {t`Lightning-fast development server with instant HMR`}
              </List.Item>
              <List.Item>
                <strong>{t`Mantine UI:`}</strong>{" "}
                {t`Modern React components library with comprehensive theming`}
              </List.Item>
              <List.Item>
                <strong>{t`TanStack Router:`}</strong>{" "}
                {t`Type-safe routing with code splitting`}
              </List.Item>
              <List.Item>
                <strong>{t`TanStack Query:`}</strong>{" "}
                {t`Powerful data synchronization and caching`}
              </List.Item>
            </List>
          </Card>

          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            data-testid="card-architecture"
          >
            <Group justify="space-between" mb="xs">
              <Text fw={500}>{t`Architecture`}</Text>
              <Badge color="green" variant="light">
                {t`Scalable`}
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" mb="md">
              {t`Built following Feature-Sliced Design methodology for maintainable and scalable frontend architecture.`}
            </Text>

            <List spacing="sm" size="sm">
              <List.Item>
                <strong>{t`Feature-Sliced Design:`}</strong>{" "}
                {t`Organized by business features rather than technical layers`}
              </List.Item>
              <List.Item>
                <strong>{t`Type Safety:`}</strong>{" "}
                {t`End-to-end type safety from API to UI components`}
              </List.Item>
              <List.Item>
                <strong>{t`Testing Ready:`}</strong>{" "}
                {t`testing setup with Vitest and Playwright`}
              </List.Item>
              <List.Item>
                <strong>{t`Code Quality:`}</strong>{" "}
                {t`ESLint, Prettier, and automated quality checks`}
              </List.Item>
            </List>
          </Card>

          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            data-testid="card-getting-started"
          >
            <Group justify="space-between" mb="xs">
              <Text fw={500}>{t`Getting Started`}</Text>
              <Badge color="pink" variant="light">
                {t`Easy`}
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" mb="md">
              {t`Ready to start building? Check out the documentation and source code.`}
            </Text>

            <Group>
              <Anchor
                href="https://github.com/IQKV/ui-starter-app-portal"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-github"
              >
                <Group gap="xs">
                  <IconBrandGithub size="1rem" />
                  <Text size="sm">{t`View on GitHub`}</Text>
                </Group>
              </Anchor>
            </Group>
          </Card>
        </Stack>
      </Container>
    </AuthGuard>
  );
}
