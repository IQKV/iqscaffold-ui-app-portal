import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Stack,
  Title,
  Button,
  Card,
  Group,
  Text,
  Loader,
  Alert,
  Modal,
} from "@mantine/core";
import { IconPlus, IconAlertCircle, IconTrash } from "@tabler/icons-react";
import { t } from "@lingui/macro";
import { AuthGuard, useAuth } from "@/processes/auth";
import {
  GatewayConfigForm,
  GatewayConfigList,
} from "@/features/gateway-config";
import {
  useGatewayConfigs,
  useCreateGatewayConfig,
  useActivateGateway,
  useDeactivateGateway,
  useSetPrimaryGateway,
  useDeleteGatewayConfig,
} from "@/entities/billing";
import { notificationService } from "@/shared/lib/notifications";
import { PaymentGatewayProvider } from "@/shared/api/billing/types";
import {
  canManageGatewayConfig,
  canViewGatewayConfig,
} from "@/processes/auth/lib/billing-permissions";

export const Route = createFileRoute("/gateway-config")({
  component: GatewayConfigPage,
});

function GatewayConfigPage() {
  const { user } = useAuth();
  const [formOpened, setFormOpened] = useState(false);
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);
  const [providerToDelete, setProviderToDelete] =
    useState<PaymentGatewayProvider | null>(null);

  const { data: configs, isLoading, error } = useGatewayConfigs();
  const createMutation = useCreateGatewayConfig();
  const activateMutation = useActivateGateway();
  const deactivateMutation = useDeactivateGateway();
  const setPrimaryMutation = useSetPrimaryGateway();
  const deleteMutation = useDeleteGatewayConfig();

  const canManage = canManageGatewayConfig(user);
  const canView = canViewGatewayConfig(user);

  const handleCreate = async (request: any) => {
    try {
      await createMutation.mutateAsync(request);
      notificationService.success({
        title: t`Success`,
        message: t`Payment gateway configured successfully`,
      });
      setFormOpened(false);
    } catch (error) {
      notificationService.error({
        title: t`Error`,
        message: t`Failed to configure payment gateway`,
      });
    }
  };

  const handleActivate = async (provider: PaymentGatewayProvider) => {
    try {
      await activateMutation.mutateAsync(provider);
      notificationService.success({
        title: t`Success`,
        message: t`Gateway activated successfully`,
      });
    } catch (error) {
      notificationService.error({
        title: t`Error`,
        message: t`Failed to activate gateway`,
      });
    }
  };

  const handleDeactivate = async (provider: PaymentGatewayProvider) => {
    try {
      await deactivateMutation.mutateAsync(provider);
      notificationService.success({
        title: t`Success`,
        message: t`Gateway deactivated successfully`,
      });
    } catch (error) {
      notificationService.error({
        title: t`Error`,
        message: t`Failed to deactivate gateway`,
      });
    }
  };

  const handleSetPrimary = async (provider: PaymentGatewayProvider) => {
    try {
      await setPrimaryMutation.mutateAsync(provider);
      notificationService.success({
        title: t`Success`,
        message: t`Primary gateway updated successfully`,
      });
    } catch (error) {
      notificationService.error({
        title: t`Error`,
        message: t`Failed to set primary gateway`,
      });
    }
  };

  const handleDelete = (provider: PaymentGatewayProvider) => {
    setProviderToDelete(provider);
    setDeleteConfirmOpened(true);
  };

  const handleConfirmDelete = async () => {
    if (!providerToDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(providerToDelete);
      notificationService.success({
        title: t`Success`,
        message: t`Gateway deleted successfully`,
      });
      setDeleteConfirmOpened(false);
      setProviderToDelete(null);
    } catch (error) {
      notificationService.error({
        title: t`Error`,
        message: t`Failed to delete gateway`,
      });
    }
  };

  if (!canView) {
    return (
      <AuthGuard>
        <Container size="xl" py="xl">
          <Alert
            color="red"
            title={t`Access Denied`}
            icon={<IconAlertCircle />}
          >
            {t`You don't have permission to view gateway configurations.`}
          </Alert>
        </Container>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Container size="xl" py="xl" data-testid="page-gateway-config">
        <Stack gap="xl">
          <Group justify="space-between">
            <div>
              <Title order={2}>{t`Payment Gateway Configuration`}</Title>
              <Text c="dimmed" size="sm">
                {t`Manage your payment gateway integrations`}
              </Text>
            </div>
            {canManage && (
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={() => setFormOpened(true)}
              >
                {t`Add Gateway`}
              </Button>
            )}
          </Group>

          <Card withBorder>
            {isLoading ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : error ? (
              <Alert color="red" title={t`Error`} icon={<IconAlertCircle />}>
                {t`Failed to load gateway configurations`}
              </Alert>
            ) : (
              <GatewayConfigList
                configs={configs || []}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onSetPrimary={handleSetPrimary}
                onDelete={handleDelete}
                canManage={canManage}
              />
            )}
          </Card>
        </Stack>

        <GatewayConfigForm
          opened={formOpened}
          onClose={() => setFormOpened(false)}
          onSubmit={handleCreate}
          loading={createMutation.isPending}
        />

        <Modal
          opened={deleteConfirmOpened}
          onClose={() => setDeleteConfirmOpened(false)}
          title={t`Delete Gateway Configuration`}
          centered
        >
          <Stack gap="md">
            <Alert icon={<IconAlertCircle />} title={t`Warning`} color="red">
              {t`This action cannot be undone. All configuration data for this gateway will be permanently deleted.`}
            </Alert>

            {providerToDelete && (
              <Text size="sm">
                {t`Are you sure you want to delete the`}{" "}
                <strong>{providerToDelete}</strong> {t`gateway configuration?`}
              </Text>
            )}

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => setDeleteConfirmOpened(false)}
                disabled={deleteMutation.isPending}
              >
                {t`Cancel`}
              </Button>
              <Button
                color="red"
                leftSection={<IconTrash size={18} />}
                onClick={handleConfirmDelete}
                loading={deleteMutation.isPending}
              >
                {t`Delete Gateway`}
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </AuthGuard>
  );
}
