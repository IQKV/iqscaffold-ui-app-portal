import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LeadScoreBadge } from "./LeadScoreBadge";
import { MantineProvider } from "@mantine/core";

// Wrapper for Mantine components
const renderWithMantine = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe("LeadScoreBadge", () => {
  it("renders high quality badge for score >= 80", () => {
    renderWithMantine(<LeadScoreBadge score={85} />);

    const badge = screen.getByText(/Score: 85/i);
    expect(badge).toBeInTheDocument();
  });

  it("renders medium quality badge for score 50-79", () => {
    renderWithMantine(<LeadScoreBadge score={65} />);

    const badge = screen.getByText(/Score: 65/i);
    expect(badge).toBeInTheDocument();
  });

  it("renders low quality badge for score < 50", () => {
    renderWithMantine(<LeadScoreBadge score={30} />);

    const badge = screen.getByText(/Score: 30/i);
    expect(badge).toBeInTheDocument();
  });

  it("renders with custom size", () => {
    renderWithMantine(<LeadScoreBadge score={75} size="lg" />);

    const badge = screen.getByText(/Score: 75/i);
    expect(badge).toBeInTheDocument();
  });

  it("displays score of 0", () => {
    renderWithMantine(<LeadScoreBadge score={0} />);

    const badge = screen.getByText(/Score: 0/i);
    expect(badge).toBeInTheDocument();
  });

  it("displays score of 100", () => {
    renderWithMantine(<LeadScoreBadge score={100} />);

    const badge = screen.getByText(/Score: 100/i);
    expect(badge).toBeInTheDocument();
  });
});
