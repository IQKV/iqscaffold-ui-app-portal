import React from "react";
import {
  Card,
  Group,
  Text,
  Badge,
  Button,
  Stack,
  List,
  ThemeIcon,
  Radio,
  Divider,
  Box,
  Highlight,
} from "@mantine/core";
import { IconCheck, IconStar, IconTrendingUp } from "@tabler/icons-react";
import { CurrencyUtils, BillingDateUtils } from "@/shared/lib/billing-utils";
import type { Plan, BillingCycle } from "@/shared/types/billing";
import classes from "./plan-selector.module.css";

export interface PlanSelectorProps {
  plans: Plan[];
  selectedPlanId?: string;
  currentPlanId?: string;
  billingCycle: BillingCycle;
  onPlanSelect: (planId: string) => void;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  loading?: boolean;
  disabled?: boolean;
  showComparison?: boolean;
  highlightUpgrades?: boolean;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  plans,
  selectedPlanId,
  currentPlanId,
  billingCycle,
  onPlanSelect,
  onBillingCycleChange,
  loading = false,
  disabled = false,
  showComparison = true,
  highlightUpgrades = true,
}) => {
  const filteredPlans = plans.filter(
    (plan) => plan.active && plan.billingCycle === billingCycle
  );

  const getPlanBadge = (plan: Plan) => {
    if (plan.id === currentPlanId) {
      return (
        <Badge color="blue" variant="filled">
          Current Plan
        </Badge>
      );
    }
    if (plan.tier === "enterprise") {
      return (
        <Badge
          color="purple"
          variant="filled"
          leftSection={<IconStar size={12} />}
        >
          Popular
        </Badge>
      );
    }
    if (plan.tier === "pro") {
      return (
        <Badge
          color="green"
          variant="filled"
          leftSection={<IconTrendingUp size={12} />}
        >
          Recommended
        </Badge>
      );
    }
    return null;
  };

  const isUpgrade = (plan: Plan) => {
    if (!currentPlanId) {
      return false;
    }
    const currentPlan = plans.find((p) => p.id === currentPlanId);
    if (!currentPlan) {
      return false;
    }

    const tierOrder = { free: 0, pro: 1, enterprise: 2 };
    return tierOrder[plan.tier] > tierOrder[currentPlan.tier];
  };

  const formatPrice = (plan: Plan) => {
    const price = CurrencyUtils.format(plan.price, plan.currency);
    const cycle = plan.billingCycle === "monthly" ? "month" : "year";
    return `${price}/${cycle}`;
  };

  const getYearlySavings = (plan: Plan) => {
    const monthlyPlan = plans.find(
      (p) => p.tier === plan.tier && p.billingCycle === "monthly"
    );
    if (!monthlyPlan || plan.billingCycle === "monthly") {
      return null;
    }

    const yearlyTotal = plan.price;
    const monthlyTotal = monthlyPlan.price * 12;
    const savings = monthlyTotal - yearlyTotal;
    const savingsPercentage = Math.round((savings / monthlyTotal) * 100);

    return { amount: savings, percentage: savingsPercentage };
  };

  return (
    <div className={classes.planSelector}>
      {/* Billing Cycle Toggle */}
      <Group justify="center" mb="xl">
        <Radio.Group
          value={billingCycle}
          onChange={(value) => onBillingCycleChange(value as BillingCycle)}
          disabled={disabled}
        >
          <Group>
            <Radio value="monthly" label="Monthly" />
            <Radio
              value="yearly"
              label={
                <Group gap="xs">
                  <Text>Yearly</Text>
                  <Badge color="green" size="sm">
                    Save up to 20%
                  </Badge>
                </Group>
              }
            />
          </Group>
        </Radio.Group>
      </Group>

      {/* Plan Cards */}
      <Group align="stretch" justify="center" gap="md">
        {filteredPlans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const isCurrent = currentPlanId === plan.id;
          const isUpgradePlan = highlightUpgrades && isUpgrade(plan);
          const yearlySavings = getYearlySavings(plan);

          return (
            <Card
              key={plan.id}
              className={`${classes.planCard} ${isSelected ? classes.selected : ""} ${isUpgradePlan ? classes.upgrade : ""}`}
              shadow={isSelected ? "lg" : "sm"}
              padding="lg"
              radius="md"
              withBorder
              onClick={() => !disabled && onPlanSelect(plan.id)}
              style={{ cursor: disabled ? "not-allowed" : "pointer" }}
            >
              <Stack gap="md">
                {/* Plan Header */}
                <div>
                  <Group justify="space-between" align="flex-start" mb="xs">
                    <Text size="xl" fw={600} tt="capitalize">
                      {plan.name}
                    </Text>
                    {getPlanBadge(plan)}
                  </Group>

                  <Group align="baseline" gap="xs">
                    <Text size="2rem" fw={700} c={isSelected ? "blue" : "dark"}>
                      {formatPrice(plan)}
                    </Text>
                    {yearlySavings && (
                      <Badge color="green" variant="light" size="sm">
                        Save {yearlySavings.percentage}%
                      </Badge>
                    )}
                  </Group>
                </div>

                <Divider />

                {/* Plan Features */}
                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Features included:
                  </Text>
                  <List
                    spacing="xs"
                    size="sm"
                    icon={
                      <ThemeIcon color="green" size={16} radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                    }
                  >
                    {plan.features
                      .filter((f) => f.enabled)
                      .map((feature) => (
                        <List.Item key={feature.id}>
                          <Text size="sm">{feature.name}</Text>
                        </List.Item>
                      ))}
                  </List>
                </div>

                {/* Plan Quotas */}
                {plan.quotas.length > 0 && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      Usage limits:
                    </Text>
                    <Stack gap="xs">
                      {plan.quotas.map((quota) => (
                        <Group key={quota.metricType} justify="space-between">
                          <Text size="sm" c="dimmed" tt="capitalize">
                            {quota.metricType.replace("_", " ")}
                          </Text>
                          <Text size="sm" fw={500}>
                            {quota.limit === -1
                              ? "Unlimited"
                              : quota.limit.toLocaleString()}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  </div>
                )}

                {/* Trial Information */}
                {plan.trialDays && !isCurrent && (
                  <Box className={classes.trialInfo}>
                    <Text size="sm" c="blue" ta="center">
                      {plan.trialDays}-day free trial included
                    </Text>
                  </Box>
                )}

                {/* Action Button */}
                <Button
                  variant={isSelected ? "filled" : "outline"}
                  color={isUpgradePlan ? "green" : "blue"}
                  fullWidth
                  disabled={disabled || isCurrent}
                  loading={loading && isSelected}
                >
                  {isCurrent
                    ? "Current Plan"
                    : isUpgradePlan
                      ? "Upgrade"
                      : "Select Plan"}
                </Button>

                {/* Upgrade Indicator */}
                {isUpgradePlan && (
                  <Text size="xs" c="green" ta="center" fw={500}>
                    ↑ Upgrade from current plan
                  </Text>
                )}
              </Stack>
            </Card>
          );
        })}
      </Group>

      {/* Plan Comparison Table */}
      {showComparison && filteredPlans.length > 1 && (
        <Box mt="xl">
          <Text size="lg" fw={600} mb="md" ta="center">
            Compare Plans
          </Text>
          <div className={classes.comparisonTable}>
            {/* Implementation would include a detailed comparison table */}
            <Text size="sm" c="dimmed" ta="center">
              Detailed comparison table would be implemented here
            </Text>
          </div>
        </Box>
      )}
    </div>
  );
};
