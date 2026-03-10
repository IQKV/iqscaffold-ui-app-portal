import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Container, Paper, Stack, Title, Text, Center, Alert } from "@mantine/core";
import { AuthGuard } from "@/processes/auth";
import { StripePaymentWidget } from "@/widgets/stripe-payment-widget";
import { t } from "@lingui/macro";
import { usePageTitle } from "@/shared/lib";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      clientSecret: (search.clientSecret as string) || "",
      publicKey: (search.publicKey as string) || "",
      amount: (search.amount as string) || "0",
      currency: (search.currency as string) || "USD",
    };
  },
});

function CheckoutPage() {
  const { clientSecret, publicKey, amount, currency } = useSearch({
    from: "/checkout",
  });
  const pageTitle = usePageTitle(t`Checkout`);

  if (!clientSecret || !publicKey) {
    return (
      <AuthGuard>
        {pageTitle}
        <Container size="xs" py="xl">
          <Alert color="red" title={t`Invalid Checkout`}>
            {t`Required payment information is missing.`}
          </Alert>
        </Container>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      {pageTitle}
      <Container size="xs" py="xl" data-testid="page-checkout">
        <Stack gap="xl">
          <Center>
            <Stack align="center" gap={0}>
              <Title order={2}>{t`Checkout`}</Title>
              <Text size="xl" fw={700} c="dimmed">
                {(Number(amount) / 100).toFixed(2)} {currency.toUpperCase()}
              </Text>
            </Stack>
          </Center>

          <Paper withBorder p="xl" radius="md" shadow="md">
            <StripePaymentWidget
              clientSecret={clientSecret}
              publicKey={publicKey}
              returnUrl={`${window.location.origin}/billing?status=success`}
            />
          </Paper>
        </Stack>
      </Container>
    </AuthGuard>
  );
}
