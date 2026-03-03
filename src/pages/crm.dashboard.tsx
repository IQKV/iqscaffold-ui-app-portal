import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { CrmDashboard, CrmLayout } from "@/features/crm-leads";
import { FeatureGate } from "@/shared/ui";
import { CrmAccessGuard } from "@/entities/crm/ui/guards/CrmAccessGuard";
import { t } from "@lingui/core/macro";
import { usePageTitle } from "@/shared/lib";

/**
 * CRM Dashboard Page Route
 *
 * Displays CRM statistics, conversion metrics, and today's follow-ups
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.4
 */
export const Route = createFileRoute("/crm/dashboard")({
  component: CrmDashboardPage,
});

function CrmDashboardPage() {
  const pageTitle = usePageTitle(t`CRM Dashboard`);

  return (
    <AuthGuard>
      {pageTitle}
      <FeatureGate feature="crm">
        <CrmAccessGuard>
          <CrmLayout title={t`CRM Dashboard`}>
            <CrmDashboard />
          </CrmLayout>
        </CrmAccessGuard>
      </FeatureGate>
    </AuthGuard>
  );
}
