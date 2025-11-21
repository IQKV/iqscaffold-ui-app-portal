import { ActionIcon, useMantineColorScheme, Tooltip } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { t } from "@lingui/core/macro";

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <Tooltip label={dark ? t`Light mode` : t`Dark mode`}>
      <ActionIcon
        variant="subtle"
        color={dark ? "yellow" : "blue"}
        onClick={() => toggleColorScheme()}
        size="lg"
        aria-label={dark ? t`Switch to light mode` : t`Switch to dark mode`}
      >
        {dark ? <IconSun size={20} /> : <IconMoon size={20} />}
      </ActionIcon>
    </Tooltip>
  );
}
