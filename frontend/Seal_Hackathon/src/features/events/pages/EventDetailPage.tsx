import { useState } from "react";
import { useParams, useNavigate, useMatch } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import LoginIcon from "@mui/icons-material/Login";

import { StatusBadge } from "@/components/common/StatusBadge";
import { AnnouncementModal } from "../components/AnnouncementModal";
import { EventAnnouncementsCard } from "../components/EventAnnouncementsCard";
import { EventMetaGrid } from "../components/EventMetaGrid";
import { EventPrizesCard } from "../components/EventPrizesCard";
import { EventTracksSection } from "../components/EventTracksSection";
import { EVENTS } from "../mocks/events.mock";
import type { Event } from "@/types/event.types";

// Sub-components

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="py-32 text-center space-y-4">
      <p className="text-sm font-semibold text-gray-400">Event not found.</p>
      <button
        onClick={() => navigate("/")}
        className="text-sm font-bold text-blue-500 hover:underline"
      >
        Back to events
      </button>
    </div>
  );
}

interface ActionButtonsProps {
  event: Event;
  isCoordinator: boolean;
  onEdit: () => void;
  onJoin: () => void;
  onViewResults: () => void;
}

function ActionButtons({ event, isCoordinator, onEdit, onJoin, onViewResults }: ActionButtonsProps) {
  if (isCoordinator) {
    return (
      <button
        onClick={onEdit}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-200 transition-all"
      >
        <EditOutlinedIcon style={{ fontSize: 16 }} />
        Edit Event
      </button>
    );
  }

  return (
    <>
      {event.registrationOpen && (
        <button
          onClick={onJoin}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-100 transition-all"
        >
          <LoginIcon style={{ fontSize: 16 }} />
          Join Now
        </button>
      )}
      {event.status === "Ended" && (
        <button
          onClick={onViewResults}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-500 text-gray-600 text-sm font-bold rounded-lg shadow-sm transition-all"
        >
          <LeaderboardIcon style={{ fontSize: 16 }} />
          View Results
        </button>
      )}
    </>
  );
}

// Page

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCoordinator = !!useMatch("/coordinator/events/:id/view");

  const event: Event | undefined = EVENTS.find((e) => e.id === id);

  const [announcementIdx, setAnnouncementIdx] = useState<number | null>(null);
  const [showAnnouncementsList, setShowAnnouncementsList] = useState(false);
  const [cameFromList, setCameFromList] = useState(false);

  if (!event) return <NotFound />;

  // Navigation

  const backLabel = isCoordinator ? "Back to Event Management" : "Back to dashboard";
  const handleBack = () => navigate(isCoordinator ? "/coordinator/events" : "/");

  // Announcement handlers

  const openAnnouncement = (idx: number, fromList = false) => {
    setAnnouncementIdx(idx);
    setCameFromList(fromList);
  };

  const closeAnnouncement = () => {
    setAnnouncementIdx(null);
    setCameFromList(false);
  };

  const handleAnnouncementBack = () => {
    setAnnouncementIdx(null);
    setShowAnnouncementsList(true);
    setCameFromList(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Announcement modal */}
      {announcementIdx !== null && event.announcements[announcementIdx] && (
        <AnnouncementModal
          announcement={event.announcements[announcementIdx]}
          index={announcementIdx}
          total={event.announcements.length}
          showBackButton={cameFromList}
          onClose={closeAnnouncement}
          onPrev={() => setAnnouncementIdx((i) => (i !== null ? Math.max(0, i - 1) : null))}
          onNext={() =>
            setAnnouncementIdx((i) =>
              i !== null ? Math.min(event.announcements.length - 1, i + 1) : null,
            )
          }
          onBack={handleAnnouncementBack}
        />
      )}

      {/* Back navigation */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-400 hover:text-blue-500 text-sm font-bold uppercase tracking-widest transition-colors"
      >
        <ArrowBackIcon style={{ fontSize: 15 }} />
        {backLabel}
      </button>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <section className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={event.status} />
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  event.registrationOpen
                    ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                    : "text-gray-400 bg-gray-50 border-gray-100"
                }`}
              >
                {event.registrationOpen ? "REGISTRATION OPEN" : "REGISTRATION CLOSED"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{event.title}</h1>
            <p className="text-gray-600 text-base leading-relaxed">{event.description}</p>

            <EventMetaGrid startDate={event.startDate} />

            <div className="flex flex-wrap gap-3 pt-2">
              <ActionButtons
                event={event}
                isCoordinator={isCoordinator}
                onEdit={() => navigate(`/coordinator/events/${id}/edit`)}
                onJoin={() => navigate("/login")}
                onViewResults={() => navigate(`/standings?eventId=${event.id}`)}
              />
            </div>
          </section>

          <EventTracksSection
            tracks={event.tracks}
            currentPhase={event.currentPhase}
            isEnded={event.status === "Ended"}
          />
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <EventPrizesCard tracks={event.tracks} />
          <EventAnnouncementsCard
            announcements={event.announcements}
            onSelect={openAnnouncement}
            showAllModal={showAnnouncementsList}
            setShowAllModal={setShowAnnouncementsList}
          />
        </div>
      </div>
    </div>
  );
};