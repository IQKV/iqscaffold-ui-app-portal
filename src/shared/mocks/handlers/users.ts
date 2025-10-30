import { http, HttpResponse, delay } from "msw";
import { getMSWConfig } from "@/shared/lib/msw-config";

const config = getMSWConfig();

// Mock users data
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://via.placeholder.com/150",
    role: "admin",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "https://via.placeholder.com/150",
    role: "user",
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    avatar: "https://via.placeholder.com/150",
    role: "user",
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
  },
];

export const usersHandlers = [
  // Get all users with pagination
  http.get("/api/v1/users", async ({ request }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";

    if (config.enableLogging) {
      console.log("👥 MSW: Get users", { page, limit, search });
    }

    // Filter users based on search
    let filteredUsers = mockUsers;
    if (search) {
      filteredUsers = mockUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return HttpResponse.json({
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
        hasNext: endIndex < filteredUsers.length,
        hasPrev: page > 1,
      },
    });
  }),

  // Get user by ID
  http.get("/api/v1/users/:id", async ({ params }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    const { id } = params;

    if (config.enableLogging) {
      console.log("👤 MSW: Get user by ID", { id });
    }

    const user = mockUsers.find((u) => u.id === id);

    if (!user) {
      return HttpResponse.json(
        {
          type: "https://example.com/problems/user-not-found",
          title: "User Not Found",
          status: 404,
          detail: `User with ID ${id} was not found.`,
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: user });
  }),

  // Create user
  http.post("/api/v1/users", async ({ request }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    const body = (await request.json()) as {
      name: string;
      email: string;
      role?: string;
    };

    if (config.enableLogging) {
      console.log("➕ MSW: Create user", body);
    }

    // Check if email already exists
    const existingUser = mockUsers.find((u) => u.email === body.email);
    if (existingUser) {
      return HttpResponse.json(
        {
          type: "https://example.com/problems/email-exists",
          title: "Email Already Exists",
          status: 409,
          detail: "A user with this email already exists.",
        },
        { status: 409 }
      );
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: body.name,
      email: body.email,
      avatar: "https://via.placeholder.com/150",
      role: body.role || "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    return HttpResponse.json({ data: newUser }, { status: 201 });
  }),

  // Update user
  http.put("/api/v1/users/:id", async ({ params, request }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    const { id } = params;
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      role?: string;
    };

    if (config.enableLogging) {
      console.log("✏️ MSW: Update user", { id, ...body });
    }

    const userIndex = mockUsers.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return HttpResponse.json(
        {
          type: "https://example.com/problems/user-not-found",
          title: "User Not Found",
          status: 404,
          detail: `User with ID ${id} was not found.`,
        },
        { status: 404 }
      );
    }

    // Check if email already exists (excluding current user)
    if (body.email) {
      const existingUser = mockUsers.find(
        (u) => u.email === body.email && u.id !== id
      );
      if (existingUser) {
        return HttpResponse.json(
          {
            type: "https://example.com/problems/email-exists",
            title: "Email Already Exists",
            status: 409,
            detail: "A user with this email already exists.",
          },
          { status: 409 }
        );
      }
    }

    const updatedUser = {
      ...mockUsers[userIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    mockUsers[userIndex] = updatedUser;

    return HttpResponse.json({ data: updatedUser });
  }),

  // Delete user
  http.delete("/api/v1/users/:id", async ({ params }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    const { id } = params;

    if (config.enableLogging) {
      console.log("🗑️ MSW: Delete user", { id });
    }

    const userIndex = mockUsers.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return HttpResponse.json(
        {
          type: "https://example.com/problems/user-not-found",
          title: "User Not Found",
          status: 404,
          detail: `User with ID ${id} was not found.`,
        },
        { status: 404 }
      );
    }

    mockUsers.splice(userIndex, 1);

    return HttpResponse.json({ message: "User deleted successfully" });
  }),
];
