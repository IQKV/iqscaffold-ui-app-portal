import React from "react";
import {
  TextInput,
  PasswordInput,
  Select,
  NumberInput,
  Stack,
  Text,
  Group,
  Badge,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { MessageDescriptor } from "@lingui/core";
import { useLingui } from "@lingui/react";
import { t } from "@lingui/core/macro";

interface BaseBillingFormFieldProps {
  name: string;
  label: string | MessageDescriptor;
  placeholder?: string | MessageDescriptor;
  form: UseFormReturnType<any>;
  disabled?: boolean;
  withAsterisk?: boolean;
  description?: string | MessageDescriptor;
}

interface BillingTextFieldProps extends BaseBillingFormFieldProps {
  type: "text" | "email";
}

interface BillingPasswordFieldProps extends BaseBillingFormFieldProps {
  type: "password";
  showStrengthIndicator?: boolean;
}

interface BillingSelectFieldProps extends BaseBillingFormFieldProps {
  type: "select";
  data: Array<{ value: string; label: string }>;
  searchable?: boolean;
  clearable?: boolean;
}

interface BillingAmountFieldProps extends BaseBillingFormFieldProps {
  type: "amount";
  currency?: string;
  min?: number;
  max?: number;
  precision?: number;
}

export type BillingFormFieldProps =
  | BillingTextFieldProps
  | BillingPasswordFieldProps
  | BillingSelectFieldProps
  | BillingAmountFieldProps;

// Billing-specific options
export const getBillingGateways = () => [
  { value: "STRIPE", label: "Stripe" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "SQUARE", label: "Square" },
  { value: "BRAINTREE", label: "Braintree" },
];

export const getBillingCurrencies = () => [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CAD", label: "CAD (C$)" },
];

export const getBillingEnvironments = () => [
  { value: "SANDBOX", label: t`Sandbox` },
  { value: "PRODUCTION", label: t`Production` },
];

// Billing-specific validation
const validateApiKey = (value: string, gateway: string): boolean => {
  if (!value) {
    return false;
  }

  switch (gateway) {
    case "STRIPE": {
      return value.startsWith("sk_") || value.startsWith("pk_");
    }
    case "PAYPAL": {
      return value.length >= 20;
    }
    case "SQUARE": {
      return value.startsWith("sq0");
    }
    case "BRAINTREE": {
      return value.length >= 16;
    }
    default: {
      return value.length >= 8;
    }
  }
};

const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Billing-specific form field component with business logic
 *
 * Features:
 * - Gateway-specific API key validation
 * - Currency formatting and selection
 * - Amount fields with precision control
 * - Environment selection (sandbox/production)
 * - Secure password fields for API keys
 */
export function BillingFormField(props: BillingFormFieldProps) {
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
      return <TextInput {...fieldProps} type={props.type} />;
    }

    case "password": {
      const { showStrengthIndicator = false } = props;
      const value = form.values[name] || "";

      // Simple strength calculation for API keys
      const getKeyStrength = (key: string) => {
        if (!key) {
          return { strength: 0, label: t`No key`, color: "gray" };
        }
        if (key.length < 8) {
          return { strength: 25, label: t`Too short`, color: "red" };
        }
        if (key.length < 16) {
          return { strength: 50, label: t`Weak`, color: "orange" };
        }
        if (key.length < 32) {
          return { strength: 75, label: t`Good`, color: "yellow" };
        }
        return { strength: 100, label: t`Strong`, color: "green" };
      };

      const strength = showStrengthIndicator ? getKeyStrength(value) : null;

      return (
        <Stack gap="xs">
          <PasswordInput {...fieldProps} />
          {strength && (
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                {t`Key strength:`}
              </Text>
              <Badge size="xs" color={strength.color}>
                {strength.label}
              </Badge>
            </Group>
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

    case "amount": {
      const { currency = "USD", min = 0, max, precision = 2 } = props;
      const value = form.values[name];

      return (
        <Stack gap="xs">
          <NumberInput
            {...fieldProps}
            min={min}
            max={max}
            decimalScale={precision}
            leftSection={
              <Text size="sm" c="dimmed">
                {currency === "USD"
                  ? "$"
                  : currency === "EUR"
                    ? "€"
                    : currency === "GBP"
                      ? "£"
                      : currency}
              </Text>
            }
            thousandSeparator=","
          />
          {value && !isNaN(value) && (
            <Text size="xs" c="dimmed">
              {t`Formatted: `}
              {formatCurrency(value, currency)}
            </Text>
          )}
        </Stack>
      );
    }

    default:
      return null;
  }
}
