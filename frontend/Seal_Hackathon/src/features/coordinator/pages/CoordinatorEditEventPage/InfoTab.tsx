import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { isAxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { eventAssetApi } from "@/api/eventAsset.api";
import { eventApi } from "@/api/event.api";
import type { ApiErrorResponse, UUID } from "@/types/common.types";
import type { EventDetailResponse } from "@/types/event.types";
import { EventBannerCropUpload } from "@/features/coordinator/pages/CoordinatorCreateEventPage/components/EventBannerCropUpload";
import { useDeleteEventMutation } from "@/features/coordinator/hooks/useCoordinatorEventMutations";
import {
  EVENT_STATUS_STEPS,
  getEventEditRules,
  getNextEventStatus,
  normalizeEventStatus,
  type EditableEventStatus,
} from "./eventEditRules";

type InfoTabProps = {
  eventId: UUID;
  event: EventDetailResponse;
  onUpdated: () => void | Promise<void>;
  canEdit: boolean;
  readonlyReason?: string;
};

const EVENT_SEASONS = ["SPRING", "SUMMER", "FALL"] as const;

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
  },
};

const dateTimeFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
  },
  "& .MuiInputLabel-root": {
    backgroundColor: "white",
    paddingInline: "4px",
  },
  ".dark & .MuiInputLabel-root": {
    backgroundColor: "#0f172a",
  },
};

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}

function readString(event: EventDetailResponse, ...keys: string[]) {
  const raw = event as Record<string, unknown>;

  for (const key of keys) {
    const value = raw[key];

    if (typeof value === "string") return value;
  }

  return "";
}

function readNumber(event: EventDetailResponse, ...keys: string[]) {
  const raw = event as Record<string, unknown>;

  for (const key of keys) {
    const value = raw[key];

    if (typeof value === "number") return value;
  }

  return new Date().getFullYear();
}

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message || fallback;
  }

  return fallback;
}

function StatusWorkflow({
  status,
  isAdvancing,
  isCancelling,
  isDeleting,
  onAdvance,
  onCancel,
  onDelete,
}: {
  status: EditableEventStatus;
  isAdvancing: boolean;
  isCancelling: boolean;
  isDeleting: boolean;
  onAdvance: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const currentIndex = EVENT_STATUS_STEPS.findIndex(
    (step) => step.value === status,
  );
  const nextStatus = getNextEventStatus(status);
  const rules = getEventEditRules(status);

  if (status === "CANCELLED" || status === "ARCHIVED") {
    const isArchived = status === "ARCHIVED";

    return (
      <div
        className={[
          "rounded-2xl border p-5",
          isArchived
            ? "border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/40"
            : "border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10",
        ].join(" ")}
      >
        <p
          className={[
            "text-sm font-black uppercase tracking-[0.18em]",
            isArchived ? "text-slate-500" : "text-rose-500",
          ].join(" ")}
        >
          Event status
        </p>
        <h3
          className={[
            "mt-2 text-xl font-black",
            isArchived
              ? "text-slate-700 dark:text-slate-200"
              : "text-rose-700 dark:text-rose-300",
          ].join(" ")}
        >
          {isArchived ? "Archived" : "Cancelled"}
        </h3>
        <p
          className={[
            "mt-1 text-sm font-medium",
            isArchived ? "text-slate-500" : "text-rose-500",
          ].join(" ")}
        >
          This event is read-only and cannot move to the next state.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Event status workflow
          </p>
          <h3 className="mt-2 flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
            <FlagOutlinedIcon fontSize="small" className="text-blue-500" />
            {EVENT_STATUS_STEPS[currentIndex]?.label ?? status}
          </h3>
          <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            {EVENT_STATUS_STEPS[currentIndex]?.description ??
              "Current event status."}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
          <Button
            variant="contained"
            endIcon={<ArrowForwardOutlinedIcon />}
            onClick={onAdvance}
            disabled={
              !rules.canAdvance ||
              !nextStatus ||
              isAdvancing ||
              isCancelling ||
              isDeleting
            }
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 900,
              minWidth: 210,
            }}
          >
            {nextStatus ? `Move to ${nextStatus}` : "No next status"}
          </Button>

          <Button
            color="error"
            variant="outlined"
            startIcon={<CancelOutlinedIcon />}
            onClick={onCancel}
            disabled={
              !rules.canCancel || isAdvancing || isCancelling || isDeleting
            }
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 900,
              minWidth: 210,
            }}
          >
            Cancel event
          </Button>

          {status === "DRAFT" && (
            <Button
              color="error"
              variant="text"
              startIcon={<DeleteOutlineOutlinedIcon />}
              onClick={onDelete}
              disabled={isAdvancing || isCancelling || isDeleting}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 900,
                minWidth: 210,
              }}
            >
              Delete event
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {EVENT_STATUS_STEPS.map((step, index) => {
          const active = index === currentIndex;
          const done = currentIndex > index;

          return (
            <div
              key={step.value}
              className={[
                "rounded-xl border px-4 py-3 text-sm transition",
                active
                  ? "border-blue-300 bg-white text-blue-600 shadow-sm dark:border-blue-500/40 dark:bg-slate-900 dark:text-blue-300"
                  : done
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900/60",
              ].join(" ")}
            >
              <p className="font-black">
                {index + 1}. {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* <div className="mt-3 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-bold text-rose-600 dark:border-rose-500/30 dark:bg-slate-900 dark:text-rose-300">
        Cancelled is an exit state. Use Cancel event only when this event should
        stop and become read-only.
      </div> */}
    </div>
  );
}

export function InfoTab({
  eventId,
  event,
  onUpdated,
  canEdit,
  readonlyReason,
}: InfoTabProps) {
  const navigate = useNavigate();
  const deleteEventMutation = useDeleteEventMutation();
  const initialValues = useMemo(
    () => ({
      name: readString(event, "name", "eventName", "title"),
      season: readString(event, "season") || "SPRING",
      year: readNumber(event, "year"),
      status: normalizeEventStatus(readString(event, "status")),
      registrationStartAt: toDateTimeLocal(
        readString(event, "registrationStartAt", "registrationOpenAt"),
      ),
      registrationEndAt: toDateTimeLocal(
        readString(event, "registrationEndAt", "registrationCloseAt"),
      ),
      competitionStartAt: toDateTimeLocal(
        readString(event, "competitionStartAt"),
      ),
      competitionEndAt: toDateTimeLocal(
        readString(event, "competitionEndAt"),
      ),
      varianceThresholdPoints: event.varianceThresholdPoints ?? 3,
      description: readString(event, "description"),
      bannerUrl: readString(event, "bannerUrl"),
    }),
    [event],
  );

  const [form, setForm] = useState(initialValues);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "cancel" | "delete" | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(initialValues);
    setBannerFile(null);
  }, [initialValues]);

  const updateField = (field: keyof typeof form, value: string | number) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!canEdit) {
      enqueueSnackbar(readonlyReason || "This event is read-only.", {
        variant: "warning",
      });
      return;
    }

    if (!form.name.trim()) {
      enqueueSnackbar("Event name is required.", { variant: "error" });
      return;
    }

    if (!form.registrationStartAt || !form.registrationEndAt) {
      enqueueSnackbar("Registration start and end times are required.", {
        variant: "error",
      });
      return;
    }

    if (!form.competitionStartAt || !form.competitionEndAt) {
      enqueueSnackbar("Competition start and end times are required.", {
        variant: "error",
      });
      return;
    }

    if (form.registrationStartAt >= form.registrationEndAt) {
      enqueueSnackbar("Registration end time must be after start time.", {
        variant: "error",
      });
      return;
    }

    if (form.competitionStartAt >= form.competitionEndAt) {
      enqueueSnackbar("Competition end time must be after start time.", {
        variant: "error",
      });
      return;
    }

    if (form.registrationEndAt > form.competitionStartAt) {
      enqueueSnackbar("Competition must start after registration closes.", {
        variant: "error",
      });
      return;
    }

    if (
      !Number.isFinite(form.varianceThresholdPoints) ||
      form.varianceThresholdPoints <= 0
    ) {
      enqueueSnackbar("Variance threshold must be greater than 0.", {
        variant: "error",
      });
      return;
    }

    if (Math.abs(form.varianceThresholdPoints * 100 - Math.round(form.varianceThresholdPoints * 100)) > 1e-8) {
      enqueueSnackbar("Variance threshold supports at most two decimal places.", {
        variant: "error",
      });
      return;
    }

    try {
      setIsSaving(true);

      let nextBannerUrl = form.bannerUrl.trim();

      if (bannerFile) {
        const uploadedBanner = await eventAssetApi.uploadEventBanner(bannerFile);
        nextBannerUrl = uploadedBanner.url;
      }

      await eventApi.updateEvent(eventId, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        season: form.season,
        year: Number(form.year),
        registrationStartAt: form.registrationStartAt
          ? `${form.registrationStartAt}:00`
          : undefined,
        registrationEndAt: form.registrationEndAt
          ? `${form.registrationEndAt}:00`
          : undefined,
        competitionStartAt: form.competitionStartAt
          ? `${form.competitionStartAt}:00`
          : undefined,
        competitionEndAt: form.competitionEndAt
          ? `${form.competitionEndAt}:00`
          : undefined,
        varianceThresholdPoints: form.varianceThresholdPoints,
        bannerUrl: nextBannerUrl,
      });

      setBannerFile(null);
      updateField("bannerUrl", nextBannerUrl);
      enqueueSnackbar("Event updated.", { variant: "success" });
      await onUpdated();
    } catch {
      enqueueSnackbar("Failed to update event.", { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdvanceStatus = async () => {
    try {
      setIsAdvancing(true);
      const updatedEvent = await eventApi.advanceEventStatus(eventId);
      enqueueSnackbar(`Event moved to ${updatedEvent.status}.`, {
        variant: "success",
      });
      await onUpdated();
    } catch {
      enqueueSnackbar("Cannot move event to the next status.", {
        variant: "error",
      });
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleCancelStatus = async () => {
    try {
      setIsCancelling(true);
      setActionError(null);
      const updatedEvent = await eventApi.cancelEvent(eventId);
      enqueueSnackbar(`Event moved to ${updatedEvent.status}.`, {
        variant: "success",
      });
      setConfirmAction(null);
      await onUpdated();
    } catch (error) {
      setActionError(getErrorMessage(error, "Cannot cancel this event."));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      setActionError(null);
      await deleteEventMutation.mutateAsync(eventId);
      enqueueSnackbar("Draft event deleted.", { variant: "success" });
      navigate("/coordinator/events", { replace: true });
    } catch (error) {
      setActionError(getErrorMessage(error, "Cannot delete this event."));
    }
  };

  const openConfirmation = (action: "cancel" | "delete") => {
    setActionError(null);
    setConfirmAction(action);
  };

  const closeConfirmation = () => {
    if (isCancelling || deleteEventMutation.isPending) return;
    setConfirmAction(null);
    setActionError(null);
  };

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <StatusWorkflow
        status={form.status}
        isAdvancing={isAdvancing}
        isCancelling={isCancelling}
        isDeleting={deleteEventMutation.isPending}
        onAdvance={handleAdvanceStatus}
        onCancel={() => openConfirmation("cancel")}
        onDelete={() => openConfirmation("delete")}
      />

      <Dialog
        open={confirmAction !== null}
        onClose={closeConfirmation}
        maxWidth="sm"
        fullWidth
        aria-labelledby="event-action-dialog-title"
      >
        <DialogTitle id="event-action-dialog-title" sx={{ fontWeight: 900 }}>
          {confirmAction === "delete" ? "Delete draft event?" : "Cancel event?"}
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText component="div">
            <strong>{form.name || "This event"}</strong>
            {confirmAction === "delete"
              ? " will be permanently deleted. This action cannot be undone."
              : " will stop accepting workflow changes and become read-only."}
          </DialogContentText>
          {confirmAction === "delete" && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Deletion is allowed only for a DRAFT event without dependent
              records.
            </Alert>
          )}
          {actionError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {actionError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={closeConfirmation}
            disabled={isCancelling || deleteEventMutation.isPending}
          >
            Keep event
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={
              confirmAction === "delete"
                ? handleDeleteEvent
                : handleCancelStatus
            }
            disabled={isCancelling || deleteEventMutation.isPending}
            startIcon={
              isCancelling || deleteEventMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
            sx={{ fontWeight: 900 }}
          >
            {confirmAction === "delete" ? "Delete event" : "Cancel event"}
          </Button>
        </DialogActions>
      </Dialog>

      {!canEdit && readonlyReason && (
        <Alert severity="warning">{readonlyReason}</Alert>
      )}

      <div>
        <h2 className="text-xl font-black text-slate-950 dark:text-white">
          Event Information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Update basic information here. Status is changed only through the
          sequential workflow above.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <TextField
          label="Event name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          fullWidth
          size="small"
          sx={textFieldSx}
          disabled={!canEdit}
        />

        <TextField
          label="Season"
          select
          value={form.season}
          onChange={(event) => updateField("season", event.target.value)}
          fullWidth
          size="small"
          sx={textFieldSx}
          disabled={!canEdit}
        >
          {EVENT_SEASONS.map((season) => (
            <MenuItem key={season} value={season}>
              {season}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Year"
          type="number"
          value={form.year}
          onChange={(event) => updateField("year", Number(event.target.value))}
          fullWidth
          size="small"
          sx={textFieldSx}
          disabled={!canEdit}
        />

        <TextField
          label="Current status"
          value={form.status}
          fullWidth
          size="small"
          sx={textFieldSx}
          disabled
        />

        <TextField
          label="Registration start"
          type="datetime-local"
          value={form.registrationStartAt}
          onChange={(event) =>
            updateField("registrationStartAt", event.target.value)
          }
          fullWidth
          size="small"
          sx={dateTimeFieldSx}
          slotProps={{ inputLabel: { shrink: true } }}
          disabled={!canEdit}
        />

        <TextField
          label="Registration end"
          type="datetime-local"
          value={form.registrationEndAt}
          onChange={(event) =>
            updateField("registrationEndAt", event.target.value)
          }
          fullWidth
          size="small"
          sx={dateTimeFieldSx}
          slotProps={{ inputLabel: { shrink: true } }}
          disabled={!canEdit}
        />

        <TextField
          label="Competition start"
          type="datetime-local"
          value={form.competitionStartAt}
          onChange={(event) =>
            updateField("competitionStartAt", event.target.value)
          }
          fullWidth
          size="small"
          sx={dateTimeFieldSx}
          slotProps={{ inputLabel: { shrink: true } }}
          disabled={!canEdit}
        />

        <TextField
          label="Competition end"
          type="datetime-local"
          value={form.competitionEndAt}
          onChange={(event) =>
            updateField("competitionEndAt", event.target.value)
          }
          fullWidth
          size="small"
          sx={dateTimeFieldSx}
          slotProps={{ inputLabel: { shrink: true } }}
          disabled={!canEdit}
        />

        <TextField
          label="Variance review threshold"
          type="number"
          value={form.varianceThresholdPoints}
          onChange={(event) =>
            updateField("varianceThresholdPoints", Number(event.target.value))
          }
          fullWidth
          size="small"
          sx={textFieldSx}
          slotProps={{ htmlInput: { min: 0.01, step: 0.1 } }}
          helperText="Standard deviation threshold used for coordinator review flags."
          disabled={!canEdit}
        />

        <div className="lg:col-span-2">
          <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-200">
            Event banner
          </p>

          <EventBannerCropUpload
            file={bannerFile}
            bannerUrl={form.bannerUrl}
            onChange={(file) => setBannerFile(file)}
            onRemove={() => updateField("bannerUrl", "")}
            disabled={!canEdit}
            helperText="JPG, PNG, WEBP. Max 5MB. Crop uses the same 21:9 frame as create event, event card, and event banner."
          />

          <TextField
            label="Banner URL"
            value={form.bannerUrl}
            onChange={(event) => {
              setBannerFile(null);
              updateField("bannerUrl", event.target.value);
            }}
            fullWidth
            size="small"
            sx={textFieldSx}
            disabled={!canEdit}
            className="mt-4"
            helperText="You can paste an external banner URL or choose an image above to upload and crop."
          />
        </div>

        <TextField
          label="Description"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          fullWidth
          multiline
          minRows={5}
          sx={textFieldSx}
          className="lg:col-span-2"
          disabled={!canEdit}
        />
      </div>

      <div className="flex justify-end">
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={handleSave}
          disabled={!canEdit || isSaving}
          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 900 }}
        >
          Save event
        </Button>
      </div>
    </section>
  );
}
