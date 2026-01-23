import React from "react";
import { Paper, Text, Stack, Button, Group } from "@mantine/core";
import { IconNotes, IconPlus } from "@tabler/icons-react";
import { t } from "@lingui/core/macro";

interface ContactNotesSectionProps {
  contactId: string;
}

/**
 * ContactNotesSection Component
 *
 * Placeholder component for contact notes functionality.
 * This would typically include:
 * - List of notes with timestamps and authors
 * - Add new note functionality
 * - Edit/delete existing notes
 * - Rich text editor for note content
 */
export const ContactNotesSection: React.FC<ContactNotesSectionProps> = ({
  contactId,
}) => {
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="lg" fw={600}>
          {t`Notes`}
        </Text>
        <Button leftSection={<IconPlus size={16} />} size="sm">
          {t`Add Note`}
        </Button>
      </Group>

      <Paper p="lg" withBorder>
        <Stack gap="md" align="center" py="xl">
          <IconNotes size={48} color="var(--mantine-color-gray-5)" />
          <Text c="dimmed" ta="center">
            {t`No notes yet for this contact.`}
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            {t`Add notes to keep track of important information and interactions.`}
          </Text>
          <Button leftSection={<IconPlus size={16} />} variant="light">
            {t`Add First Note`}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};
