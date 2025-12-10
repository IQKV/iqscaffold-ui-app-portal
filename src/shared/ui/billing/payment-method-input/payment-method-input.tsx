import React, { useState } from "react";
import {
  Stack,
  Group,
  TextInput,
  Select,
  Grid,
  Card,
  Text,
  Switch,
  Alert,
  Divider,
  Box,
} from "@mantine/core";
import { IconCreditCard, IconInfoCircle } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { paymentMethodFormSchema } from "@/shared/lib/billing-validation";
import { ValidationUtils } from "@/shared/lib/billing-utils";
import type {
  PaymentMethodData,
  PaymentMethodType,
} from "@/shared/types/billing";
import classes from "./payment-method-input.module.css";

export interface PaymentMethodInputProps {
  value?: Partial<PaymentMethodData>;
  onChange: (data: PaymentMethodData) => void;
  onValidationChange?: (isValid: boolean) => void;
  disabled?: boolean;
  showBillingAddress?: boolean;
  showSetAsDefault?: boolean;
  error?: string;
}

const CARD_TYPES = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "amex", label: "American Express" },
  { value: "discover", label: "Discover" },
];

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  // Add more countries as needed
];

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: String(i + 1).padStart(2, "0"),
}));

const YEARS = Array.from({ length: 20 }, (_, i) => {
  const year = new Date().getFullYear() + i;
  return { value: String(year), label: String(year) };
});

export const PaymentMethodInput: React.FC<PaymentMethodInputProps> = ({
  value,
  onChange,
  onValidationChange,
  disabled = false,
  showBillingAddress = true,
  showSetAsDefault = true,
  error,
}) => {
  const [cardType, setCardType] = useState<string>("");

  const form = useForm<PaymentMethodData>({
    initialValues: {
      type: "card" as PaymentMethodType,
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      billingAddress: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
      },
      ...value,
    },
    validate: zodResolver(paymentMethodFormSchema),
    onValuesChange: (values) => {
      onChange(values);

      // Validate and notify parent of validation state
      const validation = paymentMethodFormSchema.safeParse(values);
      onValidationChange?.(validation.success);
    },
  });

  const detectCardType = (number: string) => {
    const cleanNumber = number.replace(/\D/g, "");

    if (cleanNumber.startsWith("4")) return "visa";
    if (cleanNumber.startsWith("5") || cleanNumber.startsWith("2"))
      return "mastercard";
    if (cleanNumber.startsWith("3")) return "amex";
    if (cleanNumber.startsWith("6")) return "discover";

    return "";
  };

  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    const detectedType = detectCardType(cleanValue);
    setCardType(detectedType);

    // Format based on card type
    if (detectedType === "amex") {
      // AMEX: 4-6-5 format
      return cleanValue
        .substring(0, 15)
        .replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3")
        .trim();
    } else {
      // Others: 4-4-4-4 format
      return cleanValue
        .substring(0, 16)
        .replace(/(\d{4})(?=\d)/g, "$1 ")
        .trim();
    }
  };

  const handleCardNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const formatted = formatCardNumber(event.target.value);
    form.setFieldValue("cardNumber", formatted);
  };

  const getCardIcon = () => {
    switch (cardType) {
      case "visa":
        return "💳"; // In real app, use proper card icons
      case "mastercard":
        return "💳";
      case "amex":
        return "💳";
      case "discover":
        return "💳";
      default:
        return <IconCreditCard size={16} />;
    }
  };

  return (
    <form className={classes.paymentForm}>
      <Stack gap="md">
        {error && (
          <Alert color="red" icon={<IconInfoCircle size={16} />}>
            {error}
          </Alert>
        )}

        {/* Card Information */}
        <Card withBorder padding="md">
          <Stack gap="md">
            <Group>
              <IconCreditCard size={20} />
              <Text fw={500}>Card Information</Text>
            </Group>

            <TextInput
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={form.values.cardNumber}
              onChange={handleCardNumberChange}
              error={form.errors.cardNumber}
              disabled={disabled}
              rightSection={getCardIcon()}
              maxLength={cardType === "amex" ? 17 : 19} // Account for spaces
              required
            />

            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Expiry Month"
                  placeholder="MM"
                  data={MONTHS}
                  value={form.values.expiryMonth}
                  onChange={(value) =>
                    form.setFieldValue("expiryMonth", value || "")
                  }
                  error={form.errors.expiryMonth}
                  disabled={disabled}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Expiry Year"
                  placeholder="YYYY"
                  data={YEARS}
                  value={form.values.expiryYear}
                  onChange={(value) =>
                    form.setFieldValue("expiryYear", value || "")
                  }
                  error={form.errors.expiryYear}
                  disabled={disabled}
                  required
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="CVV"
              placeholder={cardType === "amex" ? "1234" : "123"}
              value={form.values.cvv}
              onChange={(event) =>
                form.setFieldValue("cvv", event.target.value)
              }
              error={form.errors.cvv}
              disabled={disabled}
              maxLength={cardType === "amex" ? 4 : 3}
              type="password"
              required
            />
          </Stack>
        </Card>

        {/* Billing Address */}
        {showBillingAddress && (
          <Card withBorder padding="md">
            <Stack gap="md">
              <Text fw={500}>Billing Address</Text>

              <TextInput
                label="Address Line 1"
                placeholder="123 Main Street"
                value={form.values.billingAddress.line1}
                onChange={(event) =>
                  form.setFieldValue("billingAddress.line1", event.target.value)
                }
                error={form.errors["billingAddress.line1"]}
                disabled={disabled}
                required
              />

              <TextInput
                label="Address Line 2 (Optional)"
                placeholder="Apartment, suite, etc."
                value={form.values.billingAddress.line2}
                onChange={(event) =>
                  form.setFieldValue("billingAddress.line2", event.target.value)
                }
                error={form.errors["billingAddress.line2"]}
                disabled={disabled}
              />

              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="City"
                    placeholder="New York"
                    value={form.values.billingAddress.city}
                    onChange={(event) =>
                      form.setFieldValue(
                        "billingAddress.city",
                        event.target.value
                      )
                    }
                    error={form.errors["billingAddress.city"]}
                    disabled={disabled}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="State/Province"
                    placeholder="NY"
                    value={form.values.billingAddress.state}
                    onChange={(event) =>
                      form.setFieldValue(
                        "billingAddress.state",
                        event.target.value
                      )
                    }
                    error={form.errors["billingAddress.state"]}
                    disabled={disabled}
                    required
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Postal Code"
                    placeholder="10001"
                    value={form.values.billingAddress.postalCode}
                    onChange={(event) =>
                      form.setFieldValue(
                        "billingAddress.postalCode",
                        event.target.value
                      )
                    }
                    error={form.errors["billingAddress.postalCode"]}
                    disabled={disabled}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Country"
                    data={COUNTRIES}
                    value={form.values.billingAddress.country}
                    onChange={(value) =>
                      form.setFieldValue(
                        "billingAddress.country",
                        value || "US"
                      )
                    }
                    error={form.errors["billingAddress.country"]}
                    disabled={disabled}
                    required
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>
        )}

        {/* Additional Options */}
        {showSetAsDefault && (
          <Box>
            <Divider mb="md" />
            <Switch
              label="Set as default payment method"
              description="Use this payment method for future charges"
              checked={form.values.setAsDefault || false}
              onChange={(event) =>
                form.setFieldValue("setAsDefault", event.currentTarget.checked)
              }
              disabled={disabled}
            />
          </Box>
        )}

        {/* Security Notice */}
        <Alert color="blue" icon={<IconInfoCircle size={16} />}>
          <Text size="sm">
            Your payment information is encrypted and secure. We never store
            your full card number.
          </Text>
        </Alert>
      </Stack>
    </form>
  );
};
