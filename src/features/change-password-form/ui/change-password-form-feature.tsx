import { Button, Card, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { useEffect } from "react";
import { t } from "@lingui/core/macro";
import { useChangePassword } from "@/shared/lib/use-auth-api";
import { FormField } from "@/shared/ui";
import { z } from "zod";

// Validation schema
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, t`Current password is required`),
    newPassword: z
      .string()
      .min(8, t`Password must be at least 8 characters`)
      .regex(/[A-Z]/, t`Password must contain at least one uppercase letter`)
      .regex(/[a-z]/, t`Password must contain at least one lowercase letter`)
      .regex(/[0-9]/, t`Password must contain at least one number`)
      .regex(
        /[^A-Za-z0-9]/,
        t`Password must contain at least one special character`
      ),
    confirmPassword: z.string().min(1, t`Please confirm your new password`),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: t`Passwords do not match`,
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: t`New password must be different from current password`,
    path: ["newPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormFeatureProps {
  onSuccess?: () => void;
  showTitle?: boolean;
}

export function ChangePasswordFormFeature({
  onSuccess,
  showTitle = true,
}: ChangePasswordFormFeatureProps) {
  const changePassword = useChangePassword();

  const form = useForm<ChangePasswordFormValues>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: zodResolver(changePasswordSchema),
  });

  // Handle success
  useEffect(() => {
    if (changePassword.isSuccess) {
      // Clear form on success
      form.reset();

      if (onSuccess) {
        onSuccess();
      }
    }
  }, [changePassword.isSuccess, onSuccess]);

  const handleSubmit = (values: ChangePasswordFormValues) => {
    changePassword.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <Card shadow="md" padding="xl" radius="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack gap="md">
          {showTitle && (
            <>
              <Text size="lg" fw={600}>
                {t`Change Password`}
              </Text>
              <Text size="sm" c="dimmed">
                {t`Update your password to keep your account secure.`}
              </Text>
            </>
          )}

          <FormField
            type="password"
            name="currentPassword"
            label={t`Current Password`}
            placeholder={t`Enter your current password`}
            withAsterisk
            form={form}
          />

          <FormField
            type="password"
            name="newPassword"
            label={t`New Password`}
            placeholder={t`Enter your new password`}
            description={t`Min 8 characters with uppercase, lowercase, number, and special character`}
            withAsterisk
            showStrengthIndicator
            form={form}
          />

          <FormField
            type="password"
            name="confirmPassword"
            label={t`Confirm New Password`}
            placeholder={t`Confirm your new password`}
            withAsterisk
            form={form}
          />

          <Button type="submit" fullWidth loading={changePassword.isPending}>
            {t`Change Password`}
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
