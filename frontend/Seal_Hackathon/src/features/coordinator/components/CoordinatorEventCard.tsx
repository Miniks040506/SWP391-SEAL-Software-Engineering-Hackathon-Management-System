import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import type {
  CoordinatorEvent,
  CoordinatorEventStatus,
} from "../mocks/coordinatorEvents.mock";

const STATUS_STYLES: Record<
  CoordinatorEventStatus,
  { classes: string; label: string }
> = {
  ONGOING: {
    classes: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    label: "ONGOING",
  },
  DRAFT: { 
    classes: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20", 
    label: "DRAFT" 
  },
  ENDED: { 
    classes: "bg-gray-50 text-gray-500 border-gray-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700", 
    label: "ENDED" 
  },
};

const StatusBadge = ({ status }: { status: CoordinatorEventStatus }) => {
  const s = STATUS_STYLES[status];
  const isOngoing = status === "ONGOING";
  
  return (
    <span className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-[11px] font-extrabold tracking-widest ${s.classes}`}>
      {isOngoing && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
        </span>
      )}
      {s.label}
    </span>
  );
};

const Stat = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) => (
  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-400">
    <span className="text-slate-400 dark:text-slate-500">{icon}</span>
    <span>
      <strong className="font-bold text-gray-800 dark:text-slate-300">{value}</strong> {label}
    </span>
  </div>
);

interface CoordinatorEventCardProps {
  event: CoordinatorEvent;
  trackCount?: number;
  approvedTeams?: number;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

export const CoordinatorEventCard = ({
  event,
  trackCount = 3,
  approvedTeams = 36,
  onEdit,
  onView,
}: CoordinatorEventCardProps) => {
  const isOngoing = event.status === "ONGOING";

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] transition-shadow duration-200 hover:shadow-md dark:hover:shadow-black/40">
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={event.status} />
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
            {event.season}
          </span>
        </div>

        <h2 className="mt-4 line-clamp-1 text-base font-bold tracking-tight text-slate-800 dark:text-slate-300">
          {event.name}
        </h2>

        <div className="mt-4 flex flex-col gap-y-2.5 border-y border-gray-100 dark:border-slate-700/50 py-4">
          <Stat
            icon={<LayersOutlinedIcon sx={{ fontSize: 16 }} />}
            value={trackCount}
            label="Tracks"
          />
          <Stat
            icon={<GroupsOutlinedIcon sx={{ fontSize: 16 }} />}
            value={approvedTeams}
            label="Approved Teams"
          />
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(event.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-bold transition ${
              isOngoing
                ? "border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-500/30 dark:text-blue-400 dark:hover:bg-blue-500/10"
                : "border-gray-200 text-gray-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700/50"
            }`}
          >
            <EditOutlinedIcon sx={{ fontSize: 15 }} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onView(event.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-bold transition ${
              isOngoing
                ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:border-blue-600 dark:text-slate-200 dark:hover:bg-blue-500"
                : "border-gray-200 text-gray-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700/50"
            }`}
          >
            <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
            View
          </button>
        </div>
      </div>
    </div>
  );
};