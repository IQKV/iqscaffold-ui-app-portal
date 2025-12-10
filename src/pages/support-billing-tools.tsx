/**
 * Support Billing Tools Page
 * Customer billing issue resolution for support agents
 */

import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Grid, Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { BillingPageLayout } from "@/shared/ui/billing";
import { AuthorityProtectedRoute } from "@/shared/ui";
import { Authority } from "@/shared/types/billing";

function SupportBillingToolsPage() {
  const breadcrumbs = [
    { title: "Support", href: "/support" },
    { title: "Billing Tools" },
  ];

  return (
    <BillingPageLayout
      title="Support Billing Tools"
      description="Customer billing assistance and issue resolution"
      breadcrumbs={breadcrumbs}
    >
      <Container size="xl" px={0}>
        <Stack gap="xl">
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            Support billing tools implementation placeholder. This would include customer search, billing overview, and support actions.
          </Alert>
        </Stack>
      </Container>
    </BillingPageLayout>
  );
}

export const Route = createFileRoute("/support-billing-tools")({
  component: () => (
    <AuthorityProtectedRoute
      authorities={[
        Authority.PLATFORM_ADMIN,
        Authority.SUPPORT_AGENT,
      ]}
    >
      <SupportBillingToolsPage />
    </AuthorityProtectedRoute>
  ),
});