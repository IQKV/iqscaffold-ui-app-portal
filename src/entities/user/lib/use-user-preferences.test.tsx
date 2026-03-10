/**
 * User Preferences Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import {
  useUserPreferences,
  useUpdateUserPreferences,
  useDeleteUserPreferences,
} from "./use-user-preferences";
import { userPreferenceApi } from "@/shared/api";

vi.mock("@/shared/api", () => ({
  userPreferenceApi: {
    getMyPreferences: vi.fn(),
    updateMyPreferences: vi.fn(),
    deleteMyPreferences: vi.fn(),
  },
}));

vi.mock("@/shared/lib/notifications", () => ({
  notificationService: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

  return Wrapper;
};

describe("useUserPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch user preferences", async () => {
    const mockPreferences = {
      id: 1,
      userId: 123,
      username: "testuser",
      locale: "en",
      timezone: "UTC",
      currency: "USD",
      dateFormat: "yyyy-MM-dd",
      timeFormat: "HH:mm:ss",
      theme: "light" as const,
      profilePhotoUrl: null,
      phoneNumber: null,
      bio: null,
      notificationEmail: true,
      notificationSms: false,
      notificationPush: true,
      twoFactorEnabled: false,
      twoFactorMethod: null,
      customSettings: null,
      tenantId: "tenant-123",
      createdAt: "2025-11-22T10:00:00",
      updatedAt: "2025-11-22T10:00:00",
    };

    vi.mocked(userPreferenceApi.getMyPreferences).mockResolvedValue(mockPreferences);

    const { result } = renderHook(() => useUserPreferences(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPreferences);
    expect(userPreferenceApi.getMyPreferences).toHaveBeenCalledTimes(1);
  });

  it("should handle fetch error", async () => {
    const error = new Error("Failed to fetch");
    vi.mocked(userPreferenceApi.getMyPreferences).mockRejectedValue(error);

    const { result } = renderHook(() => useUserPreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe("useUpdateUserPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update user preferences", async () => {
    const updateData = { theme: "dark" as const };
    const mockResponse = {
      id: 1,
      userId: 123,
      username: "testuser",
      locale: "en",
      timezone: "UTC",
      currency: "USD",
      dateFormat: "yyyy-MM-dd",
      timeFormat: "HH:mm:ss",
      theme: "dark" as const,
      profilePhotoUrl: null,
      phoneNumber: null,
      bio: null,
      notificationEmail: true,
      notificationSms: false,
      notificationPush: true,
      twoFactorEnabled: false,
      twoFactorMethod: null,
      customSettings: null,
      tenantId: "tenant-123",
      createdAt: "2025-11-22T10:00:00",
      updatedAt: "2025-11-22T10:30:00",
    };

    vi.mocked(userPreferenceApi.updateMyPreferences).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUpdateUserPreferences(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(updateData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(userPreferenceApi.updateMyPreferences).toHaveBeenCalledWith(updateData);
    expect(result.current.data).toEqual(mockResponse);
  });
});

describe("useDeleteUserPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete user preferences", async () => {
    vi.mocked(userPreferenceApi.deleteMyPreferences).mockResolvedValue();

    const { result } = renderHook(() => useDeleteUserPreferences(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(userPreferenceApi.deleteMyPreferences).toHaveBeenCalledTimes(1);
  });
});
