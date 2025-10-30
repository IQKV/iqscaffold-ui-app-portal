import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { UserFormModal } from "./user-form-modal";
import { User } from "../api/users-api";
import { vi } from "vitest";

// Mock functions
const mockOnClose = vi.fn();

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications />
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
}

const mockUser: User = {
  id: "1",
  username: "john_doe",
  name: "John Doe",
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "admin",
  roles: ["admin", "user"],
  emailVerified: true,
  tenantId: "default",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-20T14:45:00Z",
};

describe("UserFormModal", () => {
  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("renders create user modal correctly", () => {
    render(
      <TestWrapper>
        <UserFormModal
          opened={true}
          onClose={mockOnClose}
          title="Create New User"
        />
      </TestWrapper>
    );

    expect(screen.getByText("Create New User")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Role")).toBeInTheDocument();
    expect(screen.getByText("Create User")).toBeInTheDocument();
  });

  it("renders edit user modal correctly", () => {
    render(
      <TestWrapper>
        <UserFormModal
          opened={true}
          onClose={mockOnClose}
          user={mockUser}
          title="Edit User"
        />
      </TestWrapper>
    );

    expect(screen.getByText("Edit User")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john_doe")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("john.doe@example.com")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument(); // Password field should not be shown for editing
    expect(screen.getByText("Update User")).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(
      <TestWrapper>
        <UserFormModal
          opened={true}
          onClose={mockOnClose}
          title="Create New User"
        />
      </TestWrapper>
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByText("Create User");
    await userEvent.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(
        screen.getByText("Username must be at least 3 characters")
      ).toBeInTheDocument();
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      expect(
        screen.getByText("First name must be at least 2 characters")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Last name must be at least 2 characters")
      ).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    render(
      <TestWrapper>
        <UserFormModal
          opened={true}
          onClose={mockOnClose}
          title="Create New User"
        />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText("Email");
    await userEvent.type(emailInput, "invalid-email");

    const submitButton = screen.getByText("Create User");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
  });

  it("validates password length for new users", async () => {
    render(
      <TestWrapper>
        <UserFormModal
          opened={true}
          onClose={mockOnClose}
          title="Create New User"
        />
      </TestWrapper>
    );

    // Fill all fields except password
    await userEvent.type(screen.getByLabelText("Username"), "testuser");
    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(screen.getByLabelText("First Name"), "Test");
    await userEvent.type(screen.getByLabelText("Last Name"), "User");
    await userEvent.type(screen.getByLabelText("Password"), "short");

    const submitButton = screen.getByText("Create User");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters")
      ).toBeInTheDocument();
    });
  });

  it("submits form with valid data for creating user", async () => {
    render(
      <TestWrapper>
        <UserFormModal
          opened={true}
          onClose={mockOnClose}
          title="Create New User"
        />
      </TestWrapper>
    );

    // Fill all required fields
    await userEvent.type(screen.getByLabelText("Username"), "newuser");
    await userEvent.type(screen.getByLabelText("Email"), "newuser@example.com");
    await userEvent.type(screen.getByLabelText("First Name"), "New");
    await userEvent.type(screen.getByLabelText("Last Name"), "User");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.selectOptions(screen.getByLabelText("Role"), "manager");

    const submitButton = screen.getByText("Create User");
    await userEvent.click(submitButton);

    // Wait for success notification
    await waitFor(() => {
      expect(screen.getByText("User created successfully")).toBeInTheDocument();
    });
  });

  it("submits form with valid data for updating user", async () => {
    render(
      <TestWrapper>
        <UserFormModal
          opened={true}
          onClose={mockOnClose}
          user={mockUser}
          title="Edit User"
        />
      </TestWrapper>
    );

    // Update first name
    const firstNameInput = screen.getByLabelText("First Name");
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, "Johnny");

    const submitButton = screen.getByText("Update User");
    await userEvent.click(submitButton);

    // Wait for success notification
    await waitFor(() => {
      expect(screen.getByText("User updated successfully")).toBeInTheDocument();
    });
  });

  it("calls onClose when cancel button is clicked", async () => {
    render(
      <TestWrapper>
        <UserFormModal
          opened={true}
          onClose={mockOnClose}
          title="Create New User"
        />
      </TestWrapper>
    );

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("resets form when modal is closed and reopened", async () => {
    const { rerender } = render(
      <TestWrapper>
        <UserFormModal
          opened={true}
          onClose={mockOnClose}
          title="Create New User"
        />
      </TestWrapper>
    );

    // Fill some fields
    await userEvent.type(screen.getByLabelText("Username"), "testuser");
    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");

    // Close modal
    rerender(
      <TestWrapper>
        <UserFormModal
          opened={false}
          onClose={mockOnClose}
          title="Create New User"
        />
      </TestWrapper>
    );

    // Reopen modal
    rerender(
      <TestWrapper>
        <UserFormModal
          opened={true}
          onClose={mockOnClose}
          title="Create New User"
        />
      </TestWrapper>
    );

    // Fields should be empty
    expect(screen.getByLabelText("Username")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
  });

  it("displays user creation and update timestamps for editing", () => {
    render(
      <TestWrapper>
        <UserFormModal
          opened={true}
          onClose={mockOnClose}
          user={mockUser}
          title="Edit User"
        />
      </TestWrapper>
    );

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });
});
