import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import {
  useUsersQuery,
  useUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "./use-users-query";
import { server } from "@/shared/mocks/server-exports";
import { http, HttpResponse } from "msw";

// Test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useUsersQuery", () => {
  it("fetches users successfully", async () => {
    const { result } = renderHook(() => useUsersQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.data).toHaveLength(5);
    expect(result.current.data?.pagination).toBeDefined();
  });

  it("fetches users with search parameters", async () => {
    const { result } = renderHook(
      () => useUsersQuery({ search: "john", page: 1, limit: 5 }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].firstName).toBe("John");
  });

  it("handles API error", async () => {
    server.use(
      http.get("/api/v1/users", () => {
        return HttpResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useUsersQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe("useUserQuery", () => {
  it("fetches single user successfully", async () => {
    const { result } = renderHook(() => useUserQuery(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data.id).toBe(1);
    expect(result.current.data?.data.firstName).toBe("John");
  });

  it("handles user not found", async () => {
    server.use(
      http.get("/api/v1/users/999", () => {
        return HttpResponse.json({ error: "User not found" }, { status: 404 });
      })
    );

    const { result } = renderHook(() => useUserQuery(999), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHook(() => useUserQuery(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateUserMutation", () => {
  it("creates user successfully", async () => {
    const { result } = renderHook(() => useCreateUserMutation(), {
      wrapper: createWrapper(),
    });

    const newUser = {
      username: "newuser",
      email: "newuser@example.com",
      password: "password123",
      firstName: "New",
      lastName: "User",
      role: "user",
    };

    result.current.mutate(newUser);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data.username).toBe("newuser");
    expect(result.current.data?.data.email).toBe("newuser@example.com");
  });

  it("handles creation error for duplicate email", async () => {
    server.use(
      http.post("/api/v1/auth/signup", () => {
        return HttpResponse.json(
          { error: "Username or email already exists" },
          { status: 409 }
        );
      })
    );

    const { result } = renderHook(() => useCreateUserMutation(), {
      wrapper: createWrapper(),
    });

    const duplicateUser = {
      username: "john_doe",
      email: "john.doe@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      role: "user",
    };

    result.current.mutate(duplicateUser);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe("useUpdateUserMutation", () => {
  it("updates user successfully", async () => {
    const { result } = renderHook(() => useUpdateUserMutation(), {
      wrapper: createWrapper(),
    });

    const updateData = {
      id: 1,
      userData: {
        firstName: "Johnny",
        lastName: "Doe",
      },
    };

    result.current.mutate(updateData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data.firstName).toBe("Johnny");
  });

  it("handles update error for non-existent user", async () => {
    server.use(
      http.put("/api/v1/users/999", () => {
        return HttpResponse.json({ error: "User not found" }, { status: 404 });
      })
    );

    const { result } = renderHook(() => useUpdateUserMutation(), {
      wrapper: createWrapper(),
    });

    const updateData = {
      id: 999,
      userData: {
        firstName: "Updated",
      },
    };

    result.current.mutate(updateData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe("useDeleteUserMutation", () => {
  it("deletes user successfully", async () => {
    const { result } = renderHook(() => useDeleteUserMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.message).toBe("User deleted successfully");
  });

  it("handles delete error for non-existent user", async () => {
    server.use(
      http.delete("/api/v1/users/999", () => {
        return HttpResponse.json({ error: "User not found" }, { status: 404 });
      })
    );

    const { result } = renderHook(() => useDeleteUserMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(999);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
