import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import GradingOutlinedIcon from "@mui/icons-material/GradingOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

import CircularProgress from "@mui/material/CircularProgress";

import { useCoordinatorDashboard } from "../hooks/useCoordinatorDashboard";
import { getEventFallbackBannerUrl } from "@/utils/eventBanner";
import type { EventSummaryResponse, EventDetailResponse } from "@/types/event.types";
import type { ReactNode } from "react";


export type SummaryCardType = {
  title: string;
  value: string | number;
  description: string;
  iconType: "event" | "team" | "submission" | "grading";
  color: string;
};

export type PendingActionType = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  path: string;
  priority: "High" | "Medium" | "Low";
};

export type RecentActivityType = {
  id: string;
  time: string;
  title: string;
  description: string;
};

export type ResultStatusType = {
  round: string;
  rankingCalculated: number;
  awardsAssigned: number;
  published: number;
};

export type DashboardEvent = EventSummaryResponse &
  Partial<Pick<EventDetailResponse, "registrationStartAt" | "registrationEndAt" | "tracks" | "rounds">> & {
    approvedTeams?: number | null;
    approvedTeamCount?: number | null;
    teamCount?: number | null;
    bannerUrl?: string | null;
  };

// ==========================================
// FORMAT HELPERS
// ==========================================
function formatSeason(season?: string | null, year?: number | null) {
  const seasonText = season ? season.charAt(0).toUpperCase() + season.slice(1).toLowerCase() : "—";
  return year ? `${seasonText} ${year}` : seasonText;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatRegistrationPeriod(event?: DashboardEvent | null) {
  if (!event) return "—";
  const start = formatDate(event.registrationStartAt);
  const end = formatDate(event.registrationEndAt);
  if (start === "—" && end === "—") return "—";
  return `${start} – ${end}`;
}

function getEmbeddedCount(value?: unknown[] | null) {
  return Array.isArray(value) ? value.length : "—";
}

function seasonGradient(season?: string | null) {
  switch ((season ?? "").toUpperCase()) {
    case "SPRING":
      return "from-emerald-600 via-teal-500 to-cyan-500";
    case "SUMMER":
      return "from-amber-500 via-orange-500 to-rose-500";
    case "FALL":
      return "from-violet-600 via-indigo-600 to-blue-500";
    default:
      return "from-blue-600 via-indigo-600 to-violet-600";
  }
}

// ==========================================
// SMALL PIECES
// ==========================================
function PosterChip({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-md">
      <span className="text-white/80">{icon}</span>
      <div className="leading-tight">
        <p className="text-sm font-black text-white tabular-nums">{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">{label}</p>
      </div>
    </div>
  );
}

function SummaryCard({
  item,
  icon,
  isLoading,
}: {
  item: SummaryCardType;
  icon: ReactNode;
  isLoading: boolean;
}) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.title}</p>
          <p className="mt-2 text-3xl font-black text-slate-900 tabular-nums dark:text-white">
            {isLoading ? <CircularProgress size={24} /> : item.value}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{item.description}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <span className="font-black text-slate-900 tabular-nums dark:text-white">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-500 transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const priorityBadge: Record<PendingActionType["priority"], string> = {
  High: "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  Medium:
    "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  Low: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400",
};

// ==========================================
// PAGE
// ==========================================
export const CoordinatorDashboardPage = () => {
  const navigate = useNavigate();
  const [bannerFailed, setBannerFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const {
    isEventError,
    isEventLoading,
    isWidgetsLoading,
    currentEvent,
    summaryCards,
    resultStatus,
    pendingActions,
    recentActivities,
    registeredTeamsCount,
  } = useCoordinatorDashboard();

  const getSummaryIcon = (iconType: SummaryCardType["iconType"]) => {
    switch (iconType) {
      case "event":
        return <EventAvailableOutlinedIcon />;
      case "team":
        return <GroupsOutlinedIcon />;
      case "submission":
        return <UploadFileOutlinedIcon />;
      case "grading":
        return <GradingOutlinedIcon />;
      default:
        return <EventAvailableOutlinedIcon />;
    }
  };

  const bannerUrl = currentEvent?.bannerUrl;
  // Uploaded banner first, then the same seeded fallback photo as every other
  // event surface (see utils/eventBanner.ts); gradient base stays underneath.
  const bannerSrc =
    bannerUrl && !bannerFailed
      ? bannerUrl
      : currentEvent
        ? getEventFallbackBannerUrl(currentEvent.id, 1600, 640)
        : null;
  const showBanner = Boolean(bannerSrc) && !fallbackFailed;
  const isLive = (currentEvent?.status ?? "").toUpperCase() === "ONGOING";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ===== Immersive event poster hero ===== */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 shadow-lg">
        {/* Season gradient base */}
        <div className={`absolute inset-0 bg-linear-to-br ${seasonGradient(currentEvent?.season)}`} />

        {/* Optional real banner */}
        {showBanner && (
          <img
            src={bannerSrc as string}
            alt=""
            onError={() =>
              bannerSrc === bannerUrl
                ? setBannerFailed(true)
                : setFallbackFailed(true)
            }
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}

        {/* Decorative rings + dot grid */}
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[18px] border-white/10" />
        <div aria-hidden className="pointer-events-none absolute right-24 top-12 h-28 w-28 rounded-full border-8 border-white/10" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Legibility scrim */}
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/40" />

        <div className="relative flex flex-col gap-6 p-7 sm:p-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/80">
                  Event Coordinator Dashboard
                </p>
                {currentEvent && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                    <span className="relative flex h-1.5 w-1.5">
                      {isLive && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75 motion-reduce:hidden" />
                      )}
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    {isLive ? "Live" : (currentEvent.status ?? "—")}
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white drop-shadow-sm sm:text-[2.6rem]">
                {isEventLoading
                  ? "Loading event…"
                  : currentEvent
                    ? currentEvent.name
                    : "Welcome back, Coordinator!"}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white/85">
                <CalendarMonthOutlinedIcon sx={{ fontSize: 17 }} />
                {currentEvent
                  ? `Registration ${formatRegistrationPeriod(currentEvent)}`
                  : "Create an event to start managing tracks, rounds, prizes, mentors, and judges."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/coordinator/events")}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-900 shadow-lg transition-transform hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] motion-reduce:active:scale-100"
              >
                Manage Events
              </button>
              <button
                type="button"
                onClick={() => navigate("/coordinator/teams")}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:border-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Review Teams
              </button>
              {currentEvent && (
                <button
                  type="button"
                  onClick={() => navigate(`/coordinator/events/${currentEvent.id}/edit`)}
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/40 bg-transparent px-5 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  View Details
                  <ArrowForwardOutlinedIcon sx={{ fontSize: 18 }} />
                </button>
              )}
            </div>
          </div>

          {/* Poster stat chips */}
          {currentEvent && (
            <div className="flex flex-wrap gap-3">
              <PosterChip
                icon={<BoltOutlinedIcon sx={{ fontSize: 18 }} />}
                label="Season"
                value={formatSeason(currentEvent.season, currentEvent.year)}
              />
              <PosterChip
                icon={<LayersOutlinedIcon sx={{ fontSize: 18 }} />}
                label="Tracks"
                value={getEmbeddedCount(currentEvent.tracks)}
              />
              <PosterChip
                icon={<EventAvailableOutlinedIcon sx={{ fontSize: 18 }} />}
                label="Rounds"
                value={getEmbeddedCount(currentEvent.rounds)}
              />
              <PosterChip
                icon={<GroupsOutlinedIcon sx={{ fontSize: 18 }} />}
                label="Registered Teams"
                value={registeredTeamsCount != null ? registeredTeamsCount : "—"}
              />
            </div>
          )}
        </div>
      </section>

      {isEventError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Cannot load event dashboard data from API. Please check backend, endpoint, token, or security config.
        </div>
      )}

      {/* ===== Summary cards ===== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item: SummaryCardType) => (
          <SummaryCard
            key={item.title}
            item={item}
            icon={getSummaryIcon(item.iconType)}
            isLoading={isWidgetsLoading || isEventLoading}
          />
        ))}
      </section>

      {/* ===== Result status + pending actions ===== */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Result Status */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
              <EmojiEventsOutlinedIcon className="text-amber-500" sx={{ fontSize: 20 }} />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Result Status</h2>
          </div>

          {isWidgetsLoading ? (
            <div className="flex justify-center py-8">
              <CircularProgress size={24} />
            </div>
          ) : (
            <>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{resultStatus.round}</p>
              <div className="mt-5 space-y-4">
                <ProgressRow label="Ranking" value={resultStatus.rankingCalculated} />
                <ProgressRow label="Awards" value={resultStatus.awardsAssigned} />
                <ProgressRow label="Published" value={resultStatus.published} />
              </div>
            </>
          )}
        </div>

        {/* Pending Actions */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <PendingActionsOutlinedIcon className="text-blue-500" sx={{ fontSize: 20 }} />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Pending Actions</h2>
          </div>

          <div className="space-y-3">
            {isWidgetsLoading ? (
              <div className="flex justify-center py-8">
                <CircularProgress size={24} />
              </div>
            ) : pendingActions.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center dark:border-slate-700">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                  <EmojiEventsOutlinedIcon className="text-emerald-500" />
                </span>
                <p className="mt-3 font-bold text-slate-700 dark:text-slate-200">All caught up!</p>
                <p className="mt-1 text-sm text-slate-400">No urgent tasks require your attention.</p>
              </div>
            ) : (
              pendingActions.map((action: PendingActionType) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => navigate(action.path)}
                  className="w-full cursor-pointer rounded-2xl border border-slate-100 p-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-800 dark:hover:border-blue-500/40 dark:hover:bg-slate-800/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white">{action.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{action.description}</p>
                    </div>
                    <span
                      className={[
                        "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                        priorityBadge[action.priority],
                      ].join(" ")}
                    >
                      {action.priority}
                    </span>
                  </div>
                  <p className="mt-3 flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                    {action.actionLabel}
                    <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== Recent activity ===== */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
            <HistoryOutlinedIcon className="text-violet-500" sx={{ fontSize: 20 }} />
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Recent Activity</h2>
        </div>

        {isWidgetsLoading ? (
          <div className="flex justify-center py-8">
            <CircularProgress size={24} />
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center text-sm text-slate-400 dark:border-slate-700">
            No recent activities found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recentActivities.map((activity: RecentActivityType) => (
              <div
                key={activity.id}
                className="relative rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <span className="absolute left-0 top-4 h-8 w-1 rounded-r-full bg-linear-to-b from-blue-500 to-indigo-500" />
                <p className="pl-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {activity.time}
                </p>
                <p className="mt-1 pl-2 font-bold text-slate-900 dark:text-white">{activity.title}</p>
                <p className="mt-1 pl-2 text-sm text-slate-500 dark:text-slate-400">{activity.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CoordinatorDashboardPage;
