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
import { ProtectedRoute } from "@/shared/ui";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <ProtectedRoute>
      <Container size="md">
        <Stack gap="xl">
          <div>
            <Group mb="md">
              <IconInfoCircle size="2rem" color="var(--mantine-color-blue-6)" />
              <Title order={1}>About This Template</Title>
            </Group>
            <Text size="lg" c="dimmed">
              Learn more about the technologies and architecture used in this
              project
            </Text>
          </div>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Technology Stack</Text>
              <Badge color="blue" variant="light">
                Modern
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" mb="md">
              This template is built with cutting-edge technologies for optimal
              developer experience and performance.
            </Text>

            <List spacing="sm" size="sm">
              <List.Item>
                <strong>React 19:</strong> Latest React with concurrent features
                and improved performance
              </List.Item>
              <List.Item>
                <strong>TypeScript:</strong> Type-safe development with enhanced
                developer experience
              </List.Item>
              <List.Item>
                <strong>Vite:</strong> Lightning-fast development server with
                instant HMR
              </List.Item>
              <List.Item>
                <strong>Mantine UI:</strong> Modern React components library
                with comprehensive theming
              </List.Item>
              <List.Item>
                <strong>TanStack Router:</strong> Type-safe routing with code
                splitting
              </List.Item>
              <List.Item>
                <strong>TanStack Query:</strong> Powerful data synchronization
                and caching
              </List.Item>
            </List>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Architecture</Text>
              <Badge color="green" variant="light">
                Scalable
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" mb="md">
              Built following Feature-Sliced Design methodology for maintainable
              and scalable frontend architecture.
            </Text>

            <List spacing="sm" size="sm">
              <List.Item>
                <strong>Feature-Sliced Design:</strong> Organized by business
                features rather than technical layers
              </List.Item>
              <List.Item>
                <strong>Type Safety:</strong> End-to-end type safety from API to
                UI components
              </List.Item>
              <List.Item>
                <strong>Testing Ready:</strong> testing setup with Vitest and
                Playwright
              </List.Item>
              <List.Item>
                <strong>Code Quality:</strong> ESLint, Prettier, and automated
                quality checks
              </List.Item>
            </List>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Getting Started</Text>
              <Badge color="pink" variant="light">
                Easy
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" mb="md">
              Ready to start building? Check out the documentation and source
              code.
            </Text>

            <Group>
              <Anchor
                href="https://github.com/IQKV/standard-mantine-ui-project-layout"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Group gap="xs">
                  <IconBrandGithub size="1rem" />
                  <Text size="sm">View on GitHub</Text>
                </Group>
              </Anchor>
            </Group>
          </Card>
        </Stack>
      </Container>
    </ProtectedRoute>
  );
}
