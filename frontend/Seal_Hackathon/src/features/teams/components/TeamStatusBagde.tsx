type TeamStatusBadgeProps = {
  status?: string;
  memberCount?: number;
  maxMembers?: number;
};

function normalizeStatus(status?: string) {
  if (!status) return "";

  return status.toUpperCase();
}

function getStatusLabel(status?: string) {
  const normalized = normalizeStatus(status);

  const labelMap: Record<string, string> = {
    FORMING: "Forming",
    COMPLETE: "Complete",
    INCOMPLETE: "Incomplete",
    REGISTERED: "Registered",
    COMPETING: "Competing",
    ADVANCED: "Advanced",
    ELIMINATED: "Eliminated",
    WINNER: "Winner",
    APPROVED: "Approved",
    PENDING: "Pending",
    PENDING_APPROVAL: "Pending Approval",
    REJECTED: "Rejected",
    ACTIVE: "Competing",
    LEADER: "Leader",
    MEMBER: "Member",
  };

  return labelMap[normalized] ?? status;
}

const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide";

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  FORMING: {
    pill: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  COMPLETE: {
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  INCOMPLETE: {
    pill: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  REGISTERED: {
    pill: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400",
    dot: "bg-sky-500",
  },
  COMPETING: {
    pill: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  ADVANCED: {
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  ELIMINATED: {
    pill: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  WINNER: {
    pill: "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  APPROVED: {
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  PENDING: {
    pill: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  PENDING_APPROVAL: {
    pill: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  REJECTED: {
    pill: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  ACTIVE: {
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  LEADER: {
    pill: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  MEMBER: {
    pill: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
  },
};

const DEFAULT_STYLE = {
  pill: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  dot: "bg-slate-400",
};

export const TeamStatusBadge = ({
  status,
  memberCount,
  maxMembers = 5,
}: TeamStatusBadgeProps) => {
  const normalized = normalizeStatus(status);
  const style = STATUS_STYLES[normalized] ?? DEFAULT_STYLE;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status && (
        <span className={`${PILL_BASE} ${style.pill}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {getStatusLabel(status)}
        </span>
      )}

      {typeof memberCount === "number" && (
        <span
          className={`${PILL_BASE} border-slate-200 bg-white text-slate-600 tabular-nums dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300`}
        >
          {memberCount}/{maxMembers} members
        </span>
      )}
    </div>
  );
};
