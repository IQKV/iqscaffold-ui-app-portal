import { Box, Center, Stack, Text, Title } from "@mantine/core";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <Box
      pos="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      w="100vw"
      h="100vh"
      style={{ overflow: "auto" }}
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    >
      <Center mih="100vh" p="xl">
        <Box w="100%" maw={480}>
          <Stack gap="xl">
            <Stack gap="xs" align="center">
              <Title order={1} c="white" fz="2rem" fw={700} ta="center">
                {title}
              </Title>
              {subtitle && (
                <Text size="sm" c="rgba(255, 255, 255, 0.9)" ta="center">
                  {subtitle}
                </Text>
              )}
            </Stack>

            {children}
          </Stack>
        </Box>
      </Center>
    </Box>
  );
}
