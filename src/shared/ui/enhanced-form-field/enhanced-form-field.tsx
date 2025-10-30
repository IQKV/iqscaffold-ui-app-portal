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
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { UseFormReturnType } from "@mantine/form";
import { IconInfoCircle, IconAlertTriangle } from "@tabler/icons-react";

interface BaseEnhancedFormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  form: UseFormReturnType<any>;
  /** Tooltip text for additional help */
  tooltip?: string;
  /** Whether to show field validation status */
  showValidationStatus?: boolean;
  /** Custom validation message */
  customError?: string;
  /** Whether the field is loading */
  loading?: boolean;
}

interface TextEnhancedFormFieldProps extends BaseEnhancedFormFieldProps {
  type: "text" | "email" | "tel" | "url";
  /** Maximum character count */
  maxLength?: number;
  /** Show character counter */
  showCharacterCount?: boolean;
}

interface PasswordEnhancedFormFieldProps extends BaseEnhancedFormFieldProps {
  type: "password";
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  /** Show password strength indicator */
  showStrengthIndicator?: boolean;
}

interface TextareaEnhancedFormFieldProps extends BaseEnhancedFormFieldProps {
  type: "textarea";
  rows?: number;
  autosize?: boolean;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
}

interface NumberEnhancedFormFieldProps extends BaseEnhancedFormFieldProps {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

interface SelectEnhancedFormFieldProps extends BaseEnhancedFormFieldProps {
  type: "select";
  data: Array<{ value: string; label: string; disabled?: boolean }>;
  searchable?: boolean;
  clearable?: boolean;
  /** Allow creation of new options */
  creatable?: boolean;
}

interface MultiSelectEnhancedFormFieldProps extends BaseEnhancedFormFieldProps {
  type: "multiselect";
  data: Array<{ value: string; label: string; disabled?: boolean }>;
  searchable?: boolean;
  clearable?: boolean;
  /** Maximum number of selected values */
  maxValues?: number;
}

interface DateEnhancedFormFieldProps extends BaseEnhancedFormFieldProps {
  type: "date";
  minDate?: Date;
  maxDate?: Date;
}

interface CheckboxEnhancedFormFieldProps extends BaseEnhancedFormFieldProps {
  type: "checkbox";
  /** Checkbox label (different from field label) */
  checkboxLabel?: string;
}

interface SwitchEnhancedFormFieldProps extends BaseEnhancedFormFieldProps {
  type: "switch";
  /** Switch labels */
  onLabel?: string;
  offLabel?: string;
}

interface RadioEnhancedFormFieldProps extends BaseEnhancedFormFieldProps {
  type: "radio";
  data: Array<{ value: string; label: string; disabled?: boolean }>;
  /** Radio group orientation */
  orientation?: "horizontal" | "vertical";
}

type EnhancedFormFieldProps =
  | TextEnhancedFormFieldProps
  | PasswordEnhancedFormFieldProps
  | TextareaEnhancedFormFieldProps
  | NumberEnhancedFormFieldProps
  | SelectEnhancedFormFieldProps
  | MultiSelectEnhancedFormFieldProps
  | DateEnhancedFormFieldProps
  | CheckboxEnhancedFormFieldProps
  | SwitchEnhancedFormFieldProps
  | RadioEnhancedFormFieldProps;

/**
 * Enhanced form field component with better error handling and UX
 */
export function EnhancedFormField(props: EnhancedFormFieldProps) {
  const {
    name,
    label,
    placeholder,
    required,
    disabled,
    description,
    form,
    type,
    tooltip,
    showValidationStatus = true,
    customError,
    loading = false,
  } = props;

  const fieldError = form.errors[name] || customError;
  const fieldValue = form.values[name];
  const hasError = Boolean(fieldError);
  const hasValue =
    fieldValue !== undefined && fieldValue !== "" && fieldValue !== null;

  // Character count for text fields
  const getCharacterCount = () => {
    if (type === "text" || type === "textarea") {
      const textProps = props as
        | TextEnhancedFormFieldProps
        | TextareaEnhancedFormFieldProps;
      if (textProps.showCharacterCount && textProps.maxLength) {
        const currentLength = String(fieldValue || "").length;
        return `${currentLength}/${textProps.maxLength}`;
      }
    }
    return null;
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (type === "password") {
      const passwordProps = props as PasswordEnhancedFormFieldProps;
      if (passwordProps.showStrengthIndicator && fieldValue) {
        const password = String(fieldValue);
        let strength = 0;

        if (password.length >= 8) {
          strength++;
        }
        if (/[A-Z]/.test(password)) {
          strength++;
        }
        if (/[a-z]/.test(password)) {
          strength++;
        }
        if (/[0-9]/.test(password)) {
          strength++;
        }
        if (/[^A-Za-z0-9]/.test(password)) {
          strength++;
        }

        const colors = ["red", "orange", "yellow", "lime", "green"];
        const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

        return {
          strength,
          color: colors[strength - 1] || "red",
          label: labels[strength - 1] || "Very Weak",
        };
      }
    }
    return null;
  };

  const baseProps = {
    label: (
      <Group gap="xs" align="center">
        <Text size="sm" fw={500}>
          {label}
          {required && (
            <Text component="span" c="red">
              *
            </Text>
          )}
        </Text>
        {tooltip && (
          <Tooltip label={tooltip} multiline w={300}>
            <ActionIcon size="xs" variant="subtle" color="gray">
              <IconInfoCircle size="0.75rem" />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    ),
    placeholder,
    disabled: disabled || loading,
    description,
    error: fieldError,
    ...form.getInputProps(name),
  };

  const characterCount = getCharacterCount();
  const passwordStrength = getPasswordStrength();

  const renderField = () => {
    switch (type) {
      case "text":
      case "email":
      case "tel":
      case "url": {
        const textProps = props as TextEnhancedFormFieldProps;
        return (
          <TextInput
            {...baseProps}
            type={type}
            maxLength={textProps.maxLength}
            rightSection={
              characterCount && (
                <Text size="xs" c="dimmed">
                  {characterCount}
                </Text>
              )
            }
          />
        );
      }

      case "password": {
        const passwordProps = props as PasswordEnhancedFormFieldProps;
        return (
          <Stack gap="xs">
            <PasswordInput
              {...baseProps}
              visible={passwordProps.visible}
              onVisibilityChange={passwordProps.onVisibilityChange}
            />
            {passwordStrength && (
              <Group gap="xs" align="center">
                <Text size="xs" c={passwordStrength.color}>
                  Password strength: {passwordStrength.label}
                </Text>
              </Group>
            )}
          </Stack>
        );
      }

      case "textarea": {
        const textareaProps = props as TextareaEnhancedFormFieldProps;
        return (
          <Textarea
            {...baseProps}
            rows={textareaProps.rows}
            autosize={textareaProps.autosize}
            minRows={textareaProps.minRows}
            maxRows={textareaProps.maxRows}
            maxLength={textareaProps.maxLength}
            rightSection={
              characterCount && (
                <Text size="xs" c="dimmed">
                  {characterCount}
                </Text>
              )
            }
          />
        );
      }

      case "number": {
        const numberProps = props as NumberEnhancedFormFieldProps;
        return (
          <NumberInput
            {...baseProps}
            min={numberProps.min}
            max={numberProps.max}
            step={numberProps.step}
            decimalScale={numberProps.precision}
          />
        );
      }

      case "select": {
        const selectProps = props as SelectEnhancedFormFieldProps;
        return (
          <Select
            {...baseProps}
            data={selectProps.data}
            searchable={selectProps.searchable}
            clearable={selectProps.clearable}
            // Note: creatable prop is deprecated in newer Mantine versions
            // Use Combobox component for creatable functionality
          />
        );
      }

      case "multiselect": {
        const multiSelectProps = props as MultiSelectEnhancedFormFieldProps;
        return (
          <MultiSelect
            {...baseProps}
            data={multiSelectProps.data}
            searchable={multiSelectProps.searchable}
            clearable={multiSelectProps.clearable}
            maxValues={multiSelectProps.maxValues}
          />
        );
      }

      case "date": {
        const dateProps = props as DateEnhancedFormFieldProps;
        return (
          <DateInput
            {...baseProps}
            minDate={dateProps.minDate}
            maxDate={dateProps.maxDate}
          />
        );
      }

      case "checkbox": {
        const checkboxProps = props as CheckboxEnhancedFormFieldProps;
        return (
          <Checkbox
            {...form.getInputProps(name, { type: "checkbox" })}
            label={checkboxProps.checkboxLabel || label}
            description={description}
            disabled={disabled || loading}
            error={fieldError}
          />
        );
      }

      case "switch": {
        const switchProps = props as SwitchEnhancedFormFieldProps;
        return (
          <Switch
            {...form.getInputProps(name, { type: "checkbox" })}
            label={label}
            description={description}
            disabled={disabled || loading}
            onLabel={switchProps.onLabel}
            offLabel={switchProps.offLabel}
          />
        );
      }

      case "radio": {
        const radioProps = props as RadioEnhancedFormFieldProps;
        return (
          <Radio.Group
            {...form.getInputProps(name)}
            label={label}
            description={description}
            error={fieldError}
          >
            <Group
              gap="md"
              mt="xs"
              style={{
                flexDirection:
                  radioProps.orientation === "vertical" ? "column" : "row",
                alignItems:
                  radioProps.orientation === "vertical"
                    ? "flex-start"
                    : "center",
              }}
            >
              {radioProps.data.map((item) => (
                <Radio
                  key={item.value}
                  value={item.value}
                  label={item.label}
                  disabled={item.disabled || disabled || loading}
                />
              ))}
            </Group>
          </Radio.Group>
        );
      }

      default:
        return <TextInput {...baseProps} />;
    }
  };

  // Show validation status for non-checkbox/switch/radio fields
  const showStatus =
    showValidationStatus &&
    !["checkbox", "switch", "radio"].includes(type) &&
    hasValue &&
    !loading;

  return (
    <Stack gap="xs">
      {renderField()}

      {showStatus && hasError && (
        <Alert
          icon={<IconAlertTriangle size="1rem" />}
          color="red"
          variant="light"
          // Note: size prop is deprecated in newer Mantine versions
        >
          <Text size="xs">{fieldError}</Text>
        </Alert>
      )}
    </Stack>
  );
}
