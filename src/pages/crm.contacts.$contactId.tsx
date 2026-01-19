import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { ContactDetailPage } from "@/features/crm-contacts";
import { CrmLayout } from "@/features/crm-leads";
import { t } from "@lingui/core/macro";

export const Route = createFileRoute("/crm/contacts/$contactId")({
  component: ContactDetailPageRoute,
});

function ContactDetailPageRoute() {
  return (
    <AuthGuard>
      <CrmLayout title={t`Contact Details`}>
        <div data-testid="page-crm-contact-detail">
          <ContactDetailPage />
        </div>
      </CrmLayout>
    </AuthGuard>
  );
}
