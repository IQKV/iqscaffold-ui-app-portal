import { Select } from "@mantine/core";
import { IconBuilding } from "@tabler/icons-react";
import { useTenantStore } from "@/processes/tenant";
import { useEffect, useMemo, type ReactNode } from "react";
import { t } from "@lingui/core/macro";

export interface TenantSelectProps {
  /** Current selected tenant ID */
  value?: string | null;
  /** Callback when tenant is selected */
  onChange?: (tenantId: string | null) => void;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether the select is required */
  required?: boolean;
  /** Error message to display */
  error?: ReactNode;
  /** Test ID for testing */
  "data-testid"?: string;
}

/**
 * Tenant/Organization selector widget
 * Fetches and displays all available tenants from the backend
 */
export function TenantSelect({
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  "data-testid": dataTestId = "tenant-select",
}: TenantSelectProps) {
  const { availableTenants, fetchAvailableTenants, isLoading } = useTenantStore();

  // Fetch tenants on mount
  useEffect(() => {
    if (!availableTenants) {
      fetchAvailableTenants();
    }
  }, [availableTenants, fetchAvailableTenants]);

  // Convert tenant map to Select options format
  const options = useMemo(() => {
    if (!availableTenants) {
      return [];
    }

    return Object.entries(availableTenants).map(([tenantId, organizationName]) => ({
      value: tenantId,
      label: organizationName,
    }));
  }, [availableTenants]);

  return (
    <Select
      label={t`Organization`}
      placeholder={isLoading ? t`Loading organizations...` : t`Select an organization`}
      data={options}
      value={value}
      onChange={onChange}
      disabled={disabled || isLoading}
      required={required}
      error={error}
      leftSection={<IconBuilding size={16} />}
      searchable
      clearable={!required}
      data-testid={dataTestId}
      comboboxProps={{ shadow: "md" }}
    />
  );
}
