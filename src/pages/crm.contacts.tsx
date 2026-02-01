import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/processes/auth";
import { ContactListPage } from "@/features/crm-contacts";
import { CrmLayout } from "@/features/crm-leads";
import { t } from "@lingui/core/macro";
import { usePageTitle } from "@/shared/lib";

export const Route = createFileRoute("/crm/contacts")({
  component: ContactsPageRoute,
});

function ContactsPageRoute() {
  const pageTitle = usePageTitle(t`CRM Contacts`);

  return (
    <AuthGuard>
      {pageTitle}
      <CrmLayout title={t`Contacts`}>
        <div data-testid="page-crm-contacts">
          <ContactListPage />
        </div>
      </CrmLayout>
    </AuthGuard>
  );
}
