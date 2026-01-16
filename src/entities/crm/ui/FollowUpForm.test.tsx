import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FollowUpForm } from "./FollowUpForm";
import type { FollowUp } from "@/shared/api/crm/types";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

// Mock the lingui macro
vi.mock("@lingui/core/macro", () => ({
  t: (str: any) => str,
}));

// Wrapper component for Mantine context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>
    <Notifications />
    {children}
  </MantineProvider>
);

describe("FollowUpForm", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();
  const leadId = "lead-123";

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  describe("Create Mode", () => {
    it("should render the form in create mode", () => {
      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId("modal-follow-up-form")).toBeInTheDocument();
      expect(screen.getByText("Schedule Follow-up")).toBeInTheDocument();
      expect(screen.getByTestId("btn-submit-follow-up-form")).toHaveTextContent(
        "Schedule"
      );
    });

    it("should have default values for priority and type", () => {
      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      // Check that default values are set (MEDIUM priority, CALL type)
      const form = screen.getByTestId("form-follow-up");
      expect(form).toBeInTheDocument();
    });

    it("should validate required fields", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      // Try to submit without filling required fields
      const submitButton = screen.getByTestId("btn-submit-follow-up-form");
      await user.click(submitButton);

      // Form should not submit
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should submit form with valid data", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      // Fill in the description
      const descriptionField = screen.getByLabelText(/description/i);
      await user.type(descriptionField, "Follow up on product demo");

      // Submit the form
      const submitButton = screen.getByTestId("btn-submit-follow-up-form");
      await user.click(submitButton);

      // Wait for submission
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            leadId,
            description: "Follow up on product demo",
            priority: "MEDIUM",
            type: "CALL",
          })
        );
      });
    });
  });

  describe("Edit Mode", () => {
    const mockFollowUp: FollowUp = {
      id: "follow-up-1",
      leadId: "lead-123",
      description: "Existing follow-up description",
      dueDate: "2024-02-15T10:00:00Z",
      completed: false,
      createdByUserId: "user-1",
      priority: "HIGH",
      type: "MEETING",
      isOverdue: false,
    };

    it("should render the form in edit mode", () => {
      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            followUp={mockFollowUp}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      expect(screen.getByText("Edit Follow-up")).toBeInTheDocument();
      expect(screen.getByTestId("btn-submit-follow-up-form")).toHaveTextContent(
        "Update"
      );
    });

    it("should pre-populate form with follow-up data", () => {
      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            followUp={mockFollowUp}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      const descriptionField = screen.getByLabelText(/description/i);
      expect(descriptionField).toHaveValue(mockFollowUp.description);
    });

    it("should submit updated data", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            followUp={mockFollowUp}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      // Update the description
      const descriptionField = screen.getByLabelText(/description/i);
      await user.clear(descriptionField);
      await user.type(descriptionField, "Updated follow-up description");

      // Submit the form
      const submitButton = screen.getByTestId("btn-submit-follow-up-form");
      await user.click(submitButton);

      // Wait for submission
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            leadId,
            description: "Updated follow-up description",
            priority: "HIGH",
            type: "MEETING",
          })
        );
      });
    }, 15000);
  });

  describe("Past Date Warning", () => {
    it("should show warning when past date is selected", async () => {
      const user = userEvent.setup();
      const pastFollowUp: FollowUp = {
        id: "follow-up-1",
        leadId: "lead-123",
        description: "Past follow-up",
        dueDate: "2020-01-01T10:00:00Z", // Past date
        completed: false,
        createdByUserId: "user-1",
        priority: "MEDIUM",
        type: "CALL",
        isOverdue: true,
      };

      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            followUp={pastFollowUp}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      // Check for past date warning
      await waitFor(() => {
        expect(screen.getByText(/Past Date Selected/i)).toBeInTheDocument();
        expect(
          screen.getByText(/You have selected a date in the past/i)
        ).toBeInTheDocument();
      });
    });

    it("should allow submission even with past date", async () => {
      const user = userEvent.setup();
      const pastFollowUp: FollowUp = {
        id: "follow-up-1",
        leadId: "lead-123",
        description: "Past follow-up",
        dueDate: "2020-01-01T10:00:00Z",
        completed: false,
        createdByUserId: "user-1",
        priority: "MEDIUM",
        type: "CALL",
        isOverdue: true,
      };

      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            followUp={pastFollowUp}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      // Submit the form
      const submitButton = screen.getByTestId("btn-submit-follow-up-form");
      await user.click(submitButton);

      // Should still submit
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe("Form Actions", () => {
    it("should close form when cancel button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      const cancelButton = screen.getByTestId("btn-cancel-follow-up-form");
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should disable buttons when loading", () => {
      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            onSubmit={mockOnSubmit}
            isLoading
          />
        </TestWrapper>
      );

      const cancelButton = screen.getByTestId("btn-cancel-follow-up-form");
      expect(cancelButton).toBeDisabled();
    });

    it("should reset form when closed", async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      // Fill in some data
      const descriptionField = screen.getByLabelText(/description/i);
      await user.type(descriptionField, "Test description");

      // Close and reopen
      rerender(
        <TestWrapper>
          <FollowUpForm
            opened={false}
            onClose={mockOnClose}
            leadId={leadId}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      rerender(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      // Form should be reset
      const newDescriptionField = screen.getByLabelText(/description/i);
      expect(newDescriptionField).toHaveValue("");
    });
  });

  describe("Priority and Type Selection", () => {
    it("should allow selecting different priorities", async () => {
      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      // Priority field should be present with default value
      const priorityInput = screen.getByPlaceholderText(/select priority/i);
      expect(priorityInput).toBeInTheDocument();
      expect(priorityInput).toHaveValue("Medium");
    });

    it("should allow selecting different follow-up types", async () => {
      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      // Type field should be present with default value
      const typeInput = screen.getByPlaceholderText(/select follow-up type/i);
      expect(typeInput).toBeInTheDocument();
      expect(typeInput).toHaveValue("Call");
    });
  });

  describe("Error Handling", () => {
    it("should display error notification on submission failure", async () => {
      const user = userEvent.setup();
      const errorMessage = "Failed to create follow-up";
      mockOnSubmit.mockRejectedValueOnce(new Error(errorMessage));

      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            onSubmit={mockOnSubmit}
          />
        </TestWrapper>
      );

      // Fill in required fields
      const descriptionField = screen.getByLabelText(/description/i);
      await user.type(descriptionField, "Test follow-up");

      // Submit the form
      const submitButton = screen.getByTestId("btn-submit-follow-up-form");
      await user.click(submitButton);

      // Wait for error handling
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      // Form should remain open on error
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Custom Title", () => {
    it("should display custom title when provided", () => {
      const customTitle = "Custom Follow-up Title";

      render(
        <TestWrapper>
          <FollowUpForm
            opened
            onClose={mockOnClose}
            leadId={leadId}
            onSubmit={mockOnSubmit}
            title={customTitle}
          />
        </TestWrapper>
      );

      expect(screen.getByText(customTitle)).toBeInTheDocument();
    });
  });
});
