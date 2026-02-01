import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { FollowUpList, CrmLayout } from "@/features/crm-leads";
import { t } from "@lingui/core/macro";
import { usePageTitle } from "@/shared/lib";

/**
 * CRM Follow-ups Page Route
 *
 * Displays full follow-up management interface with filtering and bulk operations
 *
 * Requirements: 8.5
 */
export const Route = createFileRoute("/crm-follow-ups")({
  component: FollowUpsPageRoute,
});

function FollowUpsPageRoute() {
  const pageTitle = usePageTitle(t`CRM Follow-ups`);

  return (
    <AuthGuard>
      {pageTitle}
      <CrmLayout title={t`Follow-ups`}>
        <div data-testid="page-crm-follow-ups">
          <FollowUpList />
        </div>
      </CrmLayout>
    </AuthGuard>
  );
}
