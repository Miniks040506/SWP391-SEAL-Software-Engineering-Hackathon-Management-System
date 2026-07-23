import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
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
import {
  editDateFieldSx,
  editDialogPaperSx,
  editFieldSx,
} from "./editEventUi";
import { TabShell } from "./TabShell";

type InfoTabProps = {
  eventId: UUID;
  event: EventDetailResponse;
  onUpdated: () => void | Promise<void>;
  canEdit: boolean;
  readonlyReason?: string;
};

const EVENT_SEASONS = ["SPRING", "SUMMER", "FALL"] as const;

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
            ? "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40"
            : "border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10",
        ].join(" ")}
      >
        <p
          className={[
            "text-[11px] font-black uppercase tracking-[0.18em]",
            isArchived ? "text-slate-500" : "text-rose-500",
          ].join(" ")}
        >
          Event status
        </p>
        <h3
          className={[
            "mt-2 flex items-center gap-2 text-xl font-black",
            isArchived
              ? "text-slate-700 dark:text-slate-200"
              : "text-rose-700 dark:text-rose-300",
          ].join(" ")}
        >
          <LockOutlinedIcon fontSize="small" />
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            Event status workflow
          </p>
          <h3 className="mt-2 flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-sky-400 text-white shadow-md shadow-blue-500/25">
              <FlagOutlinedIcon sx={{ fontSize: 17 }} />
            </span>
            {EVENT_STATUS_STEPS[currentIndex]?.label ?? status}
          </h3>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            {EVENT_STATUS_STEPS[currentIndex]?.description ??
              "Current event status."}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:flex-col">
          <button
            type="button"
            onClick={onAdvance}
            aria-describedby={
              rules.advanceReason ? "event-status-advance-reason" : undefined
            }
            disabled={
              !rules.canAdvance ||
              !nextStatus ||
              isAdvancing ||
              isCancelling ||
              isDeleting
            }
            className="inline-flex min-w-52 cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
          >
            {isAdvancing ? (
              <CircularProgress size={15} sx={{ color: "white" }} />
            ) : null}
            {nextStatus ? `Move to ${nextStatus}` : "No next status"}
            {!isAdvancing && <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={
              !rules.canCancel || isAdvancing || isCancelling || isDeleting
            }
            className="inline-flex min-w-52 cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-2.5 text-sm font-black text-rose-600 transition-colors duration-200 hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/30 dark:bg-transparent dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <CancelOutlinedIcon sx={{ fontSize: 16 }} />
            Cancel event
          </button>

          {status === "DRAFT" && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isAdvancing || isCancelling || isDeleting}
              className="inline-flex min-w-52 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black text-rose-500 transition-colors duration-200 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-rose-500/10"
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
              Delete event
            </button>
          )}
        </div>
      </div>

      {rules.advanceReason && (
        <div
          id="event-status-advance-reason"
          role="note"
          className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
            <LockOutlinedIcon sx={{ fontSize: 17 }} />
          </span>
          <div>
            <p className="text-sm font-black text-amber-900 dark:text-amber-200">
              Judging starts automatically
            </p>
            <p className="mt-0.5 text-sm font-medium leading-5 text-amber-800 dark:text-amber-300">
              {rules.advanceReason}
            </p>
          </div>
        </div>
      )}

      {/* Status pipeline — mirrors the wizard stepper rhythm */}
      <div className="mt-6 flex items-start">
        {EVENT_STATUS_STEPS.map((step, index) => {
          const active = index === currentIndex;
          const done = currentIndex > index;

          return (
            <div key={step.value} className="flex flex-1 items-start">
              <div className="flex flex-1 flex-col items-center gap-2">
                <span
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition-all duration-300 motion-reduce:transition-none",
                    active
                      ? "bg-linear-to-br from-blue-500 to-sky-400 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10"
                      : done
                        ? "bg-emerald-500/90 text-white shadow-md shadow-emerald-500/25"
                        : "border border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-900",
                  ].join(" ")}
                >
                  {done ? (
                    <CheckOutlinedIcon sx={{ fontSize: 18 }} />
                  ) : (
                    index + 1
                  )}
                </span>

                <span
                  className={[
                    "max-w-24 text-center text-[10px] font-black uppercase leading-tight tracking-widest transition-colors",
                    active
                      ? "text-blue-600 dark:text-blue-300"
                      : done
                        ? "text-emerald-600 dark:text-emerald-300"
                        : "text-slate-400",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {index < EVENT_STATUS_STEPS.length - 1 ? (
                <div className="mt-5 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full bg-linear-to-r from-emerald-400 to-teal-300 transition-all duration-500 motion-reduce:transition-none ${
                      done ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              ) : (
                <div aria-hidden className="mt-5 h-0.5 flex-1" />
              )}
            </div>
          );
        })}
      </div>
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

  const confirmBusy = isCancelling || deleteEventMutation.isPending;

  return (
    <TabShell
      tab="INFO"
      title="Event Information"
      description="Update basic information here. Status is changed only through the sequential workflow below."
    >
      <StatusWorkflow
        status={form.status}
        isAdvancing={isAdvancing}
        isCancelling={isCancelling}
        isDeleting={deleteEventMutation.isPending}
        onAdvance={handleAdvanceStatus}
        onCancel={() => openConfirmation("cancel")}
        onDelete={() => openConfirmation("delete")}
      />

      {/* Cancel / delete confirmation — dark gradient chrome like every edit popup */}
      <Dialog
        open={confirmAction !== null}
        onClose={closeConfirmation}
        maxWidth="sm"
        fullWidth
        sx={editDialogPaperSx}
        classes={{ paper: "bg-white dark:bg-slate-900" }}
        aria-labelledby="event-action-dialog-title"
      >
        <div className="relative overflow-hidden bg-linear-to-br from-rose-950 via-slate-900 to-slate-950 px-6 py-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-rose-500/25 blur-2xl"
          />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-red-600 text-white shadow-md">
              <WarningAmberRoundedIcon />
            </span>
            <div>
              <h2
                id="event-action-dialog-title"
                className="text-lg font-black text-white"
              >
                {confirmAction === "delete"
                  ? "Delete draft event?"
                  : "Cancel event?"}
              </h2>
              <p className="text-xs font-medium text-slate-400">
                {confirmAction === "delete"
                  ? "This permanently removes the draft"
                  : "This stops the event and makes it read-only"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">
              {form.name || "This event"}
            </strong>
            {confirmAction === "delete"
              ? " will be permanently deleted. This action cannot be undone."
              : " will stop accepting workflow changes and become read-only."}
          </p>

          {confirmAction === "delete" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              Deletion is allowed only for a DRAFT event without dependent
              records.
            </div>
          )}

          {actionError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              {actionError}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <Button
            onClick={closeConfirmation}
            disabled={confirmBusy}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              fontWeight: 700,
            }}
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
            disabled={confirmBusy}
            startIcon={
              confirmBusy ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              fontWeight: 800,
              boxShadow: "none",
            }}
          >
            {confirmAction === "delete" ? "Delete event" : "Cancel event"}
          </Button>
        </div>
      </Dialog>

      {!canEdit && readonlyReason && (
        <Alert severity="warning" sx={{ borderRadius: "14px" }}>
          {readonlyReason}
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <TextField
          label="Event name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          fullWidth
          size="small"
          sx={editFieldSx}
          disabled={!canEdit}
        />

        <TextField
          label="Season"
          select
          value={form.season}
          onChange={(event) => updateField("season", event.target.value)}
          fullWidth
          size="small"
          sx={editFieldSx}
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
          sx={editFieldSx}
          disabled={!canEdit}
        />

        <TextField
          label="Current status"
          value={form.status}
          fullWidth
          size="small"
          sx={editFieldSx}
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
          sx={editDateFieldSx}
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
          sx={editDateFieldSx}
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
          sx={editDateFieldSx}
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
          sx={editDateFieldSx}
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
          sx={editFieldSx}
          slotProps={{ htmlInput: { min: 0.01, step: 0.1 } }}
          helperText="Standard deviation threshold used for coordinator review flags."
          disabled={!canEdit}
        />

        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-800/40">
          <p className="mb-3 text-sm font-black text-slate-700 dark:text-slate-200">
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
            sx={editFieldSx}
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
          sx={editFieldSx}
          className="lg:col-span-2"
          disabled={!canEdit}
        />
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canEdit || isSaving}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none dark:focus-visible:ring-offset-slate-900"
        >
          {isSaving ? (
            <CircularProgress size={15} sx={{ color: "white" }} />
          ) : (
            <SaveOutlinedIcon sx={{ fontSize: 17 }} />
          )}
          Save event
        </button>
      </div>
    </TabShell>
  );
}
