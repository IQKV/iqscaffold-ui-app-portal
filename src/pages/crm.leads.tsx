import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { LeadListPage, CrmLayout } from "@/features/crm-leads";
import { t } from "@lingui/core/macro";
import { usePageTitle } from "@/shared/lib";

export const Route = createFileRoute("/crm/leads")({
  component: LeadsPageRoute,
});

function LeadsPageRoute() {
  const pageTitle = usePageTitle(t`CRM Leads`);

  return (
    <AuthGuard>
      {pageTitle}
      <CrmLayout title={t`Leads`}>
        <div data-testid="page-crm-leads">
          <LeadListPage />
        </div>
      </CrmLayout>
    </AuthGuard>
  );
}
