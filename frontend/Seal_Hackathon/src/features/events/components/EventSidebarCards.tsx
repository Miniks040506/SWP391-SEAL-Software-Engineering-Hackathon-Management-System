import React from 'react';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CampaignIcon from '@mui/icons-material/Campaign';
import type { Event } from '@/types/event.types';

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
  <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <h3 className="text-xs font-bold text-gray-900 uppercase mb-6 flex items-center gap-2 tracking-widest">
      <CampaignIcon style={{ fontSize: 16 }} className="text-blue-500" />
      Announcements
      {announcements.length > 0 && (
        <span className="ml-auto text-[10px] bg-blue-50 text-blue-500 border border-blue-100 px-2 py-0.5 rounded-full font-bold">
          {announcements.length}
        </span>
      )}
    </h3>
    <div className="space-y-3">
      {announcements.length > 0 ? (
        announcements.map((msg, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="w-full text-left group p-3 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50/50 transition-all">
            <div className="relative pl-4 border-l-2 border-blue-100 group-hover:border-blue-400 transition-colors">
              <p className="text-xs text-gray-700 font-bold leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                {msg.text}
              </p>
              <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 block">
                {msg.date}
              </span>
            </div>
          </button>
        ))
      ) : (
        <p className="text-xs text-gray-400 italic text-center py-4">No recent updates.</p>
      )}
    </div>
  </section>
);
