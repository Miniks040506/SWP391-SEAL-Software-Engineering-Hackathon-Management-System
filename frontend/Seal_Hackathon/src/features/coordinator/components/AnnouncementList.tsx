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

import type { AnnouncementEventOption } from "../mocks/coordinatorAnnouncements.mock";
import { AnnouncementStatusChip } from "./AnnouncementStatusChip";

type AnnouncementListProps = {
  announcements: AnnouncementResponse[];
  events: AnnouncementEventOption[];
  isLoading: boolean;
  onEdit: (announcement: AnnouncementResponse) => void;
  onDelete: (announcementId: UUID) => void;
  onPublish: (announcementId: UUID) => void;
  onUnpublish: (announcementId: UUID) => void;
  onPin: (announcementId: UUID) => void;
  onUnpin: (announcementId: UUID) => void;
  onMarkResult: (announcementId: UUID) => void;
};

function getEventName(events: AnnouncementEventOption[], eventId: string) {
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
        const isPublished = Boolean(announcement.publishedAt);

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
                    {announcement.publishedAt && (
                      <Chip
                        size="small"
                        label={`Published: ${announcement.publishedAt}`}
                        sx={{ fontWeight: 700 }}
                      />
                    )}

                    <Chip
                      size="small"
                      label={`Created by: ${announcement.createdBy}`}
                      sx={{ fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => onEdit(announcement)}
                    sx={{ fontWeight: 800 }}
                  >
                    Edit
                  </Button>

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
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
