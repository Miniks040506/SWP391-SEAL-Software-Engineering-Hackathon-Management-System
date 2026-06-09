import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

import type { UUID } from "@/types/common.types";
import type { AnnouncementResponse } from "@/types/announcement.types";
import type { EventSummaryResponse } from "@/types/event.types";

import { AnnouncementStatusChip } from "./AnnouncementStatusChip";

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

function getEventName(events: EventSummaryResponse[], eventId: string) {
  return events.find((event) => event.id === eventId)?.name ?? "Unknown event";
}

export const AnnouncementList = ({
  announcements,
  events,
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
    return (
      <Card variant="outlined">
        <CardContent>
          <p className="text-sm font-semibold text-gray-500">
            Loading announcements...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-6 py-12 text-center">
            <p className="font-bold text-gray-500">No announcements yet.</p>
            <p className="mt-1 text-sm text-gray-400">
              Click Create Announcement to add the first announcement.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => {
        const isPublished = announcement.status === "PUBLISHED";
        const canPublish =
          announcement.status === "DRAFT" ||
          announcement.status === "SCHEDULED";

        return (
          <Card key={announcement.id} variant="outlined">
            <CardContent>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-extrabold text-gray-900">
                      {announcement.title}
                    </h3>

                    <AnnouncementStatusChip announcement={announcement} />

                    {announcement.pinned && (
                      <Chip
                        size="small"
                        label="Pinned"
                        color="primary"
                        sx={{ fontWeight: 800 }}
                      />
                    )}

                    {announcement.resultAnnouncement && (
                      <Chip
                        size="small"
                        label="Result"
                        color="secondary"
                        sx={{ fontWeight: 800 }}
                      />
                    )}
                  </div>

                  <p className="mt-1 text-sm font-semibold text-gray-500">
                    Event: {getEventName(events, announcement.eventId)}
                  </p>

                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                    {announcement.content}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Chip
                      size="small"
                      label={`Audience: ${
                        targetScopeLabels[announcement.targetScope]
                      }`}
                      sx={{ fontWeight: 700 }}
                    />

                    <Chip
                      size="small"
                      label={`Channel: ${[
                        announcement.sendInApp ? "In-app" : null,
                        announcement.sendEmail ? "Email" : null,
                      ]
                        .filter(Boolean)
                        .join(" + ")}`}
                      sx={{ fontWeight: 700 }}
                    />

                    {announcement.scheduledAt && (
                      <Chip
                        size="small"
                        color="warning"
                        label={`Scheduled: ${announcement.scheduledAt}`}
                        sx={{ fontWeight: 700 }}
                      />
                    )}

                    {announcement.publishedAt && (
                      <Chip
                        size="small"
                        color="success"
                        label={`Published: ${announcement.publishedAt}`}
                        sx={{ fontWeight: 700 }}
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditOutlinedIcon />}
                    disabled={announcement.status === "PUBLISHED"}
                    onClick={() => onEdit(announcement)}
                    sx={{ fontWeight: 800 }}
                  >
                    Edit
                  </Button>

                  {isPublished ? (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<UndoOutlinedIcon />}
                      onClick={() => onUnpublish(announcement.id)}
                      sx={{ fontWeight: 800 }}
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
                        fontWeight: 800,
                        "&:hover": {
                          bgcolor: "#1d4ed8",
                        },
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
                    sx={{ fontWeight: 800 }}
                  >
                    {announcement.pinned ? "Unpin" : "Pin"}
                  </Button>

                  {!announcement.resultAnnouncement && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onMarkResult(announcement.id)}
                      sx={{ fontWeight: 800 }}
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
                    sx={{ fontWeight: 800 }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
