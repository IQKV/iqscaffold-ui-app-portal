import { Badge, MantineColor, Tooltip } from "@mantine/core";

interface LeadScoreBadgeProps {
  score: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * LeadScoreBadge Component
 * 
 * Visual indicator for lead quality based on qualification score (0-100).
 * Color coding helps sales reps quickly identify high-value prospects.
 * 
 * Score ranges:
 * - 80-100: High quality (Green) - Hot leads, immediate attention
 * - 50-79: Medium quality (Blue) - Warm leads, good potential
 * - 0-49: Low quality (Orange) - Cold leads, needs nurturing
 */
export const LeadScoreBadge = ({ score, size = "xs" }: LeadScoreBadgeProps) => {
  const config = getScoreConfig(score);

  return (
    <Tooltip label={config.tooltip}>
      <Badge color={config.color} variant="light" size={size}>
        Score: {score}
      </Badge>
    </Tooltip>
  );
};

interface ScoreConfig {
  color: MantineColor;
  label: string;
  tooltip: string;
}

function getScoreConfig(score: number): ScoreConfig {
  if (score >= 80) {
    return {
      color: "green",
      label: "High",
      tooltip: "High quality lead - immediate attention recommended",
    };
  }
  
  if (score >= 50) {
    return {
      color: "blue",
      label: "Medium",
      tooltip: "Medium quality lead - good potential",
    };
  }
  
  return {
    color: "orange",
    label: "Low",
    tooltip: "Low quality lead - needs nurturing",
  };
}
