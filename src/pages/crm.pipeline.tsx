import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { PipelineView, CrmLayout } from "@/features/crm-leads";
import { t } from "@lingui/core/macro";
import { usePageTitle } from "@/shared/lib";

export const Route = createFileRoute("/crm/pipeline")({
  component: PipelinePageRoute,
});

function PipelinePageRoute() {
  const pageTitle = usePageTitle(t`CRM Pipeline`);

  return (
    <AuthGuard>
      {pageTitle}
      <CrmLayout title={t`Pipeline`}>
        <div data-testid="page-crm-pipeline">
          <PipelineView showConversionMetrics highlightOverdueLeads />
        </div>
      </CrmLayout>
    </AuthGuard>
  );
}
