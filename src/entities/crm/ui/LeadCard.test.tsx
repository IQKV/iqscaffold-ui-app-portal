import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LeadCard } from "./LeadCard";
import { Lead } from "@/shared/api/crm/types";
import { MantineProvider } from "@mantine/core";

// Helper to wrap components with MantineProvider
const renderWithMantine = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

// Mock lead data for testing
const mockLead: Lead = {
  id: "lead-1",
  firstName: "John",
  lastName: "Doe",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  company: "Acme Corp",
  source: "WEBSITE",
  currentStage: "New",
  score: 75,
  assignedToUserId: "user-1",
  assignedToName: "Jane Smith",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  isQualified: false,
  isOverdue: false,
};

describe("LeadCard", () => {
  it("renders lead information correctly in list variant", () => {
    renderWithMantine(<LeadCard lead={mockLead} variant="list" showQuickActions={false} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("+1234567890")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders lead information correctly in kanban variant", () => {
    renderWithMantine(<LeadCard lead={mockLead} variant="kanban" showQuickActions={false} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("renders lead information correctly in compact variant", () => {
    renderWithMantine(<LeadCard lead={mockLead} variant="compact" showQuickActions={false} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    // In compact mode, either company or email is shown
    expect(
      screen.getByText("Acme Corp") || screen.getByText("john@example.com"),
    ).toBeInTheDocument();
  });

  it("displays quick actions when enabled", () => {
    const mockActions = {
      qualify: vi.fn(),
      scheduleFollowUp: vi.fn(),
      viewDetails: vi.fn(),
    };

    renderWithMantine(
      <LeadCard lead={mockLead} variant="list" showQuickActions onQuickActions={mockActions} />,
    );

    expect(screen.getByText("Qualify")).toBeInTheDocument();
    expect(screen.getByText("Schedule Follow-up")).toBeInTheDocument();
    expect(screen.getByText("View Details")).toBeInTheDocument();
  });

  it("does not display quick actions when disabled", () => {
    renderWithMantine(<LeadCard lead={mockLead} variant="list" showQuickActions={false} />);

    expect(screen.queryByText("Qualify")).not.toBeInTheDocument();
    expect(screen.queryByText("Schedule Follow-up")).not.toBeInTheDocument();
    expect(screen.queryByText("View Details")).not.toBeInTheDocument();
  });

  it("displays overdue badge for overdue leads", () => {
    const overdueLead = { ...mockLead, isOverdue: true };

    renderWithMantine(<LeadCard lead={overdueLead} variant="list" showQuickActions={false} />);

    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("displays qualified badge for qualified leads", () => {
    const qualifiedLead = { ...mockLead, isQualified: true };

    renderWithMantine(<LeadCard lead={qualifiedLead} variant="list" showQuickActions={false} />);

    expect(screen.getByText("Qualified")).toBeInTheDocument();
  });

  it("displays lead score badge", () => {
    renderWithMantine(<LeadCard lead={mockLead} variant="list" showQuickActions={false} />);

    expect(screen.getByText(/Score: 75/)).toBeInTheDocument();
  });

  it("displays lead source badge", () => {
    renderWithMantine(<LeadCard lead={mockLead} variant="list" showQuickActions={false} />);

    expect(screen.getByText("Website")).toBeInTheDocument();
  });

  it("displays assigned user information", () => {
    renderWithMantine(<LeadCard lead={mockLead} variant="list" showQuickActions={false} />);

    expect(screen.getByText(/Assigned to: Jane Smith/)).toBeInTheDocument();
  });

  it("handles leads without optional fields", () => {
    const minimalLead: Lead = {
      id: "lead-2",
      firstName: "Jane",
      lastName: "Doe",
      name: "Jane Doe",
      email: "jane@example.com",
      source: "REFERRAL",
      currentStage: "Qualified",
      score: 50,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      isQualified: false,
      isOverdue: false,
    };

    renderWithMantine(<LeadCard lead={minimalLead} variant="list" showQuickActions={false} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.queryByText(/Assigned to:/)).not.toBeInTheDocument();
  });
});
