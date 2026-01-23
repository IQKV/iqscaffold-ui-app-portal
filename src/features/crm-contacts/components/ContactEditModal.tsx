import React from "react";
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Textarea,
  Button,
  Group,
  NumberInput,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { t } from "@lingui/core/macro";
import { z } from "zod";
import { useUpdateContact } from "@/entities/crm/api/contact-queries";
import { Contact, ContactStatus } from "@/shared/api/contact/types";

const contactEditSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  jobTitle: z.string().max(100).optional().or(z.literal("")),
  companyId: z.number().optional(),
  status: z.nativeEnum(ContactStatus),
  leadScore: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

type ContactEditFormData = z.infer<typeof contactEditSchema>;

interface ContactEditModalProps {
  opened: boolean;
  onClose: () => void;
  contact: Contact;
  onSuccess?: () => void;
}

/**
 * ContactEditModal Component
 *
 * Modal form for editing contact information with:
 * - Form validation using Zod schema
 * - All contact fields (name, email, phone, job title, company, status, lead score, notes)
 * - Company selection dropdown
 * - Status selection with proper options
 * - Lead score input with 0-100 validation
 * - Success/error handling with notifications
 *
 * Requirements: Contact management, form validation
 */
export const ContactEditModal: React.FC<ContactEditModalProps> = ({
  opened,
  onClose,
  contact,
  onSuccess,
}) => {
  const updateContactMutation = useUpdateContact();

  const form = useForm<ContactEditFormData>({
    validate: zodResolver(contactEditSchema),
    initialValues: {
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      jobTitle: contact.jobTitle || "",
      companyId: contact.companyId || undefined,
      status: contact.status || ContactStatus.ACTIVE,
      leadScore: contact.leadScore || 0,
      notes: contact.notes || "",
    },
  });

  // Reset form when contact changes
  React.useEffect(() => {
    if (contact) {
      form.setValues({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email || "",
        phone: contact.phone || "",
        jobTitle: contact.jobTitle || "",
        companyId: contact.companyId || undefined,
        status: contact.status || ContactStatus.ACTIVE,
        leadScore: contact.leadScore || 0,
        notes: contact.notes || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);

  const handleSubmit = async (values: ContactEditFormData) => {
    try {
      await updateContactMutation.mutateAsync({
        id: contact.id,
        data: {
          ...values,
          // Convert empty strings to null for optional fields
          email: values.email || undefined,
          phone: values.phone || undefined,
          jobTitle: values.jobTitle || undefined,
          notes: values.notes || undefined,
        },
      });

      notifications.show({
        title: t`Success`,
        message: t`Contact updated successfully`,
        color: "green",
      });

      onSuccess?.();
    } catch (error: any) {
      notifications.show({
        title: t`Error`,
        message: error.message || t`Failed to update contact`,
        color: "red",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t`Edit Contact`}
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Name Fields */}
          <Group grow>
            <TextInput
              label={t`First Name`}
              placeholder={t`Enter first name`}
              required
              {...form.getInputProps("firstName")}
            />
            <TextInput
              label={t`Last Name`}
              placeholder={t`Enter last name`}
              required
              {...form.getInputProps("lastName")}
            />
          </Group>

          {/* Contact Information */}
          <TextInput
            label={t`Email`}
            placeholder={t`Enter email address`}
            type="email"
            {...form.getInputProps("email")}
          />

          <TextInput
            label={t`Phone`}
            placeholder={t`Enter phone number`}
            {...form.getInputProps("phone")}
          />

          <TextInput
            label={t`Job Title`}
            placeholder={t`Enter job title`}
            {...form.getInputProps("jobTitle")}
          />

          {/* Company Selection */}
          <Select
            label={t`Company`}
            placeholder={t`Select company`}
            data={[
              // TODO: Fetch from companies API
              { value: "1", label: "Acme Corp" },
              { value: "2", label: "Tech Solutions Inc" },
              { value: "3", label: "Global Industries" },
            ]}
            searchable
            clearable
            {...form.getInputProps("companyId")}
            value={form.values.companyId?.toString() || null}
            onChange={(value) =>
              form.setFieldValue(
                "companyId",
                value ? parseInt(value, 10) : undefined
              )
            }
          />

          {/* Status and Lead Score */}
          <Group grow>
            <Select
              label={t`Status`}
              placeholder={t`Select status`}
              required
              data={[
                { value: ContactStatus.ACTIVE, label: t`Active` },
                { value: ContactStatus.INACTIVE, label: t`Inactive` },
                { value: ContactStatus.CUSTOMER, label: t`Customer` },
                { value: ContactStatus.PROSPECT, label: t`Prospect` },
              ]}
              {...form.getInputProps("status")}
            />

            <NumberInput
              label={t`Lead Score`}
              placeholder={t`0-100`}
              min={0}
              max={100}
              {...form.getInputProps("leadScore")}
            />
          </Group>

          {/* Notes */}
          <Textarea
            label={t`Notes`}
            placeholder={t`Enter additional notes`}
            rows={4}
            maxLength={1000}
            {...form.getInputProps("notes")}
          />

          {/* Actions */}
          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={updateContactMutation.isPending}
            >
              {t`Cancel`}
            </Button>
            <Button
              type="submit"
              loading={updateContactMutation.isPending}
              disabled={updateContactMutation.isPending}
            >
              {t`Save Changes`}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
