import { useMemo } from "react";
import { useParams } from "react-router-dom";

import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";

import { useCoordinatorAnnouncements } from "../hooks/useCoordinatorAnnouncements";
import { useCountUp } from "../hooks/useCountUp";
import { filterSelectSx, menuPropsAll } from "../../teams/schemas/teams.schema";

import { AnnouncementFormDialog } from "../components/AnnouncementFormDialog";
import { AnnouncementList } from "../components/AnnouncementList";
import "../styles/announcements.css";

type Tone = "slate" | "emerald" | "blue" | "amber";

const toneMap: Record<Tone, { value: string; icon: string; accent: string }> = {
  slate: { value: "text-slate-900 dark:text-slate-100", icon: "text-slate-400 dark:text-slate-500", accent: "bg-slate-300 dark:bg-slate-600" },
  emerald: { value: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-500 dark:text-emerald-400", accent: "bg-emerald-500" },
  blue: { value: "text-blue-600 dark:text-blue-400", icon: "text-blue-500 dark:text-blue-400", accent: "bg-blue-500" },
  amber: { value: "text-amber-600 dark:text-amber-300", icon: "text-amber-500 dark:text-amber-400", accent: "bg-amber-400" },
};

function StatTile({
  label,
  value,
  tone,
  icon,
  delayMs,
}: {
  label: string;
  value: number;
  tone: Tone;
  icon: React.ReactNode;
  delayMs: number;
}) {
  const animated = useCountUp(value);
  const styles = toneMap[tone];
  return (
    <div
      className="an-rise an-card relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/60"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={`mt-1.5 text-3xl font-bold leading-none tabular-nums ${styles.value}`}>
        {Math.round(animated)}
      </div>
      <span
        className={`an-underline absolute bottom-0 left-0 h-[3px] w-full ${styles.accent}`}
        style={{ animationDelay: `${delayMs + 140}ms` }}
      />
    </div>
  );
}

// The event lifecycle is DRAFT -> REGISTRATION -> ONGOING -> JUDGING ->
// COMPLETED. Any of the active phases means the season is running now.
const ACTIVE_EVENT_STATUSES = new Set(["ONGOING", "JUDGING", "REGISTRATION"]);

function eventStatusPill(status?: string) {
  switch ((status ?? "").toUpperCase()) {
    case "ONGOING":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400";
    case "JUDGING":
      return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400";
    case "REGISTRATION":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400";
    case "UPCOMING":
    case "DRAFT":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400";
  }
}

export const CoordinatorAnnouncementPage = () => {
  const { eventId } = useParams();

  const {
    events,
    tracks,
    selectedEventId,
    setSelectedEventId,
    announcements,
    announcementsQuery,
    eventsQuery,
    isDialogOpen,
    editingAnnouncement,
    isSubmitting,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    submitAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
    unpublishAnnouncement,
    pinAnnouncement,
    unpinAnnouncement,
    markResultAnnouncement,
  } = useCoordinatorAnnouncements(eventId);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId],
  );
  const selectedStatus = (selectedEvent?.status ?? "").toUpperCase();
  const isLive = ACTIVE_EVENT_STATUSES.has(selectedStatus);

  const stats = useMemo(() => {
    return {
      total: announcements.length,
      published: announcements.filter((a) => a.status === "PUBLISHED").length,
      draft: announcements.filter((a) => a.status === "DRAFT").length,
      scheduled: announcements.filter((a) => a.status === "SCHEDULED").length,
      pinned: announcements.filter((a) => a.pinned).length,
    };
  }, [announcements]);

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] bg-slate-50 p-6 dark:bg-transparent">
      {/* Header */}
      <div className="an-fade mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Announcement Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create, edit, schedule, publish, pin, and manage event
            announcements.
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={openCreateDialog}
          disabled={!selectedEventId}
          sx={{
            bgcolor: "#2563eb",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "10px",
            boxShadow: "none",
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          Create Announcement
        </Button>
      </div>

      {/* Event context bar */}
      <div
        className="an-rise mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between"
        style={{ animationDelay: "40ms" }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <CampaignOutlinedIcon />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Managing announcements for
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {selectedEvent?.name ?? "Select an event"}
              </span>
              {selectedEvent?.status && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-bold ${eventStatusPill(selectedEvent.status)}`}
                >
                  {isLive && (
                    <span className="an-live-dot inline-block h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                  {selectedStatus === "ONGOING" ? "LIVE" : selectedEvent.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {!eventId && (
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <Select
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(event.target.value)}
              displayEmpty
              disabled={eventsQuery.isLoading}
              sx={filterSelectSx}
              MenuProps={menuPropsAll}
            >
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.name}
                  {ACTIVE_EVENT_STATUSES.has((event.status ?? "").toUpperCase())
                    ? "  • Live"
                    : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>

      {/* KPI tiles */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Total" value={stats.total} tone="slate" icon={<CampaignOutlinedIcon sx={{ fontSize: 18 }} />} delayMs={40} />
        <StatTile label="Published" value={stats.published} tone="emerald" icon={<SendOutlinedIcon sx={{ fontSize: 18 }} />} delayMs={80} />
        <StatTile label="Draft" value={stats.draft} tone="slate" icon={<EditNoteOutlinedIcon sx={{ fontSize: 18 }} />} delayMs={120} />
        <StatTile label="Scheduled" value={stats.scheduled} tone="amber" icon={<ScheduleOutlinedIcon sx={{ fontSize: 18 }} />} delayMs={160} />
        <StatTile label="Pinned" value={stats.pinned} tone="blue" icon={<PushPinOutlinedIcon sx={{ fontSize: 18 }} />} delayMs={200} />
      </div>

      {/* List */}
      <AnnouncementList
        announcements={announcements}
        events={events}
        isLoading={announcementsQuery.isLoading}
        onEdit={openEditDialog}
        onDelete={deleteAnnouncement}
        onPublish={publishAnnouncement}
        onUnpublish={unpublishAnnouncement}
        onPin={pinAnnouncement}
        onUnpin={unpinAnnouncement}
        onMarkResult={markResultAnnouncement}
      />

      <AnnouncementFormDialog
        open={isDialogOpen}
        events={events}
        tracks={tracks}
        selectedEventId={selectedEventId}
        initialAnnouncement={editingAnnouncement}
        isSubmitting={isSubmitting}
        onClose={closeDialog}
        onSubmit={submitAnnouncement}
      />
    </div>
  );
};
