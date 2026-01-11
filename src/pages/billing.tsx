import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Stack,
  Title,
  Grid,
  Alert,
  Button,
  Group,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { AuthGuard, useAuth } from "@/processes/auth";
import { BillingHistoryTable } from "@/widgets/billing-history";
import { MerchantStatusCard } from "@/widgets/merchant-status-card";
import { organizationApi } from "@/shared/api/organization-api";
import { t } from "@lingui/macro";
import { useQuery } from "@tanstack/react-query";
import { canManageGatewayConfigs } from "@/processes/auth/lib/billing-permissions";

export const Route = createFileRoute("/billing")({
  component: BillingPage,
});

function BillingPage() {
  const {
    hasBillingAccess,
    hasReadOnlyBillingAccess,
    canManageMerchants,
    user,
  } = useAuth();

  const { data: orgsData } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => organizationApi.getAllOrganizations({ page: 0, size: 100 }),
    enabled: hasBillingAccess(),
  });

  const organizations =
    orgsData?.content.map((org) => ({ id: org.id, name: org.name })) || [];

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
          <Group justify="space-between">
            <Title order={2}>{t`Billing & Payments`}</Title>
            {canManageGatewayConfigs(user) && (
              <Button
                component={Link}
                to="/gateway-config"
                leftSection={<IconSettings size={18} />}
                variant="light"
              >
                {t`Gateway Configuration`}
              </Button>
            )}
          </Group>

          {hasReadOnlyBillingAccess() && (
            <Alert color="blue">
              {t`You have read-only access to billing information.`}
            </Alert>
          )}

          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              {canManageMerchants() && organizations.length > 0 && (
                <MerchantStatusCard organizations={organizations} />
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
