import React from "react";
import { Card, Text, Title, Stack, Group, Badge, Anchor } from "@mantine/core";
import { StripeConnectButton } from "@/features/merchant-onboarding";
import { useAuth } from "@/processes/auth";
import { t } from "@lingui/macro";
import {
  IconAlertCircle,
  IconCheck,
  IconExternalLink,
} from "@tabler/icons-react";

interface MerchantStatusCardProps {
  isConfigured: boolean;
  onboardingStatus?: "PENDING" | "COMPLETED" | "NONE";
}

export const MerchantStatusCard = ({
  isConfigured,
  onboardingStatus = "NONE",
}: MerchantStatusCardProps) => {
  const { canManageMerchants } = useAuth();
  
  const showOnboardingButton = canManageMerchants() && 
                               !isConfigured && 
                               onboardingStatus !== "COMPLETED";
  return (
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

        <Text size="sm" c="dimmed">
          {onboardingStatus === "COMPLETED"
            ? t`Your Stripe Connect account is fully configured. You can now receive payments.`
            : t`To start receiving payments from your customers, you need to connect your Stripe account.`}
        </Text>

        {onboardingStatus === "COMPLETED" && (
          <Anchor
            href="https://dashboard.stripe.com/"
            target="_blank"
            size="sm"
            fw={500}
          >
            <Group gap={4}>
              {t`Open Stripe Dashboard`}
              <IconExternalLink size={14} />
            </Group>
          </Anchor>
        )}

        {showOnboardingButton && (
          <StripeConnectButton
            refreshUrl={`${window.location.origin}/billing?status=refresh`}
            returnUrl={`${window.location.origin}/billing?status=success`}
          />
        )}
      </Stack>
    </Card>
  );
};
