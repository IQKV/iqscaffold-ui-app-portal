import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/shared/lib/stripe";
import { StripeCheckoutForm } from "@/features/payment-checkout";
import { Skeleton, useMantineColorScheme } from "@mantine/core";
import { useEffect, useState } from "react";
import type { Stripe } from "@stripe/stripe-js";

interface StripePaymentWidgetProps {
  clientSecret: string;
  publicKey: string;
  accountId?: string;
  returnUrl: string;
  onSuccess?: () => void;
}

export const StripePaymentWidget = ({
  clientSecret,
  publicKey,
  accountId,
  returnUrl,
  onSuccess,
}: StripePaymentWidgetProps) => {
  const { colorScheme } = useMantineColorScheme();
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    setStripePromise(getStripe(publicKey, accountId));
  }, [publicKey, accountId]);

  if (!stripePromise) {
    return <Skeleton height={300} />;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: colorScheme === "dark" ? "night" : "stripe",
        },
      }}
    >
      <StripeCheckoutForm returnUrl={returnUrl} onSuccess={onSuccess} />
    </Elements>
  );
};
