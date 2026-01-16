import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { FollowUpList, CRMLayout } from "@/features/crm-leads";
import { t } from "@lingui/core/macro";

/**
 * CRM Follow-ups Page Route
 *
 * Displays full follow-up management interface with filtering and bulk operations
 *
 * Requirements: 8.5
 */
export const Route = createFileRoute("/crm/follow-ups")({
  component: FollowUpsPageRoute,
});

function FollowUpsPageRoute() {
  return (
    <AuthGuard>
      <CRMLayout title={t`Follow-ups`}>
        <div data-testid="page-crm-follow-ups">
          <FollowUpList />
        </div>
      </CRMLayout>
    </AuthGuard>
  );
}
