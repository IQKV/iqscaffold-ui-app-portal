import { http, HttpResponse, delay } from "msw";
import { getMSWConfig } from "@/shared/lib/msw-config";

const config = getMSWConfig();

// Mock users data
let mockUsers = [
  {
    id: "1",
    username: "john_doe",
    name: "John Doe",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    avatar: "https://via.placeholder.com/150",
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
    avatar: "https://via.placeholder.com/150",
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
    avatar: "https://via.placeholder.com/150",
    role: "user",
    roles: ["user"],
    emailVerified: false,
    tenantId: "default",
    createdAt: "2024-01-17T09:15:00Z",
  },
  {
    id: "4",
    username: "alice_brown",
    name: "Alice Brown",
    email: "alice.brown@example.com",
    firstName: "Alice",
    lastName: "Brown",
    avatar: "https://via.placeholder.com/150",
    role: "user",
    roles: ["user"],
    emailVerified: true,
    tenantId: "default",
    createdAt: "2024-01-18T08:30:00Z",
  },
  {
    id: "5",
    username: "charlie_davis",
    name: "Charlie Davis",
    email: "charlie.davis@example.com",
    firstName: "Charlie",
    lastName: "Davis",
    avatar: "https://via.placeholder.com/150",
    role: "manager",
    roles: ["manager", "user"],
    emailVerified: true,
    tenantId: "default",
    createdAt: "2024-01-19T13:20:00Z",
  },
];

let nextUserId = 6;

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
      const searchLower = search.toLowerCase();
      filteredUsers = mockUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower)
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

  // Create user (signup)
  http.post("/api/v1/auth/signup", async ({ request }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    const body = (await request.json()) as {
      username: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role?: string;
      tenantId?: string;
    };

    if (config.enableLogging) {
      console.log("➕ MSW: Create user (signup)", body);
    }

    // Check if username or email already exists
    const existingUser = mockUsers.find(
      (u) => u.username === body.username || u.email === body.email
    );
    if (existingUser) {
      return HttpResponse.json(
        {
          type: "https://example.com/problems/user-exists",
          title: "User Already Exists",
          status: 409,
          detail: "Username or email already exists.",
        },
        { status: 409 }
      );
    }

    const newUser = {
      id: nextUserId.toString(),
      username: body.username,
      name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      avatar: "https://via.placeholder.com/150",
      role: body.role || "user",
      roles:
        body.role === "admin"
          ? ["admin", "user"]
          : body.role === "manager"
            ? ["manager", "user"]
            : ["user"],
      emailVerified: false,
      tenantId: body.tenantId || "default",
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    nextUserId++;

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
      username?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: string;
      emailVerified?: boolean;
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

    // Check if username or email already exists (excluding current user)
    if (body.username || body.email) {
      const existingUser = mockUsers.find(
        (u) =>
          u.id !== id &&
          ((body.username && u.username === body.username) ||
            (body.email && u.email === body.email))
      );
      if (existingUser) {
        return HttpResponse.json(
          {
            type: "https://example.com/problems/user-exists",
            title: "User Already Exists",
            status: 409,
            detail: "Username or email already exists.",
          },
          { status: 409 }
        );
      }
    }

    const updatedUser = {
      ...mockUsers[userIndex],
      ...body,
      name:
        body.firstName && body.lastName
          ? `${body.firstName} ${body.lastName}`
          : mockUsers[userIndex].name,
      roles:
        body.role === "admin"
          ? ["admin", "user"]
          : body.role === "manager"
            ? ["manager", "user"]
            : body.role === "user"
              ? ["user"]
              : mockUsers[userIndex].roles,
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
