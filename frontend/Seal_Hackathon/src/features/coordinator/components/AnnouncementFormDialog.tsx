import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import type { AnnouncementResponse } from "@/types/announcement.types";
import type { EventSummaryResponse } from "@/types/event.types";
import type { TrackResponse } from "@/types/track.types";

import {
  ANNOUNCEMENT_TARGET_SCOPES,
  announcementFormSchema,
  initialAnnouncementFormValues,
  type AnnouncementAction,
  type AnnouncementFormValues,
} from "../schemas/announcement.schema";

type AnnouncementFormDialogProps = {
  open: boolean;
  events: EventSummaryResponse[];
  tracks: TrackResponse[];
  selectedEventId: string;
  initialAnnouncement: AnnouncementResponse | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (
    values: AnnouncementFormValues,
    action: AnnouncementAction,
  ) => void | Promise<void>;
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

export const AnnouncementFormDialog = ({
  open,
  events,
  tracks,
  selectedEventId,
  initialAnnouncement,
  isSubmitting,
  onClose,
  onSubmit,
}: AnnouncementFormDialogProps) => {
  const isEditMode = Boolean(initialAnnouncement);
  const [activeAction, setActiveAction] = useState<AnnouncementAction | null>(
    null,
  );

  const methods = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema) as Resolver<AnnouncementFormValues>,
    defaultValues: {
      ...initialAnnouncementFormValues,
      eventId: selectedEventId,
    },
    mode: "onSubmit",
  });

  const {
    control,
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = methods;

  const targetScope = useWatch({
    control,
    name: "targetScope",
  });

  const scheduleMode = useWatch({
    control,
    name: "scheduleMode",
  });

  const targetTrackIds = useWatch({
    control,
    name: "targetTrackIds",
  });

  useEffect(() => {
    if (!open) return;

    if (initialAnnouncement) {
      reset({
        eventId: initialAnnouncement.eventId,
        title: initialAnnouncement.title,
        content: initialAnnouncement.content,
        pinned: initialAnnouncement.pinned,
        resultAnnouncement: initialAnnouncement.resultAnnouncement,
        sendEmail: initialAnnouncement.sendEmail,
        sendInApp: initialAnnouncement.sendInApp,
        targetScope: initialAnnouncement.targetScope,
        targetId: initialAnnouncement.targetId ?? "",
        targetTrackIds: initialAnnouncement.targetTrackIds ?? [],
        targetRoleNames: initialAnnouncement.targetRoleNames ?? [],
        scheduleMode: initialAnnouncement.scheduledAt
          ? "SCHEDULE_LATER"
          : "SEND_NOW",
        scheduledAt: initialAnnouncement.scheduledAt
          ? initialAnnouncement.scheduledAt.slice(0, 16)
          : "",
      });
      return;
    }

    reset({
      ...initialAnnouncementFormValues,
      eventId: selectedEventId,
    });
  }, [open, initialAnnouncement, selectedEventId, reset]);

  useEffect(() => {
    setValue("targetId", "");
    setValue("targetTrackIds", []);
    setValue("targetRoleNames", []);
  }, [targetScope, setValue]);

  const handleToggleTrack = (trackId: string) => {
    const currentValues = targetTrackIds ?? [];

    const nextValues = currentValues.includes(trackId)
      ? currentValues.filter((id) => id !== trackId)
      : [...currentValues, trackId];

    setValue("targetTrackIds", nextValues, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleActionSubmit = (action: AnnouncementAction) => {
    if (isSubmitting) return;

    const nextScheduleMode =
      action === "SCHEDULE" ? "SCHEDULE_LATER" : "SEND_NOW";

    setValue("scheduleMode", nextScheduleMode, {
      shouldDirty: true,
      shouldValidate: false,
    });
    setActiveAction(action);

    void handleSubmit(
      async (values) => {
        try {
          await onSubmit(
            { ...values, scheduleMode: nextScheduleMode },
            action,
          );
        } finally {
          setActiveAction(null);
        }
      },
      () => setActiveAction(null),
    )();
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ fontWeight: 900 }}>
        {isEditMode ? "Edit Announcement" : "Create Announcement"}
      </DialogTitle>

      <FormProvider {...methods}>
        <DialogContent dividers>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <TextField
                select
                label="Event"
                error={Boolean(errors.eventId)}
                helperText={errors.eventId?.message}
                fullWidth
                required
                size="small"
                disabled={isEditMode}
                {...register("eventId")}
              >
                {events.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.name}
                  </MenuItem>
                ))}
              </TextField>

              <Controller
                name="targetScope"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Audience"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    fullWidth
                    required
                    size="small"
                  >
                    {ANNOUNCEMENT_TARGET_SCOPES.map((scope) => (
                      <MenuItem key={scope} value={scope}>
                        {targetScopeLabels[scope]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <TextField
                label="Title"
                placeholder="e.g. Submission deadline reminder"
                error={Boolean(errors.title)}
                helperText={errors.title?.message}
                fullWidth
                required
                size="small"
                className="md:col-span-2"
                {...register("title")}
              />

              <TextField
                label="Content"
                placeholder="Write announcement content..."
                error={Boolean(errors.content)}
                helperText={errors.content?.message}
                fullWidth
                required
                multiline
                minRows={6}
                className="md:col-span-2"
                {...register("content")}
              />
            </div>

            {targetScope === "TRACK" && (
              <div>
                <p className="mb-2 text-sm font-bold text-gray-700">
                  Target Tracks
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {tracks.map((track) => {
                    const checked = targetTrackIds?.includes(track.id);

                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => handleToggleTrack(track.id)}
                        className={[
                          "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                          checked
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/40",
                        ].join(" ")}
                      >
                        <Checkbox checked={checked} tabIndex={-1} disableRipple />
                        <span className="text-sm font-bold">{track.name}</span>
                      </button>
                    );
                  })}
                </div>

                {errors.targetTrackIds?.message && (
                  <p className="mt-2 text-sm font-semibold text-red-600">
                    {errors.targetTrackIds.message}
                  </p>
                )}
              </div>
            )}

            {(targetScope === "TEAM" || targetScope === "SINGLE_USER") && (
              <TextField
                label={targetScope === "TEAM" ? "Target Team ID" : "Target User ID"}
                placeholder="Paste UUID here"
                error={Boolean(errors.targetId)}
                helperText={
                  errors.targetId?.message ??
                  "Temporary input until team/user selector API is available."
                }
                fullWidth
                required
                size="small"
                {...register("targetId")}
              />
            )}

            <div className="rounded-2xl border border-gray-200 px-5 py-4">
              <p className="text-sm font-bold text-gray-700">Channel</p>

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Controller
                  name="sendInApp"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(event) =>
                            field.onChange(event.target.checked)
                          }
                        />
                      }
                      label="In-app notification"
                    />
                  )}
                />

                <Controller
                  name="sendEmail"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(event) =>
                            field.onChange(event.target.checked)
                          }
                        />
                      }
                      label="Email"
                    />
                  )}
                />
              </div>

              {errors.sendInApp?.message && (
                <p className="mt-1 text-sm font-semibold text-red-600">
                  {errors.sendInApp.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Controller
                name="scheduleMode"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Schedule"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="SEND_NOW">Send now</MenuItem>
                    <MenuItem value="SCHEDULE_LATER">Schedule later</MenuItem>
                  </TextField>
                )}
              />

              {scheduleMode === "SCHEDULE_LATER" && (
                <TextField
                  label="Scheduled At"
                  type="datetime-local"
                  error={Boolean(errors.scheduledAt)}
                  helperText={errors.scheduledAt?.message}
                  fullWidth
                  required
                  size="small"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  {...register("scheduledAt")}
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Controller
                name="pinned"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(event) =>
                          field.onChange(event.target.checked)
                        }
                      />
                    }
                    label="Pin announcement"
                  />
                )}
              />

              <Controller
                name="resultAnnouncement"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(event) =>
                          field.onChange(event.target.checked)
                        }
                      />
                    }
                    label="Mark as result announcement"
                  />
                )}
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="outlined"
            onClick={() => handleActionSubmit("DRAFT")}
            disabled={isSubmitting}
            sx={{ fontWeight: 800 }}
          >
            {isSubmitting && activeAction === "DRAFT"
              ? "Saving..."
              : "Save Draft"}
          </Button>

          <Button
            variant="outlined"
            onClick={() => handleActionSubmit("SCHEDULE")}
            disabled={isSubmitting}
            sx={{ fontWeight: 800 }}
          >
            {isSubmitting && activeAction === "SCHEDULE"
              ? "Scheduling..."
              : "Schedule"}
          </Button>

          <Button
            variant="contained"
            onClick={() => handleActionSubmit("PUBLISH")}
            disabled={isSubmitting}
            sx={{
              bgcolor: "#2563eb",
              fontWeight: 800,
              "&:hover": {
                bgcolor: "#1d4ed8",
              },
            }}
          >
            {isSubmitting && activeAction === "PUBLISH"
              ? "Publishing..."
              : "Publish Now"}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};
