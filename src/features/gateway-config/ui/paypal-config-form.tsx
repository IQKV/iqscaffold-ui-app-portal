import { TextInput, PasswordInput, Select, Stack } from "@mantine/core";
import { t } from "@lingui/macro";
import { PayPalGatewayConfigData } from "@/shared/api/billing/types";

interface PayPalConfigFormProps {
  value: Partial<PayPalGatewayConfigData>;
  onChange: (value: Partial<PayPalGatewayConfigData>) => void;
  errors?: Record<string, string>;
}

export const PayPalConfigForm = ({
  value,
  onChange,
  errors = {},
}: PayPalConfigFormProps) => {
  return (
    <Stack gap="md">
      <TextInput
        label={t`Client ID`}
        placeholder="AeB..."
        required
        value={value.clientId || ""}
        onChange={(e) =>
          onChange({ ...value, clientId: e.currentTarget.value })
        }
        error={errors.clientId}
        description={t`Your PayPal REST API client ID`}
      />
      <PasswordInput
        label={t`Client Secret`}
        placeholder="EL..."
        required
        value={value.clientSecret || ""}
        onChange={(e) =>
          onChange({ ...value, clientSecret: e.currentTarget.value })
        }
        error={errors.clientSecret}
        description={t`Your PayPal REST API client secret`}
      />
      <TextInput
        label={t`Webhook ID`}
        placeholder="WH-..."
        value={value.webhookId || ""}
        onChange={(e) =>
          onChange({ ...value, webhookId: e.currentTarget.value })
        }
        error={errors.webhookId}
        description={t`Webhook ID for event notifications (optional)`}
      />
      <Select
        label={t`Mode`}
        required
        value={value.mode || "sandbox"}
        onChange={(val) =>
          onChange({ ...value, mode: val as "sandbox" | "live" })
        }
        data={[
          { value: "sandbox", label: t`Sandbox (Test)` },
          { value: "live", label: t`Live (Production)` },
        ]}
        error={errors.mode}
        description={t`Environment mode for PayPal API`}
      />
    </Stack>
  );
};
