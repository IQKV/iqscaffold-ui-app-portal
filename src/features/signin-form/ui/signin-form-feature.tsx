import {
  Anchor,
  Button,
  Card,
  Checkbox,
  Group,
  PasswordInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconLock, IconUser } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { authApi, type TokenResponse } from "@/shared/api";
import { getAuthConfig } from "@/app/config";
import { initialSignInValues, validateSignInForm } from "../model/validation";
import type { SignInFormValues } from "../model/types";

interface SignInFormFeatureProps {
  onSuccess?: (data: TokenResponse) => void;
  onForgotPassword?: () => void;
  onNavigateToRegister?: () => void;
  useExternalRedirect?: boolean;
}

export function SignInFormFeature({
  onSuccess,
  onForgotPassword,
  onNavigateToRegister,
  useExternalRedirect = false,
}: SignInFormFeatureProps) {
  const navigate = useNavigate();
  const authConfig = getAuthConfig();

  const form = useForm<SignInFormValues>({
    initialValues: initialSignInValues,
    validate: validateSignInForm,
  });

  const loginMutation = useMutation({
    mutationFn: async (values: SignInFormValues) => {
      return await authApi.login(values);
    },
    onSuccess: (data) => {
      // Store tokens in localStorage
      localStorage.setItem(
        authConfig.tokenStorage.accessTokenKey,
        data.accessToken
      );
      localStorage.setItem(
        authConfig.tokenStorage.refreshTokenKey,
        data.refreshToken
      );

      notifications.show({
        title: "Login Successful",
        message: `Welcome back, ${data.user.firstName}!`,
        color: "green",
      });

      if (onSuccess) {
        onSuccess(data);
      } else if (useExternalRedirect) {
        // External redirect to app domain
        window.location.href = authConfig.redirects.afterLogin;
      } else {
        // Internal navigation
        navigate({ to: "/" });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message || "Invalid credentials. Please try again.";

      notifications.show({
        title: "Login Failed",
        message: errorMessage,
        color: "red",
      });
    },
  });

  const handleSubmit = (values: SignInFormValues) => {
    loginMutation.mutate(values);
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      navigate({ to: "/forgot-password" });
    }
  };

  const handleNavigateToRegister = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister();
    } else {
      navigate({ to: "/register" });
    }
  };

  return (
    <Card shadow="md" padding="xl" radius="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Username or Email"
            placeholder="Enter your username or email"
            leftSection={<IconUser size={16} />}
            required
            {...form.getInputProps("username")}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            leftSection={<IconLock size={16} />}
            required
            {...form.getInputProps("password")}
          />

          <Group justify="space-between">
            <Checkbox
              label="Remember me"
              {...form.getInputProps("rememberMe", { type: "checkbox" })}
            />
            <Anchor
              component="button"
              type="button"
              size="sm"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </Anchor>
          </Group>

          <Button type="submit" fullWidth loading={loginMutation.isPending}>
            Sign In
          </Button>

          <Group justify="center" gap="xs">
            <Anchor size="sm" onClick={handleNavigateToRegister}>
              Don't have an account? Sign up
            </Anchor>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
