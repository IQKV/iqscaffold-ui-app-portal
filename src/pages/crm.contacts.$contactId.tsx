import { createFileRoute } from "@tanstack/react-router";
import { ContactDetailPage } from "@/features/crm-contacts/components/ContactDetailPage";

export const Route = createFileRoute("/crm/contacts/$contactId")({
  component: ContactDetailPage,
});
