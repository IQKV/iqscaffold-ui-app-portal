import { http, HttpResponse } from "msw";
import { UserDto, type UserPageResponse } from "@/entities/user";

// Response types for mock handlers
type UsersResponse = UserPageResponse;
type UserResponse = { data: UserDto };

// Mock data
const mockUsers: UserDto[] = [
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
    createdAt: "2024-01-16T09:15:00Z",
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
    createdAt: "2024-01-17T16:45:00Z",
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

const users = [...mockUsers];
let nextId = 6;

export const usersHandlers = [
  // Get users with pagination and search
  http.get("/v1/admin/users", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const search = url.searchParams.get("search") || "";

    let filteredUsers = users;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = users.filter(
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

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const response: UsersResponse = {
      content: paginatedUsers,
      totalElements: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limit),
      size: limit,
      number: page - 1, // Spring uses 0-based page numbers
      first: page === 1,
      last: endIndex >= filteredUsers.length,
    };

    return HttpResponse.json(response);
  }),

  // Get user by ID
  http.get("/v1/admin/users/:id", ({ params }) => {
    const { id } = params;
    const userId = parseInt(id as string, 10);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response: UserResponse = { data: user };
    return HttpResponse.json(response);
  }),

  // Create user (signup)
  http.post("/v1/auth/signup", async ({ request }) => {
    const body = (await request.json()) as any;

    // Check if username or email already exists
    const existingUser = users.find(
      (u) => u.username === body.username || u.email === body.email
    );

    if (existingUser) {
      return HttpResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    const newUser: UserDto = {
      id: nextId,
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

    users.push(newUser);
    nextId++;

    const response: UserResponse = { data: newUser };
    return HttpResponse.json(response, { status: 201 });
  }),

  // Update user
  http.put("/v1/admin/users/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as any;
    const userId = parseInt(id as string, 10);

    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if username or email conflicts with other users
    if (body.username || body.email) {
      const conflictingUser = users.find(
        (u) =>
          u.id !== userId &&
          ((body.username && u.username === body.username) ||
            (body.email && u.email === body.email))
      );

      if (conflictingUser) {
        return HttpResponse.json(
          { error: "Username or email already exists" },
          { status: 409 }
        );
      }
    }

    const updatedUser: UserDto = {
      ...users[userIndex],
      ...body,
      authorities: body.authorities || users[userIndex].authorities,
      updatedAt: new Date().toISOString(),
    };

    users[userIndex] = updatedUser;

    const response: UserResponse = { data: updatedUser };
    return HttpResponse.json(response);
  }),

  // Delete user
  http.delete("/v1/admin/users/:id", ({ params }) => {
    const { id } = params;
    const userId = parseInt(id as string, 10);
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }

    users.splice(userIndex, 1);

    return HttpResponse.json({ message: "User deleted successfully" });
  }),
];
