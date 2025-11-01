import React from "react";
import {
  TextInput,
  PasswordInput,
  Textarea,
  Select,
  MultiSelect,
  NumberInput,
  Checkbox,
  Switch,
  Radio,
  Group,
  Stack,
  Text,
  Tooltip,
  ActionIcon,
  Alert,
  Progress,
  Badge,
  Input,
} from "@mantine/core";
// import { DateInput, TimeInput } from "@mantine/dates";
import { UseFormReturnType } from "@mantine/form";
import {
  IconInfoCircle,
  IconAlertTriangle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { MessageDescriptor } from "@lingui/core";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

export interface BaseFormFieldProps {
  name: string;
  label: string | MessageDescriptor;
  placeholder?: string | MessageDescriptor;
  disabled?: boolean;
  description?: string | MessageDescriptor;
  form: UseFormReturnType<any>;
  /** Tooltip text for additional help */
  tooltip?: string | MessageDescriptor;
  /** Whether to show field validation status */
  showValidationStatus?: boolean;
  /** Custom validation message */
  customError?: string;
  /** Whether the field is loading */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Field size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Field variant */
  variant?: "default" | "filled" | "unstyled";
  /** Whether field is required (for visual indicator only, validation handled by Zod) */
  withAsterisk?: boolean;
}

export interface TextFormFieldProps extends BaseFormFieldProps {
  type: "text" | "email" | "tel" | "url" | "search";
  /** Maximum character count */
  maxLength?: number;
  /** Show character counter */
  showCharacterCount?: boolean;
  /** Input icon */
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
}

export interface PasswordFormFieldProps extends BaseFormFieldProps {
  type: "password";
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  /** Show password strength indicator */
  showStrengthIndicator?: boolean;
  /** Custom strength calculation */
  strengthCalculator?: (password: string) => {
    strength: number;
    label: string;
    color: string;
    percentage?: number;
  };
}

export interface TextareaFormFieldProps extends BaseFormFieldProps {
  type: "textarea";
  rows?: number;
  autosize?: boolean;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
  /** Resize behavior */
  resize?: "none" | "both" | "horizontal" | "vertical";
}

export interface NumberFormFieldProps extends BaseFormFieldProps {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  /** Hide controls */
  hideControls?: boolean;
  /** Thousand separator */
  thousandSeparator?: string;
  /** Decimal separator */
  decimalSeparator?: string;
}

export interface SelectFormFieldProps extends BaseFormFieldProps {
  type: "select";
  data: Array<{
    value: string;
    label: string | MessageDescriptor;
    disabled?: boolean;
    group?: string;
  }>;
  searchable?: boolean;
  clearable?: boolean;
  /** Allow creation of new options */
  creatable?: boolean;
  /** Custom create option label */
  createLabel?: string | MessageDescriptor;
  /** Limit displayed options */
  limit?: number;
  /** Custom filter function */
  filter?: (value: string, item: any) => boolean;
}

export interface MultiSelectFormFieldProps extends BaseFormFieldProps {
  type: "multiselect";
  data: Array<{
    value: string;
    label: string | MessageDescriptor;
    disabled?: boolean;
    group?: string;
  }>;
  searchable?: boolean;
  clearable?: boolean;
  /** Maximum number of selected values */
  maxValues?: number;
  /** Hide selected options from dropdown */
  hidePickedOptions?: boolean;
  /** Custom value component */
  valueComponent?: React.ComponentType<any>;
}

export interface DateFormFieldProps extends BaseFormFieldProps {
  type: "date";
  minDate?: Date;
  maxDate?: Date;
  /** Date format */
  valueFormat?: string;
  /** First day of week */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Exclude dates */
  excludeDate?: (date: Date) => boolean;
}

export interface TimeFormFieldProps extends BaseFormFieldProps {
  type: "time";
  /** Time format */
  format?: "12" | "24";
  /** Show seconds */
  withSeconds?: boolean;
}

export interface DateTimeFormFieldProps extends BaseFormFieldProps {
  type: "datetime";
  minDate?: Date;
  maxDate?: Date;
  /** Date format */
  valueFormat?: string;
  /** Time format */
  timeFormat?: "12" | "24";
  /** Show seconds */
  withSeconds?: boolean;
}

export interface CheckboxFormFieldProps extends BaseFormFieldProps {
  type: "checkbox";
  /** Checkbox label (different from field label) */
  checkboxLabel?: string | MessageDescriptor;
  /** Indeterminate state */
  indeterminate?: boolean;
  /** Icon when checked */
  icon?: React.ReactNode;
}

export interface SwitchFormFieldProps extends BaseFormFieldProps {
  type: "switch";
  /** Switch labels */
  onLabel?: string | MessageDescriptor;
  offLabel?: string | MessageDescriptor;
  /** Thumb icon */
  thumbIcon?: React.ReactNode;
}

export interface RadioFormFieldProps extends BaseFormFieldProps {
  type: "radio";
  data: Array<{
    value: string;
    label: string | MessageDescriptor;
    disabled?: boolean;
    description?: string;
  }>;
  /** Radio group orientation */
  orientation?: "horizontal" | "vertical";
  /** Custom radio component */
  radioComponent?: React.ComponentType<any>;
}

export interface FileFormFieldProps extends BaseFormFieldProps {
  type: "file";
  /** Accept file types */
  accept?: string;
  /** Multiple files */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Custom file validation */
  fileValidator?: (file: File) => string | null;
}

export interface ColorFormFieldProps extends BaseFormFieldProps {
  type: "color";
  /** Color format */
  format?: "hex" | "rgb" | "hsl";
  /** Show color swatches */
  swatches?: string[];
  /** Disable alpha channel */
  disallowInput?: boolean;
}

export type FormFieldProps =
  | TextFormFieldProps
  | PasswordFormFieldProps
  | TextareaFormFieldProps
  | NumberFormFieldProps
  | SelectFormFieldProps
  | MultiSelectFormFieldProps
  | DateFormFieldProps
  | TimeFormFieldProps
  | DateTimeFormFieldProps
  | CheckboxFormFieldProps
  | SwitchFormFieldProps
  | RadioFormFieldProps
  | FileFormFieldProps
  | ColorFormFieldProps;

/**
 * Comprehensive form field component with Mantine + Zod + Lingui integration
 * Supports all common form field types with enhanced UX and validation
 */
export function FormField(props: FormFieldProps) {
  // Safely handle Lingui - fallback to identity function if not available
  let _;
  try {
    const lingui = useLingui();
    _ = lingui._;
  } catch {
    _ = (message: any) => {
      if (typeof message === "string") {
        return message;
      }
      return message?.message || "";
    };
  }

  const {
    name,
    label,
    placeholder,
    disabled,
    description,
    form,
    type,
    tooltip,
    showValidationStatus = true,
    customError,
    loading = false,
    className,
    size = "sm",
    variant = "default",
    withAsterisk = false,
  } = props;

  const fieldError = form.errors[name] || customError;
  const fieldValue = form.values[name];
  const hasError = Boolean(fieldError);
  const hasValue =
    fieldValue !== undefined && fieldValue !== "" && fieldValue !== null;
  const isTouched = form.isTouched(name);

  // Helper function to resolve i18n messages
  const resolveMessage = (
    message: string | MessageDescriptor | undefined
  ): string => {
    if (!message) {
      return "";
    }
    if (typeof message === "string") {
      return message;
    }
    return _(message);
  };

  // Character count for text fields
  const getCharacterCount = () => {
    if (
      (type === "text" || type === "textarea") &&
      "showCharacterCount" in props &&
      "maxLength" in props
    ) {
      const textProps = props as TextFormFieldProps | TextareaFormFieldProps;
      if (textProps.showCharacterCount && textProps.maxLength) {
        const currentLength = String(fieldValue || "").length;
        const isNearLimit = currentLength > textProps.maxLength * 0.8;
        const isOverLimit = currentLength > textProps.maxLength;
        return {
          text: `${currentLength}/${textProps.maxLength}`,
          color: isOverLimit ? "red" : isNearLimit ? "orange" : "dimmed",
        };
      }
    }
    return null;
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (type === "password" && "showStrengthIndicator" in props) {
      const passwordProps = props as PasswordFormFieldProps;
      if (passwordProps.showStrengthIndicator && fieldValue) {
        const password = String(fieldValue);

        if (passwordProps.strengthCalculator) {
          return passwordProps.strengthCalculator(password);
        }

        // Default strength calculation
        let strength = 0;
        const checks = [
          password.length >= 8,
          /[A-Z]/.test(password),
          /[a-z]/.test(password),
          /[0-9]/.test(password),
          /[^A-Za-z0-9]/.test(password),
        ];

        strength = checks.filter(Boolean).length;

        const colors = ["red", "orange", "yellow", "lime", "green"];
        const labels = [
          _(msg`Very Weak`),
          _(msg`Weak`),
          _(msg`Fair`),
          _(msg`Good`),
          _(msg`Strong`),
        ];

        return {
          strength,
          percentage: (strength / 5) * 100,
          color: colors[strength - 1] || "red",
          label: labels[strength - 1] || _(msg`Very Weak`),
        };
      }
    }
    return null;
  };

  // Validation status indicator
  const getValidationStatus = () => {
    if (!showValidationStatus || !isTouched) {
      return null;
    }

    if (hasError) {
      return <IconX size="1rem" color="red" />;
    }
    if (hasValue && !hasError) {
      return <IconCheck size="1rem" color="green" />;
    }
    return null;
  };

  const baseProps = {
    label: (
      <Group gap="xs" align="center">
        <Text size="sm" fw={500}>
          {resolveMessage(label)}
          {withAsterisk && (
            <Text component="span" c="red" ml={4}>
              *
            </Text>
          )}
        </Text>
        {tooltip && (
          <Tooltip label={resolveMessage(tooltip)} multiline w={300}>
            <ActionIcon size="xs" variant="subtle" color="gray">
              <IconInfoCircle size="0.75rem" />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    ),
    placeholder: resolveMessage(placeholder),
    disabled: disabled || loading,
    description: resolveMessage(description),
    error: fieldError,
    size,
    variant,
    className,
    ...form.getInputProps(name),
  };

  const characterCount = getCharacterCount();
  const passwordStrength = getPasswordStrength();
  const validationStatus = getValidationStatus();

  const renderField = () => {
    switch (type) {
      case "text":
      case "email":
      case "tel":
      case "url":
      case "search": {
        const textProps = props as TextFormFieldProps;
        const rightSectionElements = [
          characterCount && (
            <Text key="count" size="xs" c={characterCount.color}>
              {characterCount.text}
            </Text>
          ),
          validationStatus && <span key="validation">{validationStatus}</span>,
          textProps.rightSection,
        ].filter(Boolean);

        return (
          <TextInput
            {...baseProps}
            type={type}
            maxLength={textProps.maxLength}
            leftSection={textProps.leftSection}
            rightSection={
              rightSectionElements.length > 0 ? (
                <Group gap="xs">{rightSectionElements}</Group>
              ) : undefined
            }
          />
        );
      }

      case "password": {
        const passwordProps = props as PasswordFormFieldProps;
        return (
          <Stack gap="xs">
            <PasswordInput
              {...baseProps}
              visible={passwordProps.visible}
              onVisibilityChange={passwordProps.onVisibilityChange}
              rightSection={validationStatus}
            />
            {passwordStrength && (
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Text size="xs" c={passwordStrength.color}>
                    {_(msg`Password strength`)}: {passwordStrength.label}
                  </Text>
                  <Badge size="xs" color={passwordStrength.color}>
                    {passwordStrength.strength}/5
                  </Badge>
                </Group>
                <Progress
                  value={passwordStrength.percentage || 0}
                  color={passwordStrength.color}
                  size="xs"
                />
              </Stack>
            )}
          </Stack>
        );
      }

      case "textarea": {
        const textareaProps = props as TextareaFormFieldProps;
        return (
          <Stack gap="xs">
            <Textarea
              {...baseProps}
              rows={textareaProps.rows}
              autosize={textareaProps.autosize}
              minRows={textareaProps.minRows}
              maxRows={textareaProps.maxRows}
              maxLength={textareaProps.maxLength}
              resize={textareaProps.resize}
            />
            {characterCount && (
              <Group justify="flex-end">
                <Text size="xs" c={characterCount.color}>
                  {characterCount.text}
                </Text>
              </Group>
            )}
          </Stack>
        );
      }

      case "number": {
        const numberProps = props as NumberFormFieldProps;
        return (
          <NumberInput
            {...baseProps}
            min={numberProps.min}
            max={numberProps.max}
            step={numberProps.step}
            decimalScale={numberProps.precision}
            hideControls={numberProps.hideControls}
            thousandSeparator={numberProps.thousandSeparator}
            decimalSeparator={numberProps.decimalSeparator}
            rightSection={validationStatus}
          />
        );
      }

      case "select": {
        const selectProps = props as SelectFormFieldProps;
        const translatedData = selectProps.data.map((item) => ({
          ...item,
          label: resolveMessage(item.label),
        }));

        // Note: Creatable select functionality would require custom implementation
        // For now, we'll use the standard Select component

        return (
          <Select
            {...baseProps}
            data={translatedData}
            searchable={selectProps.searchable}
            clearable={selectProps.clearable}
            limit={selectProps.limit}
            rightSection={validationStatus}
          />
        );
      }

      case "multiselect": {
        const multiSelectProps = props as MultiSelectFormFieldProps;
        const translatedData = multiSelectProps.data.map((item) => ({
          ...item,
          label: resolveMessage(item.label),
        }));

        return (
          <MultiSelect
            {...baseProps}
            data={translatedData}
            searchable={multiSelectProps.searchable}
            clearable={multiSelectProps.clearable}
            maxValues={multiSelectProps.maxValues}
            hidePickedOptions={multiSelectProps.hidePickedOptions}
          />
        );
      }

      case "date": {
        const dateProps = props as DateFormFieldProps;
        return (
          <TextInput
            {...baseProps}
            type="date"
            rightSection={validationStatus}
          />
        );
      }

      case "time": {
        const timeProps = props as TimeFormFieldProps;
        return (
          <TextInput
            {...baseProps}
            type="time"
            rightSection={validationStatus}
          />
        );
      }

      case "datetime": {
        const datetimeProps = props as DateTimeFormFieldProps;
        return (
          <TextInput
            {...baseProps}
            type="datetime-local"
            rightSection={validationStatus}
          />
        );
      }

      case "checkbox": {
        const checkboxProps = props as CheckboxFormFieldProps;
        return (
          <Checkbox
            {...form.getInputProps(name, { type: "checkbox" })}
            label={resolveMessage(checkboxProps.checkboxLabel || label)}
            description={resolveMessage(description)}
            disabled={disabled || loading}
            error={fieldError}
            size={size}
            indeterminate={checkboxProps.indeterminate}
          />
        );
      }

      case "switch": {
        const switchProps = props as SwitchFormFieldProps;
        return (
          <Switch
            {...form.getInputProps(name, { type: "checkbox" })}
            label={resolveMessage(label)}
            description={resolveMessage(description)}
            disabled={disabled || loading}
            size={size}
            onLabel={resolveMessage(switchProps.onLabel)}
            offLabel={resolveMessage(switchProps.offLabel)}
          />
        );
      }

      case "radio": {
        const radioProps = props as RadioFormFieldProps;
        return (
          <Radio.Group
            {...form.getInputProps(name)}
            label={resolveMessage(label)}
            description={resolveMessage(description)}
            error={fieldError}
            size={size}
          >
            <Stack gap="xs" mt="xs">
              {radioProps.data.map((item) => (
                <Stack key={item.value} gap={2}>
                  <Radio
                    value={item.value}
                    label={resolveMessage(item.label)}
                    disabled={item.disabled || disabled || loading}
                  />
                  {item.description && (
                    <Text size="xs" c="dimmed" ml="xl">
                      {item.description}
                    </Text>
                  )}
                </Stack>
              ))}
            </Stack>
          </Radio.Group>
        );
      }

      case "file": {
        const fileProps = props as FileFormFieldProps;
        return (
          <Input.Wrapper {...baseProps}>
            <Input
              component="input"
              type="file"
              accept={fileProps.accept}
              multiple={fileProps.multiple}
              {...form.getInputProps(name)}
              onChange={(event) => {
                const files = event.target.files;
                if (files && fileProps.fileValidator) {
                  for (let i = 0; i < files.length; i++) {
                    const error = fileProps.fileValidator(files[i]);
                    if (error) {
                      form.setFieldError(name, error);
                      return;
                    }
                  }
                }
                form.setFieldValue(name, files);
              }}
            />
          </Input.Wrapper>
        );
      }

      case "color": {
        const colorProps = props as ColorFormFieldProps;
        return (
          <Input.Wrapper {...baseProps}>
            <Input
              component="input"
              type="color"
              {...form.getInputProps(name)}
            />
          </Input.Wrapper>
        );
      }

      default:
        return <TextInput {...baseProps} rightSection={validationStatus} />;
    }
  };

  return renderField();
}

// Export as both FormField and EnhancedFormField for backward compatibility
export { FormField as EnhancedFormField };
