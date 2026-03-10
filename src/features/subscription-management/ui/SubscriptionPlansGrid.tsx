import {
  Grid,
  Card,
  Text,
  Button,
  Stack,
  Group,
  Badge,
  List,
  ThemeIcon,
  Loader,
  Alert,
} from "@mantine/core";
import { IconCheck, IconStar } from "@tabler/icons-react";
import { t } from "@lingui/macro";
import { useActiveSubscriptionPlansQuery, SubscriptionPlan } from "@/entities/billing";
import { formatCurrency } from "@/shared/lib/format";

interface SubscriptionPlansGridProps {
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  currentPlanId?: string;
}

export function SubscriptionPlansGrid({ onSelectPlan, currentPlanId }: SubscriptionPlansGridProps) {
  const { data: plans, isLoading, error } = useActiveSubscriptionPlansQuery();

  if (isLoading) {
    return (
      <Group justify="center" p="xl">
        <Loader />
      </Group>
    );
  }

  if (error) {
    return (
      <Alert color="red" title={t`Error Loading Plans`}>
        {t`Failed to load subscription plans. Please try again later.`}
      </Alert>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <Alert color="blue" title={t`No Plans Available`}>
        {t`No subscription plans are currently available.`}
      </Alert>
    );
  }

  return (
    <Grid>
      {plans.map((plan) => (
        <Grid.Col key={plan.id} span={{ base: 12, md: 6, lg: 4 }}>
          <PlanCard
            plan={plan}
            onSelect={() => onSelectPlan?.(plan)}
            isCurrentPlan={plan.id === currentPlanId}
          />
        </Grid.Col>
      ))}
    </Grid>
  );
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelect?: () => void;
  isCurrentPlan?: boolean;
}

function PlanCard({ plan, onSelect, isCurrentPlan }: PlanCardProps) {
  const formatInterval = (interval: string, count: number) => {
    if (count === 1) {
      return interval === "month" ? t`monthly` : t`yearly`;
    }
    return interval === "month" ? t`every ${count} months` : t`every ${count} years`;
  };

  const features = plan.features ? Object.entries(plan.features) : [];

  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      h="100%"
      style={{
        position: "relative",
        border: isCurrentPlan ? "2px solid var(--mantine-color-blue-6)" : undefined,
      }}
    >
      {isCurrentPlan && (
        <Badge
          color="blue"
          variant="filled"
          style={{
            position: "absolute",
            top: -8,
            right: 16,
            zIndex: 1,
          }}
        >
          {t`Current Plan`}
        </Badge>
      )}

      <Stack gap="md" h="100%">
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <Text fw={600} size="xl">
              {plan.name}
            </Text>
            {plan.trialDays && plan.trialDays > 0 && (
              <Badge color="green" variant="light" size="sm">
                <Group gap={4}>
                  <IconStar size={12} />
                  {(() => {
                    const trialDays = plan.trialDays;
                    return t`${trialDays} day trial`;
                  })()}
                </Group>
              </Badge>
            )}
          </Group>

          {plan.description && (
            <Text size="sm" c="dimmed">
              {plan.description}
            </Text>
          )}
        </Stack>

        <Stack gap="xs">
          <Group align="baseline" gap="xs">
            <Text size="2rem" fw={700}>
              {formatCurrency(plan.priceAmount / 100, plan.currency)}
            </Text>
            <Text size="sm" c="dimmed">
              / {formatInterval(plan.interval, plan.intervalCount)}
            </Text>
          </Group>
        </Stack>

        {features.length > 0 && (
          <Stack gap="xs" style={{ flex: 1 }}>
            <Text fw={500} size="sm">
              {t`Features:`}
            </Text>
            <List
              spacing="xs"
              size="sm"
              icon={
                <ThemeIcon color="green" size={18} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              {features.map(([key, value]) => (
                <List.Item key={key}>
                  {typeof value === "boolean" && value
                    ? key.replace(/([A-Z])/g, " $1").toLowerCase()
                    : `${key.replace(/([A-Z])/g, " $1").toLowerCase()}: ${value}`}
                </List.Item>
              ))}
            </List>
          </Stack>
        )}

        <Button
          fullWidth
          variant={isCurrentPlan ? "light" : "filled"}
          disabled={isCurrentPlan}
          onClick={onSelect}
        >
          {isCurrentPlan ? t`Current Plan` : t`Select Plan`}
        </Button>
      </Stack>
    </Card>
  );
}
