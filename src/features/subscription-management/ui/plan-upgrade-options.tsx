/**
 * Plan Upgrade Options Component
 * Displays available plan upgrades with feature comparison and proration calculation
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Button,
  Group,
  Stack,
  Badge,
  Divider,
  List,
  ThemeIcon,
  Box,
  Grid,
  Alert,
  Modal,
  Skeleton,
} from "@mantine/core";
import {
  IconCheck,
  IconArrowUp,
  IconInfoCircle,
  IconCurrency,
  IconX,
} from "@tabler/icons-react";
import { subscriptionApi } from "@/entities/subscription/api/subscription-api";
import type { Plan, ProrationCalculation } from "@/entities/subscription/types/subscription-types";

interface PlanUpgradeOptionsProps {
  currentPlan: Plan | null;
  availablePlans: Plan[];
  onUpgrade: (planId: string) => void;
  loading?: boolean;
}

export const PlanUpgradeOptions: React.FC<PlanUpgradeOptionsProps> = ({
  currentPlan,
  availablePlans,
  onUpgrade,
  loading = false,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [prorationData, setProrationData] = useState<ProrationCalculation | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [calculatingProration, setCalculatingProration] = useState(false);

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const calculateProration = async (plan: Plan) => {
    if (!currentPlan) return;

    setCalculatingProration(true);
    try {
      // This would normally use the subscription ID, but for demo purposes
      // we'll simulate the calculation
      const mockProration: ProrationCalculation = {
        oldPlan: currentPlan,
        newPlan: plan,
        prorationAmount: Math.max(0, plan.price - currentPlan.price),
        creditAmount: 0,
        chargeAmount: Math.max(0, plan.price - currentPlan.price),
        effectiveDate: new Date(),
      };
      setProrationData(mockProration);
    } catch (error) {
      console.error("Failed to calculate proration:", error);
    } finally {
      setCalculatingProration(false);
    }
  };

  const handlePlanSelect = async (plan: Plan) => {
    setSelectedPlan(plan);
    await calculateProration(plan);
    setShowUpgradeModal(true);
  };

  const handleConfirmUpgrade = () => {
    if (selectedPlan) {
      onUpgrade(selectedPlan.id);
      setShowUpgradeModal(false);
      setSelectedPlan(null);
      setProrationData(null);
    }
  };

  const getUpgradeType = (plan: Plan) => {
    if (!currentPlan) return "upgrade";
    return plan.price > currentPlan.price ? "upgrade" : "downgrade";
  };

  const getPlanComparison = (plan: Plan) => {
    if (!currentPlan) return { newFeatures: [], removedFeatures: [] };

    const currentFeatureIds = new Set(
      currentPlan.features.filter(f => f.enabled).map(f => f.id)
    );
    const newFeatureIds = new Set(
      plan.features.filter(f => f.enabled).map(f => f.id)
    );

    const newFeatures = plan.features.filter(
      f => f.enabled && !currentFeatureIds.has(f.id)
    );
    const removedFeatures = currentPlan.features.filter(
      f => f.enabled && !newFeatureIds.has(f.id)
    );

    return { newFeatures, removedFeatures };
  };

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Skeleton height={24} width="60%" />
          <Stack gap="sm">
            <Skeleton height={80} />
            <Skeleton height={80} />
          </Stack>
        </Stack>
      </Card>
    );
  }

  if (!currentPlan || availablePlans.length === 0) {
    return (
      <Card withBorder radius="md" p="lg">
        <Text c="dimmed" ta="center">
          No upgrade options available
        </Text>
      </Card>
    );
  }

  return (
    <>
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text size="lg" fw={600}>
              Available Plans
            </Text>
            <Badge variant="light" color="blue" size="sm">
              {availablePlans.length} options
            </Badge>
          </Group>

          <Divider />

          <Stack gap="md">
            {availablePlans.map((plan) => {
              const upgradeType = getUpgradeType(plan);
              const { newFeatures, removedFeatures } = getPlanComparison(plan);
              const priceDifference = plan.price - currentPlan.price;

              return (
                <Card key={plan.id} withBorder radius="sm" p="md">
                  <Stack gap="sm">
                    {/* Plan Header */}
                    <Group justify="space-between" align="flex-start">
                      <Box>
                        <Group gap="sm" align="center">
                          <Text size="md" fw={600}>
                            {plan.name}
                          </Text>
                          <Badge
                            variant="light"
                            color={upgradeType === "upgrade" ? "green" : "orange"}
                            size="xs"
                          >
                            {upgradeType}
                          </Badge>
                        </Group>
                        <Group gap="xs" align="center" mt="xs">
                          <Text size="lg" fw={700} c="blue">
                            {formatCurrency(plan.price, plan.currency)}
                          </Text>
                          <Text size="sm" c="dimmed">
                            / {plan.billingCycle}
                          </Text>
                          {priceDifference !== 0 && (
                            <Badge
                              variant="light"
                              color={priceDifference > 0 ? "red" : "green"}
                              size="xs"
                            >
                              {priceDifference > 0 ? "+" : ""}
                              {formatCurrency(priceDifference, plan.currency)}
                            </Badge>
                          )}
                        </Group>
                      </Box>
                      <Button
                        variant="light"
                        size="sm"
                        leftSection={<IconArrowUp size={14} />}
                        onClick={() => handlePlanSelect(plan)}
                        loading={loading}
                      >
                        {upgradeType === "upgrade" ? "Upgrade" : "Downgrade"}
                      </Button>
                    </Group>

                    {/* Feature Changes */}
                    {(newFeatures.length > 0 || removedFeatures.length > 0) && (
                      <Box>
                        {newFeatures.length > 0 && (
                          <Box mb="xs">
                            <Text size="xs" fw={500} c="green" mb="xs">
                              New Features:
                            </Text>
                            <List spacing="xs" size="xs">
                              {newFeatures.slice(0, 3).map((feature) => (
                                <List.Item
                                  key={feature.id}
                                  icon={
                                    <ThemeIcon color="green" size={14} radius="xl" variant="light">
                                      <IconCheck size={10} />
                                    </ThemeIcon>
                                  }
                                >
                                  {feature.name}
                                </List.Item>
                              ))}
                              {newFeatures.length > 3 && (
                                <Text size="xs" c="dimmed">
                                  +{newFeatures.length - 3} more features
                                </Text>
                              )}
                            </List>
                          </Box>
                        )}

                        {removedFeatures.length > 0 && (
                          <Box>
                            <Text size="xs" fw={500} c="red" mb="xs">
                              Removed Features:
                            </Text>
                            <List spacing="xs" size="xs">
                              {removedFeatures.slice(0, 2).map((feature) => (
                                <List.Item
                                  key={feature.id}
                                  icon={
                                    <ThemeIcon color="red" size={14} radius="xl" variant="light">
                                      <IconX size={10} />
                                    </ThemeIcon>
                                  }
                                >
                                  {feature.name}
                                </List.Item>
                              ))}
                              {removedFeatures.length > 2 && (
                                <Text size="xs" c="dimmed">
                                  +{removedFeatures.length - 2} more features
                                </Text>
                              )}
                            </List>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Stack>
                </Card>
              );
            })}
          </Stack>

          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            <Text size="sm">
              Plan changes take effect immediately. You'll be charged or credited
              based on the prorated amount for the current billing period.
            </Text>
          </Alert>
        </Stack>
      </Card>

      {/* Upgrade Confirmation Modal */}
      <Modal
        opened={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Confirm Plan Change"
        size="md"
      >
        {selectedPlan && (
          <Stack gap="md">
            <Box>
              <Text size="sm" mb="xs">
                You're about to {getUpgradeType(selectedPlan)} to:
              </Text>
              <Group gap="sm" align="center">
                <Text size="lg" fw={600}>
                  {selectedPlan.name}
                </Text>
                <Badge variant="light" color="blue">
                  {formatCurrency(selectedPlan.price, selectedPlan.currency)} / {selectedPlan.billingCycle}
                </Badge>
              </Group>
            </Box>

            {prorationData && (
              <Card withBorder p="md" bg="gray.0">
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Billing Summary
                  </Text>
                  <Group justify="space-between">
                    <Text size="sm">Prorated charge:</Text>
                    <Text size="sm" fw={500}>
                      {formatCurrency(prorationData.chargeAmount, selectedPlan.currency)}
                    </Text>
                  </Group>
                  {prorationData.creditAmount > 0 && (
                    <Group justify="space-between">
                      <Text size="sm">Credit applied:</Text>
                      <Text size="sm" fw={500} c="green">
                        -{formatCurrency(prorationData.creditAmount, selectedPlan.currency)}
                      </Text>
                    </Group>
                  )}
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>
                      Total due today:
                    </Text>
                    <Text size="sm" fw={600}>
                      {formatCurrency(prorationData.prorationAmount, selectedPlan.currency)}
                    </Text>
                  </Group>
                </Stack>
              </Card>
            )}

            <Group justify="flex-end" gap="sm">
              <Button
                variant="light"
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUpgrade}
                loading={calculatingProration || loading}
                leftSection={<IconArrowUp size={14} />}
              >
                Confirm {getUpgradeType(selectedPlan)}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
};