import { Badge, MantineColor } from "@mantine/core";
import { LeadSource } from "@/shared/api/crm/types";

interface LeadSourceBadgeProps {
  source: LeadSource;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * LeadSourceBadge Component
 * 
 * Visual indicator for lead source/origin.
 * Helps sales reps understand where leads came from and adjust their approach.
 */
export const LeadSourceBadge = ({
  source,
  size = "xs",
}: LeadSourceBadgeProps) => {
  const config = sourceConfig[source] || {
    color: "gray",
    label: source,
  };

  return (
    <Badge color={config.color} variant="dot" size={size}>
      {config.label}
    </Badge>
  );
};

const sourceConfig: Record<LeadSource, { color: MantineColor; label: string }> =
  {
    WEBSITE: { color: "blue", label: "Website" },
    REFERRAL: { color: "green", label: "Referral" },
    COLD_CALL: { color: "cyan", label: "Cold Call" },
    EMAIL_CAMPAIGN: { color: "violet", label: "Email" },
    SOCIAL_MEDIA: { color: "pink", label: "Social" },
    TRADE_SHOW: { color: "orange", label: "Trade Show" },
    PARTNER: { color: "teal", label: "Partner" },
    OTHER: { color: "gray", label: "Other" },
  };
