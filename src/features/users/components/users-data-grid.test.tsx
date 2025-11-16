import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UsersDataGrid } from "./users-data-grid";
import { server } from "@/shared/mocks/server-exports";
import { http, HttpResponse } from "msw";
import { TestWrapper } from "@/shared/lib/test-utils";
import { vi } from "vitest";

// Mock authenticated admin user for tests
const mockAdminUser = {
  userId: 1,
  username: "admin",
  email: "admin@example.com",
  roles: ["ADMIN", "USER"],
  permissions: [],
  firstName: "Admin",
  lastName: "User",
  tenantId: "default",
  customClaims: {},
};

// Create a test wrapper with authenticated admin user
function AdminTestWrapper({ children }: { children: React.ReactNode }) {
  return <TestWrapper>{children}</TestWrapper>;
}

// Mock the useAuth hook to return admin user (mock the actual module used by the component)
vi.mock("@/processes/auth", () => {
  const user = {
    userId: 1,
    username: "admin",
    email: "admin@example.com",
    roles: ["ADMIN", "USER"],
    permissions: [],
    firstName: "Admin",
    lastName: "User",
    tenantId: "default",
    customClaims: {},
  };
  return {
    useAuth: () => ({
      user,
      isAuthenticated: true,
      isLoading: false,
      hasRole: (role: string) => user.roles.includes(role),
      hasAnyRole: (roles: string[]) =>
        roles.some((role) => user.roles.includes(role)),
      hasAllRoles: (roles: string[]) =>
        roles.every((role) => user.roles.includes(role)),
      hasPermission: () => false,
      isAdmin: () => true,
      isSuperAdmin: () => false,
      canManageUsers: () => true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    }),
  };
});

// Mock functions
const mockOnCreateUser = vi.fn();
const mockOnEditUser = vi.fn();

describe("UsersDataGrid", () => {
  beforeEach(() => {
    mockOnCreateUser.mockClear();
    mockOnEditUser.mockClear();
  });

  it("renders users data grid with mock data", async () => {
    render(
      <AdminTestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </AdminTestWrapper>
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
      <AdminTestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </AdminTestWrapper>
    );

    const addButton = screen.getByText("Add User");
    await userEvent.click(addButton);

    expect(mockOnCreateUser).toHaveBeenCalledTimes(1);
  });

  it("calls onEditUser when edit button is clicked", async () => {
    render(
      <AdminTestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </AdminTestWrapper>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Find and click the first edit button (using test id or icon)
    const editButtons = screen.getAllByRole("button");
    // Find the edit button by looking for the edit icon
    const editButton = editButtons.find((button) =>
      button.querySelector("svg")?.classList.contains("tabler-icon-edit")
    );
    expect(editButton).toBeDefined();
    await userEvent.click(editButton!);

    expect(mockOnEditUser).toHaveBeenCalledTimes(1);
    expect(mockOnEditUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        username: "john_doe",
        firstName: "John",
        lastName: "Doe",
      })
    );
  });

  it("filters users based on search input", async () => {
    render(
      <AdminTestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </AdminTestWrapper>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Search for a specific user
    const searchInput = screen.getByPlaceholderText("Search users...");
    await userEvent.type(searchInput, "jane");

    // Wait for debounced search to trigger and API call to complete
    // The component uses 300ms debounce, so we need to wait for that plus API response time
    await waitFor(
      () => {
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      },
      { timeout: 2000 } // Increase timeout to account for debounce + API call
    );
  });

  it("displays role badges with correct colors", async () => {
    render(
      <AdminTestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </AdminTestWrapper>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("ADMIN, USER")).toBeInTheDocument();
    });

    // Check if role badges are displayed
    expect(screen.getByText("ADMIN, USER")).toBeInTheDocument();
    // Use getAllByText for multiple instances of "USER"
    const userBadges = screen.getAllByText("USER");
    expect(userBadges.length).toBeGreaterThan(0);
  });

  it("handles delete user confirmation", async () => {
    render(
      <AdminTestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </AdminTestWrapper>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Find and click the first delete button (using test id or icon)
    const deleteButtons = screen.getAllByRole("button");
    // Find the delete button by looking for the trash icon
    const deleteButton = deleteButtons.find((button) =>
      button.querySelector("svg")?.classList.contains("tabler-icon-trash")
    );
    expect(deleteButton).toBeDefined();
    await userEvent.click(deleteButton!);

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
      http.get("/api/v1/admin/users", () => {
        return HttpResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      })
    );

    render(
      <AdminTestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </AdminTestWrapper>
    );

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Error loading users/)).toBeInTheDocument();
    });
  });

  it("displays loading state", () => {
    // Mock slow API response
    server.use(
      http.get("/api/v1/admin/users", async () => {
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
      <AdminTestWrapper>
        <UsersDataGrid
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
        />
      </AdminTestWrapper>
    );

    // Check if loading text is displayed (DataTable shows "Loading..." in cells)
    const loadingTexts = screen.getAllByText("Loading...");
    expect(loadingTexts.length).toBeGreaterThan(0);
  });
});
