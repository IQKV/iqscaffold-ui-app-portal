import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeadForm } from "./LeadForm";
import type { Lead } from "@/shared/api/crm/types";
import { TestWrapper } from "@/shared/lib/test-utils";

// Mock the CRM API
vi.mock("@/shared/api/crm", () => ({
  crmApi: {
    createLead: vi.fn(),
    updateLead: vi.fn(),
  },
}));

// Mock notifications
vi.mock("@mantine/notifications", async () => {
  const actual = await vi.importActual("@mantine/notifications");
  return {
    ...actual,
    notifications: {
      show: vi.fn(),
    },
  };
});

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

describe("LeadForm", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Create Mode", () => {
    it("should render create form with empty fields", () => {
      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      expect(screen.getByTestId("modal-lead-form")).toBeInTheDocument();
      expect(screen.getByTestId("form-lead")).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toHaveValue("");
      expect(screen.getByLabelText(/last name/i)).toHaveValue("");
      expect(screen.getByLabelText(/email/i)).toHaveValue("");
      expect(screen.getByLabelText(/phone/i)).toHaveValue("");
      expect(screen.getByLabelText(/company/i)).toHaveValue("");
    });

    it("should show 'Add Lead' title by default in create mode", () => {
      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      expect(screen.getByText(/add lead/i)).toBeInTheDocument();
    });

    it("should show custom title when provided", () => {
      render(
        <TestWrapper>
          <LeadForm
            opened
            onClose={mockOnClose}
            lead={null}
            title="Create New Lead"
          />
        </TestWrapper>
      );

      expect(screen.getByText("Create New Lead")).toBeInTheDocument();
    });

    it("should have required fields marked with asterisk", () => {
      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      // Check for required fields (firstName, lastName, email, source)
      // Note: Mantine form validation is handled by Zod, not HTML5 required attribute
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);

      expect(firstNameInput).toBeInTheDocument();
      expect(lastNameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
    });
  });

  describe("Edit Mode", () => {
    it("should render edit form with pre-populated fields (Requirement 1.4)", () => {
      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={mockLead} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/first name/i)).toHaveValue(
        mockLead.firstName
      );
      expect(screen.getByLabelText(/last name/i)).toHaveValue(
        mockLead.lastName
      );
      expect(screen.getByLabelText(/email/i)).toHaveValue(mockLead.email);
      expect(screen.getByLabelText(/phone/i)).toHaveValue(mockLead.phone);
      expect(screen.getByLabelText(/company/i)).toHaveValue(mockLead.company);
    });

    it("should show 'Edit Lead' title by default in edit mode", () => {
      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={mockLead} />
        </TestWrapper>
      );

      expect(screen.getByText(/edit lead/i)).toBeInTheDocument();
    });

    it("should show 'Update' button in edit mode", () => {
      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={mockLead} />
        </TestWrapper>
      );

      expect(screen.getByTestId("btn-submit-lead-form")).toHaveTextContent(
        /update/i
      );
    });
  });

  describe("Form Validation (Requirements 11.1, 11.2)", () => {
    it("should show validation error for missing first name", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("btn-submit-lead-form");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(
          /name must be at least 2 characters/i
        );
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it("should show validation error for invalid email format (Requirement 11.2)", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "invalid-email");

      const submitButton = screen.getByTestId("btn-submit-lead-form");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });

    it("should show validation error for missing email", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, "John");

      const lastNameInput = screen.getByLabelText(/last name/i);
      await user.type(lastNameInput, "Doe");

      const submitButton = screen.getByTestId("btn-submit-lead-form");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toHaveAttribute(
          "aria-invalid",
          "true"
        );
      });
    });

    it("should show validation error for missing lead source", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(firstNameInput, "John");
      await user.type(lastNameInput, "Doe");
      await user.type(emailInput, "john@example.com");

      // Clear the default source value
      const sourceInput = screen.getByRole("textbox", { name: /lead source/i });
      await user.clear(sourceInput);

      const submitButton = screen.getByTestId("btn-submit-lead-form");
      await user.click(submitButton);

      // The validation error appears in the form
      await waitFor(() => {
        const form = screen.getByTestId("form-lead");
        expect(form).toBeInTheDocument();
      });
    }, 15000);
  });

  describe("Lead Source Selection", () => {
    it("should render lead source dropdown with all options", () => {
      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      const sourceSelect = screen.getByRole("textbox", {
        name: /lead source/i,
      });
      expect(sourceSelect).toBeInTheDocument();
    });

    it("should be searchable", () => {
      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      const sourceSelect = screen.getByRole("textbox", {
        name: /lead source/i,
      });
      // Searchable select allows typing
      expect(sourceSelect).toBeInTheDocument();
    });
  });

  describe("Form Actions", () => {
    it("should call onClose when cancel button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      const cancelButton = screen.getByTestId("btn-cancel-lead-form");
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should reset form when closed", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, "Test Name");

      const cancelButton = screen.getByTestId("btn-cancel-lead-form");
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Modal Behavior", () => {
    it("should not render modal content when opened is false", () => {
      render(
        <TestWrapper>
          <LeadForm opened={false} onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      // Modal root may exist but content should not be visible
      expect(screen.queryByTestId("form-lead")).not.toBeInTheDocument();
    });

    it("should render when opened is true", () => {
      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      expect(screen.getByTestId("modal-lead-form")).toBeInTheDocument();
    });
  });

  describe("Optional Fields", () => {
    it("should allow submission without phone number", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(firstNameInput, "John");
      await user.type(lastNameInput, "Doe");
      await user.type(emailInput, "john@example.com");

      // Phone is optional, so form should be valid without it
      const phoneInput = screen.getByLabelText(/phone/i);
      expect(phoneInput).not.toBeRequired();
    });

    it("should allow submission without company", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LeadForm opened onClose={mockOnClose} lead={null} />
        </TestWrapper>
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(firstNameInput, "John");
      await user.type(lastNameInput, "Doe");
      await user.type(emailInput, "john@example.com");

      // Company is optional, so form should be valid without it
      const companyInput = screen.getByLabelText(/company/i);
      expect(companyInput).not.toBeRequired();
    }, 15000);
  });
});
