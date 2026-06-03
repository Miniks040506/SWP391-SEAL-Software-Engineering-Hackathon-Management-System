import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";

import { CoordinatorEventCard } from "../components/CoordinatorEventCard";
import { useCoordinatorEventsQuery } from "../hooks/useCoordinatorEventQueries";

import type { EventSummaryResponse } from "@/types/event.types";

const PAGE_SIZE = 6;

const STATUS_FILTERS = [
  "All",
  "ONGOING",
  "REGISTRATION",
  "DRAFT",
  "COMPLETED",
  "ENDED",
  "CANCELLED",
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

type EventWithOptionalCounts = EventSummaryResponse & {
  tracks?: unknown[] | null;
  approvedTeams?: number | null;
  approvedTeamCount?: number | null;
  teamCount?: number | null;
};

const paginationSx = {
  "& .MuiPaginationItem-root": {
    fontWeight: 700,
    fontSize: "0.75rem",
    borderColor: "var(--mui-palette-divider, #475569)",
    color: "inherit",
  },
  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    color: "#e2e8f0",
    "&:hover": {
      backgroundColor: "#1d4ed8",
    },
  },
};

function getTrackCount(event: EventWithOptionalCounts) {
  return Array.isArray(event.tracks) ? event.tracks.length : "—";
}

function getApprovedTeamCount(event: EventWithOptionalCounts) {
  return event.approvedTeamCount ?? event.approvedTeams ?? event.teamCount ?? "—";
}

function formatStatusLabel(filter: StatusFilter) {
  if (filter === "All") return "All";
  return filter.charAt(0) + filter.slice(1).toLowerCase();
}

export const CoordinatorEventsPage = () => {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);

  const eventsQuery = useCoordinatorEventsQuery({
    status: activeFilter === "All" ? undefined : activeFilter,
    page: page - 1,
    size: PAGE_SIZE,
  });

  const events = (eventsQuery.data?.content ?? []) as EventWithOptionalCounts[];
  const totalElements = eventsQuery.data?.totalElements ?? events.length;
  const pageCount = Math.max(1, eventsQuery.data?.totalPages ?? 1);

  const handleFilterChange = (filter: StatusFilter) => {
    setActiveFilter(filter);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-300">
            Event Management
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Manage all hackathon events, timelines, and configurations.
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => navigate("/coordinator/events/create")}
          sx={{
            bgcolor: "#2563eb",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            boxShadow: "none",
            color: "#e2e8f0",
            "&:hover": {
              boxShadow: "none",
              bgcolor: "#1d4ed8",
            },
          }}
        >
          Create New Event
        </Button>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap rounded-lg bg-gray-100 p-1 dark:bg-slate-800/50">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => handleFilterChange(filter)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-all ${
                activeFilter === filter
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              {formatStatusLabel(filter)}
            </button>
          ))}
        </div>

        <span className="text-sm text-gray-400 dark:text-slate-500">
          {eventsQuery.isLoading ? "Loading..." : `${totalElements} event(s)`}
        </span>
      </div>

      {eventsQuery.isLoading && (
        <div className="flex justify-center py-20">
          <CircularProgress />
        </div>
      )}

      {eventsQuery.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Cannot load events from API. Please check backend, endpoint, token, or
          security config.
        </div>
      )}

      {!eventsQuery.isLoading && !eventsQuery.isError && events.length > 0 && (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <CoordinatorEventCard
              key={event.id}
              event={event}
              trackCount={getTrackCount(event)}
              approvedTeams={getApprovedTeamCount(event)}
              onEdit={(id) => navigate(`/coordinator/events/${id}/edit`)}
              onView={(id) => navigate(`/coordinator/events/${id}/view`)}
            />
          ))}
        </section>
      )}

      {!eventsQuery.isLoading && !eventsQuery.isError && events.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center dark:border-slate-700">
          <p className="text-sm font-semibold text-gray-400 dark:text-slate-500">
            No events found
          </p>

          <p className="mt-1 text-xs text-gray-300 dark:text-slate-600">
            Try a different filter or create a new event.
          </p>
        </div>
      )}

      {!eventsQuery.isLoading && !eventsQuery.isError && pageCount > 1 && (
        <div className="flex justify-center pt-2">
          <div className="dark:text-slate-400">
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, value) => setPage(value)}
              variant="outlined"
              shape="rounded"
              sx={paginationSx}
            />
          </div>
        </div>
      )}
    </div>
  );
};
