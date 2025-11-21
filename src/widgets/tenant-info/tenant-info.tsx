/**
 * Tenant Info Widget
 * Displays current tenant information (for development/debugging)
 */

import { Card, Text, Badge, Stack, Group } from "@mantine/core";
import { IconBuilding } from "@tabler/icons-react";
import { useCurrentTenantId, useCurrentTenant } from "@/processes/tenant";

interface TenantInfoProps {
  showInProduction?: boolean;
}

export function TenantInfo({ showInProduction = false }: TenantInfoProps) {
  const tenantId = useCurrentTenantId();
  const tenant = useCurrentTenant();

  // Only show in development unless explicitly enabled
  if (!import.meta.env.DEV && !showInProduction) {
    return null;
  }

  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder>
      <Stack gap="xs">
        <Group gap="xs">
          <IconBuilding size={16} />
          <Text size="sm" fw={600}>
            Tenant Context
          </Text>
        </Group>

        {tenantId ? (
          <>
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                Tenant ID:
              </Text>
              <Badge size="sm" variant="light">
                {tenantId}
              </Badge>
            </Group>

            {tenant && (
              <>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    Name:
                  </Text>
                  <Text size="xs">{tenant.name}</Text>
                </Group>

                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    Status:
                  </Text>
                  <Badge
                    size="sm"
                    color={tenant.enabled ? "green" : "red"}
                    variant="light"
                  >
                    {tenant.enabled ? "Active" : "Disabled"}
                  </Badge>
                </Group>
              </>
            )}
          </>
        ) : (
          <Text size="xs" c="dimmed">
            No tenant context (system mode)
          </Text>
        )}

        {import.meta.env.DEV && (
          <Text size="xs" c="dimmed" fs="italic">
            Dev: Set tenant via localStorage.setItem('tenantId', 'your-tenant')
          </Text>
        )}
      </Stack>
    </Card>
  );
}
