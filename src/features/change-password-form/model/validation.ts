import { z } from "zod";
import { t } from "@lingui/core/macro";

export const changePasswordFormSchema = z
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

export type ChangePasswordFormSchemaType = z.infer<
  typeof changePasswordFormSchema
>;

export const initialChangePasswordValues: ChangePasswordFormSchemaType = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
