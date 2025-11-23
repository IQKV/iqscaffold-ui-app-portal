import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { DashboardFeature } from "@/features/dashboard";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <AuthGuard>
      <div data-testid="page-home">
        <DashboardFeature />
      </div>
    </AuthGuard>
  );
}
