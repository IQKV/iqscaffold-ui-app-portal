import React from "react";
import {
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  Text,
  Alert,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { IconLogin, IconAlertCircle } from "@tabler/icons-react";
import { useAuth } from "@/shared/lib";
import { notifications } from "@mantine/notifications";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormData>({
    validate: zodResolver(loginSchema),
    initialValues: {
      username: "",
      password: "",
    },
  });

  if (isAuthenticated) {
    return (
      <Paper p="md" withBorder>
        <Alert color="green" icon={<IconLogin size={16} />}>
          <Text>You are already logged in!</Text>
        </Alert>
      </Paper>
    );
  }

  const handleSubmit = async (values: LoginFormData) => {
    setIsLoading(true);

    try {
      // Simulate login - in real app, this would call the auth API
      // For demo purposes, we'll create a mock JWT token
      const mockToken = createMockJWT(values.username);

      login({
        accessToken: mockToken,
        refreshToken: "mock-refresh-token",
      });

      notifications.show({
        title: "Success",
        message: "Logged in successfully!",
        color: "green",
      });

      onSuccess?.();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Login failed. Please try again.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper p="md" withBorder maw={400} mx="auto">
      <Title order={2} ta="center" mb="md">
        Login Demo
      </Title>

      <Alert color="blue" icon={<IconAlertCircle size={16} />} mb="md">
        <Text size="sm">
          <strong>Demo Accounts:</strong>
          <br />
          • admin / password (ADMIN role)
          <br />
          • superadmin / password (SUPER_ADMIN role)
          <br />• user / password (USER role)
        </Text>
      </Alert>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Username"
            placeholder="Enter username"
            required
            {...form.getInputProps("username")}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter password"
            required
            {...form.getInputProps("password")}
          />

          <Button
            type="submit"
            loading={isLoading}
            leftSection={<IconLogin size={16} />}
            fullWidth
          >
            Login
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}

// Mock JWT token creation for demo purposes
function createMockJWT(username: string): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  let roles: string[] = ["USER"];
  let userId = 1;

  // Assign roles based on username for demo
  if (username === "admin") {
    roles = ["USER", "ADMIN"];
    userId = 2;
  } else if (username === "superadmin") {
    roles = ["USER", "ADMIN", "SUPER_ADMIN"];
    userId = 3;
  }

  const payload = {
    sub: username,
    userId,
    username,
    email: `${username}@example.com`,
    roles,
    permissions: [],
    firstName: username.charAt(0).toUpperCase() + username.slice(1),
    lastName: "User",
    tenantId: "default",
    customClaims: {},
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    iat: Math.floor(Date.now() / 1000),
  };

  // Simple base64 encoding for demo (not secure, just for testing)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));

  return `${encodedHeader}.${encodedPayload}.mock-signature`;
}
