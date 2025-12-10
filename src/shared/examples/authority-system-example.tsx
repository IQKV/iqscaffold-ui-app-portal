/**
 * Authority System Example
 * Demonstrates the role-based access control system
 */

import React from "react";
import { Stack, Card, Title, Text, Group, Badge, Button } from "@mantine/core";
import {
  AuthorityGuard,
  TenantAdminGuard,
  PlatformAdminGuard,
  SupportAgentGuard,
  BillingViewerGuard,
  ProtectedActionButton,
  SubscriptionActions,
  PaymentMethodActions,
  InvoiceActions,
  ConditionalWidget,
  ProtectedWidgetContainer,
} from "@/shared/ui";
import { Authority } from "@/shared/types";
import {
  useAuthorityGuard,
  useAuthorizedActions,
  useWidgetVisibility,
} from "@/shared/lib";

// Mock components for demonstration
const MockSubscriptionWidget = () => (
  <Card withBorder>
    <Title order={4}>Subscription Details</Title>
    <Text>Current Plan: Pro</Text>
    <Text>Status: Active</Text>
  </Card>
);

const MockPaymentMethodWidget = () => (
  <Card withBorder>
    <Title order={4}>Payment Methods</Title>
    <Text>**** 1234 (Default)</Text>
  </Card>
);

const MockAnalyticsWidget = () => (
  <Card withBorder>
    <Title order={4}>Revenue Analytics</Title>
    <Text>MRR: $50,000</Text>
  </Card>
);

export function AuthoritySystemExample() {
  const { authorities, hasAuthority } = useAuthorityGuard();
  const subscriptionActions = useAuthorizedActions("subscription");
  const isWidgetVisible = useWidgetVisibility();

  return (
    <Stack gap="lg">
      <Card withBorder>
        <Title order={3}>Current User Authorities</Title>
        <Group gap="xs" mt="sm">
          {authorities.map((authority) => (
            <Badge key={authority} color="blue">
              {authority}
            </Badge>
          ))}
        </Group>
        {authorities.length === 0 && (
          <Text c="dimmed">No billing authorities assigned</Text>
        )}
      </Card>

      <Card withBorder>
        <Title order={3}>Authority Guards</Title>
        <Stack gap="md" mt="sm">
          <TenantAdminGuard>
            <Card withBorder p="sm" bg="green.0">
              <Text fw={500}>✓ Tenant Admin Content</Text>
              <Text size="sm" c="dimmed">
                Only visible to tenant administrators
              </Text>
            </Card>
          </TenantAdminGuard>

          <PlatformAdminGuard>
            <Card withBorder p="sm" bg="blue.0">
              <Text fw={500}>✓ Platform Admin Content</Text>
              <Text size="sm" c="dimmed">
                Only visible to platform administrators
              </Text>
            </Card>
          </PlatformAdminGuard>

          <SupportAgentGuard>
            <Card withBorder p="sm" bg="orange.0">
              <Text fw={500}>✓ Support Agent Content</Text>
              <Text size="sm" c="dimmed">
                Only visible to support agents and platform admins
              </Text>
            </Card>
          </SupportAgentGuard>

          <BillingViewerGuard>
            <Card withBorder p="sm" bg="purple.0">
              <Text fw={500}>✓ Billing Viewer Content</Text>
              <Text size="sm" c="dimmed">
                Visible to billing viewers and higher authorities
              </Text>
            </Card>
          </BillingViewerGuard>

          <AuthorityGuard
            authorities={[Authority.TENANT_ADMIN, Authority.PLATFORM_ADMIN]}
            fallback={
              <Card withBorder p="sm" bg="red.0">
                <Text fw={500}>✗ Access Denied</Text>
                <Text size="sm" c="dimmed">
                  You need tenant admin or platform admin authority
                </Text>
              </Card>
            }
          >
            <Card withBorder p="sm" bg="green.0">
              <Text fw={500}>✓ Multi-Authority Content</Text>
              <Text size="sm" c="dimmed">
                Visible to tenant admins or platform admins
              </Text>
            </Card>
          </AuthorityGuard>
        </Stack>
      </Card>

      <Card withBorder>
        <Title order={3}>Protected Actions</Title>
        <Stack gap="md" mt="sm">
          <Group gap="sm">
            <Text fw={500}>Subscription Actions:</Text>
            <SubscriptionActions
              subscriptionId="sub_123"
              onUpgrade={() => console.log("Upgrade clicked")}
              onDowngrade={() => console.log("Downgrade clicked")}
              onCancel={() => console.log("Cancel clicked")}
              onSuspend={() => console.log("Suspend clicked")}
              onReactivate={() => console.log("Reactivate clicked")}
            />
          </Group>

          <Group gap="sm">
            <Text fw={500}>Payment Method Actions:</Text>
            <PaymentMethodActions
              paymentMethodId="pm_123"
              onEdit={() => console.log("Edit clicked")}
              onDelete={() => console.log("Delete clicked")}
              onSetDefault={() => console.log("Set default clicked")}
            />
          </Group>

          <Group gap="sm">
            <Text fw={500}>Invoice Actions:</Text>
            <InvoiceActions
              invoiceId="inv_123"
              onDownload={() => console.log("Download clicked")}
              onRetryPayment={() => console.log("Retry payment clicked")}
              onRefund={() => console.log("Refund clicked")}
            />
          </Group>

          <Group gap="sm">
            <Text fw={500}>Individual Protected Actions:</Text>
            <ProtectedActionButton
              action="create"
              resource="subscription"
              onClick={() => console.log("Create subscription")}
              variant="filled"
            >
              Create Subscription
            </ProtectedActionButton>

            <ProtectedActionButton
              action="export"
              resource="analytics"
              onClick={() => console.log("Export analytics")}
              variant="light"
            >
              Export Analytics
            </ProtectedActionButton>

            <ProtectedActionButton
              action="refund"
              resource="payment"
              onClick={() => console.log("Process refund")}
              variant="light"
              color="red"
            >
              Process Refund
            </ProtectedActionButton>
          </Group>
        </Stack>
      </Card>

      <Card withBorder>
        <Title order={3}>Conditional Widgets</Title>
        <Stack gap="md" mt="sm">
          <ConditionalWidget
            name="SubscriptionCard"
            component={MockSubscriptionWidget}
            fallback={<Text c="dimmed">Subscription widget not available</Text>}
          />

          <ConditionalWidget
            name="PaymentMethods"
            component={MockPaymentMethodWidget}
            fallback={
              <Text c="dimmed">Payment methods widget not available</Text>
            }
          />

          <ConditionalWidget
            name="RevenueAnalytics"
            component={MockAnalyticsWidget}
            fallback={<Text c="dimmed">Analytics widget not available</Text>}
          />

          <ProtectedWidgetContainer
            widgetName="TenantManagement"
            fallback={
              <Text c="dimmed">Tenant management widget not available</Text>
            }
          >
            <Card withBorder>
              <Title order={4}>Tenant Management</Title>
              <Text>Manage tenant settings and configurations</Text>
            </Card>
          </ProtectedWidgetContainer>
        </Stack>
      </Card>

      <Card withBorder>
        <Title order={3}>Action Permissions</Title>
        <Stack gap="sm" mt="sm">
          <Group gap="md">
            <Text size="sm">Can create subscription:</Text>
            <Badge color={subscriptionActions.canCreate ? "green" : "red"}>
              {subscriptionActions.canCreate ? "Yes" : "No"}
            </Badge>
          </Group>

          <Group gap="md">
            <Text size="sm">Can update subscription:</Text>
            <Badge color={subscriptionActions.canUpdate ? "green" : "red"}>
              {subscriptionActions.canUpdate ? "Yes" : "No"}
            </Badge>
          </Group>

          <Group gap="md">
            <Text size="sm">Can cancel subscription:</Text>
            <Badge color={subscriptionActions.canCancel ? "green" : "red"}>
              {subscriptionActions.canCancel ? "Yes" : "No"}
            </Badge>
          </Group>

          <Group gap="md">
            <Text size="sm">Can process refunds:</Text>
            <Badge color={subscriptionActions.canRefund ? "green" : "red"}>
              {subscriptionActions.canRefund ? "Yes" : "No"}
            </Badge>
          </Group>
        </Stack>
      </Card>

      <Card withBorder>
        <Title order={3}>Widget Visibility</Title>
        <Stack gap="sm" mt="sm">
          {[
            "BillingOverview",
            "SubscriptionCard",
            "PaymentMethods",
            "UsageMetrics",
            "RevenueAnalytics",
            "TenantManagement",
            "CustomerSupport",
          ].map((widget) => (
            <Group key={widget} gap="md">
              <Text size="sm" style={{ minWidth: 150 }}>
                {widget}:
              </Text>
              <Badge color={isWidgetVisible(widget) ? "green" : "red"}>
                {isWidgetVisible(widget) ? "Visible" : "Hidden"}
              </Badge>
            </Group>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
