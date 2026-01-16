import type { Meta, StoryObj } from "@storybook/react";
import { LeadSourceBadge } from "./LeadSourceBadge";
import { Stack, Text, Group } from "@mantine/core";
import { LeadSource } from "@/shared/api/crm/types";

const meta = {
  title: "Entities/CRM/LeadSourceBadge",
  component: LeadSourceBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LeadSourceBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Website: Story = {
  args: {
    source: "WEBSITE",
  },
};

export const Referral: Story = {
  args: {
    source: "REFERRAL",
  },
};

export const ColdCall: Story = {
  args: {
    source: "COLD_CALL",
  },
};

export const EmailCampaign: Story = {
  args: {
    source: "EMAIL_CAMPAIGN",
  },
};

export const SocialMedia: Story = {
  args: {
    source: "SOCIAL_MEDIA",
  },
};

export const TradeShow: Story = {
  args: {
    source: "TRADE_SHOW",
  },
};

export const Partner: Story = {
  args: {
    source: "PARTNER",
  },
};

export const Other: Story = {
  args: {
    source: "OTHER",
  },
};

export const AllSources: Story = {
  args: {
    source: "WEBSITE",
  },
  render: () => {
    const sources: LeadSource[] = [
      "WEBSITE",
      "REFERRAL",
      "COLD_CALL",
      "EMAIL_CAMPAIGN",
      "SOCIAL_MEDIA",
      "TRADE_SHOW",
      "PARTNER",
      "OTHER",
    ];

    return (
      <Stack gap="md">
        {sources.map((source) => (
          <div key={source}>
            <Text size="sm" fw={500} mb="xs">
              {source}
            </Text>
            <LeadSourceBadge source={source} />
          </div>
        ))}
      </Stack>
    );
  },
};

export const Sizes: Story = {
  args: {
    source: "WEBSITE",
  },
  render: () => (
    <Stack gap="md">
      <div>
        <Text size="sm" fw={500} mb="xs">
          Extra Small
        </Text>
        <LeadSourceBadge source="WEBSITE" size="xs" />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Small
        </Text>
        <LeadSourceBadge source="WEBSITE" size="sm" />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Medium
        </Text>
        <LeadSourceBadge source="WEBSITE" size="md" />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Large
        </Text>
        <LeadSourceBadge source="WEBSITE" size="lg" />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Extra Large
        </Text>
        <LeadSourceBadge source="WEBSITE" size="xl" />
      </div>
    </Stack>
  ),
};

export const InContext: Story = {
  args: {
    source: "WEBSITE",
  },
  render: () => (
    <Stack gap="lg">
      <div>
        <Text size="sm" fw={500} mb="xs">
          High-value referral lead
        </Text>
        <Group gap="xs">
          <LeadSourceBadge source="REFERRAL" />
          <Text size="sm" c="dimmed">
            - Typically converts well
          </Text>
        </Group>
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Website inquiry
        </Text>
        <Group gap="xs">
          <LeadSourceBadge source="WEBSITE" />
          <Text size="sm" c="dimmed">
            - Needs quick follow-up
          </Text>
        </Group>
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Trade show contact
        </Text>
        <Group gap="xs">
          <LeadSourceBadge source="TRADE_SHOW" />
          <Text size="sm" c="dimmed">
            - Follow up within 48 hours
          </Text>
        </Group>
      </div>
    </Stack>
  ),
};
