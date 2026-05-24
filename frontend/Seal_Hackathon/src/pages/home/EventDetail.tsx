import React, { useMemo } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CampaignIcon from '@mui/icons-material/Campaign';
import { StatusBadge } from './Shared';
import type { Event } from './Shared';

type MuiIcon = React.ElementType;

const ROADMAP_STEPS = [
  { phase: 'Phase 1', title: 'Technical Proposal',    active: true  },
  { phase: 'Phase 2', title: 'Agile Coding Marathon', active: false },
  { phase: 'Phase 3', title: 'Grand Finale Pitch',    active: false },
];

export const EventDetail = ({ event, onBack }: { event: Event; onBack: () => void }) => {
  if (!event) return null;

  // useMemo: avoid recreating array every render; depends on event data
  const META_ITEMS: { label: string; val: string; icon: MuiIcon }[] = useMemo(() => [
    { label: 'Start Date', val: event.startDate, icon: EventIcon },
    { label: 'Venue',      val: 'FPT Uni HCM',  icon: LocationOnIcon },
    { label: 'Audience',   val: 'SE Faculty',    icon: GroupIcon },
    { label: 'Awards',     val: 'Certified',     icon: WorkspacePremiumIcon },
  ], [event.startDate]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-blue-500 text-sm font-bold transition-colors uppercase tracking-widest"
      >
        <ArrowBackIcon style={{ fontSize: 15 }} /> Back to dashboard
      </button>

      {/* 2-col layout: main (8/12) + sidebar (4/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left column */}
        <div className="lg:col-span-8 space-y-8">

          {/* Overview card */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <StatusBadge status={event.status} />
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                event.registrationOpen
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                  : 'text-gray-400 bg-gray-50 border-gray-100'
              }`}>
                {event.registrationOpen ? 'REGISTRATION OPEN' : 'REGISTRATION CLOSED'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{event.title}</h1>
            <p className="text-gray-600 text-base leading-relaxed">{event.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
              {META_ITEMS.map(item => (
                <div key={item.label} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:bg-white transition-all">
                  <item.icon style={{ fontSize: 18 }} className="text-blue-500 mb-3" />
                  <span className="text-xs text-gray-400 block uppercase font-bold tracking-widest mb-1">{item.label}</span>
                  <span className="text-gray-800 font-bold text-sm truncate block">{item.val}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Roadmap */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-10 flex items-center gap-2">
              <AccessTimeIcon style={{ fontSize: 16 }} className="text-blue-500" /> Event Roadmap
            </h2>
            <div className="relative space-y-12 ml-3 border-l border-gray-100">
              {ROADMAP_STEPS.map(step => (
                <div key={step.phase} className="relative pl-10">
                  <div className={`absolute -left-[7.5px] top-1 w-3.5 h-3.5 rounded-full border-4 border-white shadow-md ${
                    step.active ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{step.phase}</span>
                    <h4 className="text-base font-bold text-gray-800">{step.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-6">

          {/* Competitive Tracks */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <MenuBookIcon style={{ fontSize: 16 }} className="text-blue-500" /> Competitive Tracks
            </h3>
            <div className="space-y-4">
              {event.tracks.map(track => (
                <div key={track.name} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-800 text-sm">{track.name}</h4>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{track.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Prize Structure */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 uppercase mb-6 flex items-center gap-2 tracking-widest">
              <EmojiEventsIcon style={{ fontSize: 16 }} className="text-blue-500" /> Prize Structure
            </h3>
            <div className="space-y-3">
              {event.prizes.map(prize => (
                <div key={prize.rank} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{prize.rank}</span>
                  <span className="text-sm font-bold text-gray-800">{prize.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Announcements */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 uppercase mb-6 flex items-center gap-2 tracking-widest">
              <CampaignIcon style={{ fontSize: 16 }} className="text-blue-500" /> Announcements
            </h3>
            <div className="space-y-6">
              {event.announcements.length > 0
                ? event.announcements.map((msg, i) => (
                    <div key={i} className="space-y-1 relative pl-4 border-l-2 border-blue-100">
                      <p className="text-xs text-gray-700 font-bold leading-snug">{msg.text}</p>
                      <span className="text-xs text-gray-400 font-bold uppercase">{msg.date}</span>
                    </div>
                  ))
                : <p className="text-xs text-gray-400 italic text-center py-4">No recent updates.</p>
              }
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};