import { createFileRoute } from "@tanstack/react-router";
import { Container, Title, Stack, Tabs } from "@mantine/core";
import { IconUser, IconShield, IconLogin, IconCode } from "@tabler/icons-react";
import {
  AuthDemo,
  AuthExamples,
  AuthLoginForm,
  useAuthStore,
} from "@/processes/auth";

export const Route = createFileRoute("/auth-demo")({
  component: AuthDemoPage,
});

function AuthDemoPage() {
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = status === "authenticated";

  return (
    <Container size="lg" py="md">
      <Title order={1} mb="xl" ta="center">
        Authentication & Authorization Demo
      </Title>

      <Tabs defaultValue={isAuthenticated ? "demo" : "login"} variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="login" leftSection={<IconLogin size={16} />}>
            Login
          </Tabs.Tab>
          <Tabs.Tab value="demo" leftSection={<IconShield size={16} />}>
            Authorization Demo
          </Tabs.Tab>
          <Tabs.Tab value="examples" leftSection={<IconCode size={16} />}>
            Code Examples
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="login" pt="md">
          <AuthLoginForm />
        </Tabs.Panel>

        <Tabs.Panel value="demo" pt="md">
          <AuthDemo />
        </Tabs.Panel>

        <Tabs.Panel value="examples" pt="md">
          <AuthExamples />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
