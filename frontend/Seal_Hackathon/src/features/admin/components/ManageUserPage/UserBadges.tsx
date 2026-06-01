import type { UserRole } from "@/types/auth.types";
import type { UserStatus } from "@/types/user.types";

const ROLE_COLORS: Record<UserRole, string> & Record<string, string> = {
  ADMIN: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  COORDINATOR: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
  EVENT_COORDINATOR: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300",
  JUDGE: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300",
  MENTOR: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300",
  PARTICIPANT: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
  STUDENT: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${ROLE_COLORS[role]}`}>
      {role}
    </span>
  );
}

export function StatusDot({ status }: { status: UserStatus }) {
  const dotColor =
    status === "ACTIVE"
      ? "bg-green-500"
      : status === "PENDING_APPROVAL"
        ? "bg-orange-400"
        : status === "UNVERIFIED"
          ? "bg-blue-400"
          : status === "SUSPENDED"
            ? "bg-red-500"
            : "bg-slate-400"; // DEACTIVATED

  const label = status === "PENDING_APPROVAL" ? "Pending Approval"
    : status === "UNVERIFIED" ? "Unverified"
    : status === "DEACTIVATED" ? "Deactivated"
    : status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}