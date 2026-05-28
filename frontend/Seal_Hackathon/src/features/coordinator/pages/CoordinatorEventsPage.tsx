import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import { CoordinatorEventCard } from "../components/CoordinatorEventCard";
import { coordinatorEventsMock } from "../mocks/coordinatorEvents.mock";

const PAGE_SIZE = 6;

const STATUS_FILTERS = ["All", "ONGOING", "DRAFT", "ENDED"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const paginationSx = {
  "& .MuiPaginationItem-root": {
    fontWeight: 700,
    fontSize: "0.75rem",
    borderColor: "#e5e7eb",
    color: "#6b7280",
  },
  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    color: "#fff",
    "&:hover": { backgroundColor: "#1d4ed8" },
  },
};

export const CoordinatorEventsPage = () => {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);

  const filteredEvents = useMemo(
    () =>
      activeFilter === "All"
        ? coordinatorEventsMock
        : coordinatorEventsMock.filter((e) => e.status === activeFilter),
    [activeFilter],
  );

  const pageCount = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const pagedEvents = filteredEvents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (filter: StatusFilter) => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleCreate = () => navigate("/coordinator/events/create");
  const handleEdit = (id: string) => navigate(`/coordinator/events/${id}/edit`);
  const handleView = (id: string) => navigate(`/coordinator/events/${id}`);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Event Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all hackathon events, timelines, and configurations.
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={handleCreate}
          sx={{
            bgcolor: "#2563eb",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            boxShadow: "none",
            "&:hover": { boxShadow: "none", bgcolor: "#1d4ed8" },
          }}
        >
          Create New Event
        </Button>
      </section>

      <div className="flex items-center gap-3">
        <div className="flex rounded-lg bg-gray-100 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-all ${
                activeFilter === f
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "All" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <span className="text-sm text-gray-400">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
        </span>
      </div>

      {pagedEvents.length > 0 ? (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pagedEvents.map((event) => (
            <CoordinatorEventCard
              key={event.id}
              event={event}
              onEdit={handleEdit}
              onView={handleView}
            />
          ))}
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <p className="text-sm font-semibold text-gray-400">No events found</p>
          <p className="mt-1 text-xs text-gray-300">
            Try a different filter or create a new event.
          </p>
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            variant="outlined"
            shape="rounded"
            sx={paginationSx}
          />
        </div>
      )}
    </div>
  );
};