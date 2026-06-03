import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { Button, MenuItem, TextField } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";

import { eventApi } from "@/api/event.api";
import type { UUID } from "@/types/common.types";
import type { EventDetailResponse } from "@/types/event.types";

type InfoTabProps = {
  eventId: UUID;
  event: EventDetailResponse;
  onUpdated: () => void | Promise<void>;
};

type EventStatus =
  | "DRAFT"
  | "REGISTRATION"
  | "ONGOING"
  | "JUDGING"
  | "COMPLETED"
  | "CANCELLED";

type StatusStep = {
  value: EventStatus;
  label: string;
  description: string;
};

const STATUS_STEPS: StatusStep[] = [
  {
    value: "DRAFT",
    label: "Draft",
    description: "Coordinator is preparing event information, tracks, rounds, and prizes.",
  },
  {
    value: "REGISTRATION",
    label: "Registration",
    description: "Teams can register for the event during the configured registration period.",
  },
  {
    value: "ONGOING",
    label: "Ongoing",
    description: "The hackathon is running and teams are working on submissions.",
  },
  {
    value: "JUDGING",
    label: "Judging",
    description: "Submissions are locked and judges complete scorecards.",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    description: "Final results are ready and the event lifecycle is finished.",
  },
];

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

function normalizeStatus(status?: string | null): EventStatus {
  const nextStatus = (status || "DRAFT").trim().toUpperCase();

  if (
    nextStatus === "DRAFT" ||
    nextStatus === "REGISTRATION" ||
    nextStatus === "ONGOING" ||
    nextStatus === "JUDGING" ||
    nextStatus === "COMPLETED" ||
    nextStatus === "CANCELLED"
  ) {
    return nextStatus;
  }

  return "DRAFT";
}

function getNextStatus(status: EventStatus) {
  if (status === "DRAFT") return "REGISTRATION";
  if (status === "REGISTRATION") return "ONGOING";
  if (status === "ONGOING") return "JUDGING";
  if (status === "JUDGING") return "COMPLETED";
  return null;
}

function StatusWorkflow({
  status,
  isAdvancing,
  onAdvance,
}: {
  status: EventStatus;
  isAdvancing: boolean;
  onAdvance: () => void;
}) {
  const currentIndex = STATUS_STEPS.findIndex((step) => step.value === status);
  const nextStatus = getNextStatus(status);

  if (status === "CANCELLED") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-500/30 dark:bg-rose-500/10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-500">
          Event status
        </p>
        <h3 className="mt-2 text-xl font-black text-rose-700 dark:text-rose-300">
          Cancelled
        </h3>
        <p className="mt-1 text-sm font-medium text-rose-500">
          This event was cancelled and cannot move to the next state.
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
            {STATUS_STEPS[currentIndex]?.label ?? status}
          </h3>
          <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            {STATUS_STEPS[currentIndex]?.description ?? "Current event status."}
          </p>
        </div>

        <Button
          variant="contained"
          endIcon={<ArrowForwardOutlinedIcon />}
          onClick={onAdvance}
          disabled={!nextStatus || isAdvancing}
          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 900, minWidth: 210 }}
        >
          {nextStatus ? `Move to ${nextStatus}` : "No next status"}
        </Button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {STATUS_STEPS.map((step, index) => {
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
              <p className="font-black">{index + 1}. {step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InfoTab({ eventId, event, onUpdated }: InfoTabProps) {
  const initialValues = useMemo(
    () => ({
      name: readString(event, "name", "eventName", "title"),
      season: readString(event, "season") || "SPRING",
      year: readNumber(event, "year"),
      status: normalizeStatus(readString(event, "status")),
      registrationStartAt: toDateTimeLocal(
        readString(event, "registrationStartAt", "registrationOpenAt"),
      ),
      registrationEndAt: toDateTimeLocal(
        readString(event, "registrationEndAt", "registrationCloseAt"),
      ),
      description: readString(event, "description"),
      bannerUrl: readString(event, "bannerUrl"),
    }),
    [event],
  );

  const [form, setForm] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const updateField = (field: keyof typeof form, value: string | number) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      enqueueSnackbar("Event name is required.", { variant: "error" });
      return;
    }

    try {
      setIsSaving(true);

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
        bannerUrl: form.bannerUrl.trim() || undefined,
      });

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
      enqueueSnackbar(`Event moved to ${updatedEvent.status}.`, { variant: "success" });
      await onUpdated();
    } catch {
      enqueueSnackbar("Cannot move event to the next status.", { variant: "error" });
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <StatusWorkflow
        status={form.status}
        isAdvancing={isAdvancing}
        onAdvance={handleAdvanceStatus}
      />

      <div>
        <h2 className="text-xl font-black text-slate-950 dark:text-white">
          Event Information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Update basic information here. Status is changed only through the sequential workflow above.
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
        />

        <TextField
          label="Season"
          select
          value={form.season}
          onChange={(event) => updateField("season", event.target.value)}
          fullWidth
          size="small"
          sx={textFieldSx}
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
        />

        <TextField
          label="Banner URL"
          value={form.bannerUrl}
          onChange={(event) => updateField("bannerUrl", event.target.value)}
          fullWidth
          size="small"
          sx={textFieldSx}
          className="lg:col-span-2"
        />

        <TextField
          label="Description"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          fullWidth
          multiline
          minRows={5}
          sx={textFieldSx}
          className="lg:col-span-2"
        />
      </div>

      <div className="flex justify-end">
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={handleSave}
          disabled={isSaving}
          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 900 }}
        >
          Save event
        </Button>
      </div>
    </section>
  );
}
