import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { PipelineView } from "@/features/crm-leads";

export const Route = createFileRoute("/crm/pipeline")({
  component: PipelinePageRoute,
});

function PipelinePageRoute() {
  return (
    <AuthGuard>
      <div data-testid="page-crm-pipeline">
        <PipelineView showConversionMetrics highlightOverdueLeads />
      </div>
    </AuthGuard>
  );
}
