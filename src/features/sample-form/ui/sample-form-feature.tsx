import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconPlus, IconX } from "@tabler/icons-react";

import { initialFormValues, validateSampleForm } from "../model/validation";
import { FormValues } from "../model/types";
import { FormField } from "@/shared/ui";
import { useFormMutation, queryClient } from "@/shared/lib";
import { QueryClientProvider } from "@tanstack/react-query";

export function SampleFormFeature() {
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm<FormValues>({
    initialValues: initialFormValues,
    validate: validateSampleForm,
  });

  const mutation = useFormMutation<void, FormValues>(
    form,
    async (values) => {
      // demo-only: no backend call
      console.log("Sample form submitted:", values);
    },
    {
      notifySuccess: {
        title: "Form submitted!",
        message: "We have received your submission.",
      },
      notifyError: {
        title: "Submit Failed",
        fallback: "Could not submit the form",
      },
      onSuccess: () => {
        form.reset();
        close();
      },
    } as any
  );

  const handleSubmit = (values: FormValues) => {
    void mutation.mutateAsync(values);
  };

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Title order={3}>Sample Form Feature</Title>
          <ActionIcon variant="filled" color="blue" onClick={open}>
            <IconPlus size="1rem" />
          </ActionIcon>
        </Group>
        <Text size="sm" c="dimmed">
          Click the plus button to open a modal with a sample form using Mantine
          components. This demonstrates Feature-Sliced Design architecture.
        </Text>
      </Card>

      <Modal opened={opened} onClose={close} title="Sample Form" centered>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <FormField
              type="text"
              name="name"
              label="Name"
              placeholder="Enter your name"
              form={form}
            />
            <FormField
              type="email"
              name="email"
              label="Email"
              placeholder="Enter your email"
              form={form}
            />
            <Group justify="flex-end">
              <Button
                variant="subtle"
                onClick={close}
                leftSection={<IconX size="1rem" />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                leftSection={<IconCheck size="1rem" />}
                loading={mutation.isPending}
              >
                Submit
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
