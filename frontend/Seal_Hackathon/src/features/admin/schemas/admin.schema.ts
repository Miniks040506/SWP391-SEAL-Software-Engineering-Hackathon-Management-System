import { z } from "zod";
import type { UserRole } from "@/types/auth.types";
import type { UserStatus } from "@/types/user.types";

// Constants

export const ALL_ROLES: readonly UserRole[] = [
  "ADMIN",
  "COORDINATOR",
  "JUDGE",
  "MENTOR",
  "STUDENT",
] as const;

export const CREATE_ROLES = [
  "ADMIN",
  "COORDINATOR",
  "JUDGE",
  "MENTOR",
] as const;

export const ALL_STATUSES = [
  "UNVERIFIED",
  "PENDING_APPROVAL",
  "ACTIVE",
  "SUSPENDED",
  "DEACTIVATED",
] as const satisfies readonly [UserStatus, ...UserStatus[]];

export const CREATE_STATUSES = [
  "ACTIVE",
  "PENDING_APPROVAL",
] as const satisfies readonly [UserStatus, ...UserStatus[]];

// MUI sx Presets
export const textFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
  ".dark & .MuiInputBase-input": { color: "#cbd5e1" },
  ".dark & .MuiInputLabel-root": { color: "#94a3b8" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
  ".dark &:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#64748b" },
  ".dark & .MuiIconButton-root": { color: "#94a3b8" },
};

/* Use for Search TextField in filter bar */
export const filterTextFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
  "& .MuiInputBase-input": { color: "#1e293b" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.87)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#2563eb",
  },
  ".dark & .MuiInputBase-input": { color: "#cbd5e1" },
  ".dark & .MuiInputLabel-root": { color: "#64748b" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
  ".dark &:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
  ".dark & .MuiInputLabel-root.Mui-focused": { color: "#93c5fd" },
  ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#3b82f6",
  },
};

export const selectSx = {
  borderRadius: "10px",
  ".dark &": { color: "#cbd5e1" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
  ".dark &:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#64748b" },
  ".dark & .MuiSvgIcon-root": { color: "#94a3b8" },
};

/* Use for filter Select */
export const filterSelectSx = {
  borderRadius: "10px",
  color: "#1e293b",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)" },
  "&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(0,0,0,0.87)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563eb" },
  ".dark &": { color: "#cbd5e1" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
  ".dark &:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": {
    borderColor: "#475569",
  },
  ".dark &.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
  ".dark & .MuiSvgIcon-root": { color: "#cbd5e1" },
};

export const menuPropsDark = {
  sx: {
    ".dark & .MuiPaper-root": {
      bgcolor: "#1e293b",
      color: "#f1f5f9",
      border: "1px solid #334155",
    },
  },
};

/* MenuProps for light and dark mode */
export const menuPropsAll = {
  sx: {
    "& .MuiPaper-root": {
      bgcolor: "#ffffff",
      color: "#0f172a",
      border: "1px solid #e2e8f0",
    },
    ".dark & .MuiPaper-root": {
      bgcolor: "#1e293b",
      color: "#f1f5f9",
      border: "1px solid #334155",
    },
  },
};

export const paginationSx = {
  "& .MuiPaginationItem-root": {
    color: "#334155",
    borderColor: "#e2e8f0",
    fontWeight: 600,
    borderRadius: "8px",
    minWidth: "32px",
    height: "32px",
    margin: "0 2px",
  },
  "& .MuiPaginationItem-root:hover": {
    backgroundColor: "#f8fafc",
    borderColor: "#3b82f6",
    color: "#2563eb",
  },
  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
    color: "#ffffff",
    "&:hover": { backgroundColor: "#2563eb" },
  },
  "& .MuiPaginationItem-ellipsis": { color: "#94a3b8" },
  ".dark & .MuiPaginationItem-root": {
    color: "#cbd5e1",
    borderColor: "#334155",
  },
  ".dark & .MuiPaginationItem-root:hover": {
    backgroundColor: "#1e293b",
    borderColor: "#3b82f6",
    color: "#60a5fa",
  },
  ".dark & .MuiPaginationItem-ellipsis": { color: "#64748b" },
};

// Zod Schemas

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(100, "Password must be less than 100 characters.")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Must contain at least one number.");

export const createUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(200, "Full name must be less than 200 characters."),
  email: z.string().trim().min(1, "Email is required.").email("Invalid email."),
  password: passwordSchema,
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  role: z.enum(CREATE_ROLES, { message: "Role is required." }),
  status: z.enum(CREATE_STATUSES, { message: "Status is required." }),
});

export type CreateUserFormInput = z.input<typeof createUserSchema>;
export type CreateUserFormValues = z.output<typeof createUserSchema>;

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