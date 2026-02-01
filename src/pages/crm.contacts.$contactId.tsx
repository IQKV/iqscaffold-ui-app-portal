import { createFileRoute } from "@tanstack/react-router";
import { ContactDetailPage } from "@/features/crm-contacts/components/ContactDetailPage";
import { usePageTitle } from "@/shared/lib";
import { t } from "@lingui/macro";

export const Route = createFileRoute("/crm/contacts/$contactId")({
  component: ContactDetailPageRoute,
});

function ContactDetailPageRoute() {
  const pageTitle = usePageTitle(t`Contact Details`);

  return (
    <>
      {pageTitle}
      <ContactDetailPage />
    </>
  );
}
