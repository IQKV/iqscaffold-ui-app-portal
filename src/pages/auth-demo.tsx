import { createFileRoute } from "@tanstack/react-router";
import { Container, Title, Stack, Tabs } from "@mantine/core";
import { IconUser, IconShield, IconLogin, IconCode } from "@tabler/icons-react";
import { AuthDemo, LoginForm, AuthExamples } from "@/shared/ui";
import { useAuth } from "@/shared/lib";

export const Route = createFileRoute("/auth-demo")({
  component: AuthDemoPage,
});

function AuthDemoPage() {
  const { isAuthenticated } = useAuth();

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
          <LoginForm />
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
