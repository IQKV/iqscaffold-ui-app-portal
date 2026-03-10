import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { UsersDataGrid } from "./users-data-grid";
import { UserDto } from "@/entities/user";
import { http, HttpResponse } from "msw";

// Mock data for stories
const mockUsersResponse = {
  data: [
    {
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
    },
    {
      id: "2",
      username: "jane_smith",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith",
      role: "manager",
      roles: ["manager", "user"],
      emailVerified: true,
      tenantId: "default",
      createdAt: "2024-01-16T14:20:00Z",
      updatedAt: "2024-01-18T11:20:00Z",
    },
    {
      id: "3",
      username: "bob_wilson",
      name: "Bob Wilson",
      email: "bob.wilson@example.com",
      firstName: "Bob",
      lastName: "Wilson",
      role: "user",
      roles: ["user"],
      emailVerified: false,
      tenantId: "default",
      createdAt: "2024-01-17T09:15:00Z",
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 3,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

const meta: Meta<typeof UsersDataGrid> = {
  title: "Features/Users/UsersDataGrid",
  component: UsersDataGrid,
  parameters: {
    layout: "fullscreen",
    msw: {
      handlers: [
        http.get("/v1/admin/users", () => {
          return HttpResponse.json(mockUsersResponse);
        }),
        http.delete("/v1/admin/users/:id", () => {
          return HttpResponse.json({ message: "User deleted successfully" });
        }),
      ],
    },
  },
  decorators: [
    (Story) => {
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
              <div style={{ padding: "20px" }}>
                <Story />
              </div>
            </ModalsProvider>
          </MantineProvider>
        </QueryClientProvider>
      );
    },
  ],
  argTypes: {
    onCreateUser: { action: "create user clicked" },
    onEditUser: { action: "edit user clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onCreateUser: () => console.log("Create user clicked"),
    onEditUser: (user: UserDto) => console.log("Edit user clicked", user),
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/v1/admin/users", async () => {
          // Simulate loading state
          await new Promise((resolve) => setTimeout(resolve, 10000));
          return HttpResponse.json(mockUsersResponse);
        }),
      ],
    },
  },
  args: {
    onCreateUser: () => console.log("Create user clicked"),
    onEditUser: (user: UserDto) => console.log("Edit user clicked", user),
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/v1/admin/users", () => {
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
        }),
      ],
    },
  },
  args: {
    onCreateUser: () => console.log("Create user clicked"),
    onEditUser: (user: UserDto) => console.log("Edit user clicked", user),
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/v1/admin/users", () => {
          return HttpResponse.json({ error: "Internal server error" }, { status: 500 });
        }),
      ],
    },
  },
  args: {
    onCreateUser: () => console.log("Create user clicked"),
    onEditUser: (user: UserDto) => console.log("Edit user clicked", user),
  },
};

export const LargeDataset: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/v1/admin/users", () => {
          const users = Array.from({ length: 50 }, (_, i) => ({
            id: (i + 1).toString(),
            username: `user_${i + 1}`,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            firstName: `First${i + 1}`,
            lastName: `Last${i + 1}`,
            role: ["admin", "manager", "user"][i % 3],
            roles:
              ["admin", "manager", "user"][i % 3] === "admin"
                ? ["admin", "user"]
                : ["admin", "manager", "user"][i % 3] === "manager"
                  ? ["manager", "user"]
                  : ["user"],
            emailVerified: i % 2 === 0,
            tenantId: "default",
            createdAt: new Date(2024, 0, i + 1).toISOString(),
          }));

          return HttpResponse.json({
            data: users.slice(0, 10), // First page
            pagination: {
              page: 1,
              limit: 10,
              total: 50,
              totalPages: 5,
              hasNext: true,
              hasPrev: false,
            },
          });
        }),
      ],
    },
  },
  args: {
    onCreateUser: () => console.log("Create user clicked"),
    onEditUser: (user: UserDto) => console.log("Edit user clicked", user),
  },
};
