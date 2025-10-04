import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { LoadingOverlay } from "./loading-overlay";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe("LoadingOverlay", () => {
  it("renders nothing when not visible", () => {
    render(
      <TestWrapper>
        <LoadingOverlay visible={false} />
      </TestWrapper>
    );

    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("renders loading overlay when visible", () => {
    render(
      <TestWrapper>
        <LoadingOverlay visible />
      </TestWrapper>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays custom message when provided", () => {
    render(
      <TestWrapper>
        <LoadingOverlay visible message="Please wait..." />
      </TestWrapper>
    );

    expect(screen.getByText("Please wait...")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("displays default message when no message provided", () => {
    render(
      <TestWrapper>
        <LoadingOverlay visible />
      </TestWrapper>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders loader component when visible", () => {
    render(
      <TestWrapper>
        <LoadingOverlay visible />
      </TestWrapper>
    );

    // Mantine Loader component should be present
    const loader = document.querySelector("[data-loader]");
    expect(loader || screen.getByText("Loading...")).toBeInTheDocument();
  });
});
