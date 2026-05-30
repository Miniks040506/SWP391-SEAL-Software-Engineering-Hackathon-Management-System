import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import LoginIcon from "@mui/icons-material/Login";
import { CircularProgress } from "@mui/material";
import { AnnouncementModal } from "@/features/events/components/AnnouncementModal";
import { EventAnnouncementsCard } from "@/features/events/components/EventAnnouncementsCard";
import { EventMetaGrid } from "@/features/events/components/EventMetaGrid";
import { EventPrizesCard } from "@/features/events/components/EventPrizesCard";
import { EventTracksSection } from "@/features/events/components/EventTracksSection";
import { PublicStatusBadge } from "@/features/events/components/PublicStatusBadge";
import { usePublicEventActions } from "@/features/events/hooks/usePublicEventActions";
import {
  usePublicEventAnnouncementsQuery,
  usePublicEventDetailQuery,
  usePublicEventPrizesQuery,
} from "@/features/events/hooks/usePublicEventQueries";
import {
  getEventDescription,
  isCompletedEvent,
  isRegistrationOpen,
  toAnnouncementViews,
  type PublicAnnouncementView,
} from "@/features/events/utils/publicEventView";

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<PublicAnnouncementView | null>(null);
  const [selectedAnnouncementIndex, setSelectedAnnouncementIndex] =
    useState<number | null>(null);
  const [showAnnouncementsList, setShowAnnouncementsList] = useState(false);
  const [cameFromList, setCameFromList] = useState(false);

  const eventQuery = usePublicEventDetailQuery(eventId);
  const announcementsQuery = usePublicEventAnnouncementsQuery(eventId);
  const prizesQuery = usePublicEventPrizesQuery(eventId);

  const { joinEvent, viewPrizes, viewResults } = usePublicEventActions();

  const announcementViews = useMemo(
    () => toAnnouncementViews(announcementsQuery.data ?? []),
    [announcementsQuery.data],
  );

  if (eventQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <CircularProgress />
      </div>
    );
  }

  if (eventQuery.isError || !eventQuery.data) {
    return (
      <div className="space-y-4 py-32 text-center">
        <p className="font-semibold text-gray-400">Event not found.</p>

        <button
          type="button"
          onClick={() => navigate("/events")}
          className="text-sm font-bold text-blue-500 hover:underline"
        >
          Back to events
        </button>
      </div>
    );
  }

  const event = eventQuery.data;
  const registrationOpen = isRegistrationOpen(event.status);
  const completed = isCompletedEvent(event.status);

  const handleSelectAnnouncement = (
    announcement: PublicAnnouncementView,
    index: number,
    fromList = false,
  ) => {
    setSelectedAnnouncement(announcement);
    setSelectedAnnouncementIndex(index);
    setCameFromList(fromList);
  };

  const handlePrevAnnouncement = () => {
    if (selectedAnnouncementIndex == null) return;

    const nextIndex = Math.max(0, selectedAnnouncementIndex - 1);
    setSelectedAnnouncementIndex(nextIndex);
    setSelectedAnnouncement(announcementViews[nextIndex] ?? null);
  };

  const handleNextAnnouncement = () => {
    if (selectedAnnouncementIndex == null) return;

    const nextIndex = Math.min(
      announcementViews.length - 1,
      selectedAnnouncementIndex + 1,
    );

    setSelectedAnnouncementIndex(nextIndex);
    setSelectedAnnouncement(announcementViews[nextIndex] ?? null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {selectedAnnouncement && selectedAnnouncementIndex !== null && (
        <AnnouncementModal
          announcement={selectedAnnouncement}
          index={selectedAnnouncementIndex}
          total={announcementViews.length}
          showBackButton={cameFromList}
          onClose={() => {
            setSelectedAnnouncement(null);
            setSelectedAnnouncementIndex(null);
            setCameFromList(false);
          }}
          onPrev={handlePrevAnnouncement}
          onNext={handleNextAnnouncement}
          onBack={() => {
            setSelectedAnnouncement(null);
            setSelectedAnnouncementIndex(null);
            setShowAnnouncementsList(true);
            setCameFromList(false);
          }}
        />
      )}

      <button
        type="button"
        onClick={() => navigate("/events")}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-blue-500"
      >
        <ArrowBackIcon style={{ fontSize: 15 }} />
        Back to events
      </button>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <PublicStatusBadge status={event.status} />

              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs font-bold uppercase",
                  registrationOpen
                    ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                    : "border-gray-100 bg-gray-50 text-gray-400",
                ].join(" ")}
              >
                {registrationOpen ? "Registration Open" : "Registration Closed"}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {event.name}
            </h1>

            <p className="text-base leading-relaxed text-gray-600">
              {getEventDescription(event)}
            </p>

            <EventMetaGrid event={event} />

            <div className="flex flex-wrap gap-3 pt-2">
              {registrationOpen && (
                <button
                  type="button"
                  onClick={() => joinEvent(event.id)}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-600 active:scale-95"
                >
                  <LoginIcon style={{ fontSize: 16 }} />
                  Join Now
                </button>
              )}

              {completed && (
                <>
                  <button
                    type="button"
                    onClick={() => viewPrizes(event.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-600 active:scale-95"
                  >
                    <CardGiftcardIcon style={{ fontSize: 16 }} />
                    View Prizes
                  </button>

                  <button
                    type="button"
                    onClick={() => viewResults(event.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-600 shadow-sm transition-all hover:border-blue-400 hover:text-blue-500"
                  >
                    <LeaderboardIcon style={{ fontSize: 16 }} />
                    View Results
                  </button>
                </>
              )}
            </div>
          </section>

          <EventTracksSection event={event} />
        </div>

        <div className="flex flex-col gap-8 lg:col-span-4">
          <EventPrizesCard
            prizes={prizesQuery.data ?? []}
            tracks={event.tracks ?? []}
            onViewAllPage={() => viewPrizes(event.id)}
          />

          <EventAnnouncementsCard
            announcements={announcementsQuery.data ?? []}
            onSelect={handleSelectAnnouncement}
            showAllModal={showAnnouncementsList}
            setShowAllModal={setShowAnnouncementsList}
          />
        </div>
      </div>
    </div>
  );
}