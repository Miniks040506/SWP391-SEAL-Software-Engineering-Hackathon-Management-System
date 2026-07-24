import Button from "@mui/material/Button";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

import type { UUID } from "@/types/common.types";
import type { AnnouncementResponse } from "@/types/announcement.types";
import type { EventSummaryResponse } from "@/types/event.types";

type AnnouncementListProps = {
  announcements: AnnouncementResponse[];
  events: EventSummaryResponse[];
  isLoading: boolean;
  onEdit: (announcement: AnnouncementResponse) => void;
  onDelete: (announcementId: UUID) => void;
  onPublish: (announcementId: UUID) => void;
  onUnpublish: (announcementId: UUID) => void;
  onPin: (announcementId: UUID) => void;
  onUnpin: (announcementId: UUID) => void;
  onMarkResult: (announcementId: UUID) => void;
};

const targetScopeLabels: Record<string, string> = {
  ALL: "All event users",
  TRACK: "Specific track",
  TEAM: "Specific team",
  JUDGE: "Judges",
  COORDINATION: "Coordinators",
  STUDENT: "Students / Participants",
  SINGLE_USER: "Single user",
};

function statusPill(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400";
    case "SCHEDULED":
      return "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400";
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400";
    default:
      return "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-600/40 dark:bg-slate-700/40 dark:text-slate-300";
  }
}

const metaChip =
  "inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400";

function fmt(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

function SkeletonCards() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div className="an-skeleton mb-3 h-4 w-48 rounded" />
          <div className="an-skeleton mb-2 h-3 w-full rounded" />
          <div className="an-skeleton mb-4 h-3 w-2/3 rounded" />
          <div className="flex gap-2">
            <div className="an-skeleton h-6 w-24 rounded-lg" />
            <div className="an-skeleton h-6 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export const AnnouncementList = ({
  announcements,
  isLoading,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onPin,
  onUnpin,
  onMarkResult,
}: AnnouncementListProps) => {
  if (isLoading) {
    return <SkeletonCards />;
  }

  if (announcements.length === 0) {
    return (
      <div className="an-rise flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-800/40">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <CampaignOutlinedIcon />
        </span>
        <p className="text-base font-bold text-slate-600 dark:text-slate-300">
          No announcements yet
        </p>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
          Click{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            Create Announcement
          </span>{" "}
          to publish the first one for this event.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement, i) => {
        const isPublished = announcement.status === "PUBLISHED";
        const canPublish =
          announcement.status === "DRAFT" ||
          announcement.status === "SCHEDULED";
        const channels = [
          announcement.sendInApp ? "In-app" : null,
          announcement.sendEmail ? "Email" : null,
        ]
          .filter(Boolean)
          .join(" + ");

        return (
          <div
            key={announcement.id}
            className={`an-card-in an-card relative overflow-hidden rounded-2xl border bg-white p-5 dark:bg-slate-900/60 ${
              announcement.pinned
                ? "border-blue-200 dark:border-blue-500/30"
                : "border-slate-200 dark:border-slate-800"
            }`}
            style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}
          >
            {announcement.pinned && (
              <span className="absolute inset-y-0 left-0 w-1 bg-blue-500" />
            )}
            <div className="flex flex-col gap-4 pl-1 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    {announcement.title}
                  </h3>
                  <span
                    className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${statusPill(announcement.status)}`}
                  >
                    {announcement.status}
                  </span>
                  {announcement.pinned && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
                      <PushPinOutlinedIcon sx={{ fontSize: 13 }} /> Pinned
                    </span>
                  )}
                  {announcement.resultAnnouncement && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-bold text-violet-600 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400">
                      <EmojiEventsOutlinedIcon sx={{ fontSize: 13 }} /> Result
                    </span>
                  )}
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {announcement.content}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={metaChip}>
                    <GroupOutlinedIcon sx={{ fontSize: 13 }} />
                    {targetScopeLabels[announcement.targetScope] ??
                      announcement.targetScope}
                  </span>
                  {channels && (
                    <span className={metaChip}>
                      <NotificationsNoneOutlinedIcon sx={{ fontSize: 13 }} />
                      {channels}
                    </span>
                  )}
                  {announcement.scheduledAt && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400">
                      <ScheduleOutlinedIcon sx={{ fontSize: 13 }} />
                      {fmt(announcement.scheduledAt)}
                    </span>
                  )}
                  {announcement.publishedAt && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />
                      {fmt(announcement.publishedAt)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditOutlinedIcon />}
                  disabled={isPublished}
                  onClick={() => onEdit(announcement)}
                  sx={{ fontWeight: 700, textTransform: "none", borderRadius: "10px" }}
                >
                  Edit
                </Button>

                {isPublished ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<UndoOutlinedIcon />}
                    onClick={() => onUnpublish(announcement.id)}
                    sx={{ fontWeight: 700, textTransform: "none", borderRadius: "10px" }}
                  >
                    Unpublish
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!canPublish}
                    startIcon={<SendOutlinedIcon />}
                    onClick={() => onPublish(announcement.id)}
                    sx={{
                      bgcolor: "#2563eb",
                      fontWeight: 700,
                      textTransform: "none",
                      borderRadius: "10px",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#1d4ed8" },
                    }}
                  >
                    Publish
                  </Button>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PushPinOutlinedIcon />}
                  onClick={() =>
                    announcement.pinned
                      ? onUnpin(announcement.id)
                      : onPin(announcement.id)
                  }
                  sx={{ fontWeight: 700, textTransform: "none", borderRadius: "10px" }}
                >
                  {announcement.pinned ? "Unpin" : "Pin"}
                </Button>

                {!announcement.resultAnnouncement && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EmojiEventsOutlinedIcon />}
                    onClick={() => onMarkResult(announcement.id)}
                    sx={{ fontWeight: 700, textTransform: "none", borderRadius: "10px" }}
                  >
                    Mark Result
                  </Button>
                )}

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteOutlineOutlinedIcon />}
                  onClick={() => onDelete(announcement.id)}
                  sx={{ fontWeight: 700, textTransform: "none", borderRadius: "10px" }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
