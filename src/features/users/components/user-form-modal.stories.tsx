import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { UserFormModal } from "./user-form-modal";
import { User } from "../api/users-api";
import { http, HttpResponse } from "msw";

const mockUser: User = {
  id: 1,
  username: "john_doe",
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  enabled: true,
  authorities: ["ADMIN", "USER"],
  emailVerified: true,
  tenantId: "default",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-20T14:45:00Z",
};

const meta: Meta<typeof UserFormModal> = {
  title: "Features/Users/UserFormModal",
  component: UserFormModal,
  parameters: {
    layout: "centered",
    msw: {
      handlers: [
        http.post("/v1/auth/signup", async ({ request }) => {
          const body = (await request.json()) as any;
          return HttpResponse.json(
            {
              data: {
                id: "999",
                username: body.username,
                name: `${body.firstName} ${body.lastName}`,
                email: body.email,
                firstName: body.firstName,
                lastName: body.lastName,
                role: body.role,
                roles: [body.role],
                emailVerified: false,
                tenantId: "default",
                createdAt: new Date().toISOString(),
              },
            },
            { status: 201 }
          );
        }),
        http.put("/v1/users/:id", async ({ request }) => {
          const body = (await request.json()) as any;
          return HttpResponse.json({
            data: {
              ...mockUser,
              ...body,
              updatedAt: new Date().toISOString(),
            },
          });
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
            <Notifications />
            <div style={{ width: "500px" }}>
              <Story />
            </div>
          </MantineProvider>
        </QueryClientProvider>
      );
    },
  ],
  argTypes: {
    onClose: { action: "modal closed" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateUser: Story = {
  args: {
    opened: true,
    title: "Create New User",
    onClose: () => console.log("Modal closed"),
  },
};

export const EditUser: Story = {
  args: {
    opened: true,
    title: "Edit User",
    user: mockUser,
    onClose: () => console.log("Modal closed"),
  },
};

export const Closed: Story = {
  args: {
    opened: false,
    title: "Create New User",
    onClose: () => console.log("Modal closed"),
  },
};

export const CreateUserWithError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/v1/auth/signup", () => {
          return HttpResponse.json(
            { error: "Username or email already exists" },
            { status: 409 }
          );
        }),
      ],
    },
  },
  args: {
    opened: true,
    title: "Create New User",
    onClose: () => console.log("Modal closed"),
  },
};

export const EditUserWithError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.put("/v1/users/:id", () => {
          return HttpResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }),
      ],
    },
  },
  args: {
    opened: true,
    title: "Edit User",
    user: mockUser,
    onClose: () => console.log("Modal closed"),
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/v1/auth/signup", async () => {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return HttpResponse.json(
            {
              data: {
                id: "999",
                username: "newuser",
                name: "New User",
                email: "newuser@example.com",
                firstName: "New",
                lastName: "User",
                role: "user",
                roles: ["user"],
                emailVerified: false,
                tenantId: "default",
                createdAt: new Date().toISOString(),
              },
            },
            { status: 201 }
          );
        }),
      ],
    },
  },
  args: {
    opened: true,
    title: "Create New User",
    onClose: () => console.log("Modal closed"),
  },
};
