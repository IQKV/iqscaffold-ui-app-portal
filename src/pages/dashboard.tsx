import { createFileRoute } from "@tanstack/react-router";
import { Title, Paper, Text } from "@mantine/core";
import { AuthGuard } from "@/processes/auth";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AuthGuard>
      <Paper p="lg" withBorder>
        <Title order={2}>Dashboard</Title>
        <Text c="dimmed">
          Protected content visible to authenticated users.
        </Text>
      </Paper>
    </AuthGuard>
  );
}
