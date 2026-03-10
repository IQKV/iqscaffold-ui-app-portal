import { useState, useMemo, useCallback } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Text,
  Stack,
  Paper,
  Title,
  Alert,
  Select,
  Tooltip,
  CopyButton,
} from "@mantine/core";
import {
  IconTrash,
  IconPlus,
  IconAlertCircle,
  IconCopy,
  IconCheck,
  IconLink,
} from "@tabler/icons-react";
import { DataTable, type DataTableColumn } from "@/shared/ui/data-table";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { t } from "@lingui/core/macro";
import {
  useInvitations,
  useRevokeInvitation,
  useInvitationLink,
} from "@/shared/lib/use-invitation-api";
import {
  type OrganizationInvitationDto,
  InvitationStatus,
  InvitationType,
} from "@/shared/api/invitation-api";

interface InvitationListProps {
  onCreateInvitation: () => void;
}

export function InvitationList({ onCreateInvitation }: InvitationListProps) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const pageSize = 10;

  const { data, isLoading, error } = useInvitations({
    page: page - 1,
    size: pageSize,
    status: statusFilter as InvitationStatus | undefined,
  });

  const revokeInvitationMutation = useRevokeInvitation();

  const handleRevokeInvitation = useCallback(
    (invitation: OrganizationInvitationDto) => {
      openConfirmModal({
        title: t`Revoke Invitation`,
        children: (
          <Text size="sm">
            {t`Are you sure you want to revoke this invitation?`}{" "}
            {invitation.inviteeEmail && (
              <>
                {t`for`} <strong>{invitation.inviteeEmail}</strong>
              </>
            )}
            ? {t`This action cannot be undone.`}
          </Text>
        ),
        labels: { confirm: t`Revoke`, cancel: t`Cancel` },
        confirmProps: { color: "red" },
        onConfirm: () => {
          revokeInvitationMutation.mutate(invitation.id);
        },
      });
    },
    [revokeInvitationMutation],
  );

  const getStatusBadgeColor = (status: InvitationStatus) => {
    switch (status) {
      case InvitationStatus.PENDING:
        return "blue";
      case InvitationStatus.ACCEPTED:
        return "green";
      case InvitationStatus.EXPIRED:
        return "yellow";
      case InvitationStatus.REVOKED:
        return "red";
      default:
        return "gray";
    }
  };

  const getTypeBadgeColor = (type: InvitationType) => {
    switch (type) {
      case InvitationType.EMAIL:
        return "cyan";
      case InvitationType.LINK:
        return "violet";
      case InvitationType.CODE:
        return "grape";
      default:
        return "gray";
    }
  };

  const CopyInvitationLink = ({ invitationId }: { invitationId: number }) => {
    const { data: linkData } = useInvitationLink(invitationId);

    if (!linkData) {
      return null;
    }

    return (
      <CopyButton value={linkData.fullUrl}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? t`Copied!` : t`Copy invitation link`}>
            <ActionIcon variant="subtle" color={copied ? "teal" : "blue"} onClick={copy}>
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    );
  };

  const columns = useMemo<DataTableColumn<OrganizationInvitationDto>[]>(
    () => [
      {
        key: "type",
        title: t`Type`,
        sortable: true,
        render: (_, invitation) => (
          <Badge color={getTypeBadgeColor(invitation.type)} variant="light">
            {invitation.type}
          </Badge>
        ),
      },
      {
        key: "email",
        title: t`Email / Details`,
        sortable: true,
        render: (_, invitation) => (
          <div>
            {invitation.inviteeEmail ? (
              <Text size="sm">{invitation.inviteeEmail}</Text>
            ) : (
              <Text size="sm" c="dimmed">
                {invitation.type === InvitationType.LINK ? t`Shareable link` : t`Code invitation`}
              </Text>
            )}
            {invitation.maxUses && (
              <Text size="xs" c="dimmed">
                {t`Uses`}: {invitation.currentUses}/{invitation.maxUses}
              </Text>
            )}
          </div>
        ),
      },
      {
        key: "authority",
        title: t`Authority`,
        sortable: true,
        render: (_, invitation) => <Badge variant="light">{invitation.authority}</Badge>,
      },
      {
        key: "status",
        title: t`Status`,
        sortable: true,
        render: (_, invitation) => (
          <Badge color={getStatusBadgeColor(invitation.status)} variant="light">
            {invitation.status}
          </Badge>
        ),
      },
      {
        key: "expiresAt",
        title: t`Expires`,
        sortable: true,
        render: (_, invitation) => (
          <Text size="sm">{new Date(invitation.expiresAt).toLocaleDateString()}</Text>
        ),
      },
      {
        key: "createdAt",
        title: t`Created`,
        sortable: true,
        render: (_, invitation) => (
          <div>
            <Text size="sm">{new Date(invitation.createdAt).toLocaleDateString()}</Text>
            <Text size="xs" c="dimmed">
              {t`by`} {invitation.invitedByUsername}
            </Text>
          </div>
        ),
      },
      {
        key: "actions",
        title: t`Actions`,
        align: "center",
        render: (_, invitation) => (
          <Group gap="xs" justify="center">
            {invitation.status === InvitationStatus.PENDING && (
              <>
                <CopyInvitationLink invitationId={invitation.id} />
                <Tooltip label={t`Revoke invitation`}>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleRevokeInvitation(invitation)}
                    loading={revokeInvitationMutation.isPending}
                    data-testid={`btn-revoke-invitation-${invitation.id}`}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </>
            )}
          </Group>
        ),
      },
    ],
    [handleRevokeInvitation, revokeInvitationMutation.isPending],
  );

  return (
    <Stack gap="md" data-testid="feature-invitation-list">
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title={t`Error`} color="red">
          {t`Error loading invitations`}: {error.message}
        </Alert>
      )}
      <Paper p="md" withBorder shadow="sm">
        <Group justify="space-between" mb="md">
          <Title order={2} data-testid="invitations-title">
            {t`Invitations`}
          </Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={onCreateInvitation}
            data-testid="btn-create-invitation"
          >
            {t`Create Invitation`}
          </Button>
        </Group>

        <Select
          placeholder={t`Filter by status`}
          data={[
            { value: "", label: t`All Statuses` },
            { value: InvitationStatus.PENDING, label: t`Pending` },
            { value: InvitationStatus.ACCEPTED, label: t`Accepted` },
            { value: InvitationStatus.EXPIRED, label: t`Expired` },
            { value: InvitationStatus.REVOKED, label: t`Revoked` },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          mb="md"
          data-testid="select-status-filter"
        />

        <DataTable
          columns={columns}
          data={data?.content || []}
          loading={isLoading}
          pagination={{
            page,
            total: data?.totalElements || 0,
            pageSize,
            onChange: setPage,
          }}
          emptyText={t`No invitations found`}
        />
      </Paper>
    </Stack>
  );
}
