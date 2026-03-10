import { Table, Group, ActionIcon, Menu, Text, Badge, Tooltip, Avatar } from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconPower,
  IconStar,
  IconBrandStripe,
  IconBrandPaypal,
  IconBuildingStore,
  IconCreditCard,
} from "@tabler/icons-react";
import { t } from "@lingui/macro";
import { GatewayConfigSummary, PaymentGatewayProvider } from "@/shared/api/billing/types";
import { GatewayStatusBadge } from "./gateway-status-badge";

interface GatewayConfigListProps {
  configs: GatewayConfigSummary[];
  onActivate: (provider: PaymentGatewayProvider) => void;
  onDeactivate: (provider: PaymentGatewayProvider) => void;
  onSetPrimary: (provider: PaymentGatewayProvider) => void;
  onDelete: (provider: PaymentGatewayProvider) => void;
  canManage: boolean;
}

const getGatewayIcon = (provider: PaymentGatewayProvider) => {
  switch (provider) {
    case PaymentGatewayProvider.STRIPE:
      return <IconBrandStripe size={18} />;
    case PaymentGatewayProvider.PAYPAL:
      return <IconBrandPaypal size={18} />;
    case PaymentGatewayProvider.SQUARE:
      return <IconBuildingStore size={18} />;
    case PaymentGatewayProvider.BRAINTREE:
      return <IconCreditCard size={18} />;
  }
};

const getGatewayColor = (provider: PaymentGatewayProvider) => {
  switch (provider) {
    case PaymentGatewayProvider.STRIPE:
      return "indigo";
    case PaymentGatewayProvider.PAYPAL:
      return "blue";
    case PaymentGatewayProvider.SQUARE:
      return "dark";
    case PaymentGatewayProvider.BRAINTREE:
      return "teal";
  }
};

export const GatewayConfigList = ({
  configs,
  onActivate,
  onDeactivate,
  onSetPrimary,
  onDelete,
  canManage,
}: GatewayConfigListProps) => {
  if (configs.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        {t`No payment gateways configured yet.`}
      </Text>
    );
  }

  const rows = configs.map((config) => (
    <Table.Tr key={config.id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar color={getGatewayColor(config.gatewayProvider)} size="sm" radius="sm">
            {getGatewayIcon(config.gatewayProvider)}
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {config.displayName || config.gatewayProvider}
            </Text>
            {config.displayName && (
              <Text size="xs" c="dimmed">
                {config.gatewayProvider}
              </Text>
            )}
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color={config.mode === "live" ? "green" : "yellow"}>
          {config.mode}
        </Badge>
      </Table.Td>
      <Table.Td>
        <GatewayStatusBadge isActive={config.isActive} isPrimary={config.isPrimary} />
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {new Date(config.updatedAt).toLocaleDateString()}
        </Text>
      </Table.Td>
      <Table.Td>
        {canManage && (
          <Group gap="xs" justify="flex-end">
            {!config.isPrimary && config.isActive && (
              <Tooltip label={t`Set as primary`}>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => onSetPrimary(config.gatewayProvider)}
                >
                  <IconStar size={18} />
                </ActionIcon>
              </Tooltip>
            )}
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <IconDots size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {config.isActive ? (
                  <Menu.Item
                    leftSection={<IconPower size={16} />}
                    onClick={() => onDeactivate(config.gatewayProvider)}
                  >
                    {t`Deactivate`}
                  </Menu.Item>
                ) : (
                  <Menu.Item
                    leftSection={<IconPower size={16} />}
                    onClick={() => onActivate(config.gatewayProvider)}
                  >
                    {t`Activate`}
                  </Menu.Item>
                )}
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={16} />}
                  color="red"
                  onClick={() => onDelete(config.gatewayProvider)}
                >
                  {t`Delete`}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{t`Gateway`}</Table.Th>
          <Table.Th>{t`Mode`}</Table.Th>
          <Table.Th>{t`Status`}</Table.Th>
          <Table.Th>{t`Updated`}</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
