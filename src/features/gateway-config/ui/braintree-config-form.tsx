import { TextInput, PasswordInput, Select, Stack } from "@mantine/core";
import { t } from "@lingui/core/macro";
import { BraintreeGatewayConfigData } from "@/shared/api/billing/types";

interface BraintreeConfigFormProps {
  value: Partial<BraintreeGatewayConfigData>;
  onChange: (value: Partial<BraintreeGatewayConfigData>) => void;
  errors?: Record<string, string>;
}

export const BraintreeConfigForm = ({ value, onChange, errors = {} }: BraintreeConfigFormProps) => {
  return (
    <Stack gap="md">
      <TextInput
        label={t`Merchant ID`}
        placeholder="merchant_id"
        required
        value={value.merchantId || ""}
        onChange={(e) => onChange({ ...value, merchantId: e.currentTarget.value })}
        error={errors.merchantId}
        description={t`Your Braintree merchant ID`}
      />
      <TextInput
        label={t`Public Key`}
        placeholder="public_key"
        required
        value={value.publicKey || ""}
        onChange={(e) => onChange({ ...value, publicKey: e.currentTarget.value })}
        error={errors.publicKey}
        description={t`Your Braintree public key`}
      />
      <PasswordInput
        label={t`Private Key`}
        placeholder="private_key"
        required
        value={value.privateKey || ""}
        onChange={(e) => onChange({ ...value, privateKey: e.currentTarget.value })}
        error={errors.privateKey}
        description={t`Your Braintree private key`}
      />
      <Select
        label={t`Environment`}
        required
        value={value.environment || "sandbox"}
        onChange={(val) => onChange({ ...value, environment: val as "sandbox" | "production" })}
        data={[
          { value: "sandbox", label: t`Sandbox (Test)` },
          { value: "prd", label: t`Production (Live)` },
        ]}
        error={errors.environment}
        description={t`Environment for Braintree API`}
      />
    </Stack>
  );
};
