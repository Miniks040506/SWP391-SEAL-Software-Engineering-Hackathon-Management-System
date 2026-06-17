import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import type { EventSummaryResponse, EventDetailResponse } from "@/types/event.types";

export type DashboardEvent = EventSummaryResponse &
  Partial<Pick<EventDetailResponse, "registrationStartAt" | "registrationEndAt" | "tracks" | "rounds">> & {
    approvedTeams?: number | null;
    approvedTeamCount?: number | null;
    teamCount?: number | null;
  };

type Props = {
  event: DashboardEvent | null;
  isLoading: boolean;
};

// Utils nội bộ cho component này
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

function getApprovedTeamCount(event?: DashboardEvent | null) {
  if (!event) return "—";
  return event.approvedTeamCount ?? event.approvedTeams ?? event.teamCount ?? "—";
}

export function DashboardCurrentEvent({ event, isLoading }: Props) {
  const navigate = useNavigate();

  return (
    <Card variant="outlined" className="xl:col-span-2 dark:border-slate-700 dark:bg-[#1e293b]">
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-gray-400">Current Event</p>
            {isLoading ? (
              <div className="mt-6"><CircularProgress size={28} /></div>
            ) : event ? (
              <>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{event.name}</h2>
                  <Chip label={event.status} color="primary" size="small" />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  Registration Period: {formatRegistrationPeriod(event)}
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
            onClick={() => event ? navigate(`/coordinator/events/${event.id}/edit`) : navigate("/coordinator/events")}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            View Details
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
            <p className="text-sm text-gray-500">Season</p>
            <p className="mt-1 font-bold text-gray-900 dark:text-white">{event ? formatSeason(event.season, event.year) : "—"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
            <p className="text-sm text-gray-500">Tracks</p>
            <p className="mt-1 font-bold text-gray-900 dark:text-white">{getEmbeddedCount(event?.tracks)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
            <p className="text-sm text-gray-500">Rounds</p>
            <p className="mt-1 font-bold text-gray-900 dark:text-white">{getEmbeddedCount(event?.rounds)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
            <p className="text-sm text-gray-500">Approved Teams</p>
            <p className="mt-1 font-bold text-gray-900 dark:text-white">{getApprovedTeamCount(event)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-slate-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Event progress</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Progress metrics will be connected after round, submission, and scoring dashboard APIs are available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}