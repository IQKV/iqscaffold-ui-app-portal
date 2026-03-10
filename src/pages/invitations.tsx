import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Text } from "@mantine/core";
import { t } from "@lingui/core/macro";
import { InvitationList, CreateInvitationModal } from "@/features/invitation-management";

export const Route = createFileRoute("/invitations")({
  component: InvitationsPage,
});

function InvitationsPage() {
  const [createModalOpened, setCreateModalOpened] = useState(false);

  return (
    <Container size="xl" py="xl">
      <Stack gap="md">
        <div>
          <Text size="sm" c="dimmed">
            {t`Manage invitations for your organization`}
          </Text>
        </div>

        <InvitationList onCreateInvitation={() => setCreateModalOpened(true)} />

        <CreateInvitationModal
          opened={createModalOpened}
          onClose={() => setCreateModalOpened(false)}
        />
      </Stack>
    </Container>
  );
}
