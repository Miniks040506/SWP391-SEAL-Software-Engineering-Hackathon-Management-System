import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import LoginIcon from "@mui/icons-material/Login";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
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
  getSeasonLabel,
  isCompletedEvent,
  isRegistrationOpen,
  toAnnouncementViews,
  type PublicAnnouncementView,
} from "@/features/events/utils/publicEventView";

function getRegistrationCountdown(registrationEndAt?: string | null) {
  if (!registrationEndAt) return null;

  const end = parseISO(registrationEndAt);
  if (!isValid(end)) return null;

  const days = differenceInCalendarDays(end, new Date());
  if (days < 0) return null;
  if (days === 0) return "Registration closes today";
  if (days === 1) return "Registration closes tomorrow";

  return `Registration closes in ${days} days`;
}

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
  const [bannerFailed, setBannerFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

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
  const countdown = registrationOpen
    ? getRegistrationCountdown(event.registrationEndAt)
    : null;

  const bannerSrc =
    event.bannerUrl && !bannerFailed
      ? event.bannerUrl
      : `https://picsum.photos/seed/seal-event-${event.id}/1440/560`;

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
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
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
        className="flex cursor-pointer items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400"
      >
        <ArrowBackIcon style={{ fontSize: 15 }} />
        Back to events
      </button>

      {/* ---------------------------------------------------------------- */}
      {/* Hero banner                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-slate-900 shadow-xl dark:border-slate-800">
        <div className="absolute inset-0">
          {!fallbackFailed ? (
            <img
              src={bannerSrc}
              alt={`${event.name} banner`}
              onError={() =>
                bannerSrc === event.bannerUrl
                  ? setBannerFailed(true)
                  : setFallbackFailed(true)
              }
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-blue-600 via-indigo-700 to-slate-900" />
          )}

          {/* Bottom-only scrim keeps the banner image clearly visible */}
          <div className="absolute inset-x-0 bottom-0 h-4/5 bg-linear-to-t from-slate-950/90 via-slate-950/45 to-transparent" />
        </div>

        <div className="relative flex min-h-90 flex-col justify-end gap-4 p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <PublicStatusBadge status={event.status} />

            <span className="rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-cyan-200 backdrop-blur-sm">
              {getSeasonLabel(event.season, event.year)}
            </span>

            {countdown && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-200 backdrop-blur-sm">
                <ScheduleOutlinedIcon style={{ fontSize: 14 }} />
                {countdown}
              </span>
            )}

            {completed && event.resultPublishedAt && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-amber-200 backdrop-blur-sm">
                <EmojiEventsOutlinedIcon style={{ fontSize: 14 }} />
                Results published
              </span>
            )}
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white drop-shadow-md md:text-5xl">
            {event.name}
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-slate-200 drop-shadow-sm">
            {getEventDescription(event)}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            {showCompetingButton ? (
              <button
                type="button"
                onClick={() => navigate(`/events/${event.id}/competing`)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/40 transition-all hover:from-blue-600 hover:to-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-95"
              >
                <RocketLaunchIcon style={{ fontSize: 17 }} />
                Go to event competing
              </button>
            ) : (
              registrationOpen && (
                <button
                  type="button"
                  onClick={() => joinEvent()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/40 transition-all hover:from-blue-600 hover:to-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-95"
                >
                  <LoginIcon style={{ fontSize: 17 }} />
                  Join now
                </button>
              )
            )}

            {completed && (
              <button
                type="button"
                onClick={() => viewResults(event.id)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-95"
              >
                <LeaderboardIcon style={{ fontSize: 17 }} />
                View Results
              </button>
            )}

            {userRole === "COORDINATOR" && (
              <button
                type="button"
                onClick={() =>
                  navigate(`/coordinator/events/${event.id}/grading-progress`)
                }
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/40 transition-all hover:from-indigo-600 hover:to-violet-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 active:scale-95"
              >
                <AssessmentOutlinedIcon style={{ fontSize: 17 }} />
                View Grading Progress
              </button>
            )}
          </div>
        </div>

        {/* Brand gradient accent along the hero base */}
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-linear-to-r from-blue-500 via-cyan-400 to-indigo-500" />
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Key facts                                                         */}
      {/* ---------------------------------------------------------------- */}
      <EventMetaGrid event={event} />

      {/* ---------------------------------------------------------------- */}
      {/* Content grid                                                      */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          <EventTracksSection event={event} />

          {completed && (
            <section className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500">
                  Final results
                </p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
                  Awards
                </h2>
              </div>

              <PublicEventAwardsSection eventId={event.id} />
            </section>
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
