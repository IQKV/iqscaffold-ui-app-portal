import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFormMutation } from "./use-form-mutation";
import { notificationService } from "./notifications";

// Mock dependencies
vi.mock("./notifications", () => ({
  notificationService: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("./http-error", () => ({
  normalizeAxiosError: vi.fn((error) => error),
  toMantineErrors: vi.fn(() => ({})),
  getErrorMessage: vi.fn((error, fallback) => error?.message || fallback),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useFormMutation", () => {
  const mockMutationFn = vi.fn();
  const mockForm = {
    setErrors: vi.fn(),
    getInputProps: vi.fn(),
    values: {},
    errors: {},
    reset: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears form errors on successful mutation", async () => {
    mockMutationFn.mockResolvedValue("success");

    const { result } = renderHook(
      () => useFormMutation(mockForm, mockMutationFn),
      { wrapper: createWrapper() }
    );

    result.current.mutate("test data");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockForm.setErrors).toHaveBeenCalledWith({});
  });

  it("shows success notification when configured", async () => {
    mockMutationFn.mockResolvedValue("success");

    const { result } = renderHook(
      () =>
        useFormMutation(mockForm, mockMutationFn, {
          notifySuccess: {
            title: "Success!",
            message: "Operation completed",
          },
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate("test data");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(notificationService.success).toHaveBeenCalledWith({
      title: "Success!",
      message: "Operation completed",
    });
  });

  it("does not show success notification when disabled", async () => {
    mockMutationFn.mockResolvedValue("success");

    const { result } = renderHook(
      () =>
        useFormMutation(mockForm, mockMutationFn, {
          notifySuccess: false,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate("test data");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(notificationService.success).not.toHaveBeenCalled();
  });

  it("shows error notification on mutation failure", async () => {
    const error = new Error("Test error");
    mockMutationFn.mockRejectedValue(error);

    const { result } = renderHook(
      () =>
        useFormMutation(mockForm, mockMutationFn, {
          notifyError: {
            title: "Error!",
            fallback: "Something went wrong",
          },
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate("test data");

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(notificationService.error).toHaveBeenCalledWith({
      title: "Error!",
      message: "Test error",
    });
  });

  it("does not show error notification when disabled", async () => {
    const error = new Error("Test error");
    mockMutationFn.mockRejectedValue(error);

    const { result } = renderHook(
      () =>
        useFormMutation(mockForm, mockMutationFn, {
          notifyError: false,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate("test data");

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(notificationService.error).not.toHaveBeenCalled();
  });

  it("calls custom onSuccess callback", async () => {
    const onSuccess = vi.fn();
    mockMutationFn.mockResolvedValue("success");

    const { result } = renderHook(
      () =>
        useFormMutation(mockForm, mockMutationFn, {
          onSuccess,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate("test data");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith("success", "test data", undefined);
  });

  it("calls custom onError callback", async () => {
    const onError = vi.fn();
    const error = new Error("Test error");
    mockMutationFn.mockRejectedValue(error);

    const { result } = renderHook(
      () =>
        useFormMutation(mockForm, mockMutationFn, {
          onError,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate("test data");

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error, "test data", undefined);
  });

  it("maps field errors using custom mapField function", async () => {
    const { toMantineErrors } = await import("./http-error");
    (toMantineErrors as any).mockReturnValue({ email: "Invalid email" });

    const mapField = vi.fn((errors) => ({ userEmail: errors.email }));
    const error = new Error("Validation error");
    mockMutationFn.mockRejectedValue(error);

    const { result } = renderHook(
      () =>
        useFormMutation(mockForm, mockMutationFn, {
          mapField,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate("test data");

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mapField).toHaveBeenCalledWith({ email: "Invalid email" });
    expect(mockForm.setErrors).toHaveBeenCalledWith({
      userEmail: "Invalid email",
    });
  });
});
