import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { LeadListPage } from "@/features/crm-leads";

export const Route = createFileRoute("/crm/leads")({
  component: LeadsPageRoute,
});

function LeadsPageRoute() {
  return (
    <AuthGuard>
      <div data-testid="page-crm-leads">
        <LeadListPage />
      </div>
    </AuthGuard>
  );
}
