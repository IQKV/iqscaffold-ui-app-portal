import { Center, Loader, Overlay, Stack, Text } from "@mantine/core";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = "Loading..." }: LoadingOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <Overlay>
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="lg" fw={500}>
            {message}
          </Text>
        </Stack>
      </Center>
    </Overlay>
  );
}
