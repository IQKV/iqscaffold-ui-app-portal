/**
 * Quick Theme Switcher Component
 * A simple component to quickly switch between themes
 */

import { SegmentedControl } from "@mantine/core";
import { IconSun, IconMoon, IconDeviceDesktop } from "@tabler/icons-react";
import {
  useUserPreferences,
  useUpdateUserPreferences,
  type ThemeOption,
} from "@/entities/user";

export function QuickThemeSwitcher() {
  const { data: preferences } = useUserPreferences();
  const updateMutation = useUpdateUserPreferences();

  const handleThemeChange = (value: string) => {
    updateMutation.mutate({ theme: value as ThemeOption });
  };

  return (
    <SegmentedControl
      value={preferences?.theme || "light"}
      onChange={handleThemeChange}
      data={[
        {
          value: "light",
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconSun size={16} />
              <span>Light</span>
            </div>
          ),
        },
        {
          value: "dark",
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconMoon size={16} />
              <span>Dark</span>
            </div>
          ),
        },
        {
          value: "auto",
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconDeviceDesktop size={16} />
              <span>Auto</span>
            </div>
          ),
        },
      ]}
      disabled={updateMutation.isPending}
    />
  );
}
