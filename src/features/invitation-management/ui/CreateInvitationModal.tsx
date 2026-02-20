import { useState } from "react";
import {
  Modal,
  Button,
  Stack,
  Select,
  TextInput,
  NumberInput,
  Group,
  Text,
  Paper,
  CopyButton,
  ActionIcon,
  Tooltip,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconCopy, IconAlertCircle } from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import {
  useCreateInvitation,
  useInvitationLink,
} from "@/shared/lib/use-invitation-api";
import {
  InvitationType,
  type CreateInvitationRequest,
  type OrganizationInvitationDto,
} from "@/shared/api/invitation-api";

interface CreateInvitationModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateInvitationModal({
  opened,
  onClose,
}: CreateInvitationModalProps) {
  const [createdInvitation, setCreatedInvitation] =
    useState<OrganizationInvitationDto | null>(null);

  const createInvitationMutation = useCreateInvitation();

  const form = useForm<CreateInvitationRequest>({
    initialValues: {
      type: InvitationType.EMAIL,
      inviteeEmail: "",
      authority: "USER",
      expirationHours: 168, // 7 days default
      maxUses: undefined,
      customMessage: "",
    },
    validate: {
      inviteeEmail: (value, values) =>
        values.type === InvitationType.EMAIL && !value
          ? t`Email is required for email invitations`
          : null,
      expirationHours: (value) =>
        value < 1 || value > 720
          ? t`Expiration must be between 1 and 720 hours`
          : null,
      maxUses: (value, values) =>
        values.type === InvitationType.LINK && value !== undefined && value < 1
          ? t`Max uses must be at least 1`
          : null,
    },
  });

  const handleSubmit = (values: CreateInvitationRequest) => {
    // Clean up the request based on invitation type
    const request: CreateInvitationRequest = {
      type: values.type,
      authority: values.authority || "USER",
      expirationHours: values.expirationHours,
    };

    if (values.type === InvitationType.EMAIL) {
      request.inviteeEmail = values.inviteeEmail;
    }

    if (values.type === InvitationType.LINK && values.maxUses) {
      request.maxUses = values.maxUses;
    }

    if (values.customMessage) {
      request.customMessage = values.customMessage;
    }

    createInvitationMutation.mutate(request, {
      onSuccess: (data) => {
        setCreatedInvitation(data);
      },
    });
  };

  const handleClose = () => {
    form.reset();
    setCreatedInvitation(null);
    onClose();
  };

  const InvitationLinkDisplay = ({
    invitationId,
  }: {
    invitationId: number;
  }) => {
    const { data: linkData, isLoading } = useInvitationLink(invitationId);

    if (isLoading) {
      return <Text size="sm">{t`Loading invitation link...`}</Text>;
    }

    if (!linkData) {
      return null;
    }

    return (
      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Text size="sm" fw={500}>
            {t`Invitation Link`}
          </Text>
          <Group gap="xs">
            <TextInput
              value={linkData.fullUrl}
              readOnly
              style={{ flex: 1 }}
              data-testid="invitation-link-input"
            />
            <CopyButton value={linkData.fullUrl}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? t`Copied!` : t`Copy link`}>
                  <ActionIcon
                    color={copied ? "teal" : "blue"}
                    onClick={copy}
                    data-testid="btn-copy-link"
                  >
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <Text size="xs" c="dimmed">
            {t`Expires`}: {new Date(linkData.expiresAt).toLocaleString()}
          </Text>
        </Stack>
      </Paper>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={createdInvitation ? t`Invitation Created` : t`Create Invitation`}
      size="lg"
      data-testid="create-invitation-modal"
    >
      {createdInvitation ? (
        <Stack gap="md">
          <Alert
            icon={<IconCheck size={16} />}
            title={t`Success`}
            color="green"
          >
            {t`Invitation has been created successfully!`}
          </Alert>

          <InvitationLinkDisplay invitationId={createdInvitation.id} />

          <Button onClick={handleClose} fullWidth data-testid="btn-close">
            {t`Close`}
          </Button>
        </Stack>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label={t`Invitation Type`}
              placeholder={t`Select type`}
              data={[
                { value: InvitationType.EMAIL, label: t`Email Invitation` },
                { value: InvitationType.LINK, label: t`Shareable Link` },
                { value: InvitationType.CODE, label: t`Code Invitation` },
              ]}
              required
              {...form.getInputProps("type")}
              data-testid="select-invitation-type"
            />

            {form.values.type === InvitationType.EMAIL && (
              <TextInput
                label={t`Email Address`}
                placeholder={t`user@example.com`}
                required
                {...form.getInputProps("inviteeEmail")}
                data-testid="input-invitee-email"
              />
            )}

            <Select
              label={t`Authority`}
              placeholder={t`Select authority`}
              data={[
                { value: "USER", label: t`User` },
                { value: "ADMIN", label: t`Admin` },
              ]}
              required
              {...form.getInputProps("authority")}
              data-testid="select-authority"
            />

            <NumberInput
              label={t`Expiration (hours)`}
              placeholder={t`Enter hours`}
              min={1}
              max={720}
              required
              description={t`Between 1 hour and 30 days (720 hours)`}
              {...form.getInputProps("expirationHours")}
              data-testid="input-expiration-hours"
            />

            {form.values.type === InvitationType.LINK && (
              <NumberInput
                label={t`Max Uses`}
                placeholder={t`Leave empty for unlimited`}
                min={1}
                description={t`Maximum number of times this link can be used`}
                {...form.getInputProps("maxUses")}
                data-testid="input-max-uses"
              />
            )}

            <TextInput
              label={t`Custom Message (Optional)`}
              placeholder={t`Add a personal message`}
              {...form.getInputProps("customMessage")}
              data-testid="input-custom-message"
            />

            {createInvitationMutation.isError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title={t`Error`}
                color="red"
              >
                {createInvitationMutation.error?.message ||
                  t`Failed to create invitation`}
              </Alert>
            )}

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={handleClose}
                data-testid="btn-cancel"
              >
                {t`Cancel`}
              </Button>
              <Button
                type="submit"
                loading={createInvitationMutation.isPending}
                data-testid="btn-submit"
              >
                {t`Create Invitation`}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
