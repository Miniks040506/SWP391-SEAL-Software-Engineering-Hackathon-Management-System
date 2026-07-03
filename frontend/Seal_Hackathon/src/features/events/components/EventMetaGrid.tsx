import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { formatDateTime } from "@/features/events/utils/publicEventView";
import type { EventDetailResponse } from "@/types/event.types";

type EventMetaGridProps = {
  event: EventDetailResponse;
};

export function EventMetaGrid({ event }: EventMetaGridProps) {
  const items = [
    {
      label: "Registration",
      val: `${formatDateTime(event.registrationStartAt)} → ${formatDateTime(
        event.registrationEndAt,
      )}`,
      Icon: EventIcon,
    },
    {
      label: "Venue",
      val: "FPT Uni HCM",
      Icon: LocationOnIcon,
    },
    {
      label: "Competition",
      val: `${formatDateTime(event.competitionStartAt)} â†’ ${formatDateTime(
        event.competitionEndAt,
      )}`,
      Icon: WorkspacePremiumIcon,
    },
    {
      label: "Tracks",
      val: String(event.tracks?.length ?? 0),
      Icon: GroupIcon,
    },
    {
      label: "Awards",
      val: "Certified",
      Icon: WorkspacePremiumIcon,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 pt-6 md:grid-cols-5">
      {items.map(({ label, val, Icon }) => (
        <div
          key={label}
          className="rounded-lg border border-gray-100 bg-gray-50 p-4 transition-all hover:bg-white"
        >
          <Icon style={{ fontSize: 18 }} className="mb-3 text-blue-500" />

          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-400">
            {label}
          </span>

          <span className="block truncate text-sm font-bold text-gray-800">
            {val}
          </span>
        </div>
      ))}
    </div>
  );
}
