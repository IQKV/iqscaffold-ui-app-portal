/**
 * Subscription Cancellation Component
 * Handles subscription cancellation with retention offers and cancellation flow
 */

import React, { useState } from "react";
import {
  Card,
  Text,
  Button,
  Group,
  Stack,
  Alert,
  Modal,
  Radio,
  Textarea,
  Checkbox,
  Divider,
  List,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconX,
  IconGift,
  IconInfoCircle,
  IconCheck,
} from "@tabler/icons-react";
import type { Subscription } from "@/entities/subscription/types/subscription-types";

interface SubscriptionCancellationProps {
  subscription: Subscription | null;
  onCancel: (cancelAtPeriodEnd: boolean) => void;
  loading?: boolean;
}

interface RetentionOffer {
  id: string;
  title: string;
  description: string;
  discount?: number;
  freeMonths?: number;
  features?: string[];
}

const RETENTION_OFFERS: RetentionOffer[] = [
  {
    id: "discount_20",
    title: "20% Off Next 3 Months",
    description: "Continue with your current plan at a reduced rate",
    discount: 20,
  },
  {
    id: "free_month",
    title: "1 Month Free",
    description: "Get an additional month at no charge",
    freeMonths: 1,
  },
  {
    id: "downgrade",
    title: "Switch to Basic Plan",
    description: "Keep essential features at a lower cost",
    features: ["Core features", "Email support", "Basic analytics"],
  },
];

const CANCELLATION_REASONS = [
  "Too expensive",
  "Not using enough features",
  "Found a better alternative",
  "Technical issues",
  "Poor customer support",
  "Business is closing/changing",
  "Other",
];

export const SubscriptionCancellation: React.FC<
  SubscriptionCancellationProps
> = ({ subscription, onCancel, loading = false }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRetentionOffers, setShowRetentionOffers] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  if (!subscription) {
    return null;
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleInitialCancel = () => {
    setShowCancelModal(true);
  };

  const handleProceedToRetention = () => {
    setShowRetentionOffers(true);
  };

  const handleAcceptOffer = (offerId: string) => {
    setSelectedOffer(offerId);
    // In a real app, this would apply the retention offer
    console.log("Accepted retention offer:", offerId);
    setShowCancelModal(false);
    setShowRetentionOffers(false);
  };

  const handleFinalCancel = () => {
    onCancel(cancelAtPeriodEnd);
    setShowCancelModal(false);
    setShowRetentionOffers(false);
  };

  const isAlreadyCanceled = subscription.cancelAtPeriodEnd;

  return (
    <>
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Box>
              <Text size="lg" fw={600} c="red">
                Cancel Subscription
              </Text>
              <Text size="sm" c="dimmed">
                End your subscription and stop future billing
              </Text>
            </Box>
            {!isAlreadyCanceled && (
              <Button
                variant="light"
                color="red"
                leftSection={<IconX size={14} />}
                onClick={handleInitialCancel}
              >
                Cancel Subscription
              </Button>
            )}
          </Group>

          {isAlreadyCanceled ? (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="orange"
              variant="light"
            >
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Subscription Scheduled for Cancellation
                </Text>
                <Text size="sm">
                  Your subscription will end on{" "}
                  {formatDate(subscription.currentPeriodEnd)}. You'll continue
                  to have access until then.
                </Text>
                <Button
                  variant="light"
                  color="blue"
                  size="xs"
                  mt="xs"
                  onClick={() => {
                    // In a real app, this would reactivate the subscription
                    console.log("Reactivating subscription");
                  }}
                >
                  Reactivate Subscription
                </Button>
              </Stack>
            </Alert>
          ) : (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="yellow"
              variant="light"
            >
              <Text size="sm">
                Canceling your subscription will stop all future billing and
                you'll lose access to premium features at the end of your
                current billing period.
              </Text>
            </Alert>
          )}
        </Stack>
      </Card>

      {/* Cancellation Modal */}
      <Modal
        opened={showCancelModal && !showRetentionOffers}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
        size="md"
      >
        <Stack gap="md">
          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="red"
            variant="light"
          >
            <Text size="sm">
              We're sorry to see you go! Before you cancel, let us know why
              you're leaving so we can improve our service.
            </Text>
          </Alert>

          <Box>
            <Text size="sm" fw={500} mb="xs">
              What's the main reason for canceling?
            </Text>
            <Stack gap="xs">
              {CANCELLATION_REASONS.map((reason) => (
                <Radio
                  key={reason}
                  value={reason}
                  label={reason}
                  checked={selectedReason === reason}
                  onChange={(event) =>
                    setSelectedReason(event.currentTarget.value)
                  }
                />
              ))}
            </Stack>
          </Box>

          <Textarea
            label="Additional Feedback (Optional)"
            description="Help us understand how we can improve"
            value={additionalFeedback}
            onChange={(event) =>
              setAdditionalFeedback(event.currentTarget.value)
            }
            placeholder="Tell us more about your experience..."
            rows={3}
          />

          <Checkbox
            label="Cancel at the end of current billing period"
            description={`Keep access until ${formatDate(subscription.currentPeriodEnd)}`}
            checked={cancelAtPeriodEnd}
            onChange={(event) =>
              setCancelAtPeriodEnd(event.currentTarget.checked)
            }
          />

          <Group justify="space-between" gap="sm">
            <Button variant="light" onClick={() => setShowCancelModal(false)}>
              Keep Subscription
            </Button>
            <Group gap="xs">
              <Button
                variant="light"
                color="blue"
                onClick={handleProceedToRetention}
                disabled={!selectedReason}
              >
                See Special Offers
              </Button>
              <Button
                color="red"
                onClick={handleFinalCancel}
                loading={loading}
                disabled={!selectedReason}
              >
                Cancel Subscription
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      {/* Retention Offers Modal */}
      <Modal
        opened={showRetentionOffers}
        onClose={() => setShowRetentionOffers(false)}
        title="Wait! We Have Special Offers for You"
        size="lg"
      >
        <Stack gap="md">
          <Alert icon={<IconGift size={16} />} color="blue" variant="light">
            <Text size="sm">
              We value your business! Here are some exclusive offers to help you
              stay:
            </Text>
          </Alert>

          <Stack gap="md">
            {RETENTION_OFFERS.map((offer) => (
              <Card key={offer.id} withBorder p="md" radius="sm">
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start">
                    <Box>
                      <Text size="md" fw={600} c="blue">
                        {offer.title}
                      </Text>
                      <Text size="sm" c="dimmed" mt="xs">
                        {offer.description}
                      </Text>
                    </Box>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => handleAcceptOffer(offer.id)}
                    >
                      Accept Offer
                    </Button>
                  </Group>

                  {offer.features && (
                    <Box>
                      <Text size="xs" fw={500} mb="xs">
                        Includes:
                      </Text>
                      <List spacing="xs" size="xs">
                        {offer.features.map((feature, index) => (
                          <List.Item
                            key={index}
                            icon={
                              <ThemeIcon
                                color="green"
                                size={14}
                                radius="xl"
                                variant="light"
                              >
                                <IconCheck size={10} />
                              </ThemeIcon>
                            }
                          >
                            {feature}
                          </List.Item>
                        ))}
                      </List>
                    </Box>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>

          <Divider />

          <Group justify="space-between" gap="sm">
            <Button
              variant="light"
              onClick={() => setShowRetentionOffers(false)}
            >
              Back to Cancellation
            </Button>
            <Button
              color="red"
              variant="light"
              onClick={handleFinalCancel}
              loading={loading}
            >
              No Thanks, Cancel Anyway
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
