import { useState } from "react";
import {
  Card,
  Text,
  Title,
  Stack,
  Group,
  Badge,
  Button,
  Select,
} from "@mantine/core";
import { MerchantOnboardingWizard } from "@/features/merchant-onboarding";
import { useAuth } from "@/processes/auth";
import { useMerchantStatusQuery } from "@/entities/billing";
import { t } from "@lingui/macro";
import { IconAlertCircle, IconCheck, IconPlus } from "@tabler/icons-react";

interface MerchantStatusCardProps {
  organizations: Array<{ id: number; name: string }>;
}

export const MerchantStatusCard = ({
  organizations,
}: MerchantStatusCardProps) => {
  const { canManageMerchants } = useAuth();
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(
    organizations.length > 0 ? organizations[0].id : null
  );
  const [wizardOpened, setWizardOpened] = useState(false);

  const { data: merchantStatus, isLoading } = useMerchantStatusQuery(
    selectedOrgId || 0
  );

  const onboardingStatus = !merchantStatus
    ? "NONE"
    : merchantStatus.chargesEnabled && merchantStatus.payoutsEnabled
      ? "COMPLETED"
      : "PENDING";

  const showOnboardingButton =
    canManageMerchants() && onboardingStatus !== "COMPLETED" && selectedOrgId;

  return (
    <>
      <Card withBorder padding="xl" radius="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={4}>{t`Merchant Account`}</Title>
            <Badge
              color={onboardingStatus === "COMPLETED" ? "green" : "yellow"}
              leftSection={
                onboardingStatus === "COMPLETED" ? (
                  <IconCheck size={14} />
                ) : (
                  <IconAlertCircle size={14} />
                )
              }
            >
              {onboardingStatus === "COMPLETED" ? t`Active` : t`Setup Required`}
            </Badge>
          </Group>

          {organizations.length > 0 && (
            <Select
              label={t`Organization`}
              placeholder={t`Select organization`}
              data={organizations.map((org) => ({
                value: org.id.toString(),
                label: org.name,
              }))}
              value={selectedOrgId?.toString() || null}
              onChange={(value) =>
                setSelectedOrgId(value ? parseInt(value, 10) : null)
              }
            />
          )}

          <Text size="sm" c="dimmed">
            {isLoading
              ? t`Loading merchant status...`
              : onboardingStatus === "COMPLETED"
                ? t`This organization is set up to receive payments.`
                : t`This organization needs to complete payment gateway onboarding.`}
          </Text>

          {showOnboardingButton && (
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setWizardOpened(true)}
              variant="light"
            >
              {t`Start Onboarding`}
            </Button>
          )}
        </Stack>
      </Card>

      <MerchantOnboardingWizard
        opened={wizardOpened}
        onClose={() => setWizardOpened(false)}
        organizations={organizations}
      />
    </>
  );
};
