/**
 * Billing Authority Demo Page
 * Demonstrates the role-based access control system in a billing context
 */

import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Title,
  Stack,
  Card,
  Text,
  Group,
  Badge,
} from "@mantine/core";
import { AuthoritySystemExample } from "@/shared/examples/authority-system-example";
import { AuthorityProtectedRoute } from "@/shared/ui";
import { Authority } from "@/shared/types";

function BillingAuthorityDemoPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Billing Authority System Demo</Title>
          <Text c="dimmed" mt="sm">
            This page demonstrates the role-based access control system for
            billing operations. Different components and actions will be visible
            based on your current authorities.
          </Text>
        </div>

        <Card withBorder>
          <Title order={2} mb="md">
            Authority System Overview
          </Title>
          <Stack gap="sm">
            <Group gap="md">
              <Badge color="blue" size="lg">
                TENANT_ADMIN
              </Badge>
              <Text size="sm">
                Full subscription and billing management within tenant scope
              </Text>
            </Group>
            <Group gap="md">
              <Badge color="purple" size="lg">
                PLATFORM_ADMIN
              </Badge>
              <Text size="sm">
                Cross-tenant administrative capabilities and system-wide billing
                operations
              </Text>
            </Group>
            <Group gap="md">
              <Badge color="orange" size="lg">
                SUPPORT_AGENT
              </Badge>
              <Text size="sm">
                Customer assistance with limited billing modification
                capabilities
              </Text>
            </Group>
            <Group gap="md">
              <Badge color="green" size="lg">
                BILLING_VIEWER
              </Badge>
              <Text size="sm">
                Read-only access to billing information and reports
              </Text>
            </Group>
          </Stack>
        </Card>

        <AuthoritySystemExample />
      </Stack>
    </Container>
  );
}

export const Route = createFileRoute("/billing-authority-demo")({
  component: () => (
    <AuthorityProtectedRoute
      authorities={[
        Authority.TENANT_ADMIN,
        Authority.PLATFORM_ADMIN,
        Authority.SUPPORT_AGENT,
        Authority.BILLING_VIEWER,
      ]}
    >
      <BillingAuthorityDemoPage />
    </AuthorityProtectedRoute>
  ),
});
