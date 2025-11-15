import { z } from "zod";
import { msg } from "@lingui/core/macro";
import { i18n } from "@lingui/core";

export const changePasswordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, i18n._(msg`Current password is required`)),
    newPassword: z
      .string()
      .min(8, i18n._(msg`Password must be at least 8 characters`))
      .regex(
        /[A-Z]/,
        i18n._(msg`Password must contain at least one uppercase letter`)
      )
      .regex(
        /[a-z]/,
        i18n._(msg`Password must contain at least one lowercase letter`)
      )
      .regex(/[0-9]/, i18n._(msg`Password must contain at least one number`))
      .regex(
        /[^A-Za-z0-9]/,
        i18n._(msg`Password must contain at least one special character`)
      ),
    confirmPassword: z
      .string()
      .min(1, i18n._(msg`Please confirm your new password`)),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: i18n._(msg`Passwords do not match`),
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: i18n._(msg`New password must be different from current password`),
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
