import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/shared/ui";
import { UsersPage } from "@/features/users";

export const Route = createFileRoute("/users")({
  component: UsersPageRoute,
});

function UsersPageRoute() {
  return (
    <ProtectedRoute>
      <UsersPage />
    </ProtectedRoute>
  );
}
