import React from "react";
import {
  TextInput,
  PasswordInput,
  Select,
  MultiSelect,
  Switch,
  Stack,
  Text,
  Progress,
  Group,
  Badge,
  Alert,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { MessageDescriptor } from "@lingui/core";
import { useLingui } from "@lingui/react";
import {
  IconShield,
  IconShieldCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { t } from "@lingui/core/macro";

interface BaseUserFormFieldProps {
  name: string;
  label: string | MessageDescriptor;
  placeholder?: string | MessageDescriptor;
  form: UseFormReturnType<any>;
  disabled?: boolean;
  withAsterisk?: boolean;
  description?: string | MessageDescriptor;
}

interface UserTextFieldProps extends BaseUserFormFieldProps {
  type: "text" | "email" | "username";
  maxLength?: number;
  showCharacterCount?: boolean;
}

interface UserPasswordFieldProps extends BaseUserFormFieldProps {
  type: "password";
  showStrengthIndicator?: boolean;
  requireStrong?: boolean;
}

interface UserSelectFieldProps extends BaseUserFormFieldProps {
  type: "select";
  data: Array<{ value: string; label: string }>;
  searchable?: boolean;
  clearable?: boolean;
}

interface UserMultiSelectFieldProps extends BaseUserFormFieldProps {
  type: "multiselect";
  data: Array<{ value: string; label: string }>;
  searchable?: boolean;
  clearable?: boolean;
  maxValues?: number;
}

interface UserSwitchFieldProps extends BaseUserFormFieldProps {
  type: "switch";
  onLabel?: string;
  offLabel?: string;
}

export type UserFormFieldProps =
  | UserTextFieldProps
  | UserPasswordFieldProps
  | UserSelectFieldProps
  | UserMultiSelectFieldProps
  | UserSwitchFieldProps;

// User-specific options
export const getUserRoles = () => [
  { value: "USER", label: t`User` },
  { value: "ADMIN", label: t`Admin` },
  { value: "SUPER_ADMIN", label: t`Super Admin` },
];

export const getUserAuthorities = () => [
  { value: "USER", label: t`Basic User Access` },
  { value: "ADMIN", label: t`Admin Access` },
  { value: "SUPER_ADMIN", label: t`Super Admin Access` },
  { value: "BILLING_READ", label: t`View Billing` },
  { value: "BILLING_WRITE", label: t`Manage Billing` },
  { value: "CRM_READ", label: t`View CRM` },
  { value: "CRM_WRITE", label: t`Manage CRM` },
  { value: "USER_READ", label: t`View Users` },
  { value: "USER_WRITE", label: t`Manage Users` },
];

export const getUserStatuses = () => [
  { value: "ACTIVE", label: t`Active` },
  { value: "INACTIVE", label: t`Inactive` },
  { value: "PENDING", label: t`Pending Verification` },
  { value: "SUSPENDED", label: t`Suspended` },
];

// User-specific validation
const calculatePasswordStrength = (password: string) => {
  if (!password) {
    return { strength: 0, label: t`No password`, color: "gray", percentage: 0 };
  }

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  score += checks.length ? 20 : 0;
  score += checks.lowercase ? 20 : 0;
  score += checks.uppercase ? 20 : 0;
  score += checks.numbers ? 20 : 0;
  score += checks.special ? 20 : 0;

  if (score < 40) {
    return { strength: score, label: t`Weak`, color: "red", percentage: score };
  }
  if (score < 60) {
    return {
      strength: score,
      label: t`Fair`,
      color: "orange",
      percentage: score,
    };
  }
  if (score < 80) {
    return {
      strength: score,
      label: t`Good`,
      color: "yellow",
      percentage: score,
    };
  }
  return {
    strength: score,
    label: t`Strong`,
    color: "green",
    percentage: score,
  };
};

const validateUsername = (username: string): boolean => {
  // Username should be 3-30 characters, alphanumeric + underscore/dash
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * User-specific form field component with business logic
 *
 * Features:
 * - Username validation (alphanumeric + underscore/dash)
 * - Password strength indicator with security requirements
 * - Role and authority selection with descriptions
 * - User status management
 * - Multi-select for authorities with limits
 * - Switch fields for boolean user properties
 */
export function UserFormField(props: UserFormFieldProps) {
  const { _ } = useLingui();
  const {
    name,
    label,
    form,
    disabled = false,
    withAsterisk = false,
    description,
  } = props;

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
    case "email": {
      const { maxLength, showCharacterCount } = props;
      const currentLength = form.values[name]?.length || 0;

      return (
        <Stack gap="xs">
          <TextInput {...fieldProps} type={props.type} maxLength={maxLength} />
          {showCharacterCount && maxLength && (
            <Text
              size="xs"
              c={currentLength > maxLength * 0.9 ? "orange" : "dimmed"}
            >
              {currentLength}/{maxLength}
            </Text>
          )}
        </Stack>
      );
    }

    case "username": {
      const { maxLength = 30, showCharacterCount } = props;
      const value = form.values[name] || "";
      const isValid = validateUsername(value);
      const currentLength = value.length;

      return (
        <Stack gap="xs">
          <TextInput
            {...fieldProps}
            maxLength={maxLength}
            rightSection={
              value && (
                <Group gap="xs">
                  {isValid ? (
                    <IconShieldCheck size={16} color="green" />
                  ) : (
                    <IconAlertTriangle size={16} color="orange" />
                  )}
                </Group>
              )
            }
          />
          {showCharacterCount && (
            <Text
              size="xs"
              c={currentLength > maxLength * 0.9 ? "orange" : "dimmed"}
            >
              {currentLength}/{maxLength}
            </Text>
          )}
          {value && !isValid && (
            <Alert color="orange" variant="light">
              {t`Username must be 3-30 characters, letters, numbers, underscore, or dash only`}
            </Alert>
          )}
        </Stack>
      );
    }

    case "password": {
      const { showStrengthIndicator = true, requireStrong = false } = props;
      const value = form.values[name] || "";
      const strength = showStrengthIndicator
        ? calculatePasswordStrength(value)
        : null;

      return (
        <Stack gap="xs">
          <PasswordInput
            {...fieldProps}
            rightSection={<IconShield size={16} />}
          />
          {strength && value && (
            <Stack gap="xs">
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  {t`Password strength:`}
                </Text>
                <Badge size="xs" color={strength.color}>
                  {strength.label}
                </Badge>
              </Group>
              <Progress
                value={strength.percentage}
                color={strength.color}
                size="xs"
              />
              {requireStrong && strength.strength < 80 && (
                <Alert color="orange" variant="light">
                  {t`Password should be strong for security. Include uppercase, lowercase, numbers, and special characters.`}
                </Alert>
              )}
            </Stack>
          )}
        </Stack>
      );
    }

    case "select": {
      const { data, searchable = false, clearable = false } = props;

      return (
        <Select
          {...fieldProps}
          data={data}
          searchable={searchable}
          clearable={clearable}
        />
      );
    }

    case "multiselect": {
      const { data, searchable = true, clearable = true, maxValues } = props;
      const selectedCount = form.values[name]?.length || 0;

      return (
        <Stack gap="xs">
          <MultiSelect
            {...fieldProps}
            data={data}
            searchable={searchable}
            clearable={clearable}
            maxValues={maxValues}
          />
          {maxValues && (
            <Text
              size="xs"
              c={selectedCount >= maxValues ? "orange" : "dimmed"}
            >
              {selectedCount}/{maxValues} {t`selected`}
            </Text>
          )}
        </Stack>
      );
    }

    case "switch": {
      const { onLabel = t`Yes`, offLabel = t`No` } = props;

      return <Switch {...fieldProps} onLabel={onLabel} offLabel={offLabel} />;
    }

    default:
      return null;
  }
}
