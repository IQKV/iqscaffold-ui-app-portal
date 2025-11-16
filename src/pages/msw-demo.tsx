import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  Button,
} from "@mantine/core";
import { useMSWControl } from "@/shared/lib";
import { useUsersQuery } from "@/features/users/hooks/use-users-query";

export function MSWDemoPage() {
  const { config, isRunning, toggleMSW } = useMSWControl();
  const {
    data: usersData,
    isLoading,
    error,
  } = useUsersQuery({ page: 1, limit: 5 });

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            MSW Demo Page
          </Title>
          <Text c="dimmed" size="lg">
            This page demonstrates Mock Service Worker (MSW) functionality. The
            API calls below use mocked responses when MSW is enabled.
          </Text>
        </div>

        <Card withBorder padding="md">
          <Group justify="space-between" mb="md">
            <Text fw={500}>MSW Status</Text>
            <Badge color={isRunning ? "green" : "gray"}>
              {isRunning ? "Active" : "Inactive"}
            </Badge>
          </Group>

          <Stack gap="xs" mb="md">
            <Group>
              <Text size="sm" c="dimmed">
                Enabled:
              </Text>
              <Text size="sm">{config.enabled ? "Yes" : "No"}</Text>
            </Group>
            <Group>
              <Text size="sm" c="dimmed">
                Logging:
              </Text>
              <Text size="sm">{config.enableLogging ? "Yes" : "No"}</Text>
            </Group>
            <Group>
              <Text size="sm" c="dimmed">
                Unhandled Requests:
              </Text>
              <Text size="sm">{config.onUnhandledRequest}</Text>
            </Group>
            <Group>
              <Text size="sm" c="dimmed">
                Delay:
              </Text>
              <Text size="sm">
                {config.delay
                  ? typeof config.delay === "object"
                    ? `${config.delay.min}-${config.delay.max}ms`
                    : `${config.delay}ms`
                  : "None"}
              </Text>
            </Group>
          </Stack>

          <Button onClick={toggleMSW} variant="outline">
            {isRunning ? "Disable MSW" : "Enable MSW"}
          </Button>
        </Card>

        <Card withBorder padding="md">
          <Title order={2} mb="md">
            API Demo: Users List
          </Title>
          <Text c="dimmed" mb="md">
            This component fetches data from <code>/api/v1/admin/users</code>.
            When MSW is enabled, it returns mock data. When disabled, it will
            attempt to call your real API.
          </Text>

          {isLoading && <Text>Loading users...</Text>}

          {error && (
            <Text c="red">
              Error:{" "}
              {error instanceof Error ? error.message : "Failed to load users"}
            </Text>
          )}

          {usersData && (
            <Stack gap="sm">
              <Text fw={500}>Users ({usersData.data.length}):</Text>
              {usersData.data.map((user) => (
                <Card key={user.id} withBorder padding="sm">
                  <Group>
                    <div>
                      <Text fw={500}>
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {user.email}
                      </Text>
                    </div>
                    <Badge
                      color={user.roles.includes("ADMIN") ? "red" : "blue"}
                      variant="light"
                    >
                      {user.roles.join(", ")}
                    </Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Card>

        <Card withBorder padding="md">
          <Title order={3} mb="md">
            How to Use MSW
          </Title>
          <Stack gap="md">
            <div>
              <Text fw={500} mb="xs">
                1. Environment Configuration
              </Text>
              <Text size="sm" c="dimmed">
                Set <code>VITE_ENABLE_MSW=true</code> in your <code>.env</code>{" "}
                file
              </Text>
            </div>

            <div>
              <Text fw={500} mb="xs">
                2. Development Tools
              </Text>
              <Text size="sm" c="dimmed">
                Use the floating MSW Dev Tools panel (bottom-right) to control
                MSW at runtime
              </Text>
            </div>

            <div>
              <Text fw={500} mb="xs">
                3. Add New Mocks
              </Text>
              <Text size="sm" c="dimmed">
                Create handlers in <code>src/shared/mocks/handlers/</code> and
                export them
              </Text>
            </div>

            <div>
              <Text fw={500} mb="xs">
                4. Testing
              </Text>
              <Text size="sm" c="dimmed">
                MSW automatically works in tests - no additional setup required
              </Text>
            </div>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
