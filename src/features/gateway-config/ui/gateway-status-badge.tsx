import { Badge } from "@mantine/core";
import { IconCheck, IconX, IconStar } from "@tabler/icons-react";
import { t } from "@lingui/macro";

interface GatewayStatusBadgeProps {
  isActive: boolean;
  isPrimary?: boolean;
}

export const GatewayStatusBadge = ({
  isActive,
  isPrimary = false,
}: GatewayStatusBadgeProps) => {
  if (isPrimary) {
    return (
      <Badge color="blue" leftSection={<IconStar size={12} />} variant="filled">
        {t`Primary`}
      </Badge>
    );
  }

  return (
    <Badge
      color={isActive ? "green" : "gray"}
      leftSection={isActive ? <IconCheck size={12} /> : <IconX size={12} />}
      variant={isActive ? "light" : "outline"}
    >
      {isActive ? t`Active` : t`Inactive`}
    </Badge>
  );
};
