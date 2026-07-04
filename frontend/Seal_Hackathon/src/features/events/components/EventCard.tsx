import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EventIcon from "@mui/icons-material/Event";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { PublicStatusBadge } from "@/features/events/components/PublicStatusBadge";
import {
  formatShortDate,
  getSeasonLabel,
} from "@/features/events/utils/publicEventView";
import type { EventSummaryResponse } from "@/types/event.types";

type EventCardProps = {
  event: EventSummaryResponse;
  onClick: (event: EventSummaryResponse) => void;
  onGoCompeting?: (event: EventSummaryResponse) => void;
  canCompete?: boolean;
};

export function EventCard({
  event,
  onClick,
  onGoCompeting,
  canCompete = false,
}: EventCardProps) {
  const competitionPeriod = `${formatShortDate(
    event.competitionStartAt,
  )} - ${formatShortDate(event.competitionEndAt)}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-blue-400 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500">
      <button
        type="button"
        onClick={() => onClick(event)}
        className="flex flex-1 flex-col p-7 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <PublicStatusBadge status={event.status} />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {getSeasonLabel(event.season, event.year)}
          </span>
        </div>

        <h3 className="mb-2 text-base font-bold text-gray-900 transition-colors group-hover:text-blue-500 dark:text-white">
          {event.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
          Explore event details, tracks, rounds, prizes, and announcements.
        </p>

        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
          Competition: {competitionPeriod}
        </p>
      </button>

      <footer className="mx-7 flex items-center justify-between border-t border-gray-100 py-5 text-xs font-semibold text-gray-400 dark:border-slate-800">
        <span className="flex items-center gap-2">
          <EventIcon style={{ fontSize: 13 }} className="text-blue-500" />
          {event.season} {event.year}
        </span>

        {canCompete ? (
          <button
            type="button"
            onClick={() => onGoCompeting?.(event)}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 font-bold text-white transition-all hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-95"
          >
            Compete <RocketLaunchIcon style={{ fontSize: 14 }} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onClick(event)}
            className="inline-flex items-center gap-1 font-bold text-blue-500 transition-transform hover:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            Details <ChevronRightIcon style={{ fontSize: 14 }} />
          </button>
        )}
      </footer>
    </article>
  );
}
