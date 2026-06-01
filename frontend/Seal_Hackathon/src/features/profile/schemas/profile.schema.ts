import { z } from "zod";

const optionalTrimmedString = z.string().trim().optional().or(z.literal(""));

export const updateMyProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(200, "Full name must not exceed 200 characters."),

  phone: optionalTrimmedString
    .refine((value) => !value || /^\d+$/.test(value), {
      message: "Phone must contain numbers only.",
    })
    .refine((value) => !value || value.length >= 10, {
      message: "Phone must be at least 10 digits.",
    })
    .refine((value) => !value || value.length <= 11, {
      message: "Phone must not exceed 11 digits.",
    }),

  avatarUrl: optionalTrimmedString.refine((value) => !value || value.length <= 500, {
    message: "Avatar URL must not exceed 500 characters.",
  }),
});

export type UpdateMyProfileFormValues = z.infer<typeof updateMyProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(100, "New password must not exceed 100 characters.")
      .regex(/[A-Za-z]/, "Password must contain at least one letter.")
      .regex(/[0-9]/, "Password must contain at least one digit."),

    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters.")
      .max(100, "Confirm password must not exceed 100 characters."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "New password and confirm password do not match.",
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;