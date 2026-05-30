import type { UserRole } from "@/types/auth.types";
import type { UserStatus } from "@/types/user.types";

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-red-100 text-red-700",
  COORDINATOR: "bg-purple-100 text-purple-700",
  JUDGE: "bg-yellow-100 text-yellow-700",
  MENTOR: "bg-pink-100 text-pink-700",
  PARTICIPANT: "bg-blue-100 text-blue-700",
  STUDENT: "bg-green-100 text-green-700",
  GUEST: "bg-slate-100 text-slate-500",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider ${ROLE_COLORS[role]}`}
    >
      {role}
    </span>
  );
}

export function StatusDot({ status }: { status: UserStatus }) {
  const dotColor =
    status === "ACTIVE"
      ? "bg-green-500"
      : status === "PENDING"
        ? "bg-orange-400"
        : status === "BANNED"
          ? "bg-red-500"
          : "bg-slate-400";

  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-600">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}