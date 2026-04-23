import { createFileRoute } from "@tanstack/react-router";
import { ContactDetailPage } from "@/features/crm-contacts";
import { usePageTitle } from "@/shared/lib";
import { t } from "@lingui/core/macro";

export const Route = createFileRoute("/crm/contacts/$contactId")({
  component: ContactDetailPageRoute,
});

function ContactDetailPageRoute() {
  const pageTitle = usePageTitle(t`Contact Details`);
  const { contactId } = Route.useParams();

  return (
    <>
      {pageTitle}
      <ContactDetailPage contactId={contactId} />
    </>
  );
}
