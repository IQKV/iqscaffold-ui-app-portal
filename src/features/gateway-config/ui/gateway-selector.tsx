import { Select, Group, Avatar, Text } from "@mantine/core";
import {
  IconBrandStripe,
  IconBrandPaypal,
  IconBuildingStore,
  IconCreditCard,
} from "@tabler/icons-react";
import { PaymentGatewayProvider } from "@/shared/api/billing/types";
import { t } from "@lingui/macro";
import { forwardRef } from "react";

const gatewayData = [
  {
    value: PaymentGatewayProvider.STRIPE,
    label: "Stripe",
    icon: IconBrandStripe,
    color: "indigo",
  },
  {
    value: PaymentGatewayProvider.PAYPAL,
    label: "PayPal",
    icon: IconBrandPaypal,
    color: "blue",
  },
  {
    value: PaymentGatewayProvider.SQUARE,
    label: "Square",
    icon: IconBuildingStore,
    color: "dark",
  },
  {
    value: PaymentGatewayProvider.BRAINTREE,
    label: "Braintree",
    icon: IconCreditCard,
    color: "teal",
  },
];

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, icon: Icon, color, ...others }, ref) => (
    <div ref={ref} {...others}>
      <Group>
        <Avatar color={color} size="sm" radius="sm">
          <Icon size={18} />
        </Avatar>
        <Text size="sm">{label}</Text>
      </Group>
    </div>
  ),
);

SelectItem.displayName = "SelectItem";

interface GatewaySelectorProps {
  value: PaymentGatewayProvider | null;
  onChange: (value: PaymentGatewayProvider | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const GatewaySelector = ({
  value,
  onChange,
  label = t`Payment Gateway`,
  placeholder = t`Select gateway provider`,
  disabled = false,
  error,
}: GatewaySelectorProps) => {
  return (
    <Select
      label={label}
      placeholder={placeholder}
      data={gatewayData}
      value={value}
      onChange={(val) => onChange(val as PaymentGatewayProvider | null)}
      disabled={disabled}
      error={error}
      renderOption={({ option }) => {
        const gateway = gatewayData.find((g) => g.value === option.value);
        if (!gateway) {
          return option.label;
        }
        const Icon = gateway.icon;
        return (
          <Group>
            <Avatar color={gateway.color} size="sm" radius="sm">
              <Icon size={18} />
            </Avatar>
            <Text size="sm">{gateway.label}</Text>
          </Group>
        );
      }}
    />
  );
};
