import React from "react";
import {
  TextInput,
  Select,
  Textarea,
  NumberInput,
  Stack,
  Group,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconBuilding,
  IconStar,
  IconNotes,
} from "@tabler/icons-react";
import {
  Contact,
  ContactStatus,
  CreateContactRequest,
  UpdateContactRequest,
} from "@/shared/api/contact/types";

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (values: CreateContactRequest | UpdateContactRequest) => void;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * ContactForm Component
 *
 * Form for creating or editing contacts with validation.
 *
 * Features:
 * - Client-side validation
 * - Support for both create and edit modes
 * - Accessible form controls
 * - Loading states
 */
export const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const isEditMode = !!contact;

  const form = useForm<CreateContactRequest | UpdateContactRequest>({
    initialValues: {
      firstName: contact?.firstName || "",
      lastName: contact?.lastName || "",
      email: contact?.email || "",
      phone: contact?.phone || "",
      jobTitle: contact?.jobTitle || "",
      companyId: contact?.companyId,
      status: contact?.status || ContactStatus.ACTIVE,
      leadScore: contact?.leadScore || 0,
      notes: contact?.notes || "",
    },
    validate: {
      firstName: (value: string) =>
        !value || value.trim().length === 0
          ? "First name is required"
          : value.length > 50
            ? "First name must be less than 50 characters"
            : null,
      lastName: (value: string) =>
        !value || value.trim().length === 0
          ? "Last name is required"
          : value.length > 50
            ? "Last name must be less than 50 characters"
            : null,
      email: (value: string) => {
        if (!value || value.trim().length === 0) {
          return "Email is required";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Invalid email format";
        }
        if (value.length > 100) {
          return "Email must be less than 100 characters";
        }
        return null;
      },
      phone: (value?: string) =>
        value && value.length > 20
          ? "Phone must be less than 20 characters"
          : null,
      jobTitle: (value?: string) =>
        value && value.length > 100
          ? "Job title must be less than 100 characters"
          : null,
      leadScore: (value?: number) =>
        value !== undefined && (value < 0 || value > 100)
          ? "Lead score must be between 0 and 100"
          : null,
      notes: (value?: string) =>
        value && value.length > 1000
          ? "Notes must be less than 1000 characters"
          : null,
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    // Clean up empty optional fields
    const cleanedValues = { ...values };
    if (!cleanedValues.phone) {
      delete cleanedValues.phone;
    }
    if (!cleanedValues.jobTitle) {
      delete cleanedValues.jobTitle;
    }
    if (!cleanedValues.companyId) {
      delete cleanedValues.companyId;
    }
    if (!cleanedValues.notes) {
      delete cleanedValues.notes;
    }

    onSubmit(cleanedValues);
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Name fields */}
        <Group grow>
          <TextInput
            label="First Name"
            placeholder="John"
            required
            leftSection={<IconUser size={16} />}
            {...form.getInputProps("firstName")}
            disabled={loading}
          />
          <TextInput
            label="Last Name"
            placeholder="Doe"
            required
            leftSection={<IconUser size={16} />}
            {...form.getInputProps("lastName")}
            disabled={loading}
          />
        </Group>

        {/* Contact information */}
        <TextInput
          label="Email"
          placeholder="john.doe@example.com"
          required
          type="email"
          leftSection={<IconMail size={16} />}
          {...form.getInputProps("email")}
          disabled={loading}
        />

        <TextInput
          label="Phone"
          placeholder="+1-555-0101"
          leftSection={<IconPhone size={16} />}
          {...form.getInputProps("phone")}
          disabled={loading}
        />

        {/* Professional information */}
        <TextInput
          label="Job Title"
          placeholder="CEO"
          leftSection={<IconBriefcase size={16} />}
          {...form.getInputProps("jobTitle")}
          disabled={loading}
        />

        <NumberInput
          label="Company ID"
          placeholder="123"
          leftSection={<IconBuilding size={16} />}
          min={1}
          {...form.getInputProps("companyId")}
          disabled={loading}
        />

        {/* Status and scoring */}
        <Group grow>
          <Select
            label="Status"
            placeholder="Select status"
            data={[
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "ARCHIVED", label: "Archived" },
            ]}
            {...form.getInputProps("status")}
            disabled={loading}
          />

          <NumberInput
            label="Lead Score"
            placeholder="0-100"
            leftSection={<IconStar size={16} />}
            min={0}
            max={100}
            {...form.getInputProps("leadScore")}
            disabled={loading}
          />
        </Group>

        {/* Notes */}
        <Textarea
          label="Notes"
          placeholder="Additional notes about this contact..."
          leftSection={<IconNotes size={16} />}
          minRows={3}
          maxRows={6}
          {...form.getInputProps("notes")}
          disabled={loading}
        />

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          {onCancel && (
            <Button variant="subtle" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={loading}>
            {isEditMode ? "Update Contact" : "Create Contact"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
