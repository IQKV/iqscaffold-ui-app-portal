import { useEffect } from "react";
import {
  Modal,
  Button,
  TextInput,
  Select,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { User, CreateUserRequest, UpdateUserRequest } from "../api/users-api";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../hooks/use-users-query";
import { notifications } from "@mantine/notifications";

const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  role: z.string().min(1, "Role is required"),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormModalProps {
  opened: boolean;
  onClose: () => void;
  user?: User | null;
  title: string;
}

const roleOptions = [
  { value: "user", label: "User" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

export function UserFormModal({
  opened,
  onClose,
  user,
  title,
}: UserFormModalProps) {
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();

  const isEditing = !!user;
  const isLoading =
    createUserMutation.isPending || updateUserMutation.isPending;

  const form = useForm<UserFormData>({
    validate: zodResolver(userFormSchema),
    initialValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "user",
    },
  });

  useEffect(() => {
    if (user) {
      form.setValues({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        password: "", // Don't populate password for editing
      });
    } else {
      form.reset();
    }
  }, [user, opened]);

  const handleSubmit = (values: UserFormData) => {
    if (isEditing && user) {
      const updateData: UpdateUserRequest = {
        username: values.username,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role,
      };

      updateUserMutation.mutate(
        { id: user.id, userData: updateData },
        {
          onSuccess: () => {
            notifications.show({
              title: "Success",
              message: "User updated successfully",
              color: "green",
            });
            onClose();
          },
          onError: (error) => {
            notifications.show({
              title: "Error",
              message: `Failed to update user: ${error.message}`,
              color: "red",
            });
          },
        }
      );
    } else {
      if (!values.password) {
        notifications.show({
          title: "Error",
          message: "Password is required for new users",
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
        role: values.role,
      };

      createUserMutation.mutate(createData, {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "User created successfully",
            color: "green",
          });
          onClose();
        },
        onError: (error) => {
          notifications.show({
            title: "Error",
            message: `Failed to create user: ${error.message}`,
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
            label="Username"
            placeholder="Enter username"
            required
            {...form.getInputProps("username")}
          />

          <TextInput
            label="Email"
            placeholder="Enter email address"
            required
            type="email"
            {...form.getInputProps("email")}
          />

          <Group grow>
            <TextInput
              label="First Name"
              placeholder="Enter first name"
              required
              {...form.getInputProps("firstName")}
            />

            <TextInput
              label="Last Name"
              placeholder="Enter last name"
              required
              {...form.getInputProps("lastName")}
            />
          </Group>

          {!isEditing && (
            <TextInput
              label="Password"
              placeholder="Enter password"
              required
              type="password"
              {...form.getInputProps("password")}
            />
          )}

          <Select
            label="Role"
            placeholder="Select user role"
            required
            data={roleOptions}
            {...form.getInputProps("role")}
          />

          {isEditing && (
            <Text size="sm" c="dimmed">
              Created: {user && new Date(user.createdAt).toLocaleString()}
              {user?.updatedAt && (
                <>, Updated: {new Date(user.updatedAt).toLocaleString()}</>
              )}
            </Text>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {isEditing ? "Update" : "Create"} User
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
