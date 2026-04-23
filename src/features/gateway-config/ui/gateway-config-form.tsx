import { useState } from "react";
import { Modal, Stack, TextInput, Textarea, Select, Switch, Group, Button } from "@mantine/core";
import { t } from "@lingui/core/macro";
import {
  PaymentGatewayProvider,
  CreateGatewayConfigRequest,
  GatewayConfigData,
} from "@/shared/api/billing/types";
import { GatewaySelector } from "./gateway-selector";
import { StripeConfigForm } from "./stripe-config-form";
import { PayPalConfigForm } from "./paypal-config-form";
import { SquareConfigForm } from "./square-config-form";
import { BraintreeConfigForm } from "./braintree-config-form";

interface GatewayConfigFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (request: CreateGatewayConfigRequest) => void;
  loading?: boolean;
}

export const GatewayConfigForm = ({
  opened,
  onClose,
  onSubmit,
  loading = false,
}: GatewayConfigFormProps) => {
  const [provider, setProvider] = useState<PaymentGatewayProvider | null>(null);
  const [configData, setConfigData] = useState<any>({});
  const [mode, setMode] = useState<"test" | "live">("test");
  const [isActive, setIsActive] = useState(true);
  const [isPrimary, setIsPrimary] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    setErrors({});

    if (!provider) {
      setErrors({ provider: t`Please select a gateway provider` });
      return;
    }

    // Add provider to config data
    const fullConfigData = {
      ...configData,
      provider,
    } as GatewayConfigData;

    const request: CreateGatewayConfigRequest = {
      gatewayProvider: provider,
      configData: fullConfigData,
      mode,
      isActive,
      isPrimary,
      displayName: displayName || undefined,
      description: description || undefined,
    };

    onSubmit(request);
  };

  const handleClose = () => {
    setProvider(null);
    setConfigData({});
    setMode("test");
    setIsActive(true);
    setIsPrimary(false);
    setDisplayName("");
    setDescription("");
    setErrors({});
    onClose();
  };

  const renderProviderForm = () => {
    switch (provider) {
      case PaymentGatewayProvider.STRIPE:
        return <StripeConfigForm value={configData} onChange={setConfigData} errors={errors} />;
      case PaymentGatewayProvider.PAYPAL:
        return <PayPalConfigForm value={configData} onChange={setConfigData} errors={errors} />;
      case PaymentGatewayProvider.SQUARE:
        return <SquareConfigForm value={configData} onChange={setConfigData} errors={errors} />;
      case PaymentGatewayProvider.BRAINTREE:
        return <BraintreeConfigForm value={configData} onChange={setConfigData} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={t`Add Payment Gateway`} size="lg">
      <Stack gap="md">
        <GatewaySelector
          value={provider}
          onChange={(val) => {
            setProvider(val);
            setConfigData({});
          }}
          error={errors.provider}
        />

        {provider && (
          <>
            {renderProviderForm()}

            <Select
              label={t`Mode`}
              required
              value={mode}
              onChange={(val) => setMode(val as "test" | "live")}
              data={[
                { value: "test", label: t`Test` },
                { value: "live", label: t`Live (Production)` },
              ]}
              description={t`Environment mode for the gateway`}
            />

            <TextInput
              label={t`Display Name`}
              placeholder={t`My Payment Gateway`}
              value={displayName}
              onChange={(e) => setDisplayName(e.currentTarget.value)}
              description={t`Optional friendly name for this configuration`}
            />

            <Textarea
              label={t`Description`}
              placeholder={t`Additional notes...`}
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              description={t`Optional description`}
            />

            <Switch
              label={t`Activate immediately`}
              checked={isActive}
              onChange={(e) => setIsActive(e.currentTarget.checked)}
            />

            <Switch
              label={t`Set as primary gateway`}
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.currentTarget.checked)}
              description={t`Only one gateway can be primary at a time`}
            />
          </>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose} disabled={loading}>
            {t`Cancel`}
          </Button>
          <Button onClick={handleSubmit} loading={loading} disabled={!provider}>
            {t`Add Gateway`}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
