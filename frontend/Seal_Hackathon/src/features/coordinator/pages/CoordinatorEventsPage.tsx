import { useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import DynamicFeedOutlinedIcon from "@mui/icons-material/DynamicFeedOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import {
  coordinatorEventsMock,
  type CoordinatorEventStatus,
} from "../mocks/coordinatorEvents.mock";

export const CoordinatorEventsPage = () => {
  const navigate = useNavigate();

  const handleCreateEvent = () => {
    navigate("/coordinator/events/create");
  };

  const getStatusChip = (status: CoordinatorEventStatus) => {
    switch (status) {
      case "ONGOING":
        return (
          <Chip
            label="ONGOING"
            size="small"
            sx={{
              borderRadius: "8px",
              bgcolor: "#eff6ff",
              color: "#2563eb",
              border: "1px solid #bfdbfe",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          />
        );
      case "DRAFT":
        return (
          <Chip
            label="DRAFT"
            size="small"
            sx={{
              borderRadius: "8px",
              bgcolor: "#fffbeb",
              color: "#d97706",
              border: "1px solid #fef3c7",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          />
        );
      case "ENDED":
        return (
          <Chip
            label="ENDED"
            size="small"
            sx={{
              borderRadius: "8px",
              bgcolor: "#f3f4f6",
              color: "#6b7280",
              border: "1px solid #e5e7eb",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Event Management
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Manage all Hackathon events, timelines, and configurations.
          </p>
        </div>

<Button
  variant="contained"
  startIcon={<AddOutlinedIcon />}
  onClick={handleCreateEvent}
  sx={{
    bgcolor: '#2563eb',
    hover: { bgcolor: '#1d4ed8' },
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: '8px',
    boxShadow: 'none',
    '&:hover': { boxShadow: 'none', bgcolor: '#1d4ed8' }
  }}
>
  Create New Event
</Button>
      </section>

      {/* Events Card Grid Layout */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coordinatorEventsMock.map((event) => {
          const isOngoing = event.status === "ONGOING";

          return (
            <Card
              key={event.id}
              variant="outlined"
              className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${
                isOngoing
                  ? "border-blue-500 ring-1 ring-blue-500/20 bg-gradient-to-b from-blue-50/10 to-transparent"
                  : "border-gray-200"
              }`}
              style={{ borderRadius: "16px" }}
            >
              {/* Visual Highlight Badge cho Event đang diễn ra */}
              {isOngoing && (
                <div className="absolute right-0 top-0 rounded-bl-xl bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Active
                </div>
              )}

              <CardContent className="flex h-full flex-col p-6">
                {/* Top Row: Status & Season */}
                <div className="flex items-center justify-between gap-2">
                  {getStatusChip(event.status)}
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {event.season}
                  </span>
                </div>

                {/* Event Name */}
                <h2 className="mt-4 text-lg font-bold text-slate-800 line-clamp-1">
                  {event.name}
                </h2>

                {/* Metadata / Quick Info Grid */}
                <div className="mt-5 grid grid-cols-2 gap-y-3 border-y border-gray-100 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <DynamicFeedOutlinedIcon
                      sx={{ fontSize: 18, color: "#94a3b8" }}
                    />
                    <span>
                      <strong>{event.rounds}</strong> Rounds
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LayersOutlinedIcon
                      sx={{ fontSize: 18, color: "#94a3b8" }}
                    />
                    {/* Mocking static tracks/teams info for preview context */}
                    <span>
                      <strong>3</strong> Tracks
                    </span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <GroupsOutlinedIcon
                      sx={{ fontSize: 18, color: "#94a3b8" }}
                    />
                    <span>
                      <strong>36</strong> Approved Teams
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Clear Action Buttons */}
                <div className="mt-6 flex gap-2">
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={() => navigate(`/coordinator/events/${event.id}`)}
                    sx={{
                      borderRadius: "8px",
                      fontWeight: 700,
                      borderColor: isOngoing ? "#bfdbfe" : "#e5e7eb",
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    fullWidth
                    variant={isOngoing ? "contained" : "outlined"}
                    size="small"
                    color={isOngoing ? "primary" : "inherit"}
                    startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={() => navigate(`/coordinator/events/${event.id}`)}
                    sx={{
                      borderRadius: "8px",
                      fontWeight: 700,
                      bgcolor: isOngoing ? "#2563eb" : "transparent",
                      "&:hover": isOngoing
                        ? { bgcolor: "#1d4ed8" }
                        : { bgffcolor: "#f8fafc" },
                    }}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
};
