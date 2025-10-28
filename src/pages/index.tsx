import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/shared/ui";
import { DashboardFeature } from "@/features/dashboard";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardFeature />
    </ProtectedRoute>
  );
}
