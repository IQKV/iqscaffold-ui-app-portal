import { Container, Title, SimpleGrid } from "@mantine/core";
import {
  IconUsers,
  IconShoppingCart,
  IconCash,
  IconTrendingUp,
} from "@tabler/icons-react";
import { StatsCard } from "./stats-card";

export function DashboardFeature() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">
        Dashboard
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <StatsCard
          title="Total Users"
          value="1,234"
          change={12.5}
          icon={<IconUsers size={24} />}
        />
        <StatsCard
          title="Total Orders"
          value="567"
          change={8.3}
          icon={<IconShoppingCart size={24} />}
        />
        <StatsCard
          title="Revenue"
          value="$12,345"
          change={-2.1}
          icon={<IconCash size={24} />}
        />
        <StatsCard
          title="Growth"
          value="23%"
          change={5.7}
          icon={<IconTrendingUp size={24} />}
        />
      </SimpleGrid>
    </Container>
  );
}
