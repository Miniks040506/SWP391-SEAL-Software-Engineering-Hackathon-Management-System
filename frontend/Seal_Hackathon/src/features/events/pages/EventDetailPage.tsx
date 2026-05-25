import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CampaignIcon from "@mui/icons-material/Campaign";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import LoginIcon from "@mui/icons-material/Login";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EVENTS } from "../mocks/events.mock";
import type { Event, Announcement } from "@/types/event.types";

type MuiIcon = React.ElementType;

const BASE_STEPS = [
  { phase: "Phase 1", title: "Technical Proposal" },
  { phase: "Phase 2", title: "Agile Coding Marathon" },
  { phase: "Phase 3", title: "Grand Finale Pitch" },
];

const getRoadmapSteps = (currentPhase: number) =>
  BASE_STEPS.map((step, i) => ({ ...step, active: i < currentPhase }));

// Announcement Detail Modal
interface AnnouncementModalProps {
  announcement: Announcement;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const AnnouncementModal = ({
  announcement,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: AnnouncementModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
  onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-5 animate-in zoom-in-95 duration-200" 
    onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <CampaignIcon style={{ fontSize: 18 }} className="text-blue-500 mt-0.5 shrink-0" />
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
            Announcement
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all -mt-1 -mr-1">
          <CloseIcon style={{ fontSize: 18 }} />
        </button>
      </div>

      {/* Body */}
      <p className="text-gray-800 text-sm font-semibold leading-relaxed">
        {announcement.text}
      </p>

      {/* Date */}
      <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest pt-1 border-t border-gray-50">
        <CalendarTodayIcon style={{ fontSize: 12 }} />
        {announcement.date}
      </div>

      {/* Pagination controls if multiple announcements */}
      {total > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onPrev}
            disabled={index === 0}
            className="px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ArrowBackIcon style={{ fontSize: 14 }} /> Previous
          </button>
          <span className="text-xs text-gray-400 font-semibold">
            {index + 1} / {total}
          </span>
          <button
            onClick={onNext}
            disabled={index === total - 1}
            className="px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            Next <ArrowForwardIcon style={{ fontSize: 14 }} />
          </button>
        </div>
      )}
    </div>
  </div>
);

// TODO: when API is connected, replace EVENTS.find() with:
//   const { data: event, isLoading } = useQuery({
//     queryKey: ['event', id],
//     queryFn: () => eventApi.getById(id!),
//   });
export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [selectedAnnouncementIdx, setSelectedAnnouncementIdx] = useState<number | null>(null);

  const event: Event | undefined = EVENTS.find((e) => e.id === id);

  const META_ITEMS: { label: string; val: string; icon: MuiIcon }[] = useMemo(
    () => [
      { label: "Start Date", val: event?.startDate ?? "-", icon: EventIcon },
      { label: "Venue", val: "FPT Uni HCM", icon: LocationOnIcon },
      { label: "Audience", val: "SE Faculty", icon: GroupIcon },
      { label: "Awards", val: "Certified", icon: WorkspacePremiumIcon },
    ],
    [event?.startDate],
  );

  if (!event) {
    return (
      <div className="text-center py-32 space-y-4">
        <p className="text-gray-400 font-semibold">Event not found.</p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-500 text-sm font-bold hover:underline">
          Back to events
        </button>
      </div>
    );
  }

  const roadmapSteps = getRoadmapSteps(event.currentPhase);
  const isEnded = event.status === "Ended";

  const handleAnnouncementClose = () => setSelectedAnnouncementIdx(null);
  const handleAnnouncementPrev = () =>
    setSelectedAnnouncementIdx((i) => (i !== null ? Math.max(0, i - 1) : null));
  const handleAnnouncementNext = () =>
    setSelectedAnnouncementIdx((i) =>
      i !== null ? Math.min(event.announcements.length - 1, i + 1) : null,
    );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Announcement Modal */}
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

      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-400 hover:text-blue-500 text-sm font-bold transition-colors uppercase tracking-widest">
        <ArrowBackIcon style={{ fontSize: 15 }} /> Back to dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <StatusBadge status={event.status} />
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  event.registrationOpen
                    ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                    : "text-gray-400 bg-gray-50 border-gray-100"
                }`}>
                {event.registrationOpen ? "REGISTRATION OPEN" : "REGISTRATION CLOSED"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {event.title}
            </h1>
            <p className="text-gray-600 text-base leading-relaxed">
              {event.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
              {META_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:bg-white transition-all">
                  <item.icon
                    style={{ fontSize: 18 }}
                    className="text-blue-500 mb-3"/>
                  <span className="text-xs text-gray-400 block uppercase font-bold tracking-widest mb-1">
                    {item.label}
                  </span>
                  <span className="text-gray-800 font-bold text-sm truncate block">
                    {item.val}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {event.registrationOpen && (
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-100 transition-all">
                  <LoginIcon style={{ fontSize: 16 }} />
                  Join Now
                </button>
              )}
              {isEnded && (
                <button
                  onClick={() => navigate(`/standings?eventId=${event.id}`)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-500 text-gray-600 text-sm font-bold rounded-lg shadow-sm transition-all">
                  <LeaderboardIcon style={{ fontSize: 16 }} />
                  View Results
                </button>
              )}
            </div>
          </section>

          {/* Roadmap */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-10 flex items-center gap-2">
              <AccessTimeIcon
                style={{ fontSize: 16 }}
                className="text-blue-500"
              />{" "}
              Event Roadmap
            </h2>
            <div className="relative space-y-12 ml-3 border-l border-gray-100">
              {roadmapSteps.map((step, i) => {
                const isCurrent =
                  i === event.currentPhase - 1 && event.status !== "Ended";
                return (
                  <div key={step.phase} className="relative pl-10">
                    <div
                      className={`absolute -left-[7.5px] top-1 w-3.5 h-3.5 rounded-full border-4 border-white shadow-md transition-colors ${
                        step.active
                          ? isCurrent
                            ? "bg-blue-500 ring-2 ring-blue-200 ring-offset-1"
                            : "bg-blue-300"
                          : "bg-gray-200"
                      }`}
                    />
                    <div className="space-y-1">
                      <span className={`text-xs font-bold uppercase tracking-widest ${step.active ? "text-blue-500" : "text-gray-400"}`}>
                        {step.phase}
                        {isCurrent && (
                          <span className="ml-2 text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                            IN PROGRESS
                          </span>
                        )}
                      </span>
                      <h4 className={`text-base font-bold ${step.active ? "text-gray-800" : "text-gray-400"}`}>
                        {step.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <MenuBookIcon style={{ fontSize: 16 }} className="text-blue-500" />{" "}
              Competitive Tracks
            </h3>
            <div className="space-y-4">
              {event.tracks.map((track) => (
                <div
                  key={track.name}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-800 text-sm">
                    {track.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                    {track.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {event.prizes.length > 0 && (
            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900 uppercase mb-6 flex items-center gap-2 tracking-widest">
                <EmojiEventsIcon style={{ fontSize: 16 }} className="text-blue-500" />{" "}
                Prize Structure
              </h3>
              <div className="space-y-3">
                {event.prizes.map((prize) => (
                  <div key={prize.rank} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {prize.rank}
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {prize.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Announcements - clickable for detail */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 uppercase mb-6 flex items-center gap-2 tracking-widest">
              <CampaignIcon style={{ fontSize: 16 }} className="text-blue-500" />{" "}
              Announcements
              {event.announcements.length > 0 && (
                <span className="ml-auto text-[10px] bg-blue-50 text-blue-500 border border-blue-100 px-2 py-0.5 rounded-full font-bold">
                  {event.announcements.length}
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {event.announcements.length > 0 ? (
                event.announcements.map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAnnouncementIdx(i)}
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
                <p className="text-xs text-gray-400 italic text-center py-4">
                  No recent updates.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};