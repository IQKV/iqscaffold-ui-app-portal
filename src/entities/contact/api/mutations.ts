import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contactApi } from "@/shared/api/contact";
import type {
  CreateContactNoteRequest,
  UpdateContactNoteRequest,
} from "@/shared/api/contact/types";
import { contactKeys } from "./queries";

// Contact Note Mutations
export const useCreateContactNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contactId,
      data,
    }: {
      contactId: string | number;
      data: CreateContactNoteRequest;
    }) => contactApi.createContactNote(contactId, data),
    onSuccess: (_, variables) => {
      // Invalidate notes list
      queryClient.invalidateQueries({
        queryKey: contactKeys.notes(variables.contactId),
      });
      // Invalidate activities (note creation creates an activity)
      queryClient.invalidateQueries({
        queryKey: contactKeys.activities(variables.contactId),
      });
    },
  });
};

export const useUpdateContactNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contactId,
      noteId,
      data,
    }: {
      contactId: string | number;
      noteId: string | number;
      data: UpdateContactNoteRequest;
    }) => contactApi.updateContactNote(contactId, noteId, data),
    onSuccess: (_, variables) => {
      // Invalidate notes list
      queryClient.invalidateQueries({
        queryKey: contactKeys.notes(variables.contactId),
      });
      // Invalidate activities
      queryClient.invalidateQueries({
        queryKey: contactKeys.activities(variables.contactId),
      });
    },
  });
};

export const useDeleteContactNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contactId,
      noteId,
    }: {
      contactId: string | number;
      noteId: string | number;
    }) => contactApi.deleteContactNote(contactId, noteId),
    onSuccess: (_, variables) => {
      // Invalidate notes list
      queryClient.invalidateQueries({
        queryKey: contactKeys.notes(variables.contactId),
      });
      // Invalidate activities
      queryClient.invalidateQueries({
        queryKey: contactKeys.activities(variables.contactId),
      });
    },
  });
};
