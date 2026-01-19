import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { ContactListPage } from "@/features/crm-contacts";
import { CrmLayout } from "@/features/crm-leads";
import { t } from "@lingui/core/macro";

export const Route = createFileRoute("/crm/contacts")({
  component: ContactsPageRoute,
});

function ContactsPageRoute() {
  return (
    <AuthGuard>
      <CrmLayout title={t`Contacts`}>
        <div data-testid="page-crm-contacts">
          <ContactListPage />
        </div>
      </CrmLayout>
    </AuthGuard>
  );
}
