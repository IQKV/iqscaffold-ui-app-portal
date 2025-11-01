import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { UsersPage } from "@/features/users";

export const Route = createFileRoute("/users")({
  component: UsersPageRoute,
});

function UsersPageRoute() {
  return (
    <AuthGuard>
      <UsersPage />
    </AuthGuard>
  );
}
