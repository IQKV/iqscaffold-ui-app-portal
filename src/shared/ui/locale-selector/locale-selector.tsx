import React from "react";
import { Select, Group, Text, ActionIcon, Tooltip } from "@mantine/core";
import { IconLanguage, IconCheck } from "@tabler/icons-react";
import { Trans, msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { useLocale } from "@/shared/lib/i18n/locale-provider";

interface LocaleSelectorProps {
  variant?: "select" | "menu";
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  disabled?: boolean;
}

const LOCALE_OPTIONS = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "ja", label: "日本語", flag: "🇯🇵" },
];

export const LocaleSelector: React.FC<LocaleSelectorProps> = ({
  variant = "select",
  size = "sm",
  showLabel = false,
  disabled = false,
}) => {
  const { _ } = useLingui();
  const { locale, setLocale, isLoading, getLocaleDisplayName } = useLocale();

  const handleLocaleChange = async (value: string | null) => {
    if (value && value !== locale) {
      await setLocale(value);
    }
  };

  const currentLocaleOption = LOCALE_OPTIONS.find(
    (option) => option.value === locale
  );

  if (variant === "menu") {
    return (
      <Tooltip label={_(msg`Change Language`)}>
        <ActionIcon
          variant="subtle"
          size={size}
          disabled={disabled || isLoading}
          onClick={() => {
            // This would open a menu - for now just cycle through locales
            const currentIndex = LOCALE_OPTIONS.findIndex(
              (opt) => opt.value === locale
            );
            const nextIndex = (currentIndex + 1) % LOCALE_OPTIONS.length;
            handleLocaleChange(LOCALE_OPTIONS[nextIndex].value);
          }}
        >
          <IconLanguage size={16} />
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <Group gap="xs" align="center">
      {showLabel && (
        <Text size="sm" c="dimmed">
          <Trans>Language:</Trans>
        </Text>
      )}

      <Select
        value={locale}
        onChange={handleLocaleChange}
        data={LOCALE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        size={size}
        disabled={disabled || isLoading}
        leftSection={<IconLanguage size={16} />}
        rightSection={isLoading ? undefined : <IconCheck size={14} />}
        renderOption={({ option, checked }) => {
          const localeOption = LOCALE_OPTIONS.find(
            (opt) => opt.value === option.value
          );
          return (
            <Group gap="sm" wrap="nowrap">
              <Text size="lg">{localeOption?.flag}</Text>
              <div>
                <Text size="sm">{option.label}</Text>
                <Text size="xs" c="dimmed">
                  {getLocaleDisplayName(option.value)}
                </Text>
              </div>
              {checked && <IconCheck size={16} />}
            </Group>
          );
        }}
        comboboxProps={{
          transitionProps: { duration: 200, transition: "pop" },
        }}
        placeholder={_(msg`Select language`)}
        searchable={false}
        clearable={false}
        allowDeselect={false}
      />
    </Group>
  );
};
