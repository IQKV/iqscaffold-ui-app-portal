import { TextInput, Textarea, Select, Stack, Text, Alert } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { UseFormReturnType } from "@mantine/form";
import { MessageDescriptor } from "@lingui/core";
import { useLingui } from "@lingui/react";
import { IconCalendarExclamation } from "@tabler/icons-react";
import { t } from "@lingui/core/macro";

interface BaseCrmFormFieldProps {
  name: string;
  label: string | MessageDescriptor;
  placeholder?: string | MessageDescriptor;
  form: UseFormReturnType<any>;
  disabled?: boolean;
  withAsterisk?: boolean;
  description?: string | MessageDescriptor;
}

interface CrmTextFieldProps extends BaseCrmFormFieldProps {
  type: "text" | "email" | "tel";
  maxLength?: number;
  showCharacterCount?: boolean;
}

interface CrmTextareaFieldProps extends BaseCrmFormFieldProps {
  type: "textarea";
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
}

interface CrmSelectFieldProps extends BaseCrmFormFieldProps {
  type: "select";
  data: Array<{ value: string; label: string }>;
  searchable?: boolean;
  clearable?: boolean;
}

interface CrmDateFieldProps extends BaseCrmFormFieldProps {
  type: "date";
  minDate?: Date;
  maxDate?: Date;
  showPastDateWarning?: boolean;
}

export type CrmFormFieldProps =
  | CrmTextFieldProps
  | CrmTextareaFieldProps
  | CrmSelectFieldProps
  | CrmDateFieldProps;

// CRM-specific validation and business logic
const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// CRM-specific options
export const getCrmLeadSources = () => [
  { value: "WEBSITE", label: t`Website` },
  { value: "REFERRAL", label: t`Referral` },
  { value: "COLD_CALL", label: t`Cold Call` },
  { value: "EMAIL_CAMPAIGN", label: t`Email Campaign` },
  { value: "SOCIAL_MEDIA", label: t`Social Media` },
  { value: "TRADE_SHOW", label: t`Trade Show` },
  { value: "PARTNER", label: t`Partner` },
  { value: "OTHER", label: t`Other` },
];

export const getCrmPriorities = () => [
  { value: "LOW", label: t`Low` },
  { value: "MEDIUM", label: t`Medium` },
  { value: "HIGH", label: t`High` },
];

export const getCrmFollowUpTypes = () => [
  { value: "CALL", label: t`Call` },
  { value: "EMAIL", label: t`Email` },
  { value: "MEETING", label: t`Meeting` },
  { value: "TASK", label: t`Task` },
];

/**
 * CRM-specific form field component with business logic
 *
 * Features:
 * - CRM-specific validation and options
 * - Past date warnings for follow-ups
 * - Character counting for descriptions
 * - Lead source, priority, and follow-up type options
 * - Lingui i18n integration
 */
export function CrmFormField(props: CrmFormFieldProps) {
  const { _ } = useLingui();
  const { name, label, form, disabled = false, withAsterisk = false, description } = props;

  const labelText = typeof label === "string" ? label : _(label);
  const placeholderText = props.placeholder
    ? typeof props.placeholder === "string"
      ? props.placeholder
      : _(props.placeholder)
    : undefined;
  const descriptionText = description
    ? typeof description === "string"
      ? description
      : _(description)
    : undefined;

  const fieldProps = {
    ...form.getInputProps(name),
    label: labelText,
    placeholder: placeholderText,
    disabled,
    withAsterisk,
    description: descriptionText,
  };

  switch (props.type) {
    case "text":
    case "email":
    case "tel": {
      const { maxLength, showCharacterCount } = props;
      const currentLength = form.values[name]?.length || 0;

      return (
        <Stack gap="xs">
          <TextInput {...fieldProps} type={props.type} maxLength={maxLength} />
          {showCharacterCount && maxLength && (
            <Text size="xs" c={currentLength > maxLength * 0.9 ? "orange" : "dimmed"}>
              {currentLength}/{maxLength}
            </Text>
          )}
        </Stack>
      );
    }

    case "textarea": {
      const { rows = 3, maxLength, showCharacterCount } = props;
      const currentLength = form.values[name]?.length || 0;

      return (
        <Stack gap="xs">
          <Textarea
            {...fieldProps}
            rows={rows}
            maxLength={maxLength}
            autosize
            minRows={rows}
            maxRows={rows + 2}
          />
          {showCharacterCount && maxLength && (
            <Text size="xs" c={currentLength > maxLength * 0.9 ? "orange" : "dimmed"}>
              {currentLength}/{maxLength}
            </Text>
          )}
        </Stack>
      );
    }

    case "select": {
      const { data, searchable = false, clearable = false } = props;

      return <Select {...fieldProps} data={data} searchable={searchable} clearable={clearable} />;
    }

    case "date": {
      const { minDate, maxDate, showPastDateWarning = false } = props;
      const selectedDate = form.values[name];
      const showWarning = showPastDateWarning && selectedDate && isPastDate(new Date(selectedDate));

      return (
        <Stack gap="xs">
          <DateInput {...fieldProps} minDate={minDate} maxDate={maxDate} valueFormat="YYYY-MM-DD" />
          {showWarning && (
            <Alert icon={<IconCalendarExclamation size={16} />} color="orange" variant="light">
              {t`This date is in the past. Are you sure this is correct?`}
            </Alert>
          )}
        </Stack>
      );
    }

    default:
      return null;
  }
}
