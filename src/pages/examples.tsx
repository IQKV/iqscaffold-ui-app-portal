import {
  Container,
  Stack,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Badge,
  Button,
  Avatar,
  ActionIcon,
} from "@mantine/core";
import {
  IconCode,
  IconPalette,
  IconDatabase,
  IconEdit,
  IconTrash,
  IconEye,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import {
  DataTable,
  useConfirmationModal,
  type DataTableColumn,
} from "@/shared/ui";
import { AuthGuard } from "@/processes/auth";
import { notificationService, usePageTitle } from "@/shared/lib";
import { t } from "@lingui/core/macro";

export const Route = createFileRoute("/examples")({
  component: ExamplesPage,
});

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  avatar?: string;
}

function ExamplesPage() {
  const pageTitle = usePageTitle(t`Examples`);
  const confirmationModal = useConfirmationModal({
    title: t`Delete User`,
    message: t`Are you sure you want to delete this user? This action cannot be undone.`,
    confirmLabel: t`Delete`,
    danger: true,
  });

  // Sample data for the data table
  const users: User[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "User",
      status: "active",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "User",
      status: "inactive",
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice@example.com",
      role: "Moderator",
      status: "active",
    },
  ];

  const columns: DataTableColumn<User>[] = [
    {
      key: "name",
      title: t`User`,
      render: (_, record) => (
        <Group gap="sm">
          <Avatar size="sm" radius="xl">
            {record.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <div>
            <Text fw={500} size="sm">
              {record.name}
            </Text>
            <Text size="xs" c="dimmed">
              {record.email}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: "role",
      title: t`Role`,
      render: (value) => (
        <Badge
          color={
            value === "Admin" ? "red" : value === "Moderator" ? "blue" : "gray"
          }
          variant="light"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      title: t`Status`,
      render: (value) => (
        <Badge color={value === "active" ? "green" : "gray"} variant="light">
          {value}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: t`Actions`,
      render: (_, record) => (
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => {
              const userName = record.name;
              notificationService.info({ message: t`Viewing ${userName}` });
            }}
          >
            <IconEye size="1rem" />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="orange"
            onClick={() => {
              const userName = record.name;
              notificationService.info({ message: t`Editing ${userName}` });
            }}
          >
            <IconEdit size="1rem" />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() =>
              confirmationModal.confirm(() => {
                const userName = record.name;
                notificationService.success({
                  message: t`${userName} deleted successfully`,
                });
              })
            }
          >
            <IconTrash size="1rem" />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const handleSort = (key: string, direction: "asc" | "desc") => {
    notificationService.info({
      message: t`Sorting by ${key} in ${direction} order`,
    });
  };

  return (
    <AuthGuard>
      {pageTitle}
      <Container size="xl" data-testid="page-examples">
        <Stack gap="xl">
          <div>
            <Title order={1} mb="md" data-testid="examples-title">
              {t`Component Examples`}
            </Title>
            <Text c="dimmed" data-testid="examples-description">
              {t`Explore the various components and features available in this template`}
            </Text>
          </div>

          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                h="100%"
                data-testid="card-forms"
              >
                <Group mb="md">
                  <IconCode size="1.5rem" color="var(--mantine-color-blue-6)" />
                  <Title order={3}>{t`Forms`}</Title>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  {t`Reusable form components with validation, built using Mantine Form and custom validation rules.`}
                </Text>
                <Badge color="blue" variant="light">
                  {t`Interactive`}
                </Badge>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                h="100%"
                data-testid="card-data-tables"
              >
                <Group mb="md">
                  <IconDatabase
                    size="1.5rem"
                    color="var(--mantine-color-green-6)"
                  />
                  <Title order={3}>{t`Data Tables`}</Title>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  {t`Sortable, filterable data tables with pagination and custom cell rendering.`}
                </Text>
                <Badge color="green" variant="light">
                  {t`Functional`}
                </Badge>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                h="100%"
                data-testid="card-ui-components"
              >
                <Group mb="md">
                  <IconPalette
                    size="1.5rem"
                    color="var(--mantine-color-orange-6)"
                  />
                  <Title order={3}>{t`UI Components`}</Title>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  {t`Confirmation modals, notifications, loading states, and error boundaries.`}
                </Text>
                <Badge color="orange" variant="light">
                  {t`Reusable`}
                </Badge>
              </Card>
            </Grid.Col>
          </Grid>

          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            data-testid="section-data-table"
          >
            <Group justify="space-between" mb="md">
              <div>
                <Title order={3}>{t`Data Table Example`}</Title>
                <Text size="sm" c="dimmed">
                  {t`Interactive data table with sorting, actions, and custom rendering`}
                </Text>
              </div>
              <Button
                data-testid="btn-add-user-demo"
                onClick={() =>
                  notificationService.info({ message: t`Add new user clicked` })
                }
              >
                {t`Add User`}
              </Button>
            </Group>

            <DataTable
              data={users}
              columns={columns}
              onSort={handleSort}
              emptyText={t`No users found`}
            />
          </Card>

          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            data-testid="section-notifications"
          >
            <Title order={3} mb="md">
              {t`Notification Examples`}
            </Title>
            <Text size="sm" c="dimmed" mb="md">
              {t`Test different types of notifications`}
            </Text>

            <Group>
              <Button
                color="green"
                data-testid="btn-notification-success"
                onClick={() =>
                  notificationService.success({
                    message: t`Success notification!`,
                  })
                }
              >
                {t`Success`}
              </Button>
              <Button
                color="red"
                data-testid="btn-notification-error"
                onClick={() =>
                  notificationService.error({ message: t`Error notification!` })
                }
              >
                {t`Error`}
              </Button>
              <Button
                color="yellow"
                data-testid="btn-notification-warning"
                onClick={() =>
                  notificationService.warning({
                    message: t`Warning notification!`,
                  })
                }
              >
                {t`Warning`}
              </Button>
              <Button
                color="blue"
                data-testid="btn-notification-info"
                onClick={() =>
                  notificationService.info({ message: t`Info notification!` })
                }
              >
                {t`Info`}
              </Button>
            </Group>
          </Card>

          {confirmationModal.modal}
        </Stack>
      </Container>
    </AuthGuard>
  );
}
