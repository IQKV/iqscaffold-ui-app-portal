import { useEffect } from "react";
import { Modal, Button, Group, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { t } from "@lingui/core/macro";
import { FormField } from "@/shared/ui";
import type { Lead, LeadSource } from "@/shared/api/crm/types";
import { useCreateLead, useUpdateLead } from "../api/crm-queries";
import { notifications } from "@mantine/notifications";

// Validation schema for lead form
const createLeadFormSchema = () =>
  z.object({
    name: z.string().min(2, t`Name must be at least 2 characters`),
    email: z.string().email(t`Invalid email address`),
    phone: z.string().optional(),
    company: z.string().optional(),
    source: z.enum(
      [
        "WEBSITE",
        "REFERRAL",
        "COLD_CALL",
        "EMAIL_CAMPAIGN",
        "SOCIAL_MEDIA",
        "TRADE_SHOW",
        "PARTNER",
        "OTHER",
      ] as const,
      {
        errorMap: () => ({ message: t`Please select a lead source` }),
      }
    ),
  });

type LeadFormData = z.infer<ReturnType<typeof createLeadFormSchema>>;

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
 *
 * Requirements: 1.1, 1.4, 11.1, 11.2, 11.3
 */
export function LeadForm({ opened, onClose, lead, title }: LeadFormProps) {
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();

  const isEditing = !!lead;
  const isLoading =
    createLeadMutation.isPending || updateLeadMutation.isPending;

  const form = useForm<LeadFormData>({
    validate: zodResolver(createLeadFormSchema()),
    initialValues: {
      name: "",
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
        name: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        company: lead.company || "",
        source: lead.source,
      });
    } else {
      form.reset();
    }
  }, [lead, opened]);

  const handleSubmit = (values: LeadFormData) => {
    if (isEditing && lead) {
      // Update existing lead
      updateLeadMutation.mutate(
        {
          id: lead.id,
          data: {
            name: values.name,
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
            onClose();
          },
          onError: (error: any) => {
            // Handle duplicate email error (Requirement 11.3)
            const errorMessage =
              error?.response?.data?.message || error.message;
            const isDuplicateEmail =
              errorMessage.toLowerCase().includes("duplicate") ||
              errorMessage.toLowerCase().includes("already exists");

            notifications.show({
              title: t`Error`,
              message: isDuplicateEmail
                ? t`A lead with this email already exists`
                : t`Failed to update lead: ${errorMessage}`,
              color: "red",
            });
          },
        }
      );
    } else {
      // Create new lead (Requirement 1.1, 1.2)
      createLeadMutation.mutate(
        {
          name: values.name,
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
            onClose();
          },
          onError: (error: any) => {
            // Handle duplicate email error (Requirement 11.3)
            const errorMessage =
              error?.response?.data?.message || error.message;
            const isDuplicateEmail =
              errorMessage.toLowerCase().includes("duplicate") ||
              errorMessage.toLowerCase().includes("already exists");

            notifications.show({
              title: t`Error`,
              message: isDuplicateEmail
                ? t`A lead with this email already exists`
                : t`Failed to create lead: ${errorMessage}`,
              color: "red",
            });
          },
        }
      );
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
      title={title || (isEditing ? t`Edit Lead` : t`Add Lead`)}
      size="md"
      centered
      data-testid="modal-lead-form"
    >
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        noValidate
        data-testid="form-lead"
      >
        <Stack gap="md">
          {/* Name field - Required (Requirement 11.1) */}
          <FormField
            type="text"
            name="name"
            label={t`Name`}
            placeholder={t`Enter lead name`}
            form={form}
            withAsterisk
          />

          {/* Email field - Required with validation (Requirements 11.1, 11.2) */}
          <FormField
            type="email"
            name="email"
            label={t`Email`}
            placeholder={t`Enter email address`}
            form={form}
            withAsterisk
          />

          {/* Phone field - Optional */}
          <FormField
            type="tel"
            name="phone"
            label={t`Phone`}
            placeholder={t`Enter phone number`}
            form={form}
          />

          {/* Company field - Optional (for future autocomplete) */}
          <FormField
            type="text"
            name="company"
            label={t`Company`}
            placeholder={t`Enter company name`}
            form={form}
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
          />

          {/* Form actions */}
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={handleClose}
              disabled={isLoading}
              data-testid="btn-cancel-lead-form"
            >
              {t`Cancel`}
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              data-testid="btn-submit-lead-form"
            >
              {isEditing ? t`Update` : t`Create`}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
