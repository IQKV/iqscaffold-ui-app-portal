import { useEffect } from "react";
import { Modal, Button, Group, Stack, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { t } from "@lingui/core/macro";
import { FormField } from "@/shared/ui";
import type { FollowUp } from "@/shared/api/crm/types";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";

// Validation schema for follow-up form
const createFollowUpFormSchema = () =>
  z.object({
    description: z
      .string()
      .min(3, t`Description must be at least 3 characters`),
    dueDate: z.date({
      required_error: t`Due date is required`,
      invalid_type_error: t`Invalid date`,
    }),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"] as const, {
      errorMap: () => ({ message: t`Please select a priority` }),
    }),
    type: z.enum(["CALL", "EMAIL", "MEETING", "TASK"] as const, {
      errorMap: () => ({ message: t`Please select a follow-up type` }),
    }),
  });

type FollowUpFormData = z.infer<ReturnType<typeof createFollowUpFormSchema>>;

interface FollowUpFormProps {
  opened: boolean;
  onClose: () => void;
  leadId: string;
  followUp?: FollowUp | null;
  title?: string;
  onSubmit: (data: {
    leadId: string;
    description: string;
    dueDate: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    type: "CALL" | "EMAIL" | "MEETING" | "TASK";
  }) => Promise<void>;
  isLoading?: boolean;
}

// Priority options for the select dropdown
const getPriorityOptions = () => [
  { value: "LOW", label: t`Low` },
  { value: "MEDIUM", label: t`Medium` },
  { value: "HIGH", label: t`High` },
];

// Follow-up type options for the select dropdown
const getFollowUpTypeOptions = () => [
  { value: "CALL", label: t`Call` },
  { value: "EMAIL", label: t`Email` },
  { value: "MEETING", label: t`Meeting` },
  { value: "TASK", label: t`Task` },
];

/**
 * FollowUpForm component for creating and editing follow-ups
 *
 * Features:
 * - Create mode: Opens with empty form
 * - Edit mode: Pre-populates with existing follow-up data
 * - Form validation with Zod schema
 * - Date picker with past date warnings (Requirement 11.4)
 * - Priority and type selection (Requirement 5.1, 5.5)
 * - Validation and error handling (Requirement 11.4)
 *
 * Requirements: 5.1, 5.5, 11.4
 */
export function FollowUpForm({
  opened,
  onClose,
  leadId,
  followUp,
  title,
  onSubmit,
  isLoading = false,
}: FollowUpFormProps) {
  const isEditing = !!followUp;

  const form = useForm<FollowUpFormData>({
    validate: zodResolver(createFollowUpFormSchema()),
    initialValues: {
      description: "",
      dueDate: new Date(),
      priority: "MEDIUM",
      type: "CALL",
    },
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (followUp) {
      form.setValues({
        description: followUp.description,
        dueDate: new Date(followUp.dueDate),
        priority: followUp.priority,
        type: followUp.type,
      });
    } else {
      form.reset();
    }
  }, [followUp, opened]);

  // Check if the selected date is in the past (Requirement 11.4)
  const isPastDate = form.values.dueDate && form.values.dueDate < new Date();

  const handleSubmit = async (values: FollowUpFormData) => {
    try {
      await onSubmit({
        leadId,
        description: values.description,
        dueDate: values.dueDate.toISOString(),
        priority: values.priority,
        type: values.type,
      });

      notifications.show({
        title: t`Success`,
        message: isEditing
          ? t`Follow-up updated successfully`
          : t`Follow-up scheduled successfully`,
        color: "green",
      });
      handleClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message;
      notifications.show({
        title: t`Error`,
        message: isEditing
          ? t`Failed to update follow-up: ${errorMessage}`
          : t`Failed to schedule follow-up: ${errorMessage}`,
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
      title={title || (isEditing ? t`Edit Follow-up` : t`Schedule Follow-up`)}
      size="md"
      centered
      data-testid="modal-follow-up-form"
    >
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        noValidate
        data-testid="form-follow-up"
      >
        <Stack gap="md">
          {/* Description field - Required (Requirement 5.1) */}
          <FormField
            type="textarea"
            name="description"
            label={t`Description`}
            placeholder={t`Enter follow-up description`}
            form={form}
            withAsterisk
            rows={3}
          />

          {/* Due date field - Required with past date warning (Requirement 5.5, 11.4) */}
          <FormField
            type="date"
            name="dueDate"
            label={t`Due Date`}
            placeholder={t`Select due date`}
            form={form}
            withAsterisk
            minDate={undefined} // Allow past dates but show warning
          />

          {/* Past date warning (Requirement 11.4) */}
          {isPastDate && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title={t`Past Date Selected`}
              color="yellow"
              variant="light"
            >
              {t`You have selected a date in the past. This follow-up will be marked as overdue.`}
            </Alert>
          )}

          {/* Priority selection - Required (Requirement 5.1) */}
          <FormField
            type="select"
            name="priority"
            label={t`Priority`}
            placeholder={t`Select priority`}
            data={getPriorityOptions()}
            form={form}
            withAsterisk
          />

          {/* Follow-up type selection - Required (Requirement 5.1) */}
          <FormField
            type="select"
            name="type"
            label={t`Type`}
            placeholder={t`Select follow-up type`}
            data={getFollowUpTypeOptions()}
            form={form}
            withAsterisk
          />

          {/* Form actions */}
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={handleClose}
              disabled={isLoading}
              data-testid="btn-cancel-follow-up-form"
            >
              {t`Cancel`}
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              data-testid="btn-submit-follow-up-form"
            >
              {isEditing ? t`Update` : t`Schedule`}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
