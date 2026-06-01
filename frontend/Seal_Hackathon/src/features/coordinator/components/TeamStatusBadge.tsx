import type { TeamStatus } from "../hooks/useEditEventMutation";

const STATUS_STYLES: Record<TeamStatus, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  REJECTED: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
};

export const TeamStatusBadge = ({ status }: { status: TeamStatus }) => (
  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide ${STATUS_STYLES[status]}`}>
    {status}
  </span>
);