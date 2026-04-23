import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { UsersPage } from "@/features/users";
import { usePageTitle } from "@/shared/lib";
import { t } from "@lingui/core/macro";

export const Route = createFileRoute("/users")({
  component: UsersPageRoute,
});

function UsersPageRoute() {
  const pageTitle = usePageTitle(t`Users`);

  return (
    <AuthGuard>
      {pageTitle}
      <div data-testid="page-users">
        <UsersPage />
      </div>
    </AuthGuard>
  );
}
