import {
  Anchor,
  Button,
  Card,
  Group,
  PasswordInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAt, IconLock, IconUser, IconUserPlus } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { authApi, type UserRegistrationResponse } from "@/shared/api";
import type { UserRegistration } from "@/entities/user";
import {
  initialSignUpValues,
  validateSignUpForm,
} from "../model/validation";
import type { SignUpFormValues } from "../model/types";

interface SignUpFormFeatureProps {
  onSuccess?: (data: UserRegistrationResponse) => void;
  onNavigateToLogin?: () => void;
  redirectToHome?: boolean;
}

export function SignUpFormFeature({
  onSuccess,
  onNavigateToLogin,
  redirectToHome = false,
}: SignUpFormFeatureProps) {
  const navigate = useNavigate();

  const form = useForm<SignUpFormValues>({
    initialValues: initialSignUpValues,
    validate: validateSignUpForm,
  });

  const registerMutation = useMutation({
    mutationFn: async (values: UserRegistration) => {
      return await authApi.signup(values);
    },
    onSuccess: (data) => {
      notifications.show({
        title: "Registration Successful",
        message:
          data.message ||
          "Your account has been created. Please verify your email.",
        color: "green",
      });

      if (onSuccess) {
        onSuccess(data);
      } else if (redirectToHome) {
        // Redirect back to auth homepage (login page)
        navigate({ to: "/" });
      } else {
        // Default behavior: navigate to login
        navigate({ to: "/login" });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message || "Registration failed. Please try again.";

      notifications.show({
        title: "Registration Failed",
        message: errorMessage,
        color: "red",
      });
    },
  });

  const handleSubmit = (values: SignUpFormValues) => {
    const { confirmPassword, ...signupData } = values;
    registerMutation.mutate(signupData);
  };

  const handleNavigateToLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else if (redirectToHome) {
      // Redirect back to homepage (which is the login page)
      navigate({ to: "/" });
    } else {
      navigate({ to: "/login" });
    }
  };

  return (
    <Card shadow="md" padding="xl" radius="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="First Name"
              placeholder="John"
              required
              {...form.getInputProps("firstName")}
            />
            <TextInput
              label="Last Name"
              placeholder="Doe"
              required
              {...form.getInputProps("lastName")}
            />
          </Group>

          <TextInput
            label="Username"
            placeholder="johndoe"
            leftSection={<IconUser size={16} />}
            description="3-50 characters, letters, numbers, and underscores only"
            required
            {...form.getInputProps("username")}
          />

          <TextInput
            label="Email"
            placeholder="john.doe@example.com"
            leftSection={<IconAt size={16} />}
            type="email"
            required
            {...form.getInputProps("email")}
          />

          <PasswordInput
            label="Password"
            placeholder="Create a strong password"
            leftSection={<IconLock size={16} />}
            description="Min 8 characters with uppercase, lowercase, number, and special character"
            required
            {...form.getInputProps("password")}
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            leftSection={<IconLock size={16} />}
            required
            {...form.getInputProps("confirmPassword")}
          />

          <Button
            type="submit"
            fullWidth
            leftSection={<IconUserPlus size={18} />}
            loading={registerMutation.isPending}
          >
            Create Account
          </Button>

          <Group justify="center" gap="xs">
            <Anchor size="sm" onClick={handleNavigateToLogin}>
              Already have an account? Sign in
            </Anchor>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
