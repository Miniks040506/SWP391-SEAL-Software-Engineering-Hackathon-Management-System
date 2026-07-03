import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import type { EventSummaryResponse } from "@/types/event.types";

type CountValue = number | string | null | undefined;

type CoordinatorEventCardProps = {
  event: EventSummaryResponse;
  trackCount?: CountValue;
  registeredTeams?: CountValue;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
};

const STATUS_STYLES: Record<string, { classes: string; label: string }> = {
  ONGOING: {
    classes: "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
    label: "ONGOING",
  },
  REGISTRATION: {
    classes: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    label: "REGISTRATION",
  },
  DRAFT: {
    classes: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    label: "DRAFT",
  },
  COMPLETED: {
    classes: "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300",
    label: "COMPLETED",
  },
  ENDED: {
    classes: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
    label: "ENDED",
  },
  CANCELLED: {
    classes: "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300",
    label: "CANCELLED",
  },
  ARCHIVED: {
    classes: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
    label: "ARCHIVED",
  },
};

function normalizeStatus(status?: string | null) {
  return (status || "DRAFT").trim().toUpperCase();
}

function StatusBadge({ status }: { status?: string | null }) {
  const key = normalizeStatus(status);
  const style = STATUS_STYLES[key] ?? {
    classes: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
    label: key,
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1",
        "text-[11px] font-extrabold uppercase tracking-widest",
        style.classes,
      ].join(" ")}
    >
      {key === "ONGOING" && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
        </span>
      )}

      {style.label}
    </span>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: CountValue; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
      <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      <span>
        <strong className="font-bold text-gray-900 dark:text-slate-200">{value ?? "—"}</strong> {label}
      </span>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "â€”";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "â€”";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatCompetitionPeriod(event: EventSummaryResponse) {
  const start = formatDate(event.competitionStartAt);
  const end = formatDate(event.competitionEndAt);
  if (start === "â€”" && end === "â€”") return "â€”";
  return `${start} - ${end}`;
}

export function CoordinatorEventCard({ event, trackCount, registeredTeams, onEdit, onView }: CoordinatorEventCardProps) {
  const status = normalizeStatus(event.status);
  const isHighlighted = status === "ONGOING" || status === "REGISTRATION";

  return (
    <div className="relative flex min-h-75 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md dark:border-slate-700 dark:bg-[#1e293b]">
      {event.bannerUrl && <img src={event.bannerUrl} alt={event.name} className="-mx-6 -mt-6 mb-5 aspect-21/9 w-[calc(100%+3rem)] object-cover" />}

      <div className="flex items-center justify-between gap-3">
        <StatusBadge status={event.status} />

        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-slate-500">{event.season}</span>
      </div>

      <h2 className="mt-5 line-clamp-2 text-base font-bold text-gray-900 dark:text-white">{event.name}</h2>

      <div className="mt-5 space-y-3 border-y border-gray-100 py-5 dark:border-slate-700">
        <Stat icon={<EventAvailableOutlinedIcon sx={{ fontSize: 16 }} />} value={formatCompetitionPeriod(event)} label="Competition" />

        <Stat icon={<LayersOutlinedIcon sx={{ fontSize: 16 }} />} value={trackCount ?? "—"} label="Tracks" />

        <Stat icon={<GroupsOutlinedIcon sx={{ fontSize: 16 }} />} value={registeredTeams ?? "—"} label="Registered Teams" />
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <button
          type="button"
          onClick={() => onEdit(event.id)}
          className={[
            "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition",
            isHighlighted
              ? "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-500/30 dark:text-blue-300 dark:hover:bg-blue-500/10"
              : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/50",
          ].join(" ")}
        >
          <EditOutlinedIcon sx={{ fontSize: 17 }} />
          Edit
        </button>

        <button
          type="button"
          onClick={() => onView(event.id)}
          className={[
            "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition",
            isHighlighted
              ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
              : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/50",
          ].join(" ")}
        >
          <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
          View
        </button>
      </div>
    </div>
  );
}
