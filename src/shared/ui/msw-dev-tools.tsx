import { useState } from "react";
import {
  Button,
  Card,
  Group,
  Switch,
  Select,
  NumberInput,
  Text,
  Stack,
  Badge,
  Collapse,
  ActionIcon,
} from "@mantine/core";
import { IconSettings, IconBug, IconBugOff } from "@tabler/icons-react";
import { useMSWControl } from "@/shared/lib/use-msw-control";
import { t } from "@lingui/core/macro";

/**
 * Development tools for MSW control
 * Only renders in development mode
 */
export function MSWDevTools() {
  const [opened, setOpened] = useState(false);
  const { config, isRunning, toggleMSW, setLogging, setDelay, setUnhandledRequestBehavior } =
    useMSWControl();

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 1000,
        minWidth: 300,
      }}
    >
      <Group justify="space-between" mb="xs">
        <Group>
          <Text fw={500}>{t`MSW Dev Tools`}</Text>
          <Badge color={isRunning ? "green" : "gray"} size="sm">
            {isRunning ? t`Running` : t`Stopped`}
          </Badge>
        </Group>
        <ActionIcon
          variant="subtle"
          onClick={() => setOpened(!opened)}
          aria-label={t`Toggle MSW settings`}
        >
          <IconSettings size={16} />
        </ActionIcon>
      </Group>

      <Group mb="md">
        <Button
          leftSection={isRunning ? <IconBugOff size={16} /> : <IconBug size={16} />}
          variant={isRunning ? "filled" : "outline"}
          color={isRunning ? "red" : "blue"}
          onClick={toggleMSW}
          size="sm"
        >
          {isRunning ? t`Disable MSW` : t`Enable MSW`}
        </Button>
      </Group>

      <Collapse in={opened}>
        <Stack gap="md">
          <Switch
            label={t`Enable logging`}
            description={t`Log MSW requests to console`}
            checked={config.enableLogging}
            onChange={(event) => setLogging(event.currentTarget.checked)}
          />

          <Select
            label={t`Unhandled requests`}
            description={t`How to handle requests without mocks`}
            value={config.onUnhandledRequest}
            onChange={(value) => setUnhandledRequestBehavior(value as "bypass" | "warn" | "error")}
            data={[
              { value: "bypass", label: t`Bypass (allow through)` },
              { value: "warn", label: t`Warn (log warning)` },
              { value: "error", label: t`Error (throw error)` },
            ]}
          />

          <NumberInput
            label={t`Response delay (ms)`}
            description={t`Simulate network latency`}
            value={
              typeof config.delay === "object"
                ? config.delay.min
                : typeof config.delay === "number"
                  ? config.delay
                  : 0
            }
            onChange={(value) => {
              if (typeof value === "number") {
                setDelay(value > 0 ? value : undefined);
              }
            }}
            min={0}
            max={5000}
            step={100}
          />

          <Text size="xs" c="dimmed">
            {t`Changes take effect immediately. MSW will intercept API calls when enabled.`}
          </Text>
        </Stack>
      </Collapse>
    </Card>
  );
}
