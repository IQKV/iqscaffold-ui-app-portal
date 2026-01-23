import type { Meta, StoryObj } from "@storybook/react";
import { LeadForm } from "./LeadForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import type { Lead } from "@/shared/api/crm/types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof LeadForm> = {
  title: "Entities/CRM/LeadForm",
  component: LeadForm,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <ModalsProvider>
            <Notifications />
            <Story />
          </ModalsProvider>
        </MantineProvider>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LeadForm>;

// Mock lead data for edit mode
const mockLead: Lead = {
  id: "1",
  firstName: "John",
  lastName: "Doe",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  company: "Acme Corp",
  source: "WEBSITE",
  currentStage: "New",
  score: 75,
  isQualified: false,
  isOverdue: false,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
};

/**
 * Create mode - Opens with empty form for creating a new lead
 * Requirements: 1.1, 1.2
 */
export const CreateMode: Story = {
  args: {
    opened: true,
    onClose: () => console.log("Form closed"),
    lead: null,
    title: "Add New Lead",
  },
};

/**
 * Edit mode - Pre-populated with existing lead data
 * Requirements: 1.4
 */
export const EditMode: Story = {
  args: {
    opened: true,
    onClose: () => console.log("Form closed"),
    lead: mockLead,
    title: "Edit Lead",
  },
};

/**
 * Create mode with minimal data
 */
export const CreateModeMinimal: Story = {
  args: {
    opened: true,
    onClose: () => console.log("Form closed"),
    lead: null,
  },
};

/**
 * Edit mode with minimal lead data (no phone or company)
 */
export const EditModeMinimal: Story = {
  args: {
    opened: true,
    onClose: () => console.log("Form closed"),
    lead: {
      ...mockLead,
      phone: undefined,
      company: undefined,
    },
  },
};

/**
 * Closed state - Modal not visible
 */
export const Closed: Story = {
  args: {
    opened: false,
    onClose: () => console.log("Form closed"),
    lead: null,
  },
};
