import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { UsersPage } from "./users-page";
import { server } from "@/shared/mocks/server-exports";
import { http, HttpResponse } from "msw";

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
        <ModalsProvider>
          <Notifications />
          {children}
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

describe("UsersPage Integration", () => {
  it("completes full user management workflow", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UsersPage />
      </TestWrapper>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Test creating a new user
    const addButton = screen.getByText("Add User");
    await user.click(addButton);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByText("Create New User")).toBeInTheDocument();
    });

    // Fill out the form
    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("First Name"), "Test");
    await user.type(screen.getByLabelText("Last Name"), "User");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.selectOptions(screen.getByLabelText("Role"), "manager");

    // Submit the form
    const createButton = screen.getByText("Create User");
    await user.click(createButton);

    // Wait for success notification and modal to close
    await waitFor(() => {
      expect(screen.getByText("User created successfully")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText("Create New User")).not.toBeInTheDocument();
    });

    // New user should appear in the list
    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    // Test editing the new user
    const editButtons = screen.getAllByLabelText("Edit user");
    const newUserEditButton = editButtons.find((button) =>
      button.closest("tr")?.textContent?.includes("Test User")
    );

    if (newUserEditButton) {
      await user.click(newUserEditButton);
    }

    // Edit modal should open
    await waitFor(() => {
      expect(screen.getByText("Edit User")).toBeInTheDocument();
    });

    // Update the first name
    const firstNameInput = screen.getByLabelText("First Name");
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Updated Test");

    // Submit the update
    const updateButton = screen.getByText("Update User");
    await user.click(updateButton);

    // Wait for success notification
    await waitFor(() => {
      expect(screen.getByText("User updated successfully")).toBeInTheDocument();
    });

    // Updated name should appear in the list
    await waitFor(() => {
      expect(screen.getByText("Updated Test User")).toBeInTheDocument();
    });

    // Test search functionality
    const searchInput = screen.getByPlaceholderText("Search users...");
    await user.type(searchInput, "updated");

    // Only the updated user should be visible
    await waitFor(() => {
      expect(screen.getByText("Updated Test User")).toBeInTheDocument();
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    // Clear search
    await user.clear(searchInput);

    // All users should be visible again
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Updated Test User")).toBeInTheDocument();
    });

    // Test delete functionality
    const deleteButtons = screen.getAllByLabelText("Delete user");
    const newUserDeleteButton = deleteButtons.find((button) =>
      button.closest("tr")?.textContent?.includes("Updated Test User")
    );

    if (newUserDeleteButton) {
      await user.click(newUserDeleteButton);
    }

    // Confirmation modal should appear
    await waitFor(() => {
      expect(screen.getByText("Delete User")).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete user/)
      ).toBeInTheDocument();
    });

    // Confirm deletion
    const confirmDeleteButton = screen.getByText("Delete");
    await user.click(confirmDeleteButton);

    // Wait for success notification
    await waitFor(() => {
      expect(screen.getByText("User deleted successfully")).toBeInTheDocument();
    });

    // User should be removed from the list
    await waitFor(() => {
      expect(screen.queryByText("Updated Test User")).not.toBeInTheDocument();
    });
  });

  it("handles form validation errors", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UsersPage />
      </TestWrapper>
    );

    // Open create user modal
    const addButton = screen.getByText("Add User");
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Create New User")).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const createButton = screen.getByText("Create User");
    await user.click(createButton);

    // Validation errors should appear
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

    // Fill with invalid email
    await user.type(screen.getByLabelText("Email"), "invalid-email");
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    const user = userEvent.setup();

    // Mock API error for user creation
    server.use(
      http.post("/api/v1/auth/signup", () => {
        return HttpResponse.json(
          { error: "Username or email already exists" },
          { status: 409 }
        );
      })
    );

    render(
      <TestWrapper>
        <UsersPage />
      </TestWrapper>
    );

    // Open create user modal
    const addButton = screen.getByText("Add User");
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Create New User")).toBeInTheDocument();
    });

    // Fill out the form with valid data
    await user.type(screen.getByLabelText("Username"), "john_doe");
    await user.type(screen.getByLabelText("Email"), "john.doe@example.com");
    await user.type(screen.getByLabelText("First Name"), "John");
    await user.type(screen.getByLabelText("Last Name"), "Doe");
    await user.type(screen.getByLabelText("Password"), "password123");

    // Submit the form
    const createButton = screen.getByText("Create User");
    await user.click(createButton);

    // Error notification should appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to create user/)).toBeInTheDocument();
    });
  });

  it("displays role badges correctly", async () => {
    render(
      <TestWrapper>
        <UsersPage />
      </TestWrapper>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Check that different role badges are displayed
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("manager")).toBeInTheDocument();
    expect(screen.getByText("user")).toBeInTheDocument();
  });

  it("handles pagination correctly", async () => {
    render(
      <TestWrapper>
        <UsersPage />
      </TestWrapper>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // With 5 mock users and limit of 10, all should be on first page
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
    expect(screen.getByText("Alice Brown")).toBeInTheDocument();
    expect(screen.getByText("Charlie Davis")).toBeInTheDocument();
  });
});
