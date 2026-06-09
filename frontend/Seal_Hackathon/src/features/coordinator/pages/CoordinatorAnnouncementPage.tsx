import { useParams } from "react-router-dom";

import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import { useCoordinatorAnnouncements } from "../hooks/useCoordinatorAnnouncements";

import { AnnouncementFormDialog } from "../components/AnnouncementFormDialog";
import { AnnouncementList } from "../components/AnnouncementList";

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

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Announcement Management
          </h1>

          <p className="mt-2 max-w-3xl text-sm text-gray-500">
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
            fontWeight: 800,
            "&:hover": {
              bgcolor: "#1d4ed8",
            },
          }}
        >
          Create Announcement
        </Button>
      </section>

      {!eventId && (
        <TextField
          select
          label="Event"
          value={selectedEventId}
          onChange={(event) => setSelectedEventId(event.target.value)}
          fullWidth
          size="small"
          disabled={eventsQuery.isLoading}
        >
          {events.map((event) => (
            <MenuItem key={event.id} value={event.id}>
              {event.name}
            </MenuItem>
          ))}
        </TextField>
      )}

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