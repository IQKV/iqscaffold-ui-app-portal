import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LeadSourceBadge } from "./LeadSourceBadge";
import { MantineProvider } from "@mantine/core";
import { LeadSource } from "@/shared/api/crm/types";

// Wrapper for Mantine components
const renderWithMantine = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe("LeadSourceBadge", () => {
  it("renders website source badge", () => {
    renderWithMantine(<LeadSourceBadge source="WEBSITE" />);
    
    const badge = screen.getByText(/Website/i);
    expect(badge).toBeInTheDocument();
  });

  it("renders referral source badge", () => {
    renderWithMantine(<LeadSourceBadge source="REFERRAL" />);
    
    const badge = screen.getByText(/Referral/i);
    expect(badge).toBeInTheDocument();
  });

  it("renders cold call source badge", () => {
    renderWithMantine(<LeadSourceBadge source="COLD_CALL" />);
    
    const badge = screen.getByText(/Cold Call/i);
    expect(badge).toBeInTheDocument();
  });

  it("renders email campaign source badge", () => {
    renderWithMantine(<LeadSourceBadge source="EMAIL_CAMPAIGN" />);
    
    const badge = screen.getByText(/Email/i);
    expect(badge).toBeInTheDocument();
  });

  it("renders social media source badge", () => {
    renderWithMantine(<LeadSourceBadge source="SOCIAL_MEDIA" />);
    
    const badge = screen.getByText(/Social/i);
    expect(badge).toBeInTheDocument();
  });

  it("renders trade show source badge", () => {
    renderWithMantine(<LeadSourceBadge source="TRADE_SHOW" />);
    
    const badge = screen.getByText(/Trade Show/i);
    expect(badge).toBeInTheDocument();
  });

  it("renders partner source badge", () => {
    renderWithMantine(<LeadSourceBadge source="PARTNER" />);
    
    const badge = screen.getByText(/Partner/i);
    expect(badge).toBeInTheDocument();
  });

  it("renders other source badge", () => {
    renderWithMantine(<LeadSourceBadge source="OTHER" />);
    
    const badge = screen.getByText(/Other/i);
    expect(badge).toBeInTheDocument();
  });

  it("renders with custom size", () => {
    renderWithMantine(<LeadSourceBadge source="WEBSITE" size="md" />);
    
    const badge = screen.getByText(/Website/i);
    expect(badge).toBeInTheDocument();
  });
});
