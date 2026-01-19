import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { LeadDetailPage, CrmLayout } from "@/features/crm-leads";
import { t } from "@lingui/core/macro";

export const Route = createFileRoute("/crm/leads/$leadId")({
  component: LeadDetailPageRoute,
});

function LeadDetailPageRoute() {
  return (
    <AuthGuard>
      <CrmLayout title={t`Lead Details`}>
        <div data-testid="page-crm-lead-detail">
          <LeadDetailPage />
        </div>
      </CrmLayout>
    </AuthGuard>
  );
}
