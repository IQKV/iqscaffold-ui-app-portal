import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestWrapper } from "@/shared/lib/test-utils";
import { DashboardFeature } from "./dashboard-feature";

describe("DashboardFeature", () => {
  it("renders dashboard title", () => {
    render(<DashboardFeature />, { wrapper: TestWrapper });
    expect(screen.getByTestId("dashboard-feature-title")).toBeInTheDocument();
  });

  it("renders stats grid", () => {
    render(<DashboardFeature />, { wrapper: TestWrapper });
    expect(screen.getByTestId("dashboard-stats-grid")).toBeInTheDocument();
  });

  it("renders all stat cards", () => {
    render(<DashboardFeature />, { wrapper: TestWrapper });

    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("Growth")).toBeInTheDocument();
  });

  it("displays stat values", () => {
    render(<DashboardFeature />, { wrapper: TestWrapper });

    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("567")).toBeInTheDocument();
    expect(screen.getByText("$12,345")).toBeInTheDocument();
    expect(screen.getByText("23%")).toBeInTheDocument();
  });
});
