import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LoginIcon from '@mui/icons-material/Login';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AnnouncementModal } from '../components/AnnouncementModal';
import { EventMetaGrid } from '../components/EventMetaGrid';
import { ProgressTimeline, type TimelineStep } from '../components/ProgressTimeline';
import {
  EventPrizesCard,
  EventAnnouncementsCard,
} from '../components/EventSidebarCards';
import { EVENTS } from '../mocks/events.mock';
import type { Event, Track } from '@/types/event.types';

interface TrackAccordionProps {
  track: Track;
  currentPhase: number;
  isEnded: boolean;
}

const TrackAccordion = ({ track, currentPhase, isEnded }: TrackAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const trackRoundsSteps: TimelineStep[] = (track.rounds || []).map((round: any, index: any) => ({
    label: `Round ${index + 1}`,
    title: round.name,
    duration: round.duration,
  }));

  return (
    <div className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden transition-all duration-300 hover:border-blue-300 hover:shadow-sm">
      {/* Accordion Trigger Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors bg-white hover:bg-gray-50/50"
      >
        <div className="space-y-1 pr-4">
          <span className="inline-block text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Track
          </span>
          <h4 className="font-bold text-gray-900 text-sm md:text-base mt-1">{track.name}</h4>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{track.desc}</p>
        </div>
        <div className="p-1.5 rounded-lg text-gray-400 bg-white border border-gray-200 shadow-sm flex items-center justify-center">
          <div className={`transition-transform duration-300 flex items-center justify-center ${isOpen ? 'rotate-180 text-blue-500' : ''}`}>
            <KeyboardArrowDownIcon style={{ fontSize: 20 }} />
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      <div
        className={`transition-all duration-300 ease-in-out border-t border-gray-100 bg-white overflow-hidden ${
          isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 bg-gray-50/30">
          <ProgressTimeline
            steps={trackRoundsSteps}
            currentPhase={currentPhase}
            isEnded={isEnded}
            showCardWrapper={false}
          />
        </div>
      </div>
    </div>
  );
};

const EventTracksSection = ({ tracks, currentPhase, isEnded }: { tracks: Event['tracks']; currentPhase: number; isEnded: boolean }) => (
  <section className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm space-y-6">
    <div className="space-y-1">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
        <MenuBookIcon style={{ fontSize: 16 }} className="text-blue-500" />
        Competitive Tracks & Rounds
      </h2>
      <p className="text-xs text-gray-400">
        Expand a track below to see its structured execution milestones and ongoing timeline rounds.
      </p>
    </div>
    
    <div className="flex flex-col gap-4">
      {tracks.map((track) => (
        <TrackAccordion 
          key={track.name} 
          track={track} 
          currentPhase={currentPhase} 
          isEnded={isEnded} 
        />
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
        <button onClick={() => navigate('/')} className="text-blue-500 text-sm font-bold hover:underline">
          Back to events
        </button>
      </div>
    );
  }

  const isEnded = event.status === 'Ended';

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Modals */}
      {selectedAnnouncementIdx !== null && event.announcements[selectedAnnouncementIdx] && (
        <AnnouncementModal
          announcement={event.announcements[selectedAnnouncementIdx]}
          index={selectedAnnouncementIdx}
          total={event.announcements.length}
          onClose={() => setSelectedAnnouncementIdx(null)}
          onPrev={() => setSelectedAnnouncementIdx((i) => (i !== null ? Math.max(0, i - 1) : null))}
          onNext={() => setSelectedAnnouncementIdx((i) => i !== null ? Math.min(event.announcements.length - 1, i + 1) : null)}
        />
      )}

      {/* Navigation */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-blue-500 text-sm font-bold transition-colors uppercase tracking-widest"
      >
        <ArrowBackIcon style={{ fontSize: 15 }} /> Back to dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header Card */}
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
                  <LeaderboardIcon style={{ fontSize: 16 }} /> View Results
                </button>
              )}
            </div>
          </section>

          {/* Interactive Tracks Component */}
          <EventTracksSection 
            tracks={event.tracks} 
            currentPhase={event.currentPhase}
            isEnded={isEnded}
          />

          {/* Global Event Roadmap Card - Commented out as per user request */}
          {/* <ProgressTimeline
            title="Event Roadmap"
            icon={<AccessTimeIcon style={{ fontSize: 16 }} className="text-blue-500" />}
            steps={GLOBAL_ROADMAP_STEPS}
            currentPhase={event.currentPhase}
            isEnded={isEnded}
            showCardWrapper={true}
          />
          */}
        </div>

        {/* Sidebar Column */}
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