import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

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
import "../styles/announcements.css";

/** Dark-mode-aware styling for the MUI inputs inside the dialog. */
const textFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
  ".dark & .MuiInputBase-input": { color: "#e2e8f0" },
  ".dark & .MuiInputLabel-root": { color: "#94a3b8" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
  ".dark &:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#64748b" },
  ".dark & .MuiSelect-icon": { color: "#94a3b8" },
  ".dark & .MuiFormHelperText-root": { color: "#94a3b8" },
};

const controlLabelSx = {
  ".dark & .MuiFormControlLabel-label": { color: "#cbd5e1" },
};

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
      classes={{
        paper: "bg-white dark:bg-slate-900 dark:text-slate-200 an-dialog",
      }}
      slotProps={{
        backdrop: {
          className: "an-backdrop",
          sx: {
            backdropFilter: "blur(3px)",
            backgroundColor: "rgba(15, 23, 42, 0.55)",
          },
        },
      }}
      sx={{
        "& .MuiDialog-paper": {
          backgroundImage: "none",
          borderRadius: "20px",
          overflow: "hidden",
        },
      }}
    >
      {/* Gradient header — distinct per mode so create vs edit reads clearly */}
      <div
        className={[
          "relative overflow-hidden px-6 py-5 text-white",
          isEditMode
            ? "bg-gradient-to-br from-violet-600 to-indigo-700"
            : "bg-gradient-to-br from-blue-600 to-indigo-700",
        ].join(" ")}
      >
        <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            {isEditMode ? <EditOutlinedIcon /> : <CampaignOutlinedIcon />}
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100">
              {isEditMode ? "Update announcement" : "New announcement"}
            </p>
            <p className="text-xl font-extrabold tracking-tight">
              {isEditMode ? "Edit Announcement" : "Create Announcement"}
            </p>
          </div>
        </div>
      </div>

      <FormProvider {...methods}>
        <DialogContent dividers sx={{ ".dark &": { borderColor: "#1e293b" } }}>
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
                sx={textFieldSx}
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
                    sx={textFieldSx}
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
                sx={textFieldSx}
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
                sx={textFieldSx}
                {...register("content")}
              />
            </div>

            {targetScope === "TRACK" && (
              <div>
                <p className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
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
                            ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10",
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
                sx={textFieldSx}
                {...register("targetId")}
              />
            )}

            <div className="rounded-2xl border border-slate-200 px-5 py-4 dark:border-slate-700">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Channel
              </p>

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Controller
                  name="sendInApp"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      sx={controlLabelSx}
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
                      sx={controlLabelSx}
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
                    sx={textFieldSx}
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
                  sx={textFieldSx}
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
                    sx={controlLabelSx}
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
                    sx={controlLabelSx}
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

        <DialogActions
          className="border-t border-slate-200 dark:border-slate-800"
          sx={{ px: 3, py: 2 }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{ textTransform: "none", borderRadius: "10px" }}
          >
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
