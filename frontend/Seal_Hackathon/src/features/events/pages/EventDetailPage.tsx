import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import LoginIcon from "@mui/icons-material/Login";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AnnouncementModal } from "../components/AnnouncementModal";
import { EventMetaGrid } from "../components/EventMetaGrid";
import { EventTracksSection } from "../components/EventTracksSection";
import { EventPrizesCard } from "../components/EventPrizesCard";
import { EventAnnouncementsCard } from "../components/EventAnnouncementsCard";
import { EVENTS } from "../mocks/events.mock";
import type { Event } from "@/types/event.types";

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedAnnouncementIdx, setSelectedAnnouncementIdx] = useState<number | null>(null);
  const [showAnnouncementsList, setShowAnnouncementsList] = useState(false);
  const [cameFromList, setCameFromList] = useState(false);

  const event: Event | undefined = EVENTS.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="text-center py-32 space-y-4">
        <p className="text-gray-400 font-semibold">Event not found.</p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-500 text-sm font-bold hover:underline"
        >
          Back to events
        </button>
      </div>
    );
  }

  const isEnded = event.status === "Ended";

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Modals */}
      {selectedAnnouncementIdx !== null &&
        event.announcements[selectedAnnouncementIdx] && (
          <AnnouncementModal
            announcement={event.announcements[selectedAnnouncementIdx]}
            index={selectedAnnouncementIdx}
            total={event.announcements.length}
            showBackButton={cameFromList}
            onClose={() => {
              setSelectedAnnouncementIdx(null);
              setCameFromList(false);
            }}
            onPrev={() =>
              setSelectedAnnouncementIdx((i) => (i !== null ? Math.max(0, i - 1) : null))
            }
            onNext={() =>
              setSelectedAnnouncementIdx((i) =>
                i !== null ? Math.min(event.announcements.length - 1, i + 1) : null
              )
            }
            onBack={() => {
              setSelectedAnnouncementIdx(null);
              setShowAnnouncementsList(true);
              setCameFromList(false);
            }}
          />
        )}

      {/* Navigation */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-400 hover:text-blue-500 text-sm font-bold transition-colors uppercase tracking-widest"
      >
        <ArrowBackIcon style={{ fontSize: 15 }} /> Back to dashboard
      </button>

      {/* 2-column layout */}
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
              {event.registrationOpen && (
                <button
                  onClick={() => navigate("/login")}
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

          <EventTracksSection
            tracks={event.tracks}
            currentPhase={event.currentPhase}
            isEnded={isEnded}
          />
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <EventPrizesCard tracks={event.tracks} />
          <EventAnnouncementsCard
            announcements={event.announcements}
            onSelect={(idx, fromList = false) => {
              setSelectedAnnouncementIdx(idx);
              setCameFromList(fromList);
            }}
            showAllModal={showAnnouncementsList}
            setShowAllModal={setShowAnnouncementsList}
          />
        </div>
      </div>
    </div>
  );
};