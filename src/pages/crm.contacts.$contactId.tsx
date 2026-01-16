import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { ContactDetailPage } from "@/features/crm-contacts";
import { CRMLayout } from "@/features/crm-leads";
import { t } from "@lingui/core/macro";

export const Route = createFileRoute("/crm/contacts/$contactId")({
  component: ContactDetailPageRoute,
});

function ContactDetailPageRoute() {
  return (
    <AuthGuard>
      <CRMLayout title={t`Contact Details`}>
        <div data-testid="page-crm-contact-detail">
          <ContactDetailPage />
        </div>
      </CRMLayout>
    </AuthGuard>
  );
}
