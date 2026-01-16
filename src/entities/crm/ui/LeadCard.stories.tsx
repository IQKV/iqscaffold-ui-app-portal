import type { Meta, StoryObj } from "@storybook/react";
import { MantineProvider } from "@mantine/core";
import { LeadCard } from "./LeadCard";
import { Lead } from "@/shared/api/crm/types";
import { DndContext } from "@dnd-kit/core";

// Mock lead data for stories
const mockLeadHighScore: Lead = {
  id: "lead-1",
  name: "Sarah Johnson",
  email: "sarah.johnson@techcorp.com",
  phone: "+1 (555) 123-4567",
  company: "TechCorp Industries",
  source: "WEBSITE",
  currentStage: "Qualified",
  score: 95,
  assignedToUserId: "user-1",
  assignedToName: "John Smith",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-20T14:45:00Z",
  isQualified: true,
  isOverdue: false,
  lastContactedAt: "2024-01-20T14:45:00Z",
  nextFollowUpDate: "2024-01-25T10:00:00Z",
  conversionProbability: 85,
};

const mockLeadMediumScore: Lead = {
  id: "lead-2",
  name: "Michael Chen",
  email: "m.chen@startup.io",
  phone: "+1 (555) 987-6543",
  company: "Startup.io",
  source: "REFERRAL",
  currentStage: "New",
  score: 65,
  assignedToUserId: "user-2",
  assignedToName: "Jane Doe",
  createdAt: "2024-01-18T09:15:00Z",
  updatedAt: "2024-01-18T09:15:00Z",
  isQualified: false,
  isOverdue: false,
};

const mockLeadLowScore: Lead = {
  id: "lead-3",
  name: "Emily Rodriguez",
  email: "emily.r@example.com",
  company: "Small Business LLC",
  source: "COLD_CALL",
  currentStage: "New",
  score: 35,
  createdAt: "2024-01-22T16:20:00Z",
  updatedAt: "2024-01-22T16:20:00Z",
  isQualified: false,
  isOverdue: false,
};

const mockLeadOverdue: Lead = {
  id: "lead-4",
  name: "David Park",
  email: "david.park@enterprise.com",
  phone: "+1 (555) 456-7890",
  company: "Enterprise Solutions",
  source: "EMAIL_CAMPAIGN",
  currentStage: "Proposal",
  score: 78,
  assignedToUserId: "user-1",
  assignedToName: "John Smith",
  createdAt: "2024-01-10T08:00:00Z",
  updatedAt: "2024-01-22T11:30:00Z",
  isQualified: true,
  isOverdue: true,
  lastContactedAt: "2024-01-15T10:00:00Z",
  nextFollowUpDate: "2024-01-20T10:00:00Z",
};

const mockLeadMinimal: Lead = {
  id: "lead-5",
  name: "Alex Thompson",
  email: "alex@email.com",
  source: "SOCIAL_MEDIA",
  currentStage: "New",
  score: 50,
  createdAt: "2024-01-23T12:00:00Z",
  updatedAt: "2024-01-23T12:00:00Z",
  isQualified: false,
  isOverdue: false,
};

const meta: Meta<typeof LeadCard> = {
  title: "Entities/CRM/LeadCard",
  component: LeadCard,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <MantineProvider>
        <div style={{ width: "400px", padding: "20px" }}>
          <Story />
        </div>
      </MantineProvider>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["list", "kanban", "compact"],
    },
    showQuickActions: {
      control: "boolean",
    },
    draggable: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// List Variant Stories
export const ListVariantHighScore: Story = {
  args: {
    lead: mockLeadHighScore,
    variant: "list",
    showQuickActions: true,
    onQuickActions: {
      qualify: () => console.log("Qualify clicked"),
      scheduleFollowUp: () => console.log("Schedule Follow-up clicked"),
      viewDetails: () => console.log("View Details clicked"),
    },
  },
};

export const ListVariantMediumScore: Story = {
  args: {
    lead: mockLeadMediumScore,
    variant: "list",
    showQuickActions: true,
    onQuickActions: {
      qualify: () => console.log("Qualify clicked"),
      scheduleFollowUp: () => console.log("Schedule Follow-up clicked"),
      viewDetails: () => console.log("View Details clicked"),
    },
  },
};

export const ListVariantLowScore: Story = {
  args: {
    lead: mockLeadLowScore,
    variant: "list",
    showQuickActions: true,
    onQuickActions: {
      qualify: () => console.log("Qualify clicked"),
      scheduleFollowUp: () => console.log("Schedule Follow-up clicked"),
      viewDetails: () => console.log("View Details clicked"),
    },
  },
};

export const ListVariantOverdue: Story = {
  args: {
    lead: mockLeadOverdue,
    variant: "list",
    showQuickActions: true,
    onQuickActions: {
      qualify: () => console.log("Qualify clicked"),
      scheduleFollowUp: () => console.log("Schedule Follow-up clicked"),
      viewDetails: () => console.log("View Details clicked"),
    },
  },
};

export const ListVariantNoActions: Story = {
  args: {
    lead: mockLeadHighScore,
    variant: "list",
    showQuickActions: false,
  },
};

export const ListVariantMinimal: Story = {
  args: {
    lead: mockLeadMinimal,
    variant: "list",
    showQuickActions: true,
    onQuickActions: {
      qualify: () => console.log("Qualify clicked"),
      scheduleFollowUp: () => console.log("Schedule Follow-up clicked"),
      viewDetails: () => console.log("View Details clicked"),
    },
  },
};

// Kanban Variant Stories
export const KanbanVariant: Story = {
  args: {
    lead: mockLeadHighScore,
    variant: "kanban",
    showQuickActions: true,
    draggable: false,
    onQuickActions: {
      qualify: () => console.log("Qualify clicked"),
      scheduleFollowUp: () => console.log("Schedule Follow-up clicked"),
      viewDetails: () => console.log("View Details clicked"),
    },
  },
};

export const KanbanVariantDraggable: Story = {
  decorators: [
    (Story) => (
      <MantineProvider>
        <DndContext>
          <div style={{ width: "300px", padding: "20px" }}>
            <Story />
          </div>
        </DndContext>
      </MantineProvider>
    ),
  ],
  args: {
    lead: mockLeadMediumScore,
    variant: "kanban",
    showQuickActions: true,
    draggable: true,
    onQuickActions: {
      qualify: () => console.log("Qualify clicked"),
      scheduleFollowUp: () => console.log("Schedule Follow-up clicked"),
      viewDetails: () => console.log("View Details clicked"),
    },
  },
};

export const KanbanVariantOverdue: Story = {
  args: {
    lead: mockLeadOverdue,
    variant: "kanban",
    showQuickActions: true,
    onQuickActions: {
      qualify: () => console.log("Qualify clicked"),
      scheduleFollowUp: () => console.log("Schedule Follow-up clicked"),
      viewDetails: () => console.log("View Details clicked"),
    },
  },
};

// Compact Variant Stories
export const CompactVariant: Story = {
  args: {
    lead: mockLeadHighScore,
    variant: "compact",
    showQuickActions: false,
  },
};

export const CompactVariantOverdue: Story = {
  args: {
    lead: mockLeadOverdue,
    variant: "compact",
    showQuickActions: false,
  },
};

export const CompactVariantLowScore: Story = {
  args: {
    lead: mockLeadLowScore,
    variant: "compact",
    showQuickActions: false,
  },
};

// Comparison Story - All Variants Side by Side
export const AllVariantsComparison: Story = {
  decorators: [
    (Story) => (
      <MantineProvider>
        <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
          <div style={{ width: "400px" }}>
            <h3>List Variant</h3>
            <LeadCard
              lead={mockLeadHighScore}
              variant="list"
              showQuickActions={true}
              onQuickActions={{
                qualify: () => console.log("Qualify"),
                scheduleFollowUp: () => console.log("Follow-up"),
                viewDetails: () => console.log("Details"),
              }}
            />
          </div>
          <div style={{ width: "300px" }}>
            <h3>Kanban Variant</h3>
            <LeadCard
              lead={mockLeadHighScore}
              variant="kanban"
              showQuickActions={true}
              onQuickActions={{
                qualify: () => console.log("Qualify"),
                scheduleFollowUp: () => console.log("Follow-up"),
                viewDetails: () => console.log("Details"),
              }}
            />
          </div>
          <div style={{ width: "250px" }}>
            <h3>Compact Variant</h3>
            <LeadCard
              lead={mockLeadHighScore}
              variant="compact"
              showQuickActions={false}
            />
          </div>
        </div>
      </MantineProvider>
    ),
  ],
  args: {},
};
