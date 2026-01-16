import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { CRMDashboard } from "@/features/crm-leads";

/**
 * CRM Dashboard Page Route
 * 
 * Displays CRM statistics, conversion metrics, and today's follow-ups
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.4
 */
export const Route = createFileRoute("/crm/dashboard")({
  component: CRMDashboardPage,
});

function CRMDashboardPage() {
  return (
    <AuthGuard>
      <CRMDashboard />
    </AuthGuard>
  );
}
