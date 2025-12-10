import React from "react";
import {
  Card,
  Group,
  Text,
  Stack,
  Button,
  TextInput,
  Select,
  NumberInput,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans, msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import {
  useBillingValidation,
  useLocalizedValidation,
  LocaleCurrencyUtils,
  useBillingNotifications,
} from "@/shared/lib/i18n";

interface BillingFormData {
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: number;
  currency: string;
}

interface LocalizedBillingFormProps {
  onSubmit: (data: BillingFormData) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<BillingFormData>;
}

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
];

const COUNTRY_OPTIONS = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "JP", label: "Japan" },
];

export const LocalizedBillingForm: React.FC<LocalizedBillingFormProps> = ({
  onSubmit,
  loading = false,
  initialData = {},
}) => {
  const { _ } = useLingui();
  const validation = useLocalizedValidation();
  const billingValidation = useBillingValidation();
  const notifications = useBillingNotifications();

  const form = useForm<BillingFormData>({
    initialValues: {
      email: "",
      firstName: "",
      lastName: "",
      company: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      amount: 0,
      currency: "USD",
      ...initialData,
    },
    validate: {
      email: (value) => {
        const result = validation.email(value);
        return result === true ? null : _(result);
      },
      firstName: (value) => {
        const result = validation.required(value);
        return result === true ? null : _(result);
      },
      lastName: (value) => {
        const result = validation.required(value);
        return result === true ? null : _(result);
      },
      address: (value) => {
        const result = validation.required(value);
        return result === true ? null : _(result);
      },
      city: (value) => {
        const result = validation.required(value);
        return result === true ? null : _(result);
      },
      state: (value) => {
        const result = validation.required(value);
        return result === true ? null : _(result);
      },
      zipCode: (value) => {
        const result = validation.postalCode(value);
        return result === true ? null : _(result);
      },
      cardNumber: (value) => {
        const result = validation.creditCard(value);
        return result === true ? null : _(result);
      },
      expiryDate: (value) => {
        const result = validation.expiryDate(value);
        return result === true ? null : _(result);
      },
      cvv: (value) => {
        const result = validation.cvv(value);
        return result === true ? null : _(result);
      },
      amount: (value) => {
        const result = billingValidation.subscriptionAmount(0.01)(value);
        return result === true ? null : _(result);
      },
    },
  });

  const handleSubmit = async (values: BillingFormData) => {
    try {
      await onSubmit(values);
      notifications.billingUpdateSuccess();
      form.reset();
    } catch (error) {
      notifications.billingUpdateError(
        error instanceof Error ? error.message : undefined
      );
    }
  };

  const formatCurrencyPreview = (amount: number, currency: string) => {
    return LocaleCurrencyUtils.format(amount, currency);
  };

  return (
    <Card withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Header */}
          <div>
            <Text size="lg" fw={600}>
              <Trans>Billing Information</Trans>
            </Text>
            <Text c="dimmed" size="sm">
              <Trans>Please provide your billing details and payment information</Trans>
            </Text>
          </div>

          <Divider />

          {/* Personal Information */}
          <Stack gap="md">
            <Text size="md" fw={500}>
              <Trans>Personal Information</Trans>
            </Text>

            <Group grow>
              <TextInput
                label={_(msg`First Name`)}
                placeholder={_(msg`Enter your first name`)}
                required
                {...form.getInputProps("firstName")}
              />
              <TextInput
                label={_(msg`Last Name`)}
                placeholder={_(msg`Enter your last name`)}
                required
                {...form.getInputProps("lastName")}
              />
            </Group>

            <TextInput
              label={_(msg`Email Address`)}
              placeholder={_(msg`Enter your email address`)}
              type="email"
              required
              {...form.getInputProps("email")}
            />

            <TextInput
              label={_(msg`Company`)}
              placeholder={_(msg`Enter your company name (optional)`)}
              {...form.getInputProps("company")}
            />
          </Stack>

          <Divider />

          {/* Billing Address */}
          <Stack gap="md">
            <Text size="md" fw={500}>
              <Trans>Billing Address</Trans>
            </Text>

            <TextInput
              label={_(msg`Address`)}
              placeholder={_(msg`Enter your street address`)}
              required
              {...form.getInputProps("address")}
            />

            <Group grow>
              <TextInput
                label={_(msg`City`)}
                placeholder={_(msg`Enter your city`)}
                required
                {...form.getInputProps("city")}
              />
              <TextInput
                label={_(msg`State/Province`)}
                placeholder={_(msg`Enter your state or province`)}
                required
                {...form.getInputProps("state")}
              />
            </Group>

            <Group grow>
              <TextInput
                label={_(msg`ZIP/Postal Code`)}
                placeholder={_(msg`Enter your ZIP or postal code`)}
                required
                {...form.getInputProps("zipCode")}
              />
              <Select
                label={_(msg`Country`)}
                placeholder={_(msg`Select your country`)}
                data={COUNTRY_OPTIONS}
                required
                {...form.getInputProps("country")}
              />
            </Group>
          </Stack>

          <Divider />

          {/* Payment Information */}
          <Stack gap="md">
            <Text size="md" fw={500}>
              <Trans>Payment Information</Trans>
            </Text>

            <TextInput
              label={_(msg`Card Number`)}
              placeholder={_(msg`Enter your card number`)}
              required
              {...form.getInputProps("cardNumber")}
            />

            <Group grow>
              <TextInput
                label={_(msg`Expiry Date`)}
                placeholder={_(msg`MM/YY`)}
                required
                {...form.getInputProps("expiryDate")}
              />
              <TextInput
                label={_(msg`CVV`)}
                placeholder={_(msg`Enter CVV`)}
                required
                {...form.getInputProps("cvv")}
              />
            </Group>
          </Stack>

          <Divider />

          {/* Amount and Currency */}
          <Stack gap="md">
            <Text size="md" fw={500}>
              <Trans>Payment Amount</Trans>
            </Text>

            <Group grow>
              <NumberInput
                label={_(msg`Amount`)}
                placeholder={_(msg`Enter amount`)}
                min={0.01}
                step={0.01}
                decimalScale={2}
                required
                {...form.getInputProps("amount")}
              />
              <Select
                label={_(msg`Currency`)}
                placeholder={_(msg`Select currency`)}
                data={CURRENCY_OPTIONS}
                required
                {...form.getInputProps("currency")}
              />
            </Group>

            {form.values.amount > 0 && (
              <Text size="sm" c="dimmed">
                <Trans>Total:</Trans> {formatCurrencyPreview(form.values.amount, form.values.currency)}
              </Text>
            )}
          </Stack>

          <Divider />

          {/* Actions */}
          <Group justify="flex-end" gap="md">
            <Button
              variant="light"
              onClick={() => form.reset()}
              disabled={loading}
            >
              <Trans>Reset</Trans>
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!form.isValid()}
            >
              <Trans>Submit Payment</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
};