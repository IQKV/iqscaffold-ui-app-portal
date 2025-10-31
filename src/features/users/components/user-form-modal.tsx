import { useEffect } from "react";
import {
  Modal,
  Button,
  TextInput,
  MultiSelect,
  Group,
  Stack,
  Text,
  Switch,
  Alert,
} from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { User, CreateUserRequest, UpdateUserRequest } from "../api/users-api";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../hooks/use-users-query";
import { useAuth } from "@/shared/lib";
import { notifications } from "@mantine/notifications";
import { t } from "@lingui/core/macro";

const createUserFormSchema = () =>
  z.object({
    username: z.string().min(3, t`Username must be at least 3 characters`),
    email: z.string().email(t`Invalid email address`),
    firstName: z.string().min(2, t`First name must be at least 2 characters`),
    lastName: z.string().min(2, t`Last name must be at least 2 characters`),
    password: z
      .string()
      .min(8, t`Password must be at least 8 characters`)
      .optional(),
    roles: z.array(z.string()).min(1, t`At least one role is required`),
    enabled: z.boolean(),
    emailVerified: z.boolean(),
  });

type UserFormData = z.infer<ReturnType<typeof createUserFormSchema>>;

interface UserFormModalProps {
  opened: boolean;
  onClose: () => void;
  user?: User | null;
  title: string;
}

const getRoleOptions = () => [
  { value: "USER", label: t`User` },
  { value: "ADMIN", label: t`Admin` },
  { value: "SUPER_ADMIN", label: t`Super Admin` },
];

export function UserFormModal({
  opened,
  onClose,
  user,
  title,
}: UserFormModalProps) {
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const { canManageUsers } = useAuth();

  const isEditing = !!user;
  const isLoading =
    createUserMutation.isPending || updateUserMutation.isPending;

  const form = useForm<UserFormData>({
    validate: zodResolver(createUserFormSchema()),
    initialValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      roles: ["USER"],
      enabled: true,
      emailVerified: false,
    },
  });

  useEffect(() => {
    if (user) {
      form.setValues({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles || ["USER"],
        enabled: user.enabled,
        emailVerified: user.emailVerified,
        password: "", // Don't populate password for editing
      });
    } else {
      form.reset();
    }
  }, [user, opened, form]);

  // Check if user has permission to create/update users
  if (!canManageUsers()) {
    return (
      <Modal opened={opened} onClose={onClose} title={title} size="md" centered>
        <Alert
          variant="light"
          color="red"
          title="Access Denied"
          icon={<IconLock size={16} />}
        >
          <Text size="sm">
            You need administrator privileges to {isEditing ? "edit" : "create"}{" "}
            users.
          </Text>
        </Alert>
      </Modal>
    );
  }

  const handleSubmit = (values: UserFormData) => {
    if (isEditing && user) {
      const updateData: UpdateUserRequest = {
        username: values.username,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        roles: values.roles,
        enabled: values.enabled,
        emailVerified: values.emailVerified,
      };

      updateUserMutation.mutate(
        { id: user.id, userData: updateData },
        {
          onSuccess: () => {
            notifications.show({
              title: t`Success`,
              message: t`User updated successfully`,
              color: "green",
            });
            onClose();
          },
          onError: (error) => {
            const errorMessage = error.message;
            notifications.show({
              title: t`Error`,
              message: t`Failed to update user: ${errorMessage}`,
              color: "red",
            });
          },
        }
      );
    } else {
      if (!values.password) {
        notifications.show({
          title: t`Error`,
          message: t`Password is required for new users`,
          color: "red",
        });
        return;
      }

      const createData: CreateUserRequest = {
        username: values.username,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
        roles: values.roles,
      };

      createUserMutation.mutate(createData, {
        onSuccess: () => {
          notifications.show({
            title: t`Success`,
            message: t`User created successfully`,
            color: "green",
          });
          onClose();
        },
        onError: (error) => {
          const errorMessage = error.message;
          notifications.show({
            title: t`Error`,
            message: t`Failed to create user: ${errorMessage}`,
            color: "red",
          });
        },
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title}
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label={t`Username`}
            placeholder={t`Enter username`}
            required
            {...form.getInputProps("username")}
          />

          <TextInput
            label={t`Email`}
            placeholder={t`Enter email address`}
            required
            type="email"
            {...form.getInputProps("email")}
          />

          <Group grow>
            <TextInput
              label={t`First Name`}
              placeholder={t`Enter first name`}
              required
              {...form.getInputProps("firstName")}
            />

            <TextInput
              label={t`Last Name`}
              placeholder={t`Enter last name`}
              required
              {...form.getInputProps("lastName")}
            />
          </Group>

          {!isEditing && (
            <TextInput
              label={t`Password`}
              placeholder={t`Enter password`}
              required
              type="password"
              {...form.getInputProps("password")}
            />
          )}

          <MultiSelect
            label={t`Roles`}
            placeholder={t`Select user roles`}
            required
            data={getRoleOptions()}
            {...form.getInputProps("roles")}
          />

          {isEditing && (
            <Group grow>
              <Switch
                label={t`Enabled`}
                description={t`User can log in and access the system`}
                {...form.getInputProps("enabled", { type: "checkbox" })}
              />
              <Switch
                label={t`Email Verified`}
                description={t`User's email address has been verified`}
                {...form.getInputProps("emailVerified", { type: "checkbox" })}
              />
            </Group>
          )}

          {isEditing && (
            <Text size="sm" c="dimmed">
              {t`Created:`} {user && new Date(user.createdAt).toLocaleString()}
              {user?.updatedAt && (
                <>
                  , {t`Updated:`} {new Date(user.updatedAt).toLocaleString()}
                </>
              )}
            </Text>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
              {t`Cancel`}
            </Button>
            <Button type="submit" loading={isLoading}>
              {isEditing ? t`Update` : t`Create`} {t`User`}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
