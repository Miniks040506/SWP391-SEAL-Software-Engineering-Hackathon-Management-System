import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { CircularProgress } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { UUID } from "@/types/common.types";
import { getEventFallbackBannerUrl } from "@/utils/eventBanner";

import { AssignmentsTab } from "./AssignmentsTab";
import { InfoTab } from "./InfoTab";
import { PrizesTab } from "./PrizesTab";
import { ProblemStatementsTab } from "./ProblemStatementsTab";
import { RoundsTab } from "./RoundsTab";
import { TeamsTab } from "./TeamsTab";
import { TracksTab } from "./TracksTab";
import { CriteriaTab } from "./CriteriaTab";
import { getEventEditRules, normalizeEventStatus } from "./eventEditRules";
import {
  EDIT_TABS,
  EVENT_STATUS_PILLS,
  type EditTab,
} from "./editEventUi";

import {
  useCoordinatorEventDetailQuery,
  useCoordinatorEventPrizesQuery,
  useCoordinatorEventRoundsQuery,
  useCoordinatorEventTracksQuery,
  useInvalidateEditEventData,
} from "../../hooks/useCoordinatorEventQueries";

const QUICK_ACTIONS = [
  {
    label: "Manage Calibration",
    icon: FactCheckOutlinedIcon,
    gradient: "from-blue-500 to-sky-400",
    hoverGlow: "hover:shadow-blue-500/40",
    path: (eventId: UUID) => `/coordinator/events/${eventId}/calibrations`,
  },
  {
    label: "Grading Progress",
    icon: AssessmentOutlinedIcon,
    gradient: "from-violet-500 to-indigo-400",
    hoverGlow: "hover:shadow-violet-500/40",
    path: (eventId: UUID) => `/coordinator/events/${eventId}/grading-progress`,
  },
  {
    label: "Awards",
    icon: EmojiEventsIcon,
    gradient: "from-amber-500 to-orange-400",
    hoverGlow: "hover:shadow-amber-500/40",
    path: (eventId: UUID) => `/coordinator/events/${eventId}/awards`,
  },
  {
    label: "Export",
    icon: FileDownloadOutlinedIcon,
    gradient: "from-emerald-500 to-teal-400",
    hoverGlow: "hover:shadow-emerald-500/40",
    path: (eventId: UUID) => `/coordinator/events/${eventId}/exports`,
  },
];

/**
 * Spring-like overshoot easing (back-out) shared by the hero hover-lift
 * micro-interactions — pure CSS, no animation library needed.
 */
const HERO_SPRING_EASE = "ease-[cubic-bezier(0.34,1.56,0.64,1)]";

function getEventName(event: unknown) {
  const raw = event as { name?: string; eventName?: string; title?: string };
  return raw?.name ?? raw?.eventName ?? raw?.title ?? "Edit Event";
}

function getBannerUrl(event: unknown) {
  return (event as { bannerUrl?: string | null })?.bannerUrl ?? null;
}

function getSeason(event: unknown) {
  return (event as { season?: string | null })?.season ?? null;
}

function getYear(event: unknown) {
  return (event as { year?: number | null })?.year ?? null;
}

function formatPeriod(event: unknown) {
  const raw = event as {
    competitionStartAt?: string | null;
    competitionEndAt?: string | null;
  };

  const format = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const start = format(raw?.competitionStartAt);
  const end = format(raw?.competitionEndAt);

  if (!start || !end) return null;
  return `${start} → ${end}`;
}

export function CoordinatorEditEventPage() {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: UUID }>();
  const [activeTab, setActiveTab] = useState<EditTab>("INFO");
  const [bannerFailed, setBannerFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const eventQuery = useCoordinatorEventDetailQuery(eventId);
  const tracksQuery = useCoordinatorEventTracksQuery(eventId);
  const roundsQuery = useCoordinatorEventRoundsQuery(eventId);
  const prizesQuery = useCoordinatorEventPrizesQuery(eventId);

  const invalidateEditData = useInvalidateEditEventData(eventId);

  const eventName = useMemo(
    () => getEventName(eventQuery.data),
    [eventQuery.data],
  );
  const bannerUrl = useMemo(
    () => getBannerUrl(eventQuery.data),
    [eventQuery.data],
  );
  // Uploaded banner first, then the same seeded fallback photo as every other
  // event surface (see utils/eventBanner.ts); the dark gradient hero itself is
  // the final fallback.
  const bannerSrc =
    bannerUrl && !bannerFailed
      ? bannerUrl
      : eventId
        ? getEventFallbackBannerUrl(eventId, 1600, 640)
        : null;
  const eventStatus = normalizeEventStatus(
    (eventQuery.data as { status?: string | null } | undefined)?.status,
  );
  const editRules = getEventEditRules(eventStatus);
  const statusPill =
    EVENT_STATUS_PILLS[eventStatus] ?? EVENT_STATUS_PILLS.DRAFT;
  const season = getSeason(eventQuery.data);
  const year = getYear(eventQuery.data);
  const period = formatPeriod(eventQuery.data);

  if (!eventId) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 font-bold text-rose-600">
        Missing event id.
      </div>
    );
  }

  if (eventQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (eventQuery.isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 font-bold text-rose-600">
        Failed to load event detail.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── Immersive hero (same language as the Create Event wizard) ── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 shadow-2xl shadow-slate-950/40">
        {/* Event banner shown at full strength — same treatment as the public
            event detail hero: clear image + bottom-only scrim for legibility. */}
        {bannerSrc && !fallbackFailed ? (
          <>
            <img
              src={bannerSrc}
              alt=""
              aria-hidden
              onError={() =>
                bannerSrc === bannerUrl
                  ? setBannerFailed(true)
                  : setFallbackFailed(true)
              }
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
            />
            {/* Bottom-only scrim keeps the banner image clearly visible */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-4/5 bg-linear-to-t from-slate-950/95 via-slate-950/50 to-transparent"
            />
            {/* Thin top scrim so the back/status pills stay readable */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-slate-950/60 to-transparent"
            />
          </>
        ) : (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(148,163,184,0.16)_1px,transparent_1px)] [background-size:22px_22px]"
            />
          </>
        )}

        <div className="relative px-8 pb-7 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/coordinator/events")}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-slate-950/60 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-slate-950/40 backdrop-blur-md transition-all duration-300 ${HERO_SPRING_EASE} hover:-translate-y-0.5 hover:border-white/45 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
            >
              <ArrowBackOutlinedIcon sx={{ fontSize: 15 }} />
              Back to Events
            </button>

            <span
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-slate-950/40 backdrop-blur-md ${statusPill.className}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${statusPill.dotClassName}`}
              />
              {statusPill.label}
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-300 [text-shadow:0_1px_8px_rgba(2,6,23,0.9)]">
                Edit Event Workspace
              </p>
              <h1 className="mt-1 text-3xl font-black leading-tight text-white drop-shadow-[0_2px_12px_rgba(2,6,23,0.85)]">
                {eventName}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {season && year && (
                  <span className="inline-flex items-center rounded-full border border-white/25 bg-slate-950/60 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-md shadow-slate-950/40 backdrop-blur-md">
                    {season} {year}
                  </span>
                )}
                {period && (
                  <span className="inline-flex items-center rounded-full border border-white/25 bg-slate-950/60 px-3 py-1 text-[11px] font-bold text-slate-100 shadow-md shadow-slate-950/40 backdrop-blur-md">
                    {period}
                  </span>
                )}
              </div>
            </div>

            {/* Quick actions — elevated glass cards with a spring hover-lift */}
            <div className="flex shrink-0 flex-wrap gap-2.5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.path(eventId))}
                    className={`group inline-flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/25 bg-slate-950/60 py-2 pl-2 pr-4 text-sm font-black text-white shadow-lg shadow-slate-950/40 backdrop-blur-md transition-all duration-300 ${HERO_SPRING_EASE} hover:-translate-y-1 hover:scale-[1.03] hover:border-white/45 hover:bg-slate-900/85 hover:shadow-xl ${action.hoverGlow} active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${action.gradient} text-white shadow-md transition-transform duration-300 ${HERO_SPRING_EASE} group-hover:scale-110 group-hover:rotate-3 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0`}
                    >
                      <Icon sx={{ fontSize: 16 }} />
                    </span>
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab rail */}
          <nav
            aria-label="Edit event sections"
            className="mt-7 flex flex-wrap gap-2 border-t border-white/10 pt-5"
          >
            {EDIT_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  aria-current={active ? "page" : undefined}
                  className={[
                    `inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-all duration-300 ${HERO_SPRING_EASE} hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 motion-reduce:transition-none motion-reduce:hover:translate-y-0`,
                    active
                      ? `bg-linear-to-br ${tab.gradient} text-white shadow-lg ${tab.glow}`
                      : "border border-white/20 bg-slate-950/60 text-slate-200 shadow-md shadow-slate-950/40 backdrop-blur-md hover:border-white/40 hover:bg-slate-900/80 hover:text-white",
                  ].join(" ")}
                >
                  <Icon sx={{ fontSize: 17 }} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      {activeTab === "INFO" && (
        <InfoTab
          eventId={eventId}
          event={eventQuery.data!}
          onUpdated={invalidateEditData}
          canEdit={editRules.canEditInfo}
          readonlyReason={editRules.infoReason}
        />
      )}
      {activeTab === "TRACKS" && (
        <TracksTab
          eventId={eventId}
          tracks={tracksQuery.data ?? []}
          isLoading={tracksQuery.isLoading}
          onChanged={invalidateEditData}
          canEdit={editRules.canEditTracksRounds}
          readonlyReason={editRules.trackRoundReason}
        />
      )}
      {activeTab === "TEAMS" && (
        <TeamsTab
          eventId={eventId}
          eventName={eventName}
          tracks={tracksQuery.data ?? []}
        />
      )}
      {activeTab === "ROUNDS" && (
        <RoundsTab
          eventId={eventId}
          event={eventQuery.data!}
          tracks={tracksQuery.data ?? []}
          rounds={roundsQuery.data ?? []}
          isLoading={roundsQuery.isLoading}
          onChanged={invalidateEditData}
          canEdit={editRules.canEditTracksRounds}
          readonlyReason={editRules.trackRoundReason}
          canOperate={editRules.canOperateRounds}
          operationReadonlyReason={editRules.roundOperationReason}
        />
      )}
      {activeTab === "PROBLEMS" && (
        <ProblemStatementsTab
          rounds={roundsQuery.data ?? []}
          isLoading={roundsQuery.isLoading}
          canEdit={!editRules.isReadOnly}
          readonlyReason="Problem statements are read-only for this event status."
          onChanged={invalidateEditData}
        />
      )}
      {activeTab === "ASSIGNMENTS" && (
        <AssignmentsTab
          eventId={eventId}
          tracks={tracksQuery.data ?? []}
          rounds={roundsQuery.data ?? []}
          canEdit={editRules.canEditAssignments}
          readonlyReason={editRules.assignmentReason}
        />
      )}
      {activeTab === "CRITERIA" && (
        <CriteriaTab
          eventId={eventId}
          event={eventQuery.data}
          rounds={roundsQuery.data ?? []}
          canEdit={editRules.canEditCriteria}
          readonlyReason={editRules.criteriaReason}
        />
      )}
      {activeTab === "PRIZES" && (
        <PrizesTab
          eventId={eventId}
          tracks={tracksQuery.data ?? []}
          prizes={prizesQuery.data ?? []}
          isLoading={prizesQuery.isLoading}
          onChanged={invalidateEditData}
          canEdit={editRules.canEditPrizes}
          readonlyReason={editRules.prizeReason}
        />
      )}
    </div>
  );
}

export default CoordinatorEditEventPage;
