import React from "react";
import { Stack } from "@mantine/core";
import { t } from "@lingui/core/macro";
import { BillingFormField } from "@/entities/billing";
import { StripeGatewayConfigData } from "@/shared/api/billing/types";
import { useForm } from "@mantine/form";

interface StripeConfigFormProps {
  value: Partial<StripeGatewayConfigData>;
  onChange: (value: Partial<StripeGatewayConfigData>) => void;
  errors?: Record<string, string>;
}

export const StripeConfigForm = ({ value, onChange, errors = {} }: StripeConfigFormProps) => {
  // Create a form to work with BillingFormField
  const form = useForm({
    initialValues: value,
    onValuesChange: onChange,
  });

  // Update form when value prop changes
  React.useEffect(() => {
    form.setValues(value);
  }, [value, form]);

  return (
    <Stack gap="md">
      <BillingFormField
        type="password"
        name="apiKey"
        label={t`API Key`}
        placeholder="sk_test_..."
        form={form}
        withAsterisk
        description={t`Your Stripe secret API key`}
        showStrengthIndicator
      />
      <BillingFormField
        type="password"
        name="webhookSecret"
        label={t`Webhook Secret`}
        placeholder="whsec_..."
        form={form}
        withAsterisk
        description={t`Webhook signing secret for event validation`}
        showStrengthIndicator
      />
      <BillingFormField
        type="text"
        name="clientId"
        label={t`Client ID`}
        placeholder="ca_..."
        form={form}
        description={t`Client ID for Stripe Connect (optional)`}
      />
      <BillingFormField
        type="text"
        name="publicKey"
        label={t`Publishable Key`}
        placeholder="pk_test_..."
        form={form}
        description={t`Public key for frontend use (optional)`}
      />
    </Stack>
  );
};
