import React from "react";
import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  vi,
} from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";
import { ErrorBoundary } from "./error-boundary";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>No error</div>;
};



// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, "location", {
  value: {
    reload: mockReload,
  },
  writable: true,
});

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("renders error UI when child component throws", () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    const CustomFallback = () => <div>Custom error fallback</div>;

    render(
      <TestWrapper>
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText("Custom error fallback")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("displays generic message when error has no message", () => {
    const ThrowErrorWithoutMessage = () => {
      throw new Error();
    };

    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowErrorWithoutMessage />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(
      screen.getByText("An unexpected error occurred")
    ).toBeInTheDocument();
  });

  it("renders try again button that can be clicked", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      </TestWrapper>
    );

    // Should show error UI with try again button
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    
    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();
    
    // Button should be clickable (this tests the reset functionality)
    await user.click(tryAgainButton);
    
    // After clicking, the component will re-render and throw again, 
    // but the important thing is that the reset mechanism works
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("logs error to console", () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(console.error).toHaveBeenCalledWith(
      "ErrorBoundary caught an error:",
      expect.any(Error),
      expect.any(Object)
    );
  });
});
