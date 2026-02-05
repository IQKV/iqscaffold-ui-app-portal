import { useState } from "react";
import {
  Modal,
  Stepper,
  Button,
  Group,
  Select,
  Stack,
  Text,
  Alert,
} from "@mantine/core";
import { t } from "@lingui/macro";
import { PaymentGatewayProvider } from "@/shared/api/billing/types";
import { GatewaySelector } from "@/features/gateway-config";
import { useActiveGatewayConfigsQuery } from "@/entities/gateway-config";
import { billingApi } from "@/shared/api/billing";
import { notificationService } from "@/shared/lib/notifications";
import { IconAlertCircle } from "@tabler/icons-react";

interface MerchantOnboardingWizardProps {
  opened: boolean;
  onClose: () => void;
  organizations: Array<{ id: number; name: string }>;
}

export const MerchantOnboardingWizard = ({
  opened,
  onClose,
  organizations,
}: MerchantOnboardingWizardProps) => {
  const [active, setActive] = useState(0);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [gatewayProvider, setGatewayProvider] =
    useState<PaymentGatewayProvider | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: activeGateways, isLoading: gatewaysLoading } =
    useActiveGatewayConfigsQuery();

  const handleNext = () => setActive((current) => current + 1);
  const handlePrev = () => setActive((current) => current - 1);

  const handleInitiateOnboarding = async () => {
    if (!organizationId || !gatewayProvider) {
      return;
    }

    setLoading(true);
    try {
      const response = await billingApi.initiateOnboarding({
        organizationId,
        gatewayProvider,
        refreshUrl: `${window.location.origin}/billing?status=refresh`,
        returnUrl: `${window.location.origin}/billing?status=success`,
      });

      notificationService.info({
        title: t`Redirecting`,
        message: t`Redirecting to payment gateway for onboarding...`,
      });

      window.location.href = response.accountLink;
    } catch (error) {
      notificationService.error({
        title: t`Onboarding Failed`,
        message: t`Could not initiate merchant onboarding. Please try again.`,
      });
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActive(0);
    setOrganizationId(null);
    setGatewayProvider(null);
    setLoading(false);
    onClose();
  };

  const canProceedStep1 = organizationId !== null;
  const canProceedStep2 = gatewayProvider !== null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t`Merchant Onboarding`}
      size="lg"
    >
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label={t`Select Organization`}>
          <Stack gap="md" mt="md">
            <Text size="sm" c="dimmed">
              {t`Choose the organization to onboard as a merchant.`}
            </Text>
            <Select
              label={t`Organization`}
              placeholder={t`Select organization`}
              data={organizations.map((org) => ({
                value: org.id.toString(),
                label: org.name,
              }))}
              value={organizationId?.toString() || null}
              onChange={(value) =>
                setOrganizationId(value ? parseInt(value, 10) : null)
              }
              required
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label={t`Select Gateway`}>
          <Stack gap="md" mt="md">
            <Text size="sm" c="dimmed">
              {t`Choose the payment gateway for merchant onboarding.`}
            </Text>

            {gatewaysLoading ? (
              <Text size="sm">{t`Loading available gateways...`}</Text>
            ) : !activeGateways || activeGateways.length === 0 ? (
              <Alert
                icon={<IconAlertCircle />}
                title={t`No Active Gateways`}
                color="yellow"
              >
                {t`No active payment gateways configured. Please configure a gateway first.`}
              </Alert>
            ) : (
              <GatewaySelector
                value={gatewayProvider}
                onChange={setGatewayProvider}
                label={t`Payment Gateway`}
                placeholder={t`Select gateway`}
              />
            )}
          </Stack>
        </Stepper.Step>

        <Stepper.Completed>
          <Stack gap="md" mt="md">
            <Text size="sm" c="dimmed">
              {t`Review your selections and click Continue to proceed with onboarding.`}
            </Text>
            <div>
              <Text size="sm" fw={500}>
                {t`Organization:`}
              </Text>
              <Text size="sm" c="dimmed">
                {organizations.find((org) => org.id === organizationId)?.name}
              </Text>
            </div>
            <div>
              <Text size="sm" fw={500}>
                {t`Gateway:`}
              </Text>
              <Text size="sm" c="dimmed">
                {gatewayProvider}
              </Text>
            </div>
          </Stack>
        </Stepper.Completed>
      </Stepper>

      <Group justify="space-between" mt="xl">
        <Button variant="subtle" onClick={handleClose} disabled={loading}>
          {t`Cancel`}
        </Button>
        <Group>
          {active > 0 && active < 2 && (
            <Button variant="default" onClick={handlePrev} disabled={loading}>
              {t`Back`}
            </Button>
          )}
          {active === 0 && (
            <Button onClick={handleNext} disabled={!canProceedStep1}>
              {t`Next`}
            </Button>
          )}
          {active === 1 && (
            <Button onClick={handleNext} disabled={!canProceedStep2}>
              {t`Next`}
            </Button>
          )}
          {active === 2 && (
            <Button onClick={handleInitiateOnboarding} loading={loading}>
              {t`Continue to Gateway`}
            </Button>
          )}
        </Group>
      </Group>
    </Modal>
  );
};
