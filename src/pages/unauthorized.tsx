import { createFileRoute } from "@tanstack/react-router";
import { Paper, Title, Text } from "@mantine/core";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  return (
    <Paper p="lg" withBorder>
      <Title order={2}>Unauthorized</Title>
      <Text c="dimmed">You do not have permission to view this page.</Text>
    </Paper>
  );
}
