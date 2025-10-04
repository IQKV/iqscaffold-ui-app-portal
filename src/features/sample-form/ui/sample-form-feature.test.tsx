import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { SampleFormFeature } from "./sample-form-feature";

// Mock the form mutation hook
vi.mock("@/shared/lib", () => ({
  ...vi.importActual("@/shared/lib"),
  useFormMutation: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <ModalsProvider>
          <Notifications />
          {children}
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
};

describe("SampleFormFeature", () => {
  const mockMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useFormMutation } = await import("@/shared/lib");
    (useFormMutation as any).mockReturnValue(mockMutation);
  });

  it("renders the feature card with title and description", () => {
    render(<SampleFormFeature />, { wrapper: createWrapper() });

    expect(screen.getByText("Sample Form Feature")).toBeInTheDocument();
    expect(
      screen.getByText(/Click the plus button to open a modal/)
    ).toBeInTheDocument();
  });

  it("opens modal when plus button is clicked", async () => {
    const user = userEvent.setup();
    render(<SampleFormFeature />, { wrapper: createWrapper() });

    const plusButton = screen.getByRole("button");
    await user.click(plusButton);

    await waitFor(() => {
      expect(screen.getByText("Sample Form")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("validates form fields correctly", async () => {
    const user = userEvent.setup();
    render(<SampleFormFeature />, { wrapper: createWrapper() });

    // Open modal
    const plusButton = screen.getByRole("button");
    await user.click(plusButton);

    await waitFor(() => {
      expect(screen.getByText("Sample Form")).toBeInTheDocument();
    });

    // Fill name field with invalid data (too short)
    const nameInput = screen.getByLabelText("Name");
    await user.type(nameInput, "A");

    // Try to submit
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);

    // Check that the form validation prevents submission
    expect(mockMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it("validates email field correctly", async () => {
    const user = userEvent.setup();
    render(<SampleFormFeature />, { wrapper: createWrapper() });

    // Open modal
    const plusButton = screen.getByRole("button");
    await user.click(plusButton);

    await waitFor(() => {
      expect(screen.getByText("Sample Form")).toBeInTheDocument();
    });

    // Fill name field correctly
    const nameInput = screen.getByLabelText("Name");
    await user.type(nameInput, "John Doe");

    // Fill email field incorrectly
    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "invalid-email");

    // Try to submit
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);

    // Check that the form validation prevents submission
    expect(mockMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    mockMutation.mutateAsync.mockResolvedValue(undefined);

    render(<SampleFormFeature />, { wrapper: createWrapper() });

    // Open modal
    const plusButton = screen.getByRole("button");
    await user.click(plusButton);

    await waitFor(() => {
      expect(screen.getByText("Sample Form")).toBeInTheDocument();
    });

    // Fill form with valid data
    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");

    // Submit form
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
      });
    });
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    mockMutation.isPending = true;

    render(<SampleFormFeature />, { wrapper: createWrapper() });

    // Open modal
    const plusButton = screen.getByRole("button");
    await user.click(plusButton);

    await waitFor(() => {
      expect(screen.getByText("Sample Form")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it("closes modal when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<SampleFormFeature />, { wrapper: createWrapper() });

    // Open modal
    const plusButton = screen.getByRole("button");
    await user.click(plusButton);

    await waitFor(() => {
      expect(screen.getByText("Sample Form")).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText("Sample Form")).not.toBeInTheDocument();
    });
  });
});
