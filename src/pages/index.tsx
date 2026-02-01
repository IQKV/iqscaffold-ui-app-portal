import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { DashboardFeature } from "@/features/dashboard";
import { usePageTitle } from "@/shared/lib";
import { t } from "@lingui/macro";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const pageTitle = usePageTitle(t`Home`);

  return (
    <AuthGuard>
      {pageTitle}
      <div data-testid="page-home">
        <DashboardFeature />
      </div>
    </AuthGuard>
  );
}
