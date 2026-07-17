import { useNavigate } from "react-router-dom";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import GradingOutlinedIcon from "@mui/icons-material/GradingOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";

import { useCoordinatorDashboard } from "../hooks/useCoordinatorDashboard";
import type { EventSummaryResponse, EventDetailResponse } from "@/types/event.types";


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
  };

// ==========================================
// CÁC HÀM FORMAT GIAO DIỆN
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
  return `${start} - ${end}`;
}

function getEmbeddedCount(value?: unknown[] | null) {
  return Array.isArray(value) ? value.length : "—";
}

export const CoordinatorDashboardPage = () => {
  const navigate = useNavigate();

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


  const getPriorityColor = (priority: PendingActionType["priority"]) => {
    switch (priority) {
      case "High": return "error";
      case "Medium": return "warning";
      default: return "default";
    }
  };

  const getSummaryIcon = (iconType: SummaryCardType["iconType"]) => {
    switch (iconType) {
      case "event": return <EventAvailableOutlinedIcon />;
      case "team": return <GroupsOutlinedIcon />;
      case "submission": return <UploadFileOutlinedIcon />;
      case "grading": return <GradingOutlinedIcon />;
      default: return <EventAvailableOutlinedIcon />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      <section className="flex flex-col gap-4 rounded-3xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-7 text-white shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
            Event Coordinator Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            Welcome back, Coordinator!
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100">
            Manage hackathon events, review operational progress, and keep competition workflows on track.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="contained"
            sx={{ bgcolor: "white", color: "#2563eb", textTransform: "none", fontWeight: 800, "&:hover": { bgcolor: "#eff6ff" } }}
            onClick={() => navigate("/coordinator/events")}
          >
            Manage Events
          </Button>
          <Button
            variant="outlined"
            sx={{ borderColor: "rgba(255,255,255,0.6)", color: "white", textTransform: "none", fontWeight: 800, "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.08)" } }}
            onClick={() => navigate("/coordinator/teams")}
          >
            Review Teams
          </Button>
        </div>
      </section>

      {isEventError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Cannot load event dashboard data from API. Please check backend, endpoint, token, or security config.
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item: SummaryCardType) => (
          <Card key={item.title} variant="outlined" className="border-gray-100 dark:border-slate-700 dark:bg-[#1e293b]">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
                    {item.title}
                  </p>
                  <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                    {isWidgetsLoading || isEventLoading ? <CircularProgress size={26} /> : item.value}
                  </h2>
                  <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
                    {item.description}
                  </p>
                </div>
                <div className={`rounded-2xl p-3 ${item.color}`}>
                  {getSummaryIcon(item.iconType)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card variant="outlined" className="xl:col-span-2 dark:border-slate-700 dark:bg-[#1e293b]">
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-gray-400">Current Event</p>
                {isEventLoading ? (
                  <div className="mt-6"><CircularProgress size={28} /></div>
                ) : currentEvent ? (
                  <>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{currentEvent.name}</h2>
                      <Chip label={currentEvent.status} color="primary" size="small" />
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                      Registration Period: {formatRegistrationPeriod(currentEvent)}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">No current event</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                      Create an event to start managing tracks, rounds, prizes, mentors, and judges.
                    </p>
                  </>
                )}
              </div>

              <Button
                variant="outlined"
                endIcon={<ArrowForwardOutlinedIcon />}
                onClick={() => currentEvent ? navigate(`/coordinator/events/${currentEvent.id}/edit`) : navigate("/coordinator/events")}
                sx={{ textTransform: "none", fontWeight: 800 }}
              >
                View Details
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <p className="text-sm text-gray-500">Season</p>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">{currentEvent ? formatSeason(currentEvent.season, currentEvent.year) : "—"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <p className="text-sm text-gray-500">Tracks</p>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">{getEmbeddedCount(currentEvent?.tracks)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <p className="text-sm text-gray-500">Rounds</p>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">{getEmbeddedCount(currentEvent?.rounds)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <p className="text-sm text-gray-500">Registered Teams</p>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">
                  {registeredTeamsCount != null ? registeredTeamsCount : "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-slate-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Event progress</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Progress metrics will be connected after round, submission, and scoring dashboard APIs are fully resolved.</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="outlined" className="dark:border-slate-700 dark:bg-[#1e293b]">
          <CardContent>
            <div className="mb-5 flex items-center gap-3">
              <EmojiEventsOutlinedIcon className="text-amber-500" />
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Result Status</h2>
            </div>

            {isWidgetsLoading ? (
              <div className="flex justify-center py-6"><CircularProgress size={24} /></div>
            ) : (
              <>
                <p className="text-sm font-bold text-gray-700 dark:text-slate-300">{resultStatus.round}</p>
                <div className="mt-5 space-y-4">
                  {[
                    ["Ranking", resultStatus.rankingCalculated],
                    ["Awards", resultStatus.awardsAssigned],
                    ["Published", resultStatus.published],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{value}%</span>
                      </div>
                      <LinearProgress variant="determinate" value={value as number} sx={{ height: 7, borderRadius: 999, bgcolor: "#e5e7eb" }} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card variant="outlined" className="dark:border-slate-700 dark:bg-[#1e293b]">
          <CardContent>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Pending Actions</h2>
            <div className="mt-5 space-y-3">
              {isWidgetsLoading ? (
                <div className="flex justify-center py-6"><CircularProgress size={24} /></div>
              ) : pendingActions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">All caught up! No urgent tasks.</div>
              ) : (
                pendingActions.map((action: PendingActionType) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => navigate(action.path)}
                    className="w-full rounded-2xl border border-gray-100 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-700 dark:hover:bg-slate-800/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{action.title}</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{action.description}</p>
                      </div>
                      <Chip size="small" color={getPriorityColor(action.priority)} label={action.priority} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-blue-600">{action.actionLabel}</p>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="outlined" className="dark:border-slate-700 dark:bg-[#1e293b]">
          <CardContent>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Recent Activity</h2>
            <div className="mt-5 space-y-4">
              {isWidgetsLoading ? (
                <div className="flex justify-center py-6"><CircularProgress size={24} /></div>
              ) : recentActivities.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">No recent activities found.</div>
              ) : (
                recentActivities.map((activity: RecentActivityType) => (
                  <div key={activity.id} className="rounded-2xl border border-gray-100 p-4 dark:border-slate-700">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{activity.time}</p>
                    <p className="mt-1 font-bold text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{activity.description}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default CoordinatorDashboardPage;
