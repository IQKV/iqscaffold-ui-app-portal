import { useEffect, useRef } from "react";
import { Modal, Button, Group, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { t } from "@lingui/core/macro";
import { FormField } from "@/shared/ui";
import type { Lead, LeadSource } from "@/shared/api/crm/types";
import { useCreateLead, useUpdateLead } from "../api/crm-queries";
import { notifications } from "@mantine/notifications";
import {
  createLeadFormSchema,
  type LeadFormData,
  isDuplicateEmailError,
  getDuplicateEmailMessage,
} from "../lib/validation-schemas";
import { useAnnouncer } from "@/shared/lib/accessibility";

interface LeadFormProps {
  opened: boolean;
  onClose: () => void;
  lead?: Lead | null;
  title?: string;
}

// Lead source options for the select dropdown
const getLeadSourceOptions = () => [
  { value: "WEBSITE", label: t`Website` },
  { value: "REFERRAL", label: t`Referral` },
  { value: "COLD_CALL", label: t`Cold Call` },
  { value: "EMAIL_CAMPAIGN", label: t`Email Campaign` },
  { value: "SOCIAL_MEDIA", label: t`Social Media` },
  { value: "TRADE_SHOW", label: t`Trade Show` },
  { value: "PARTNER", label: t`Partner` },
  { value: "OTHER", label: t`Other` },
];

/**
 * LeadForm component for creating and editing leads
 *
 * Features:
 * - Create mode: Opens with empty form
 * - Edit mode: Pre-populates with existing lead data
 * - Form validation with Zod schema
 * - Lead source selection dropdown
 * - Company field (for future autocomplete enhancement)
 * - Optimistic updates via TanStack Query
 * - Focus management and screen reader support (Requirements: 14.1, 14.2, 14.6, 14.7)
 *
 * Requirements: 1.1, 1.4, 11.1, 11.2, 11.3, 14.1, 14.2, 14.6, 14.7
 */
export function LeadForm({ opened, onClose, lead, title }: LeadFormProps) {
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const modalRef = useRef<HTMLDivElement>(null);
  const { announce } = useAnnouncer();

  const isEditing = !!lead;
  const isLoading =
    createLeadMutation.isPending || updateLeadMutation.isPending;

  // Focus trap for modal
  // useFocusTrap(modalRef as any, opened);

  const form = useForm<LeadFormData>({
    validate: zodResolver(createLeadFormSchema()),
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      source: "WEBSITE" as LeadSource,
    },
  });

  // Pre-populate form when editing (Requirement 1.4)
  useEffect(() => {
    if (lead) {
      form.setValues({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone || "",
        company: lead.company || "",
        source: lead.source,
      });
      announce(`Editing lead: ${lead.firstName} ${lead.lastName}`, {
        priority: "polite",
      });
    } else {
      form.reset();
      if (opened) {
        announce("Create new lead form opened", { priority: "polite" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead, opened]);

  const handleSubmit = (values: LeadFormData) => {
    if (isEditing && lead) {
      // Update existing lead
      updateLeadMutation.mutate(
        {
          id: lead.id,
          data: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone || undefined,
            company: values.company || undefined,
            source: values.source,
          },
        },
        {
          onSuccess: () => {
            notifications.show({
              title: t`Success`,
              message: t`Lead updated successfully`,
              color: "green",
            });
            announce("Lead updated successfully", { priority: "assertive" });
            onClose();
          },
          onError: (error: any) => {
            // Handle duplicate email error (Requirement 11.3)
            const errorMessage =
              error?.response?.data?.message || error.message;

            const message = isDuplicateEmailError(error)
              ? getDuplicateEmailMessage()
              : t`Failed to update lead: ${errorMessage}`;

            notifications.show({
              title: t`Error`,
              message,
              color: "red",
            });
            announce(`Error: ${message}`, { priority: "assertive" });
          },
        }
      );
    } else {
      // Create new lead (Requirement 1.1, 1.2)
      createLeadMutation.mutate(
        {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || undefined,
          company: values.company || undefined,
          source: values.source,
        },
        {
          onSuccess: () => {
            notifications.show({
              title: t`Success`,
              message: t`Lead created successfully`,
              color: "green",
            });
            announce("Lead created successfully", { priority: "assertive" });
            onClose();
          },
          onError: (error: any) => {
            // Handle duplicate email error (Requirement 11.3)
            const errorMessage =
              error?.response?.data?.message || error.message;

            const message = isDuplicateEmailError(error)
              ? getDuplicateEmailMessage()
              : t`Failed to create lead: ${errorMessage}`;

            notifications.show({
              title: t`Error`,
              message,
              color: "red",
            });
            announce(`Error: ${message}`, { priority: "assertive" });
          },
        }
      );
    }
  };

  const handleClose = () => {
    form.reset();
    announce("Form closed", { priority: "polite" });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title || (isEditing ? t`Edit Lead` : t`Add Lead`)}
      size="md"
      centered
      data-testid="modal-lead-form"
      aria-labelledby="lead-form-title"
      aria-describedby="lead-form-description"
    >
      <div ref={modalRef}>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          noValidate
          data-testid="form-lead"
          aria-label={isEditing ? "Edit lead form" : "Create lead form"}
        >
          <Stack gap="md">
            {/* First Name field - Required (Requirement 11.1) */}
            <FormField
              type="text"
              name="firstName"
              label={t`First Name`}
              placeholder={t`Enter first name`}
              form={form}
              withAsterisk
              aria-required="true"
            />

            {/* Last Name field - Required (Requirement 11.1) */}
            <FormField
              type="text"
              name="lastName"
              label={t`Last Name`}
              placeholder={t`Enter last name`}
              form={form}
              withAsterisk
              aria-required="true"
            />

            {/* Email field - Required with validation (Requirements 11.1, 11.2) */}
            <FormField
              type="email"
              name="email"
              label={t`Email`}
              placeholder={t`Enter email address`}
              form={form}
              withAsterisk
              aria-required="true"
              aria-describedby="email-help"
            />

            {/* Phone field - Optional */}
            <FormField
              type="tel"
              name="phone"
              label={t`Phone`}
              placeholder={t`Enter phone number`}
              form={form}
              aria-describedby="phone-help"
            />

            {/* Company field - Optional (for future autocomplete) */}
            <FormField
              type="text"
              name="company"
              label={t`Company`}
              placeholder={t`Enter company name`}
              form={form}
              aria-describedby="company-help"
            />

            {/* Lead source selection - Required (Requirement 1.1) */}
            <FormField
              type="select"
              name="source"
              label={t`Lead Source`}
              placeholder={t`Select lead source`}
              data={getLeadSourceOptions()}
              form={form}
              withAsterisk
              searchable
              aria-required="true"
              aria-describedby="source-help"
            />

            {/* Form actions */}
            <Group
              justify="flex-end"
              mt="md"
              role="group"
              aria-label="Form actions"
            >
              <Button
                variant="subtle"
                onClick={handleClose}
                disabled={isLoading}
                data-testid="btn-cancel-lead-form"
                aria-label="Cancel and close form"
              >
                {t`Cancel`}
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                data-testid="btn-submit-lead-form"
                aria-label={isEditing ? "Update lead" : "Create lead"}
              >
                {isEditing ? t`Update` : t`Create`}
              </Button>
            </Group>
          </Stack>
        </form>
      </div>
    </Modal>
  );
}
