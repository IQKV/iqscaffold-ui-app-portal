import { useEffect } from "react";
import { Modal, Button, Group, Stack, Text, Alert } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { FormField } from "@/shared/ui";
import { User, CreateUserRequest, UpdateUserRequest } from "../api/users-api";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../hooks/use-users-query";
import { useAuth } from "@/processes/auth";
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
    authorities: z
      .array(z.string())
      .min(1, t`At least one authority is required`),
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
      authorities: ["USER"],
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
        authorities: user.authorities || ["USER"],
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
        authorities: values.authorities,
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
        authorities: values.authorities,
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
      data-testid="modal-user-form"
    >
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        noValidate
        data-testid="form-user"
      >
        <Stack gap="md">
          <FormField
            type="text"
            name="username"
            label={t`Username`}
            placeholder={t`Enter username`}
            form={form}
            withAsterisk
          />

          <FormField
            type="email"
            name="email"
            label={t`Email`}
            placeholder={t`Enter email address`}
            form={form}
            withAsterisk
          />

          <Group grow>
            <FormField
              type="text"
              name="firstName"
              label={t`First Name`}
              placeholder={t`Enter first name`}
              form={form}
              withAsterisk
            />

            <FormField
              type="text"
              name="lastName"
              label={t`Last Name`}
              placeholder={t`Enter last name`}
              form={form}
              withAsterisk
            />
          </Group>

          {!isEditing && (
            <FormField
              type="password"
              name="password"
              label={t`Password`}
              placeholder={t`Enter password`}
              form={form}
              withAsterisk
              showStrengthIndicator
            />
          )}

          <FormField
            type="multiselect"
            name="authorities"
            label={t`Authorities`}
            placeholder={t`Select user authorities`}
            data={getRoleOptions()}
            form={form}
            withAsterisk
          />

          {isEditing && (
            <Group grow>
              <FormField
                type="switch"
                name="enabled"
                label={t`Enabled`}
                description={t`User can log in and access the system`}
                form={form}
              />
              <FormField
                type="switch"
                name="emailVerified"
                label={t`Email Verified`}
                description={t`User's email address has been verified`}
                form={form}
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
            <Button
              variant="subtle"
              onClick={handleClose}
              disabled={isLoading}
              data-testid="btn-cancel-user-form"
            >
              {t`Cancel`}
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              data-testid="btn-submit-user-form"
            >
              {isEditing ? t`Update` : t`Create`} {t`User`}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
