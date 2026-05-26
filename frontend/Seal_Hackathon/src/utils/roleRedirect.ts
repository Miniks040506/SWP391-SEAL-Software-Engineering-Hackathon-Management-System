import type { UserRole } from "@/types/auth.types";

export function getDashboardPathByRole(role: UserRole): string {
  switch (role) {
    case "STUDENT":
      return "/student/dashboard";
    case "JUDGE":
      return "/judge/dashboard";
    case "MENTOR":
      return "/mentor/dashboard";
    case "COORDINATOR":
      return "/coordinator/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    default:
      return "/login";
  }
}