import { useState, useEffect } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button, Alert, Stack, Text } from "@mantine/core";
import { t } from "@lingui/macro";

interface StripeCheckoutFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  returnUrl: string;
}

export const StripeCheckoutForm = ({
  onSuccess,
  onError,
  returnUrl,
}: StripeCheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage(t`Payment succeeded!`);
          onSuccess?.();
          break;
        case "processing":
          setMessage(t`Your payment is processing.`);
          break;
        case "requires_payment_method":
          setMessage(t`Your payment was not successful, please try again.`);
          break;
        default:
          setMessage(t`Something went wrong.`);
          break;
      }
    });
  }, [stripe, onSuccess]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || t`An error occurred`);
      onError?.(error.message || t`An error occurred`);
    } else {
      setMessage(t`An unexpected error occurred.`);
      onError?.(t`An unexpected error occurred.`);
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <Stack gap="md">
        <Text size="lg" fw={500}>{t`Payment Details`}</Text>

        {message && (
          <Alert color={message.includes("succeeded") ? "green" : "red"}>
            {message}
          </Alert>
        )}

        <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

        <Button
          id="submit"
          type="submit"
          loading={isLoading || !stripe || !elements}
          fullWidth
          size="md"
        >
          {t`Pay now`}
        </Button>
      </Stack>
    </form>
  );
};
