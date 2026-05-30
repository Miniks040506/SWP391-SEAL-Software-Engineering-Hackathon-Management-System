import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import type {
  CoordinatorEvent,
  CoordinatorEventStatus,
} from "../mocks/coordinatorEvents.mock";

// Status badge
const STATUS_STYLES: Record<
  CoordinatorEventStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  ONGOING: {
    bg: "#eff6ff",
    text: "#2563eb",
    border: "#bfdbfe",
    label: "ONGOING",
  },
  DRAFT: { bg: "#fffbeb", text: "#d97706", border: "#fde68a", label: "DRAFT" },
  ENDED: { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb", label: "ENDED" },
};

const StatusBadge = ({ status }: { status: CoordinatorEventStatus }) => {
  const s = STATUS_STYLES[status];
  const isOngoing = status === "ONGOING";
  return (
    <span
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-[11px] font-extrabold tracking-widest">
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

// Stat item
const Stat = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) => (
  <div className="flex items-center gap-1.5 text-sm text-gray-600">
    <span className="text-slate-400">{icon}</span>
    <span>
      <strong className="font-bold text-gray-800">{value}</strong> {label}
    </span>
  </div>
);

// Props
interface CoordinatorEventCardProps {
  event: CoordinatorEvent;
  // Static preview data - will be replaced by real API data later
  trackCount?: number;
  approvedTeams?: number;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

// Component
export const CoordinatorEventCard = ({
  event,
  trackCount = 3,
  approvedTeams = 36,
  onEdit,
  onView,
}: CoordinatorEventCardProps) => {
  const isOngoing = event.status === "ONGOING";

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-1 flex-col p-6">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={event.status} />
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {event.season}
          </span>
        </div>

        {/* Title */}
        <h2 className="mt-4 line-clamp-1 text-base font-bold tracking-tight text-slate-800">
          {event.name}
        </h2>

        {/* Stats */}
        <div className="mt-4 flex flex-col gap-y-2.5 border-y border-gray-100 py-4">
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

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(event.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-bold transition hover:bg-slate-50 ${
              isOngoing
                ? "border-blue-200 text-blue-700"
                : "border-gray-200 text-gray-700"
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
                ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                : "border-gray-200 text-gray-700 hover:bg-slate-50"
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
