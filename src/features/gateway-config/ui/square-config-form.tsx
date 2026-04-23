import { TextInput, PasswordInput, Stack } from "@mantine/core";
import { t } from "@lingui/core/macro";
import { SquareGatewayConfigData } from "@/shared/api/billing/types";

interface SquareConfigFormProps {
  value: Partial<SquareGatewayConfigData>;
  onChange: (value: Partial<SquareGatewayConfigData>) => void;
  errors?: Record<string, string>;
}

export const SquareConfigForm = ({ value, onChange, errors = {} }: SquareConfigFormProps) => {
  return (
    <Stack gap="md">
      <PasswordInput
        label={t`Access Token`}
        placeholder="EAAAl..."
        required
        value={value.accessToken || ""}
        onChange={(e) => onChange({ ...value, accessToken: e.currentTarget.value })}
        error={errors.accessToken}
        description={t`Your Square API access token`}
      />
      <TextInput
        label={t`Location ID`}
        placeholder="L..."
        required
        value={value.locationId || ""}
        onChange={(e) => onChange({ ...value, locationId: e.currentTarget.value })}
        error={errors.locationId}
        description={t`Square location ID for payments`}
      />
      <PasswordInput
        label={t`Webhook Signature Key`}
        placeholder="whsec_..."
        value={value.webhookSignatureKey || ""}
        onChange={(e) => onChange({ ...value, webhookSignatureKey: e.currentTarget.value })}
        error={errors.webhookSignatureKey}
        description={t`Webhook signature key for event validation (optional)`}
      />
      <TextInput
        label={t`Application ID`}
        placeholder="sq0idp..."
        value={value.applicationId || ""}
        onChange={(e) => onChange({ ...value, applicationId: e.currentTarget.value })}
        error={errors.applicationId}
        description={t`Application ID for frontend use (optional)`}
      />
    </Stack>
  );
};
