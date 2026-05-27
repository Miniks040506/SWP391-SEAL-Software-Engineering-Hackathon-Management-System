import type { AuthUser, UserRole } from "@/types/auth.types";

export function getDashboardPathByRole(role: UserRole): string {
  switch (role) {
    case "STUDENT":
      return "/events";

    case "JUDGE":
      return "/judge/dashboard";

    case "MENTOR":
      return "/mentor/dashboard";

    case "COORDINATOR":
      return "/coordinator/dashboard";

    case "ADMIN":
      return "/admin/dashboard";

    case "PARTICIPANT":
      return "/events";

    case "GUEST":
      return "/login";

    default:
      return "/login";
  }
}

export function getUserRoles(user: AuthUser | null | undefined): UserRole[] {
  if (!user) return [];

  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles;
  }

  if (user.role) {
    return [user.role];
  }

  return [];
}

export function getRoleRedirectPath(user: AuthUser | null | undefined): string {
  const roles = getUserRoles(user);

  if (roles.length === 0) {
    return "/login";
  }

  // Ưu tiên role mạnh hơn nếu sau này user có nhiều role
  if (roles.includes("ADMIN")) {
    return getDashboardPathByRole("ADMIN");
  }

  if (roles.includes("COORDINATOR")) {
    return getDashboardPathByRole("COORDINATOR");
  }

  if (roles.includes("JUDGE")) {
    return getDashboardPathByRole("JUDGE");
  }

  if (roles.includes("MENTOR")) {
    return getDashboardPathByRole("MENTOR");
  }

  if (roles.includes("STUDENT")) {
    return getDashboardPathByRole("STUDENT");
  }

  if (roles.includes("PARTICIPANT")) {
    return getDashboardPathByRole("PARTICIPANT");
  }

  return "/login";
}