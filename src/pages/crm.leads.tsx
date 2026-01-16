import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { LeadListPage, CRMLayout } from "@/features/crm-leads";
import { t } from "@lingui/core/macro";

export const Route = createFileRoute("/crm/leads")({
  component: LeadsPageRoute,
});

function LeadsPageRoute() {
  return (
    <AuthGuard>
      <CRMLayout title={t`Leads`}>
        <div data-testid="page-crm-leads">
          <LeadListPage />
        </div>
      </CRMLayout>
    </AuthGuard>
  );
}
