import React from "react";
import { Paper, Title, Button, Stack, Alert, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { IconLogin, IconAlertCircle } from "@tabler/icons-react";
import { FormField } from "@/shared/ui";
import { useAuthStore } from "../model/store";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormData>({
    validate: zodResolver(loginSchema),
    initialValues: { username: "", password: "" },
  });

  const handleSubmit = async (values: LoginFormData) => {
    setIsLoading(true);
    try {
      await login({ username: values.username, password: values.password });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "authenticated") {
    return (
      <Paper p="md" withBorder>
        <Alert color="green" icon={<IconLogin size={16} />}>
          You are already logged in
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder maw={400} mx="auto">
      <Title order={2} ta="center" mb="md">
        Sign in
      </Title>

      <Alert color="blue" icon={<IconAlertCircle size={16} />} mb="md">
        <Text size="sm">
          <strong>Demo:</strong> any username/password works against mocked API
        </Text>
      </Alert>

      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack gap="md">
          <FormField
            type="text"
            name="username"
            label="Username"
            placeholder="Enter username"
            form={form}
            withAsterisk
          />
          <FormField
            type="password"
            name="password"
            label="Password"
            placeholder="Enter password"
            form={form}
            withAsterisk
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
