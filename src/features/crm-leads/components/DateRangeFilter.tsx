import { Group, Button, Popover, Stack, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { t } from "@lingui/core/macro";
import { IconCalendar, IconX } from "@tabler/icons-react";
import { useState } from "react";
import type { DashboardStatsParams } from "@/shared/api/crm/types";

interface DateRangeFilterProps {
  value?: DashboardStatsParams;
  onChange: (value: DashboardStatsParams | undefined) => void;
}

/**
 * DateRangeFilter - Date range selection for dashboard filtering
 * 
 * Features:
 * - Date range picker with start and end dates
 * - Quick preset options (Last 7 days, Last 30 days, etc.)
 * - Clear filter option
 * 
 * Requirements: 7.5
 */
export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [opened, setOpened] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(
    value?.startDate ? new Date(value.startDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    value?.endDate ? new Date(value.endDate) : null
  );

  const handleStartDateChange = (value: string | Date | null) => {
    if (typeof value === 'string') {
      setStartDate(new Date(value));
    } else {
      setStartDate(value);
    }
  };

  const handleEndDateChange = (value: string | Date | null) => {
    if (typeof value === 'string') {
      setEndDate(new Date(value));
    } else {
      setEndDate(value);
    }
  };

  const handleApply = () => {
    if (startDate && endDate) {
      onChange({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });
      setOpened(false);
    }
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onChange(undefined);
    setOpened(false);
  };

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start);
    setEndDate(end);
    
    onChange({
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    });
    setOpened(false);
  };

  const hasDateRange = value?.startDate && value?.endDate;

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-end" withArrow>
      <Popover.Target>
        <Button
          leftSection={<IconCalendar size={16} />}
          rightSection={hasDateRange ? <IconX size={14} /> : undefined}
          variant={hasDateRange ? "filled" : "light"}
          onClick={() => setOpened(!opened)}
          data-testid="date-range-filter-button"
        >
          {hasDateRange
            ? `${value.startDate} - ${value.endDate}`
            : t`Select Date Range`}
        </Button>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap="md" style={{ minWidth: 300 }}>
          <Text size="sm" fw={600}>
            {t`Filter by Date Range`}
          </Text>

          {/* Quick presets */}
          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              {t`Quick Select`}
            </Text>
            <Group gap="xs">
              <Button size="xs" variant="light" onClick={() => handlePreset(7)}>
                {t`Last 7 days`}
              </Button>
              <Button size="xs" variant="light" onClick={() => handlePreset(30)}>
                {t`Last 30 days`}
              </Button>
              <Button size="xs" variant="light" onClick={() => handlePreset(90)}>
                {t`Last 90 days`}
              </Button>
            </Group>
          </Stack>

          {/* Custom date range */}
          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              {t`Custom Range`}
            </Text>
            <DateInput
              label={t`Start Date`}
              placeholder={t`Pick start date`}
              value={startDate}
              onChange={handleStartDateChange}
              maxDate={endDate || new Date()}
              size="sm"
            />
            <DateInput
              label={t`End Date`}
              placeholder={t`Pick end date`}
              value={endDate}
              onChange={handleEndDateChange}
              minDate={startDate || undefined}
              maxDate={new Date()}
              size="sm"
            />
          </Stack>

          {/* Actions */}
          <Group justify="space-between">
            <Button
              size="sm"
              variant="subtle"
              color="gray"
              onClick={handleClear}
              leftSection={<IconX size={14} />}
            >
              {t`Clear`}
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!startDate || !endDate}
            >
              {t`Apply`}
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
