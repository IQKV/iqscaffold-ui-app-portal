import { Group, Button, Popover, Stack, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { t } from "@lingui/core/macro";
import { IconCalendar, IconX } from "@tabler/icons-react";
import { useState } from "react";
import type { DashboardStatsParams } from "@/shared/api/crm/types";

interface DateRangeFilterProps {
  value?: DashboardStatsParams;
  onChange: (value: DashboardStatsParams | undefined) => void;
  isMobile?: boolean;
}

/**
 * DateRangeFilter - Date range selection for dashboard filtering
 *
 * Features:
 * - Date range picker with start and end dates
 * - Quick preset options (Last 7 days, Last 30 days, etc.)
 * - Clear filter option
 * - Touch-friendly date selection for mobile
 * - Responsive popover positioning
 *
 * Requirements: 7.5, 12.5
 */
export function DateRangeFilter({ value, onChange, isMobile = false }: DateRangeFilterProps) {
  const [opened, setOpened] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(
    value?.startDate ? new Date(value.startDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    value?.endDate ? new Date(value.endDate) : null
  );

  const handleStartDateChange = (value: string | Date | null) => {
    if (typeof value === "string") {
      setStartDate(new Date(value));
    } else {
      setStartDate(value);
    }
  };

  const handleEndDateChange = (value: string | Date | null) => {
    if (typeof value === "string") {
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
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      withArrow
      width={isMobile ? "90vw" : "auto"}
    >
      <Popover.Target>
        <Button
          leftSection={<IconCalendar size={isMobile ? 14 : 16} />}
          rightSection={hasDateRange ? <IconX size={isMobile ? 12 : 14} /> : undefined}
          variant={hasDateRange ? "filled" : "light"}
          onClick={() => setOpened(!opened)}
          data-testid="date-range-filter-button"
          size={isMobile ? "xs" : "sm"}
          fullWidth={isMobile}
        >
          {hasDateRange
            ? isMobile 
              ? t`Date Range`
              : `${value.startDate} - ${value.endDate}`
            : isMobile
            ? t`Filter`
            : t`Select Date Range`}
        </Button>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap={isMobile ? "sm" : "md"} style={{ minWidth: isMobile ? "auto" : 300 }}>
          <Text size="sm" fw={600}>
            {t`Filter by Date Range`}
          </Text>

          {/* Quick presets */}
          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              {t`Quick Select`}
            </Text>
            <Group gap="xs" wrap={isMobile ? "wrap" : "nowrap"}>
              <Button 
                size="xs" 
                variant="light" 
                onClick={() => handlePreset(7)}
                fullWidth={isMobile}
              >
                {t`Last 7 days`}
              </Button>
              <Button
                size="xs"
                variant="light"
                onClick={() => handlePreset(30)}
                fullWidth={isMobile}
              >
                {t`Last 30 days`}
              </Button>
              <Button
                size="xs"
                variant="light"
                onClick={() => handlePreset(90)}
                fullWidth={isMobile}
              >
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
              styles={{
                input: {
                  fontSize: isMobile ? "14px" : "16px",
                  minHeight: isMobile ? "40px" : "36px",
                },
              }}
            />
            <DateInput
              label={t`End Date`}
              placeholder={t`Pick end date`}
              value={endDate}
              onChange={handleEndDateChange}
              minDate={startDate || undefined}
              maxDate={new Date()}
              size="sm"
              styles={{
                input: {
                  fontSize: isMobile ? "14px" : "16px",
                  minHeight: isMobile ? "40px" : "36px",
                },
              }}
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
              fullWidth={isMobile}
            >
              {t`Clear`}
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!startDate || !endDate}
              fullWidth={isMobile}
            >
              {t`Apply`}
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
