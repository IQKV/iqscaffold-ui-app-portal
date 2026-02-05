import React, { useState } from "react";
import {
  Stack,
  Paper,
  Text,
  Group,
  Button,
  Textarea,
  ActionIcon,
  Tooltip,
  Alert,
  Loader,
  Center,
  Box,
} from "@mantine/core";
import { IconEdit, IconTrash, IconCheck, IconX } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { t } from "@lingui/macro";
import {
  useLeadNotes,
  useCreateLeadNote,
  useUpdateLeadNote,
  useDeleteLeadNote,
} from "@/entities/crm";
import { LeadNote } from "@/shared/api/crm/types";

interface LeadNotesSectionProps {
  leadId: string;
}

/**
 * LeadNotesSection Component
 *
 * Displays and manages notes for a specific lead with:
 * - Notes sorted by creation date descending
 * - Inline editing and deletion with confirmation
 * - Note creation with rich text support
 *
 * Requirements: 4.2, 4.4, 4.5, 4.6, 4.7
 */
export const LeadNotesSection: React.FC<LeadNotesSectionProps> = ({
  leadId,
}) => {
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Fetch notes
  const { data: notes, isLoading, error } = useLeadNotes(leadId);

  // Mutations
  const createNote = useCreateLeadNote();
  const updateNote = useUpdateLeadNote();
  const deleteNote = useDeleteLeadNote();

  // Handle create note
  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Note content cannot be empty",
        color: "red",
      });
      return;
    }

    try {
      await createNote.mutateAsync({
        leadId,
        data: { content: newNoteContent },
      });

      notifications.show({
        title: "Success",
        message: "Note created successfully",
        color: "green",
      });

      setNewNoteContent("");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to create note",
        color: "red",
      });
    }
  };

  // Handle start editing
  const handleStartEdit = (note: LeadNote) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent("");
  };

  // Handle save edit
  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Note content cannot be empty",
        color: "red",
      });
      return;
    }

    try {
      await updateNote.mutateAsync({
        leadId,
        noteId,
        data: { content: editContent },
      });

      notifications.show({
        title: "Success",
        message: "Note updated successfully",
        color: "green",
      });

      setEditingNoteId(null);
      setEditContent("");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update note",
        color: "red",
      });
    }
  };

  // Handle delete note with confirmation
  const handleDeleteNote = (noteId: string) => {
    modals.openConfirmModal({
      title: "Delete Note",
      children: (
        <Text size="sm">
          Are you sure you want to delete this note? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteNote.mutateAsync({ leadId, noteId });

          notifications.show({
            title: "Success",
            message: "Note deleted successfully",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Error",
            message: "Failed to delete note",
            color: "red",
          });
        }
      },
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert color="red" title={t`Error loading notes`}>
        {t`Failed to load notes. Please try again.`}
      </Alert>
    );
  }

  // Sort notes by creation date descending
  const sortedNotes = [...(notes || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Stack gap="md">
      {/* Create new note */}
      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Text fw={500}>{t`Add Note`}</Text>
          <Textarea
            placeholder={t`Enter note content...`}
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.currentTarget.value)}
            minRows={3}
            autosize
          />
          <Group justify="flex-end">
            <Button
              onClick={handleCreateNote}
              loading={createNote.isPending}
              disabled={!newNoteContent.trim()}
            >
              Add Note
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Notes list */}
      {sortedNotes.length === 0 ? (
        <Paper p="xl" withBorder>
          <Center>
            <Text c="dimmed">No notes yet. Add your first note above.</Text>
          </Center>
        </Paper>
      ) : (
        <Stack gap="md">
          {sortedNotes.map((note) => (
            <Paper key={note.id} p="md" withBorder>
              {editingNoteId === note.id ? (
                // Edit mode
                <Stack gap="sm">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.currentTarget.value)}
                    minRows={3}
                    autosize
                  />
                  <Group justify="flex-end">
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={handleCancelEdit}
                      leftSection={<IconX size={14} />}
                    >
                      {t`Cancel`}
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => handleSaveEdit(note.id)}
                      loading={updateNote.isPending}
                      leftSection={<IconCheck size={14} />}
                    >
                      {t`Save`}
                    </Button>
                  </Group>
                </Stack>
              ) : (
                // View mode
                <Stack gap="xs">
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={500}>
                        {note.createdByName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDate(note.createdAt)}
                        {note.updatedAt !== note.createdAt && t` (edited)`}
                      </Text>
                    </div>
                    <Group gap="xs">
                      <Tooltip label={t`Edit note`}>
                        <ActionIcon
                          variant="subtle"
                          onClick={() => handleStartEdit(note)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={t`Delete note`}>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                  <Box>
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {note.content}
                    </Text>
                  </Box>
                </Stack>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
