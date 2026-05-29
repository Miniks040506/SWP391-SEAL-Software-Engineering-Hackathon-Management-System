import { z } from "zod";
import type { UserStatus } from "@/types/admin.types";

const ALL_ROLES = [
  "ADMIN",
  "COORDINATOR",
  "JUDGE",
  "MENTOR",
  "PARTICIPANT",
  "STUDENT",
  "GUEST",
] as const;

const ALL_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "PENDING",
  "BANNED",
] as const satisfies readonly [UserStatus, ...UserStatus[]];

// Reused across create + reset
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(100, "Password must be less than 100 characters.")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Must contain at least one number.");

// Create

export const createUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(200, "Full name must be less than 200 characters."),

  email: z.string().trim().min(1, "Email is required.").email("Invalid email."),

  password: passwordSchema,

  phone: z.string().trim().max(20).optional().or(z.literal("")),

  role: z.enum(ALL_ROLES, { message: "Role is required." }),

  status: z.enum(ALL_STATUSES, { message: "Status is required." }),
});

export type CreateUserFormInput = z.input<typeof createUserSchema>;
export type CreateUserFormValues = z.output<typeof createUserSchema>;

// Edit

export const editUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(200, "Full name must be less than 200 characters."),

  phone: z.string().trim().max(20).optional().or(z.literal("")),

  role: z.enum(ALL_ROLES, { message: "Role is required." }),

  status: z.enum(ALL_STATUSES, { message: "Status is required." }),
});

export type EditUserFormInput = z.input<typeof editUserSchema>;
export type EditUserFormValues = z.output<typeof editUserSchema>;

// Reset Password

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;