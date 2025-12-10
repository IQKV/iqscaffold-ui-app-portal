import React, { useState, useEffect } from "react";
import { Stack, Button, Group, Text, Alert } from "@mantine/core";
import { IconPlus, IconCreditCard } from "@tabler/icons-react";
import {
  usePaymentMethodStore,
  PaymentMethodService,
  type PaymentMethodFormData,
} from "@/entities/payment-method";
import { PaymentProvider } from "@/shared/types/billing";
import { PaymentMethodForm, PaymentMethodList } from "@/shared/ui/billing";
import { useTenant } from "@/processes/tenant";

/**
 * Example component demonstrating payment method management
 * This shows how to integrate the payment method system with provider abstraction
 */
export const PaymentMethodManagementExample: React.FC = () => {
  const { tenant } = useTenant();
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    paymentMethods,
    loading,
    error: storeError,
    fetchPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setAsDefault,
    getPaymentMethodMetrics,
  } = usePaymentMethodStore();

  const tenantId = tenant?.tenantId || "";
  const metrics = getPaymentMethodMetrics(tenantId);

  useEffect(() => {
    if (tenantId) {
      fetchPaymentMethods(tenantId).catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unknown error");
      });
    }
  }, [tenantId, fetchPaymentMethods]);

  useEffect(() => {
    // Initialize payment providers on component mount
    PaymentMethodService.initialize().catch((err) => {
      console.error("Failed to initialize payment providers:", err);
      setError("Failed to initialize payment system");
    });
  }, []);

  const handleAddPaymentMethod = async (formData: PaymentMethodFormData) => {
    if (!tenantId) {
      setError("No tenant selected");
      return;
    }

    try {
      setError(null);

      // Convert form data to payment method data
      const paymentMethodData = {
        type: formData.type,
        provider: (formData.provider ||
          PaymentProvider.STRIPE) as PaymentProvider,
        cardNumber: formData.cardNumber,
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cvv: formData.cvv,
        billingAddress: formData.billingAddress,
        tenantId,
      };

      await addPaymentMethod(paymentMethodData);
      setShowAddForm(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add payment method";
      setError(errorMessage);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethod: any) => {
    try {
      setError(null);
      await deletePaymentMethod(paymentMethod.id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete payment method";
      setError(errorMessage);
    }
  };

  const handleSetDefault = async (paymentMethod: any) => {
    try {
      setError(null);
      await setAsDefault(tenantId, paymentMethod.id);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to set default payment method";
      setError(errorMessage);
    }
  };

  if (!tenantId) {
    return (
      <Alert color="yellow">
        <Text>Please select a tenant to manage payment methods.</Text>
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <div>
          <Text size="xl" fw={600}>
            Payment Methods
          </Text>
          <Text size="sm" c="dimmed">
            Manage your payment methods with support for multiple providers
          </Text>
        </div>

        {!showAddForm && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setShowAddForm(true)}
          >
            Add Payment Method
          </Button>
        )}
      </Group>

      {/* Error Display */}
      {(error || storeError) && (
        <Alert color="red" onClose={() => setError(null)}>
          {error || storeError}
        </Alert>
      )}

      {/* Add Payment Method Form */}
      {showAddForm && (
        <PaymentMethodForm
          onSubmit={handleAddPaymentMethod}
          onCancel={() => setShowAddForm(false)}
          loading={loading}
        />
      )}

      {/* Payment Methods List */}
      <PaymentMethodList
        paymentMethods={paymentMethods.filter((pm) => pm.tenantId === tenantId)}
        metrics={metrics}
        loading={loading}
        onDelete={handleDeletePaymentMethod}
        onSetDefault={handleSetDefault}
        showMetrics
      />

      {/* Provider Information */}
      <Alert color="blue" title="Supported Payment Providers">
        <Stack gap="xs">
          <Group gap="xs">
            <IconCreditCard size={16} />
            <Text size="sm">
              <strong>Stripe:</strong> Credit cards with secure tokenization and
              PCI compliance
            </Text>
          </Group>
          <Group gap="xs">
            <IconCreditCard size={16} />
            <Text size="sm">
              <strong>PayPal:</strong> PayPal accounts and credit cards through
              PayPal's secure vault
            </Text>
          </Group>
        </Stack>
      </Alert>

      {/* Usage Examples */}
      <Alert color="gray" title="Integration Features">
        <Stack gap="xs">
          <Text size="sm">
            ✅ <strong>Provider Abstraction:</strong> Seamlessly switch between
            Stripe and PayPal
          </Text>
          <Text size="sm">
            ✅ <strong>Retry Logic:</strong> Automatic retry with exponential
            backoff for failed operations
          </Text>
          <Text size="sm">
            ✅ <strong>Validation:</strong> Client-side and provider-side
            validation
          </Text>
          <Text size="sm">
            ✅ <strong>Tokenization:</strong> Secure storage without handling
            sensitive card data
          </Text>
          <Text size="sm">
            ✅ <strong>Error Handling:</strong> Comprehensive error handling
            with user-friendly messages
          </Text>
        </Stack>
      </Alert>
    </Stack>
  );
};

export default PaymentMethodManagementExample;
