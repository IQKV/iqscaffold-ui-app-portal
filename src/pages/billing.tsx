import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Title, Grid, Skeleton, Alert } from "@mantine/core";
import { AuthGuard, useAuth } from "@/processes/auth";
import { BillingHistoryTable } from "@/widgets/billing-history";
import { MerchantStatusCard } from "@/widgets/merchant-status-card";
import { useMerchantStatus } from "@/entities/billing";
import { t } from "@lingui/macro";

export const Route = createFileRoute("/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { hasBillingAccess, hasReadOnlyBillingAccess, canManageMerchants } =
    useAuth();
  const { data: merchantStatus, isLoading: isStatusLoading } =
    useMerchantStatus();

  const onboardingStatus = !merchantStatus
    ? "NONE"
    : merchantStatus.chargesEnabled && merchantStatus.payoutsEnabled
      ? "COMPLETED"
      : "PENDING";

  if (!hasBillingAccess()) {
    return (
      <AuthGuard>
        <Container size="xl" py="xl" data-testid="page-billing">
          <Alert color="red" title={t`Access Denied`}>
            {t`You don't have permission to access billing information. Please contact your administrator.`}
          </Alert>
        </Container>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Container size="xl" py="xl" data-testid="page-billing">
        <Stack gap="xl">
          <Title order={2}>{t`Billing & Payments`}</Title>

          {hasReadOnlyBillingAccess() && (
            <Alert color="blue">
              {t`You have read-only access to billing information.`}
            </Alert>
          )}

          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              {canManageMerchants() && (
                <>
                  {isStatusLoading ? (
                    <Skeleton height={200} radius="md" />
                  ) : (
                    <MerchantStatusCard
                      isConfigured={!!merchantStatus}
                      onboardingStatus={onboardingStatus}
                    />
                  )}
                </>
              )}
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
