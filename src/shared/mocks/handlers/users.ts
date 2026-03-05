import { http, HttpResponse, delay } from "msw";
import { getMSWConfig } from "@/shared/lib/msw-config";
import { getConfig } from "@/app/config";
import { ENV_KEYS } from "@/shared/constants";

const config = getMSWConfig();
const API_BASE_URL = getConfig(ENV_KEYS.API_SERVER_URL) || "";

// Mock users data
const mockUsers = [
  {
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
  },
  {
    id: 2,
    username: "jane_smith",
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
    enabled: true,
    authorities: ["USER"],
    emailVerified: true,
    tenantId: "default",
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-18T11:20:00Z",
  },
  {
    id: 3,
    username: "bob_wilson",
    email: "bob.wilson@example.com",
    firstName: "Bob",
    lastName: "Wilson",
    enabled: true,
    authorities: ["USER"],
    emailVerified: false,
    tenantId: "default",
    createdAt: "2024-01-17T09:15:00Z",
  },
  {
    id: 4,
    username: "alice_brown",
    email: "alice.brown@example.com",
    firstName: "Alice",
    lastName: "Brown",
    enabled: true,
    authorities: ["USER"],
    emailVerified: true,
    tenantId: "default",
    createdAt: "2024-01-18T08:30:00Z",
  },
  {
    id: 5,
    username: "charlie_davis",
    email: "charlie.davis@example.com",
    firstName: "Charlie",
    lastName: "Davis",
    enabled: true,
    authorities: ["SUPER_ADMIN"],
    emailVerified: true,
    tenantId: "default",
    createdAt: "2024-01-19T13:20:00Z",
  },
];

let nextUserId = 6;

export const usersHandlers = [
  // Get all users with pagination
  http.get(`${API_BASE_URL}/v1/admin/users`, async ({ request }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    const url = new URL(request.url);
    const rawPage = url.searchParams.get("page");
    const rawSize =
      url.searchParams.get("size") || url.searchParams.get("limit");
    const pageParam = Number.parseInt(rawPage ?? "0", 10);
    const sizeParam = Number.parseInt(rawSize ?? "10", 10);
    // Support both 0-based (Spring-style) and 1-based page params
    const pageIndex = Number.isNaN(pageParam)
      ? 0
      : pageParam > 0
        ? pageParam - 1
        : pageParam;
    const pageSize = Number.isNaN(sizeParam) ? 10 : sizeParam;
    const search = url.searchParams.get("search") || "";

    if (config.enableLogging) {
      console.log("👥 MSW: Get users", {
        page: pageIndex,
        size: pageSize,
        search,
      });
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
          user.authorities.some((authority) =>
            authority.toLowerCase().includes(searchLower)
          )
      );
    }

    // Paginate results using 0-based page index
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return HttpResponse.json({
      content: paginatedUsers,
      totalElements: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / pageSize),
      size: pageSize,
      number: pageIndex,
      first: pageIndex === 0,
      last: endIndex >= filteredUsers.length,
    });
  }),

  // Get user by ID
  http.get(`${API_BASE_URL}/v1/admin/users/:id`, async ({ params }) => {
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

    const userId = parseInt(id as string, 10);
    const user = mockUsers.find((u) => u.id === userId);

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

    return HttpResponse.json(user);
  }),

  // Create user (signup)
  http.post(`${API_BASE_URL}/v1/auth/signup`, async ({ request }) => {
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
      id: nextUserId,
      username: body.username,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      enabled: true,
      authorities: (body as any).authorities || ["USER"],
      emailVerified: false,
      tenantId: body.tenantId || "default",
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    nextUserId++;

    return HttpResponse.json(newUser, { status: 201 });
  }),

  // Create user (admin endpoint)
  http.post(`${API_BASE_URL}/v1/admin/users`, async ({ request }) => {
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
      authorities?: string[];
      tenantId?: string;
    };

    if (config.enableLogging) {
      console.log("➕ MSW: Create user (admin)", body);
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
      id: nextUserId,
      username: body.username,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      enabled: true,
      authorities: body.authorities || ["USER"],
      emailVerified: false,
      tenantId: body.tenantId || "default",
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    nextUserId++;

    return HttpResponse.json(newUser, { status: 201 });
  }),

  // Update user
  http.put(
    `${API_BASE_URL}/v1/admin/users/:id`,
    async ({ params, request }) => {
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
        authorities?: string[];
        enabled?: boolean;
        emailVerified?: boolean;
      };

      if (config.enableLogging) {
        console.log("✏️ MSW: Update user", { id, ...body });
      }

      const userId = parseInt(id as string, 10);
      const userIndex = mockUsers.findIndex((u) => u.id === userId);

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
            u.id !== userId &&
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
        authorities: body.authorities || mockUsers[userIndex].authorities,
        updatedAt: new Date().toISOString(),
      };

      mockUsers[userIndex] = updatedUser;

      return HttpResponse.json(updatedUser);
    }
  ),

  // Delete user
  http.delete(`${API_BASE_URL}/v1/admin/users/:id`, async ({ params }) => {
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

    const userId = parseInt(id as string, 10);
    const userIndex = mockUsers.findIndex((u) => u.id === userId);

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
