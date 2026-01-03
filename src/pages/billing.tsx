import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Title, Grid, Skeleton } from "@mantine/core";
import { AuthGuard, AdminGuard } from "@/processes/auth";
import { BillingHistoryTable } from "@/widgets/billing-history/ui/BillingHistoryTable";
import { MerchantStatusCard } from "@/widgets/merchant-status-card/ui/MerchantStatusCard";
import { usePayments, useMerchantStatus } from "@/entities/billing";
import { t } from "@lingui/macro";

export const Route = createFileRoute("/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { data: merchantStatus, isLoading: isStatusLoading } = useMerchantStatus();

  const onboardingStatus = !merchantStatus
    ? "NONE"
    : (merchantStatus.chargesEnabled && merchantStatus.payoutsEnabled)
      ? "COMPLETED"
      : "PENDING";

  return (
    <AuthGuard>
      <Container size="xl" py="xl" data-testid="page-billing">
        <Stack gap="xl">
          <Title order={2}>{t`Billing & Payments`}</Title>

          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <AdminGuard>
                {isStatusLoading ? (
                  <Skeleton height={200} radius="md" />
                ) : (
                  <MerchantStatusCard
                    isConfigured={!!merchantStatus}
                    onboardingStatus={onboardingStatus}
                  />
                )}
              </AdminGuard>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <BillingHistoryTable />
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </AuthGuard>
  );
}
