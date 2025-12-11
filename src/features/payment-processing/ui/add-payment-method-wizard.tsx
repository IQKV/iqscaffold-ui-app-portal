/**
 * Add Payment Method Wizard Component
 * Multi-step payment method addition with provider integration
 */

import React, { useState, useMemo } from "react";
import {
  Card,
  Text,
  Button,
  Group,
  Stack,
  Stepper,
  TextInput,
  Select,
  Checkbox,
  Alert,
  Box,
  Grid,
  ThemeIcon,
} from "@mantine/core";
import {
  IconPlus,
  IconCreditCard,
  IconBrandPaypal,
  IconCheck,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import {
  PaymentMethodType,
  PaymentProvider,
  type PaymentMethodData,
} from "@/entities/payment-method/types/payment-method-types";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { PayPalButtons } from "@paypal/react-paypal-js";

interface AddPaymentMethodWizardProps {
  onAdd: (data: PaymentMethodData) => void;
  loading?: boolean;
}

const PAYMENT_PROVIDERS = [
  {
    value: "stripe" as PaymentProvider,
    label: "Credit/Debit Card",
    icon: <IconCreditCard size={16} />,
    description: "Visa, Mastercard, American Express",
  },
  {
    value: "paypal" as PaymentProvider,
    label: "PayPal",
    icon: <IconBrandPaypal size={16} />,
    description: "Pay with your PayPal account",
  },
];

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString().padStart(2, "0"),
  label: (i + 1).toString().padStart(2, "0"),
}));

const YEARS = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() + i;
  return { value: year.toString(), label: year.toString() };
});

export const AddPaymentMethodWizard: React.FC<AddPaymentMethodWizardProps> = ({
  onAdd,
  loading = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paypalToken, setPaypalToken] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [selectedProvider, setSelectedProvider] =
    useState<PaymentProvider | null>(null);

  const form = useForm<PaymentMethodData>({
    initialValues: {
      type: "card" as PaymentMethodType,
      provider: "stripe" as PaymentProvider,
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
    },
    validate: {
      cardNumber: (value, values) => {
        if (values.provider === "paypal") {
          return null;
        }
        if (!value) {
          return "Card number is required";
        }
        if (value.replace(/\s/g, "").length < 13) {
          return "Invalid card number";
        }
        return null;
      },
      expiryMonth: (value, values) => {
        if (values.provider === "paypal") {
          return null;
        }
        if (!value) {
          return "Expiry month is required";
        }
        return null;
      },
      expiryYear: (value, values) => {
        if (values.provider === "paypal") {
          return null;
        }
        if (!value) {
          return "Expiry year is required";
        }
        return null;
      },
      cvv: (value, values) => {
        if (values.provider === "paypal") {
          return null;
        }
        if (!value) {
          return "CVV is required";
        }
        if (value.length < 3) {
          return "Invalid CVV";
        }
        return null;
      },
      billingAddress: {
        line1: (value) => (!value ? "Address is required" : null),
        city: (value) => (!value ? "City is required" : null),
        state: (value) => (!value ? "State is required" : null),
        postalCode: (value) => (!value ? "Postal code is required" : null),
        country: (value) => (!value ? "Country is required" : null),
      },
    },
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    }
    return v;
  };

  const handleProviderSelect = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    form.setFieldValue("provider", provider);
    form.setFieldValue(
      "type",
      (provider === "paypal" ? "bank_account" : "card") as PaymentMethodType
    );
    setActive(1);
  };

  const nextStep = () => {
    if (active === 0) {
      if (!selectedProvider) {
        return;
      }
      setActive(1);
    } else if (active === 1) {
      const validation = form.validate();
      if (!validation.hasErrors) {
        setActive(2);
      }
    }
  };

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = async () => {
    const validation = form.validate();
    if (validation.hasErrors) {
      return;
    }

    if (selectedProvider === "stripe") {
      if (!stripe || !elements) {
        return;
      }
      const card = elements.getElement(CardElement);
      if (!card) {
        return;
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card,
        billing_details: {
          name: undefined,
          address: {
            line1: form.values.billingAddress.line1 || undefined,
            line2: form.values.billingAddress.line2 || undefined,
            city: form.values.billingAddress.city || undefined,
            state: form.values.billingAddress.state || undefined,
            postal_code: form.values.billingAddress.postalCode || undefined,
            country: form.values.billingAddress.country || undefined,
          },
        },
      });

      if (error || !paymentMethod) {
        // Simple alert; production code should show UI error
        return;
      }

      onAdd({
        ...form.values,
        provider: PaymentProvider.STRIPE,
        providerPaymentMethodId: paymentMethod.id,
        // clear raw fields as we used Elements
        cardNumber: undefined,
        expiryMonth: undefined,
        expiryYear: undefined,
        cvv: undefined,
      });
    } else if (selectedProvider === "paypal") {
      if (!paypalToken) {
        // Wait for PayPal approval to set token
        return;
      }
      onAdd({
        ...form.values,
        provider: PaymentProvider.PAYPAL,
        type: PaymentMethodType.BANK_ACCOUNT, // or "card" depending on PayPal funding source
        providerPaymentMethodId: paypalToken,
      });
    }

    // Reset form
    form.reset();
    setActive(0);
    setSelectedProvider(null);
    setPaypalToken(null);
  };

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="lg" fw={600}>
            Add Payment Method
          </Text>
          <ThemeIcon variant="light" size="sm" color="blue">
            <IconPlus size={14} />
          </ThemeIcon>
        </Group>

        <Stepper active={active} size="sm" allowNextStepsSelect={false}>
          {/* Step 1: Provider Selection */}
          <Stepper.Step label="Provider" description="Choose payment method">
            <Stack gap="md" mt="md">
              <Text size="sm" c="dimmed">
                Select how you'd like to pay
              </Text>
              <Stack gap="sm">
                {PAYMENT_PROVIDERS.map((provider) => (
                  <Card
                    key={provider.value}
                    withBorder
                    p="md"
                    radius="sm"
                    style={{
                      cursor: "pointer",
                      borderColor:
                        selectedProvider === provider.value
                          ? "var(--mantine-color-blue-6)"
                          : undefined,
                    }}
                    onClick={() => handleProviderSelect(provider.value)}
                  >
                    <Group gap="md" align="center">
                      <ThemeIcon variant="light" size="md" color="blue">
                        {provider.icon}
                      </ThemeIcon>
                      <Box>
                        <Text size="sm" fw={500}>
                          {provider.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {provider.description}
                        </Text>
                      </Box>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Stepper.Step>

          {/* Step 2: Payment Details */}
          <Stepper.Step label="Details" description="Enter payment information">
            <Stack gap="md" mt="md">
              {selectedProvider === "stripe" && (
                <>
                  <Box
                    style={{
                      border: "1px solid var(--mantine-color-gray-4)",
                      borderRadius: 6,
                      padding: 12,
                    }}
                  >
                    <CardElement options={{ hidePostalCode: true }} />
                  </Box>
                </>
              )}

              {selectedProvider === "paypal" && (
                <Stack gap="xs">
                  <Alert
                    icon={<IconInfoCircle size={16} />}
                    color="blue"
                    variant="light"
                  >
                    <Text size="sm">
                      Approve PayPal to vault a payment method.
                    </Text>
                  </Alert>
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    // Use advanced vault setup via onClick delegating to server if needed. For now, rely on billing token from onApprove
                    onApprove={async (data: any) => {
                      // Prefer data.billingToken when vaulting; fall back to data.orderID
                      const token =
                        (data as any).billingToken || (data as any).orderID;
                      if (token) {
                        setPaypalToken(token);
                      }
                    }}
                  />
                </Stack>
              )}
            </Stack>
          </Stepper.Step>

          {/* Step 3: Billing Address */}
          <Stepper.Step label="Address" description="Billing information">
            <Stack gap="md" mt="md">
              <TextInput
                label="Address Line 1"
                placeholder="123 Main Street"
                {...form.getInputProps("billingAddress.line1")}
              />

              <TextInput
                label="Address Line 2 (Optional)"
                placeholder="Apartment, suite, etc."
                {...form.getInputProps("billingAddress.line2")}
              />

              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="City"
                    placeholder="New York"
                    {...form.getInputProps("billingAddress.city")}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="State/Province"
                    placeholder="NY"
                    {...form.getInputProps("billingAddress.state")}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Postal Code"
                    placeholder="10001"
                    {...form.getInputProps("billingAddress.postalCode")}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Country"
                    data={COUNTRIES}
                    {...form.getInputProps("billingAddress.country")}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Stepper.Step>

          {/* Step 4: Confirmation */}
          <Stepper.Completed>
            <Stack gap="md" mt="md">
              <Alert
                icon={<IconCheck size={16} />}
                color="green"
                variant="light"
              >
                <Text size="sm">
                  Ready to add your payment method. Review the information and
                  confirm.
                </Text>
              </Alert>

              <Card withBorder p="md" bg="gray.0">
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Payment Method Summary
                  </Text>
                  <Group justify="space-between">
                    <Text size="sm">Provider:</Text>
                    <Text size="sm" fw={500}>
                      {
                        PAYMENT_PROVIDERS.find(
                          (p) => p.value === selectedProvider
                        )?.label
                      }
                    </Text>
                  </Group>
                  {selectedProvider === "stripe" && (
                    <Group justify="space-between">
                      <Text size="sm">Card:</Text>
                      <Text size="sm" fw={500}>
                        •••• {form.values.cardNumber?.slice(-4) || ""}
                      </Text>
                    </Group>
                  )}
                  <Group justify="space-between">
                    <Text size="sm">Billing Address:</Text>
                    <Text size="sm" fw={500}>
                      {form.values.billingAddress.city},{" "}
                      {form.values.billingAddress.country}
                    </Text>
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Stepper.Completed>
        </Stepper>

        {/* Navigation Buttons */}
        <Group justify="space-between" mt="md">
          <Button variant="light" onClick={prevStep} disabled={active === 0}>
            Back
          </Button>

          {active < 3 ? (
            <Button
              onClick={nextStep}
              disabled={active === 0 && !selectedProvider}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              leftSection={<IconPlus size={14} />}
            >
              Add Payment Method
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
};
