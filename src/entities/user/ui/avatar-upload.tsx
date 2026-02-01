import { useState, useRef } from "react";
import {
  Button,
  Group,
  Text,
  FileButton,
  ActionIcon,
  Menu,
  Avatar,
  Loader,
  Box,
} from "@mantine/core";
import {
  IconCamera,
  IconTrash,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import {
  useAvatarUpload,
  useAvatarDelete,
  getAvatarUrlWithCacheBusting,
} from "../model/use-avatar";
import { useAuthStore } from "@/processes/auth/model/store";
import { t } from "@lingui/macro";

interface AvatarUploadProps {
  size?: number;
  showUploadButton?: boolean;
  showDeleteButton?: boolean;
  variant?: "menu" | "inline";
}

export function AvatarUpload({
  size = 40,
  showUploadButton = true,
  showDeleteButton = true,
  variant = "menu",
}: AvatarUploadProps) {
  const user = useAuthStore((s) => s.user);
  const [file, setFile] = useState<File | null>(null);
  const resetRef = useRef<() => void>(null);

  const uploadMutation = useAvatarUpload();
  const deleteMutation = useAvatarDelete();

  if (!user) {
    return null;
  }

  const avatarUrl = getAvatarUrlWithCacheBusting(
    user.avatarUrl,
    user.avatarUpdatedAt
  );
  const initials =
    `${user.firstName?.[0] ?? user.username[0]}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const isLoading = uploadMutation.isPending || deleteMutation.isPending;

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      uploadMutation.mutate(selectedFile, {
        onSettled: () => {
          setFile(null);
          resetRef.current?.();
        },
      });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (variant === "inline") {
    return (
      <Box>
        <Group gap="md" align="center">
          <Avatar src={avatarUrl} size={size} radius="xl" color="indigo">
            {isLoading ? <Loader size="sm" /> : initials}
          </Avatar>

          <Group gap="xs">
            {showUploadButton && (
              <FileButton
                resetRef={resetRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={isLoading}
              >
                {(props) => (
                  <Button
                    {...props}
                    variant="light"
                    size="xs"
                    leftSection={<IconUpload size={14} />}
                    loading={uploadMutation.isPending}
                  >
                    {t`Upload Avatar`}
                  </Button>
                )}
              </FileButton>
            )}

            {showDeleteButton && avatarUrl && (
              <Button
                variant="light"
                color="red"
                size="xs"
                leftSection={<IconTrash size={14} />}
                onClick={handleDelete}
                loading={deleteMutation.isPending}
                disabled={uploadMutation.isPending}
              >
                {t`Remove`}
              </Button>
            )}
          </Group>
        </Group>

        {file && (
          <Text size="xs" c="dimmed" mt="xs">
            {t`Uploading`} {file.name}...
          </Text>
        )}
      </Box>
    );
  }

  // Menu variant (default)
  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <ActionIcon
          variant="transparent"
          size={size}
          radius="xl"
          style={{ position: "relative" }}
        >
          <Avatar src={avatarUrl} size={size} radius="xl" color="indigo">
            {isLoading ? <Loader size="sm" /> : initials}
          </Avatar>

          {/* Camera overlay on hover */}
          <Box
            style={(theme) => ({
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: "50%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s",
              cursor: "pointer",
              "&:hover": {
                opacity: 1,
              },
            })}
          >
            <IconCamera size={16} color="white" />
          </Box>
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Text size="sm">
            {user.firstName} {user.lastName}
          </Text>
          <Text size="xs" c="dimmed">
            {user.email}
          </Text>
        </Menu.Label>

        <Menu.Divider />

        {showUploadButton && (
          <FileButton
            resetRef={resetRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={isLoading}
          >
            {(props) => (
              <Menu.Item
                {...props}
                leftSection={<IconUpload size={16} />}
                disabled={isLoading}
              >
                {uploadMutation.isPending ? t`Uploading...` : t`Upload Avatar`}
              </Menu.Item>
            )}
          </FileButton>
        )}

        {showDeleteButton && avatarUrl && (
          <Menu.Item
            leftSection={<IconTrash size={16} />}
            color="red"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {deleteMutation.isPending ? t`Removing...` : t`Remove Avatar`}
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
