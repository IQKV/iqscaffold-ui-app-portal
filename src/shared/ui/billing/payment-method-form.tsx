import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Grid,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { IconCreditCard, IconBrandPaypal, IconAlertCircle } from "@tabler/icons-react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type {
  PaymentMethodFormData,
  PaymentProvider,
  PaymentMethodType,
} from "@/entities/payment-method/types/payment-method-types";
import { PaymentMethodService } from "@/entities/payment-method/services/payment-method-service";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

// Validation schema
const paymentMethodSchema = z.object({
  type: z.enum(["card", "bank_account"]),
  provider: z.enum(["stripe", "paypal"]),
  cardholderName: z.string().min(1, "Cardholder name is required"),
  billingAddress: z.object({
    line1: z.string().min(1, "Address is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  setAsDefault: z.boolean().default(false),
  saveForFuture: z.boolean().default(true),
});

interface PaymentMethodFormProps {
  onSubmit: (data: PaymentMethodFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: Partial<PaymentMethodFormData>;
}

export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>("stripe");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const form = useForm({
    initialValues: {
      type: "card" as PaymentMethodType,
      provider: "stripe" as PaymentProvider,
      cardholderName: "",
      billingAddress: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
      },
      setAsDefault: false,
      saveForFuture: true,
      ...initialData,
    },
    validate: zodResolver(paymentMethodSchema),
  });

  useEffect(() => {
    form.setFieldValue("provider", selectedProvider);
  }, [selectedProvider]);

  const handleSubmit = async (values: typeof form.values) => {
    setIsValidating(true);
    setValidationErrors([]);

    try {
      // Create form data for submission
      const formData: PaymentMethodFormData = {
        ...values,
        cardNumber: "", // Will be handled by Stripe Elements
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
      };

      await onSubmit(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add payment method";
      setValidationErrors([errorMessage]);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading || isValidating} />
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Provider Selection */}
          <Card withBorder>
            <Stack gap="sm">
              <Text fw={500}>Payment Provider</Text>
              <Group>
                <Button
                  variant={selectedProvider === "stripe" ? "filled" : "outline"}
                  leftSection={<IconCreditCard size={16} />}
                  onClick={() => setSelectedProvider("stripe")}
                >
                  Credit Card (Stripe)
                </Button>
                <Button
                  variant={selectedProvider === "paypal" ? "filled" : "outline"}
                  leftSection={<IconBrandPaypal size={16} />}
                  onClick={() => setSelectedProvider("paypal")}
                >
                  PayPal
                </Button>
              </Group>
            </Stack>
          </Card>

          {/* Payment Method Details */}
          {selectedProvider === "stripe" && (
            <StripePaymentMethodForm
              form={form}
              onValidationError={setValidationErrors}
            />
          )}

          {selectedProvider === "paypal" && (
            <PayPalPaymentMethodForm
              form={form}
              onValidationError={setValidationErrors}
            />
          )}

          {/* Billing Address */}
          <Card withBorder>
            <Stack gap="sm">
              <Text fw={500}>Billing Address</Text>
              <Grid>
                <Grid.Col span={12}>
                  <TextInput
                    label="Address Line 1"
                    placeholder="123 Main Street"
                    required
                    {...form.getInputProps("billingAddress.line1")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Address Line 2"
                    placeholder="Apartment, suite, etc. (optional)"
                    {...form.getInputProps("billingAddress.line2")}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="City"
                    placeholder="New York"
                    required
                    {...form.getInputProps("billingAddress.city")}
                  />
                </Grid.Col>
                <Grid.Col span={3}>
                  <TextInput
                    label="State"
                    placeholder="NY"
                    {...form.getInputProps("billingAddress.state")}
                  />
                </Grid.Col>
                <Grid.Col span={3}>
                  <TextInput
                    label="Postal Code"
                    placeholder="10001"
                    required
                    {...form.getInputProps("billingAddress.postalCode")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Select
                    label="Country"
                    placeholder="Select country"
                    required
                    data={[
                      { value: "US", label: "United States" },
                      { value: "CA", label: "Canada" },
                      { value: "GB", label: "United Kingdom" },
                      { value: "AU", label: "Australia" },
                      { value: "DE", label: "Germany" },
                      { value: "FR", label: "France" },
                      { value: "IT", label: "Italy" },
                      { value: "ES", label: "Spain" },
                      { value: "NL", label: "Netherlands" },
                    ]}
                    {...form.getInputProps("billingAddress.country")}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>

          {/* Error Display */}
          {validationErrors.length > 0 && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              <Stack gap="xs">
                {validationErrors.map((error, index) => (
                  <Text key={index} size="sm">
                    {error}
                  </Text>
                ))}
              </Stack>
            </Alert>
          )}

          {/* Actions */}
          <Group justify="flex-end">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={loading || isValidating}>
              Add Payment Method
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
};

// Stripe-specific form component
const StripePaymentMethodForm: React.FC<{
  form: any;
  onValidationError: (errors: string[]) => void;
}> = ({ form, onValidationError }) => {
  const stripe = useStripe();
  const elements = useElements();

  return (
    <Card withBorder>
      <Stack gap="sm">
        <Text fw={500}>Card Information</Text>
        <TextInput
          label="Cardholder Name"
          placeholder="John Doe"
          required
          {...form.getInputProps("cardholderName")}
        />
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Card Details
          </Text>
          <Box
            style={{
              border: "1px solid #ced4da",
              borderRadius: "4px",
              padding: "12px",
            }}
          >
            <Elements stripe={stripePromise}>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                  },
                }}
              />
            </Elements>
          </Box>
        </Box>
      </Stack>
    </Card>
  );
};

// PayPal-specific form component
const PayPalPaymentMethodForm: React.FC<{
  form: any;
  onValidationError: (errors: string[]) => void;
}> = ({ form, onValidationError }) => {
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    // Load PayPal SDK
    const loadPayPal = async () => {
      try {
        const provider = await PaymentMethodService.getProvider("paypal");
        setPaypalLoaded(true);
      } catch (error) {
        onValidationError(["Failed to load PayPal"]);
      }
    };

    loadPayPal();
  }, [onValidationError]);

  return (
    <Card withBorder>
      <Stack gap="sm">
        <Text fw={500}>PayPal Account</Text>
        {paypalLoaded ? (
          <Box>
            <Text size="sm" c="dimmed" mb="md">
              You will be redirected to PayPal to authorize this payment method.
            </Text>
            <div id="paypal-button-container" style={{ minHeight: "50px" }} />
          </Box>
        ) : (
          <Text size="sm" c="dimmed">
            Loading PayPal...
          </Text>
        )}
      </Stack>
    </Card>
  );
};

export default PaymentMethodForm;