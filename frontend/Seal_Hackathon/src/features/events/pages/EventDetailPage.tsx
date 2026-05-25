import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LoginIcon from '@mui/icons-material/Login';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AnnouncementModal } from '../components/AnnouncementModal';
import { EventMetaGrid } from '../components/EventMetaGrid';
import { EventRoadmap } from '../components/EventRoadmap';
import {
  EventPrizesCard,
  EventAnnouncementsCard,
} from '../components/EventSidebarCards';
import { EVENTS } from '../mocks/events.mock';
import type { Event } from '@/types/event.types';

// TODO: replace EVENTS.find() with TanStack Query when API is ready:
//   const { data: event, isLoading } = useQuery({
//     queryKey: ['event', id],
//     queryFn: () => eventApi.getById(id!),
//   });

/* ── Inline Tracks Section (main column) ── */
const EventTracksSection = ({ tracks }: { tracks: Event['tracks'] }) => (
  <section className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm space-y-6">
    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
      <MenuBookIcon style={{ fontSize: 16 }} className="text-blue-500" />
      Competitive Tracks
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {tracks.map((track) => (
        <div
          key={track.name}
          className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all"
        >
          <span className="inline-block text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full mb-3">
            Track
          </span>
          <h4 className="font-bold text-gray-800 text-sm mb-1.5">{track.name}</h4>
          <p className="text-xs text-gray-500 leading-relaxed">{track.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedAnnouncementIdx, setSelectedAnnouncementIdx] = useState<number | null>(null);

  const event: Event | undefined = EVENTS.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="text-center py-32 space-y-4">
        <p className="text-gray-400 font-semibold">Event not found.</p>
        <button
          onClick={() => navigate('/')}
          className="text-blue-500 text-sm font-bold hover:underline"
        >
          Back to events
        </button>
      </div>
    );
  }

  const isEnded = event.status === 'Ended';

  const handleAnnouncementClose = () => setSelectedAnnouncementIdx(null);
  const handleAnnouncementPrev = () =>
    setSelectedAnnouncementIdx((i) => (i !== null ? Math.max(0, i - 1) : null));
  const handleAnnouncementNext = () =>
    setSelectedAnnouncementIdx((i) =>
      i !== null ? Math.min(event.announcements.length - 1, i + 1) : null,
    );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Announcement modal */}
      {selectedAnnouncementIdx !== null && event.announcements[selectedAnnouncementIdx] && (
        <AnnouncementModal
          announcement={event.announcements[selectedAnnouncementIdx]}
          index={selectedAnnouncementIdx}
          total={event.announcements.length}
          onClose={handleAnnouncementClose}
          onPrev={handleAnnouncementPrev}
          onNext={handleAnnouncementNext}
        />
      )}

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-blue-500 text-sm font-bold transition-colors uppercase tracking-widest"
      >
        <ArrowBackIcon style={{ fontSize: 15 }} /> Back to dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left column: hero → tracks → roadmap ── */}
        <div className="lg:col-span-8 space-y-8">

          {/* Hero card */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={event.status} />
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  event.registrationOpen
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                    : 'text-gray-400 bg-gray-50 border-gray-100'
                }`}
              >
                {event.registrationOpen ? 'REGISTRATION OPEN' : 'REGISTRATION CLOSED'}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{event.title}</h1>
            <p className="text-gray-600 text-base leading-relaxed">{event.description}</p>

            <EventMetaGrid startDate={event.startDate} />

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {event.registrationOpen && (
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-100 transition-all"
                >
                  <LoginIcon style={{ fontSize: 16 }} /> Join Now
                </button>
              )}
              {isEnded && (
                <button
                  onClick={() => navigate(`/standings?eventId=${event.id}`)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-500 text-gray-600 text-sm font-bold rounded-lg shadow-sm transition-all"
                >
                  <LeaderboardIcon style={{ fontSize: 16 }} />
                  View Results
                </button>
              )}
            </div>
          </section>

          {/* Tracks — moved to main column so it's visible without scrolling on mobile */}
          <EventTracksSection tracks={event.tracks} />

          {/* Roadmap */}
          <EventRoadmap currentPhase={event.currentPhase} isEnded={isEnded} />
        </div>

        {/* ── Right sidebar: prizes + announcements ── */}
        <div className="lg:col-span-4 space-y-6">
          <EventPrizesCard prizes={event.prizes} />

          <EventAnnouncementsCard
            announcements={event.announcements}
            onSelect={setSelectedAnnouncementIdx}
          />
        </div>
      </div>
    </div>
  );
};