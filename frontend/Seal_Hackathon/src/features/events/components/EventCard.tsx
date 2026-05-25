import React from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { Event } from '@/types/event.types';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
}

const MAX_VISIBLE_TRACKS = 2;

export const EventCard = ({ event, onClick }: EventCardProps) => {
  const visibleTracks = event.tracks.slice(0, MAX_VISIBLE_TRACKS);
  const hiddenCount = event.tracks.length - MAX_VISIBLE_TRACKS;

  return (
    <div
      onClick={() => onClick(event)}
      className="group cursor-pointer bg-white border border-gray-200 hover:border-blue-400 hover:shadow-xl rounded-xl p-7 transition-all flex flex-col h-full"
    >
      {/* Top row: status + season */}
      <div className="flex justify-between items-center mb-5">
        <StatusBadge status={event.status} />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {event.season}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-500 transition-colors">
        {event.title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
        {event.description}
      </p>

      {/* ── Track chips ── */}
      {event.tracks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {visibleTracks.map((track) => (
            <span
              key={track.name}
              className="inline-block text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full truncate max-w-[160px]"
            >
              {track.name}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="inline-block text-[11px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full">
              +{hiddenCount} more
            </span>
          )}
        </div>
      )}

      {/* Footer: date + "Details" CTA */}
      <div className="mt-auto flex items-center justify-between text-xs text-gray-400 font-semibold pt-5 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <AccessTimeIcon style={{ fontSize: 13 }} className="text-blue-500" />
          <span>{event.startDate}</span>
        </div>
        <div className="flex items-center gap-1 text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
          Details <ChevronRightIcon style={{ fontSize: 14 }} />
        </div>
      </div>
    </div>
  );
};