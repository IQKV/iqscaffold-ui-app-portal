import type { Meta, StoryObj } from "@storybook/react";
import { FollowUpForm } from "./FollowUpForm";
import { useState } from "react";
import { Button } from "@mantine/core";
import type { FollowUp } from "@/shared/api/crm/types";

const meta: Meta<typeof FollowUpForm> = {
  title: "Entities/CRM/FollowUpForm",
  component: FollowUpForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FollowUpForm>;

// Mock follow-up data for editing
const mockFollowUp: FollowUp = {
  id: "1",
  leadId: "lead-123",
  description: "Follow up on product demo discussion",
  dueDate: "2024-02-15T10:00:00Z",
  completed: false,
  createdByUserId: "user-1",
  priority: "HIGH",
  type: "CALL",
  isOverdue: false,
};

// Mock submit handler
const mockSubmit = async (data: any) => {
  console.log("Follow-up submitted:", data);
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

/**
 * Create Mode - Empty form for scheduling a new follow-up
 */
export const CreateMode: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);

    return (
      <>
        <Button onClick={() => setOpened(true)}>Schedule Follow-up</Button>
        <FollowUpForm
          opened={opened}
          onClose={() => setOpened(false)}
          leadId="lead-123"
          onSubmit={mockSubmit}
        />
      </>
    );
  },
};

/**
 * Edit Mode - Pre-populated form for editing an existing follow-up
 */
export const EditMode: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);

    return (
      <>
        <Button onClick={() => setOpened(true)}>Edit Follow-up</Button>
        <FollowUpForm
          opened={opened}
          onClose={() => setOpened(false)}
          leadId="lead-123"
          followUp={mockFollowUp}
          onSubmit={mockSubmit}
        />
      </>
    );
  },
};

/**
 * With Past Date - Shows warning when past date is selected
 */
export const WithPastDate: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    const pastFollowUp: FollowUp = {
      ...mockFollowUp,
      dueDate: "2024-01-01T10:00:00Z", // Past date
    };

    return (
      <>
        <Button onClick={() => setOpened(true)}>
          Edit Follow-up (Past Date)
        </Button>
        <FollowUpForm
          opened={opened}
          onClose={() => setOpened(false)}
          leadId="lead-123"
          followUp={pastFollowUp}
          onSubmit={mockSubmit}
        />
      </>
    );
  },
};

/**
 * Loading State - Form with loading indicator
 */
export const LoadingState: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);

    return (
      <>
        <Button onClick={() => setOpened(true)}>Schedule Follow-up</Button>
        <FollowUpForm
          opened={opened}
          onClose={() => setOpened(false)}
          leadId="lead-123"
          onSubmit={mockSubmit}
          isLoading
        />
      </>
    );
  },
};

/**
 * High Priority Call - Pre-configured for urgent call follow-up
 */
export const HighPriorityCall: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    const urgentFollowUp: FollowUp = {
      ...mockFollowUp,
      description: "Urgent: CEO wants to discuss contract terms",
      priority: "HIGH",
      type: "CALL",
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    };

    return (
      <>
        <Button onClick={() => setOpened(true)} color="red">
          Urgent Call Follow-up
        </Button>
        <FollowUpForm
          opened={opened}
          onClose={() => setOpened(false)}
          leadId="lead-123"
          followUp={urgentFollowUp}
          onSubmit={mockSubmit}
        />
      </>
    );
  },
};

/**
 * Meeting Follow-up - Pre-configured for meeting type
 */
export const MeetingFollowUp: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    const meetingFollowUp: FollowUp = {
      ...mockFollowUp,
      description: "Schedule product demo meeting with decision makers",
      priority: "MEDIUM",
      type: "MEETING",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    };

    return (
      <>
        <Button onClick={() => setOpened(true)}>Schedule Meeting</Button>
        <FollowUpForm
          opened={opened}
          onClose={() => setOpened(false)}
          leadId="lead-123"
          followUp={meetingFollowUp}
          onSubmit={mockSubmit}
        />
      </>
    );
  },
};

/**
 * Email Follow-up - Pre-configured for email type
 */
export const EmailFollowUp: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    const emailFollowUp: FollowUp = {
      ...mockFollowUp,
      description: "Send pricing proposal and case studies",
      priority: "LOW",
      type: "EMAIL",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    };

    return (
      <>
        <Button onClick={() => setOpened(true)}>Schedule Email</Button>
        <FollowUpForm
          opened={opened}
          onClose={() => setOpened(false)}
          leadId="lead-123"
          followUp={emailFollowUp}
          onSubmit={mockSubmit}
        />
      </>
    );
  },
};

/**
 * Task Follow-up - Pre-configured for task type
 */
export const TaskFollowUp: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    const taskFollowUp: FollowUp = {
      ...mockFollowUp,
      description: "Research competitor pricing and prepare comparison",
      priority: "MEDIUM",
      type: "TASK",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    };

    return (
      <>
        <Button onClick={() => setOpened(true)}>Create Task</Button>
        <FollowUpForm
          opened={opened}
          onClose={() => setOpened(false)}
          leadId="lead-123"
          followUp={taskFollowUp}
          onSubmit={mockSubmit}
        />
      </>
    );
  },
};
