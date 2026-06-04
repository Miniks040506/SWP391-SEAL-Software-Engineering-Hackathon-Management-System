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

export function getPrimaryRole(
  user: AuthUser | null | undefined,
): UserRole | null {
  const roles = getUserRoles(user);

  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("COORDINATOR")) return "COORDINATOR";
  if (roles.includes("JUDGE")) return "JUDGE";
  if (roles.includes("MENTOR")) return "MENTOR";
  if (roles.includes("STUDENT")) return "STUDENT";
  if (roles.includes("PARTICIPANT")) return "PARTICIPANT";

  return null;
}

export function getRoleRedirectPath(user: AuthUser | null | undefined): string {
  const primaryRole = getPrimaryRole(user);

  if (!primaryRole) {
    return "/login";
  }

  return getDashboardPathByRole(primaryRole);
}