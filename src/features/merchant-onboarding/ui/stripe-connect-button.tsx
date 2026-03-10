import { useState } from "react";
import { Button } from "@mantine/core";
import { IconBrandStripe } from "@tabler/icons-react";
import { t } from "@lingui/macro";
import { billingApi } from "@/shared/api/billing";
import { notificationService } from "@/shared/lib/notifications";
import { PaymentGatewayProvider } from "@/shared/api/billing/types";

interface StripeConnectButtonProps {
  organizationId: number;
  refreshUrl: string;
  returnUrl: string;
}

/**
 * @deprecated Use MerchantOnboardingWizard instead
 */
export const StripeConnectButton = ({
  organizationId,
  refreshUrl,
  returnUrl,
}: StripeConnectButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await billingApi.initiateOnboarding({
        organizationId,
        gatewayProvider: PaymentGatewayProvider.STRIPE,
        refreshUrl,
        returnUrl,
      });

      notificationService.info({
        title: t`Redirecting`,
        message: t`You are being redirected to Stripe to complete your setup.`,
      });

      window.location.href = response.accountLink;
    } catch {
      notificationService.error({
        title: t`Onboarding Failed`,
        message: t`Could not initiate Stripe onboarding. Please try again later.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      loading={isLoading}
      leftSection={<IconBrandStripe size={20} />}
      variant="light"
      color="indigo"
      fullWidth
    >
      {t`Connect with Stripe`}
    </Button>
  );
};
