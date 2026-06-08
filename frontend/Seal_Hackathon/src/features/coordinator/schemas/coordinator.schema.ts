export {
  ALL_ROLES,
  ALL_STATUSES,
  CREATE_STATUSES,
  textFieldSx,
  filterTextFieldSx,
  selectSx,
  filterSelectSx,
  menuPropsDark,
  menuPropsAll,
  paginationSx,
  createUserSchema,
  editUserSchema,
  resetPasswordSchema,
} from "@/features/admin/schemas/admin.schema";

export type {
  CreateUserFormInput,
  CreateUserFormValues,
  EditUserFormInput,
  EditUserFormValues,
  ResetPasswordFormValues,
} from "@/features/admin/schemas/admin.schema";

// Coordinators cannot create ADMIN users
export const CREATE_ROLES = [
  "JUDGE",
  "MENTOR",
] as const;