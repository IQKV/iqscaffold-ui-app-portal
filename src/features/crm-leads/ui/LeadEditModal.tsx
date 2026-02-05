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
  Checkbox,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { t } from "@lingui/core/macro";
import { z } from "zod";
import { useUpdateLead } from "@/entities/crm";
import type { Lead, LeadSource } from "@/shared/api/crm/types";

const leadEditSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email format"),
  phone: z.string().max(20).optional().or(z.literal("")),
  company: z.string().max(255).optional().or(z.literal("")),
  jobTitle: z.string().max(100).optional().or(z.literal("")),
  source: z.enum([
    "WEBSITE",
    "REFERRAL",
    "COLD_CALL",
    "EMAIL_CAMPAIGN",
    "SOCIAL_MEDIA",
    "TRADE_SHOW",
    "PARTNER",
    "OTHER",
  ]),
  score: z.number().min(0).max(100).optional(),
  qualified: z.boolean().optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

type LeadEditFormData = z.infer<typeof leadEditSchema>;

interface LeadEditModalProps {
  opened: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess?: () => void;
}

/**
 * LeadEditModal Component
 *
 * Modal form for editing lead information with:
 * - Form validation using Zod schema
 * - All lead fields (name, email, phone, company, job title, source, score, qualification status, notes)
 * - Lead source selection dropdown
 * - Lead score input with 0-100 validation
 * - Qualification checkbox
 * - Success/error handling with notifications
 *
 * Requirements: Lead management, form validation
 */
export const LeadEditModal: React.FC<LeadEditModalProps> = ({
  opened,
  onClose,
  lead,
  onSuccess,
}) => {
  const updateLeadMutation = useUpdateLead();

  const form = useForm<LeadEditFormData>({
    validate: zodResolver(leadEditSchema),
    initialValues: {
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      jobTitle: lead.jobTitle || "",
      source: lead.source || "WEBSITE",
      score: lead.score || 0,
      qualified: lead.isQualified || false,
      notes: lead.notes || "",
    },
  });

  // Reset form when lead changes
  React.useEffect(() => {
    if (lead) {
      form.setValues({
        firstName: lead.firstName || "",
        lastName: lead.lastName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        jobTitle: lead.jobTitle || "",
        source: lead.source || "WEBSITE",
        score: lead.score || 0,
        qualified: lead.isQualified || false,
        notes: lead.notes || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead]);

  const handleSubmit = async (values: LeadEditFormData) => {
    try {
      await updateLeadMutation.mutateAsync({
        id: lead.id,
        data: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || undefined,
          company: values.company || undefined,
          jobTitle: values.jobTitle || undefined,
          source: values.source,
          score: values.score,
          qualified: values.qualified,
          notes: values.notes || undefined,
        },
      });

      notifications.show({
        title: t`Success`,
        message: t`Lead updated successfully`,
        color: "green",
      });

      onSuccess?.();
    } catch (error: any) {
      notifications.show({
        title: t`Error`,
        message: error.message || t`Failed to update lead`,
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
      title={t`Edit Lead`}
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
            required
            {...form.getInputProps("email")}
          />

          <TextInput
            label={t`Phone`}
            placeholder={t`Enter phone number`}
            {...form.getInputProps("phone")}
          />

          {/* Company and Job Title */}
          <Group grow>
            <TextInput
              label={t`Company`}
              placeholder={t`Enter company name`}
              {...form.getInputProps("company")}
            />
            <TextInput
              label={t`Job Title`}
              placeholder={t`Enter job title`}
              {...form.getInputProps("jobTitle")}
            />
          </Group>

          {/* Lead Source */}
          <Select
            label={t`Lead Source`}
            placeholder={t`Select lead source`}
            required
            data={[
              { value: "WEBSITE", label: t`Website` },
              { value: "REFERRAL", label: t`Referral` },
              { value: "COLD_CALL", label: t`Cold Call` },
              { value: "EMAIL_CAMPAIGN", label: t`Email Campaign` },
              { value: "SOCIAL_MEDIA", label: t`Social Media` },
              { value: "TRADE_SHOW", label: t`Trade Show` },
              { value: "PARTNER", label: t`Partner` },
              { value: "OTHER", label: t`Other` },
            ]}
            {...form.getInputProps("source")}
          />

          {/* Lead Score and Qualification */}
          <Group grow>
            <NumberInput
              label={t`Lead Score`}
              placeholder={t`0-100`}
              min={0}
              max={100}
              {...form.getInputProps("score")}
            />
            <div style={{ paddingTop: "25px" }}>
              <Checkbox
                label={t`Qualified Lead`}
                {...form.getInputProps("qualified", { type: "checkbox" })}
              />
            </div>
          </Group>

          {/* Notes */}
          <Textarea
            label={t`Notes`}
            placeholder={t`Enter additional notes about this lead`}
            rows={4}
            maxLength={2000}
            {...form.getInputProps("notes")}
          />

          {/* Actions */}
          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={updateLeadMutation.isPending}
            >
              {t`Cancel`}
            </Button>
            <Button
              type="submit"
              loading={updateLeadMutation.isPending}
              disabled={updateLeadMutation.isPending}
            >
              {t`Save Changes`}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
