import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { LeadDetailPage } from "@/features/crm-leads";

export const Route = createFileRoute("/crm/leads/$leadId")({
  component: LeadDetailPageRoute,
});

function LeadDetailPageRoute() {
  return (
    <AuthGuard>
      <div data-testid="page-crm-lead-detail">
        <LeadDetailPage />
      </div>
    </AuthGuard>
  );
}
