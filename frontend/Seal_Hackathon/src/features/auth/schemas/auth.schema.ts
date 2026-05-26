import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(100, "Password must be less than 100 characters.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Invalid email format."),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(200, "Full name must be less than 200 characters."),

    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Invalid email format."),

    password: passwordSchema,

    phone: z
      .string()
      .trim()
      .max(20, "Phone must be less than 20 characters.")
      .optional()
      .or(z.literal("")),

    studentType: z.enum(["FPT", "EXTERNAL"]),

    studentCode: z
      .string()
      .trim()
      .max(50, "Student code must be less than 50 characters.")
      .optional()
      .or(z.literal("")),

    universityName: z
      .string()
      .trim()
      .max(200, "University name must be less than 200 characters.")
      .optional()
      .or(z.literal("")),

    major: z
      .string()
      .trim()
      .max(200, "Major must be less than 200 characters.")
      .optional()
      .or(z.literal("")),

    graduationYear: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || /^\d{4}$/.test(value), {
        message: "Graduation year must be 4 digits.",
      })
      .transform((value) => (value ? Number(value) : undefined)),
  })
  .superRefine((values, ctx) => {
    if (values.studentType === "EXTERNAL" && !values.universityName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["universityName"],
        message: "University name is required for external students.",
      });
    }
  });

export type RegisterFormInput = z.input<typeof registerSchema>;
export type RegisterFormValues = z.output<typeof registerSchema>;

export const verifyEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Invalid email format."),

  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Code must contain exactly 6 digits."),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Invalid email format."),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Reset code must contain exactly 6 digits."),
});

export type ResetPasswordCodeFormValues = z.infer<typeof resetPasswordCodeSchema>;

export const resetPasswordNewPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password confirmation does not match.",
  });

export type ResetPasswordNewPasswordFormValues = z.infer<
  typeof resetPasswordNewPasswordSchema
>;

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Invalid email format."),

    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Reset code must contain exactly 6 digits."),

    newPassword: passwordSchema,

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password confirmation does not match.",
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
