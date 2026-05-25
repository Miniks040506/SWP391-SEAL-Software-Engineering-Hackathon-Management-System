import React from 'react';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CampaignIcon from '@mui/icons-material/Campaign';
import type { Event } from '@/types/event.types';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Competitive Tracks
interface EventTracksCardProps {
  tracks: Event['tracks'];
}

export const EventTracksCard = ({ tracks }: EventTracksCardProps) => (
  <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
      <MenuBookIcon style={{ fontSize: 16 }} className="text-blue-500" />
      Competitive Tracks
    </h3>
    <div className="space-y-4">
      {tracks.map((track) => (
        <div key={track.name} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <h4 className="font-bold text-gray-800 text-sm">{track.name}</h4>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{track.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

// Prize Structure
interface EventPrizesCardProps {
  prizes: Event['prizes'];
}

/* Returns null when the event has no prizes defined. */
export const EventPrizesCard = ({ prizes }: EventPrizesCardProps) => {
  if (prizes.length === 0) return null;

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-xs font-bold text-gray-900 uppercase mb-6 flex items-center gap-2 tracking-widest">
        <EmojiEventsIcon style={{ fontSize: 16 }} className="text-blue-500" />
        Prize Structure
      </h3>
      <div className="space-y-3">
        {prizes.map((prize) => (
          <div
            key={prize.rank}
            className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0"
          >
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {prize.rank}
            </span>
            <span className="text-sm font-bold text-gray-800">{prize.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

// Announcements

interface EventAnnouncementsCardProps {
  announcements: Event['announcements'];
  onSelect: (index: number) => void;
}

export const EventAnnouncementsCard = ({
  announcements,
  onSelect,
}: EventAnnouncementsCardProps) => (
  <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
        <CampaignIcon style={{ fontSize: 16 }} className="text-blue-500" />
        Latest Announcements
      </h3>
      {announcements.length > 0 && (
        <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full font-black tabular-nums">
          {announcements.length}
        </span>
      )}
    </div>

    <div className="space-y-3">
      {announcements.length > 0 ? (
        announcements.map((msg, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="w-full text-left group p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-blue-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-50"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {msg.date}
                </span>
                {msg.phase && (
                  <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                    Phase {msg.phase}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-800 font-bold leading-relaxed group-hover:text-blue-600 transition-colors line-clamp-2">
                {msg.text}
              </p>

              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 group-hover:text-blue-500 transition-colors pt-1 border-t border-gray-100/60">
                <OpenInNewIcon style={{ fontSize: 10 }} />
                <span>More details</span>
              </div>
            </div>
          </button>
        ))
      ) : (
        <p className="text-xs text-gray-400 italic text-center py-4">No recent updates.</p>
      )}
    </div>
  </section>
);