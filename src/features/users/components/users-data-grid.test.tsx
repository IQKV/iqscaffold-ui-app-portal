import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { UsersDataGrid } from "./users-data-grid";
import { server } from "@/shared/mocks/server-exports";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";

// Mock functions
const mockOnCreateUser = vi.fn();
const mockOnEditUser = vi.fn();

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

describe("UsersDataGrid", () => {
  beforeEach(() => {
    mockOnCreateUser.mockClear();
    mockOnEditUser.mockClear();
  });

  it("renders users data grid with mock data", async () => {
    render(
      <TestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </TestWrapper>
    );

    // Check if the title is rendered
    expect(screen.getByText("User Management")).toBeInTheDocument();

    // Check if the Add User button is rendered
    expect(screen.getByText("Add User")).toBeInTheDocument();

    // Check if the search input is rendered
    expect(screen.getByPlaceholderText("Search users...")).toBeInTheDocument();

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Check if user data is displayed
    expect(
      screen.getByText("@john_doe • john.doe@example.com")
    ).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(
      screen.getByText("@jane_smith • jane.smith@example.com")
    ).toBeInTheDocument();
  });

  it("calls onCreateUser when Add User button is clicked", async () => {
    render(
      <TestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </TestWrapper>
    );

    const addButton = screen.getByText("Add User");
    await userEvent.click(addButton);

    expect(mockOnCreateUser).toHaveBeenCalledTimes(1);
  });

  it("calls onEditUser when edit button is clicked", async () => {
    render(
      <TestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </TestWrapper>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Find and click the first edit button
    const editButtons = screen.getAllByLabelText("Edit user");
    await userEvent.click(editButtons[0]);

    expect(mockOnEditUser).toHaveBeenCalledTimes(1);
    expect(mockOnEditUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "1",
        username: "john_doe",
        firstName: "John",
        lastName: "Doe",
      })
    );
  });

  it("filters users based on search input", async () => {
    render(
      <TestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </TestWrapper>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Search for a specific user
    const searchInput = screen.getByPlaceholderText("Search users...");
    await userEvent.type(searchInput, "jane");

    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });
  });

  it("displays role badges with correct colors", async () => {
    render(
      <TestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </TestWrapper>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    // Check if role badges are displayed
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("manager")).toBeInTheDocument();
    expect(screen.getByText("user")).toBeInTheDocument();
  });

  it("handles delete user confirmation", async () => {
    render(
      <TestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </TestWrapper>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Find and click the first delete button
    const deleteButtons = screen.getAllByLabelText("Delete user");
    await userEvent.click(deleteButtons[0]);

    // Check if confirmation modal appears
    await waitFor(() => {
      expect(screen.getByText("Delete User")).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete user/)
      ).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByText("Delete User")).not.toBeInTheDocument();
    });
  });

  it("handles API error gracefully", async () => {
    // Mock API error
    server.use(
      http.get("/api/v1/users", () => {
        return HttpResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      })
    );

    render(
      <TestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </TestWrapper>
    );

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Error loading users/)).toBeInTheDocument();
    });
  });

  it("displays loading state", () => {
    // Mock slow API response
    server.use(
      http.get("/api/v1/users", async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return HttpResponse.json({
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        });
      })
    );

    render(
      <TestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </TestWrapper>
    );

    // Check if loading text is displayed
    expect(screen.getByText("Loading users...")).toBeInTheDocument();
  });
});
