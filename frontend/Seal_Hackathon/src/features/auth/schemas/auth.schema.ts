import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required").max(200),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    studentType: z.enum(["FPT", "EXTERNAL"]),
    studentCode: z.string().max(50).optional().or(z.literal("")),
    universityName: z.string().max(200).optional().or(z.literal("")),
    major: z.string().max(200).optional().or(z.literal("")),
    graduationYear: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? Number(value) : undefined)),
  })
  .superRefine((data, ctx) => {
    if (data.studentType === "EXTERNAL" && !data.universityName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["universityName"],
        message: "University name is required for external students.",
      });
    }
  });

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, "Code must contain exactly 6 digits."),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    code: z.string().regex(/^\d{6}$/, "Code must contain exactly 6 digits."),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm password is required."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password confirmation does not match.",
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;