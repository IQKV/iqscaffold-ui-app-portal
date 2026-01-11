import { TextInput, PasswordInput, Stack } from "@mantine/core";
import { t } from "@lingui/macro";
import { StripeGatewayConfigData } from "@/shared/api/billing/types";

interface StripeConfigFormProps {
  value: Partial<StripeGatewayConfigData>;
  onChange: (value: Partial<StripeGatewayConfigData>) => void;
  errors?: Record<string, string>;
}

export const StripeConfigForm = ({
  value,
  onChange,
  errors = {},
}: StripeConfigFormProps) => {
  return (
    <Stack gap="md">
      <PasswordInput
        label={t`API Key`}
        placeholder="sk_test_..."
        required
        value={value.apiKey || ""}
        onChange={(e) => onChange({ ...value, apiKey: e.currentTarget.value })}
        error={errors.apiKey}
        description={t`Your Stripe secret API key`}
      />
      <PasswordInput
        label={t`Webhook Secret`}
        placeholder="whsec_..."
        required
        value={value.webhookSecret || ""}
        onChange={(e) =>
          onChange({ ...value, webhookSecret: e.currentTarget.value })
        }
        error={errors.webhookSecret}
        description={t`Webhook signing secret for event validation`}
      />
      <TextInput
        label={t`Client ID`}
        placeholder="ca_..."
        value={value.clientId || ""}
        onChange={(e) =>
          onChange({ ...value, clientId: e.currentTarget.value })
        }
        error={errors.clientId}
        description={t`Client ID for Stripe Connect (optional)`}
      />
      <TextInput
        label={t`Publishable Key`}
        placeholder="pk_test_..."
        value={value.publicKey || ""}
        onChange={(e) =>
          onChange({ ...value, publicKey: e.currentTarget.value })
        }
        error={errors.publicKey}
        description={t`Public key for frontend use (optional)`}
      />
    </Stack>
  );
};
