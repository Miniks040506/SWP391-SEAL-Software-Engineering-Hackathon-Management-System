import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import LoginIcon from "@mui/icons-material/Login";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import { CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { teamApi } from "@/api/team.api";
import { AnnouncementModal } from "@/features/events/components/AnnouncementModal";
import { EventAnnouncementsCard } from "@/features/events/components/EventAnnouncementsCard";
import { EventMetaGrid } from "@/features/events/components/EventMetaGrid";
import { EventPrizesCard } from "@/features/events/components/EventPrizesCard";
import { EventTracksSection } from "@/features/events/components/EventTracksSection";
import { PublicStatusBadge } from "@/features/events/components/PublicStatusBadge";
import { PublicEventAwardsSection } from "@/features/events/components/PublicEventAwardsSection";
import { usePublicEventActions } from "@/features/events/hooks/usePublicEventActions";
import {
  usePublicEventAnnouncementsQuery,
  usePublicEventDetailQuery,
  usePublicEventPrizesQuery,
} from "@/features/events/hooks/usePublicEventQueries";
import { useAuthStore } from "@/stores/authStore";
import { getPrimaryRole } from "@/utils/roleRedirect";
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
  const location = useLocation();

  const backPath = location.pathname.includes("/coordinator")
    ? "/coordinator/events"
    : "/events";

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<PublicAnnouncementView | null>(null);
  const [selectedAnnouncementIndex, setSelectedAnnouncementIndex] = useState<
    number | null
  >(null);
  const [showAnnouncementsList, setShowAnnouncementsList] = useState(false);
  const [cameFromList, setCameFromList] = useState(false);

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const userRole = getPrimaryRole(user);
  const canFetchCompetition =
    Boolean(accessToken) &&
    (userRole === "STUDENT" || userRole === "PARTICIPANT");

  const eventQuery = usePublicEventDetailQuery(eventId);
  const announcementsQuery = usePublicEventAnnouncementsQuery(eventId);
  const prizesQuery = usePublicEventPrizesQuery(eventId);
  const competitionsQuery = useQuery({
    queryKey: ["my-active-competitions"],
    queryFn: () => teamApi.getMyActiveCompetitions(),
    enabled: canFetchCompetition,
    staleTime: 30_000,
  });

  const { joinEvent, viewResults } = usePublicEventActions();

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
          onClick={() => navigate(backPath)}
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
  const activeCompetition = (competitionsQuery.data ?? []).find(
    (competition) =>
      competition.eventId === event.id &&
      competition.eventStatus === "ONGOING",
  );
  const showCompetingButton =
    event.status === "ONGOING" && Boolean(activeCompetition);

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
        onClick={() => navigate(backPath)}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-blue-500"
      >
        <ArrowBackIcon style={{ fontSize: 15 }} />
        Back to events
      </button>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-10 dark:bg-slate-800 dark:border-slate-700">
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

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-300">
              {event.name}
            </h1>

            <p className="text-base leading-relaxed text-gray-600 dark:text-slate-400">
              {getEventDescription(event)}
            </p>

            <EventMetaGrid event={event} />

            <div className="flex flex-wrap gap-3 pt-2">
              {showCompetingButton ? (
                <button
                  type="button"
                  onClick={() => navigate(`/events/${event.id}/competing`)}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-95 dark:shadow-none"
                >
                  <RocketLaunchIcon style={{ fontSize: 16 }} />
                  Go to event competing
                </button>
              ) : (
                registrationOpen && (
                  <button
                    type="button"
                    onClick={() => joinEvent()}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-95 dark:shadow-none"
                  >
                    <LoginIcon style={{ fontSize: 16 }} />
                    Join now
                  </button>
                )
              )}

              {completed && (
                <>
                  <button
                    type="button"
                    onClick={() => viewResults(event.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-600 shadow-sm transition-all hover:border-blue-400 hover:text-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <LeaderboardIcon style={{ fontSize: 16 }} />
                    View Results
                  </button>
                </>
              )}

              {userRole === "COORDINATOR" && (
                <button
                  type="button"
                  onClick={() => navigate(`/coordinator/events/${event.id}/grading-progress`)}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-600 active:scale-95 dark:shadow-none"
                >
                  <AssessmentOutlinedIcon style={{ fontSize: 16 }} />
                  View Grading Progress
                </button>
              )}
            </div>
          </section>

          <EventTracksSection event={event} />

          {completed && (
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-300">Awards</h2>
              <PublicEventAwardsSection eventId={event.id} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8 lg:col-span-4">
          <EventPrizesCard
            prizes={prizesQuery.data ?? []}
            tracks={event.tracks ?? []}
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
