import type { Meta, StoryObj } from "@storybook/react";
import { LeadScoreBadge } from "./LeadScoreBadge";
import { Stack, Text } from "@mantine/core";

const meta = {
  title: "Entities/CRM/LeadScoreBadge",
  component: LeadScoreBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LeadScoreBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HighQuality: Story = {
  args: {
    score: 85,
  },
};

export const MediumQuality: Story = {
  args: {
    score: 65,
  },
};

export const LowQuality: Story = {
  args: {
    score: 30,
  },
};

export const EdgeCases: Story = {
  render: () => (
    <Stack gap="md">
      <div>
        <Text size="sm" fw={500} mb="xs">
          Score: 0 (Minimum)
        </Text>
        <LeadScoreBadge score={0} />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Score: 49 (Low threshold)
        </Text>
        <LeadScoreBadge score={49} />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Score: 50 (Medium threshold)
        </Text>
        <LeadScoreBadge score={50} />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Score: 79 (Medium high)
        </Text>
        <LeadScoreBadge score={79} />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Score: 80 (High threshold)
        </Text>
        <LeadScoreBadge score={80} />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Score: 100 (Maximum)
        </Text>
        <LeadScoreBadge score={100} />
      </div>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="md">
      <div>
        <Text size="sm" fw={500} mb="xs">
          Extra Small
        </Text>
        <LeadScoreBadge score={75} size="xs" />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Small
        </Text>
        <LeadScoreBadge score={75} size="sm" />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Medium
        </Text>
        <LeadScoreBadge score={75} size="md" />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Large
        </Text>
        <LeadScoreBadge score={75} size="lg" />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Extra Large
        </Text>
        <LeadScoreBadge score={75} size="xl" />
      </div>
    </Stack>
  ),
};
