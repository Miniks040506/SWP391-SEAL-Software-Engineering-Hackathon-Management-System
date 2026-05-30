import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EventIcon from "@mui/icons-material/Event";
import { PublicStatusBadge } from "@/features/events/components/PublicStatusBadge";
import { getSeasonLabel } from "@/features/events/utils/publicEventView";
import type { EventSummaryResponse } from "@/types/event.types";

type EventCardProps = {
  event: EventSummaryResponse;
  onClick: (event: EventSummaryResponse) => void;
};

export function EventCard({ event, onClick }: EventCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className="group flex h-full cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-7 text-left transition-all hover:border-blue-400 hover:shadow-xl"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <PublicStatusBadge status={event.status} />

        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          {getSeasonLabel(event.season, event.year)}
        </span>
      </div>

      <h3 className="mb-2 text-base font-bold text-gray-900 transition-colors group-hover:text-blue-500">
        {event.name}
      </h3>

      <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-gray-500">
        Explore event details, tracks, rounds, prizes, and announcements.
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-5 text-xs font-semibold text-gray-400">
        <div className="flex items-center gap-2">
          <EventIcon style={{ fontSize: 13 }} className="text-blue-500" />
          <span>{event.season} {event.year}</span>
        </div>

        <div className="flex items-center gap-1 text-blue-500 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
          Details <ChevronRightIcon style={{ fontSize: 14 }} />
        </div>
      </div>
    </button>
  );
}