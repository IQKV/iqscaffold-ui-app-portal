import { createFileRoute } from "@tanstack/react-router";
import { Title, Paper, Text } from "@mantine/core";
import { AuthGuard } from "@/processes/auth";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AuthGuard>
      <Paper p="lg" withBorder data-testid="page-dashboard">
        <Title order={2} data-testid="dashboard-title">
          Dashboard
        </Title>
        <Text c="dimmed" data-testid="dashboard-description">
          Protected content visible to authenticated users.
        </Text>
      </Paper>
    </AuthGuard>
  );
}
