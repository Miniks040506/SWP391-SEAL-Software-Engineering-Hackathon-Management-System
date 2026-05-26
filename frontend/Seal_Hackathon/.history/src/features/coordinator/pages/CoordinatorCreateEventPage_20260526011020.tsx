import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

import {
  EVENT_SEASONS,
  initialCreateEventFormValues,
  type CreateEventFormValues,
} from "../mocks/createEventForm.mock";

type CreateEventFromErrors = Partial<
  Record<keyof CreateEventFormValues, string>
>;

const steps = [
  {
    number: 1,
    label: "Event Details",
  },
  {
    number: 2,
    label: "Track & Round",
  },
  {
    number: 3,
    label: "Prizes",
  },
  {
    number: 4,
    label: "Mentors & Judges",
  },
  {
    number: 5,
    label: "Event Criteria",
  },
];

export const CoordinatorCreateEventPage = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<CreateEventFormValues>(
    initialCreateEventFormValues,
  );

  const [errors, setErrors] = useState<CreateEventFromErrors>({});

  const handleChange = (
    field: keyof CreateEventFormValues,
    value: string | File | null,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const validateStepOne = () => {
    const nextErrors: CreateEventFromErrors = {};

    if (!formValues.eventName.trim()) {
      nextErrors.eventName = "Event name is required";
    }

    if (!formValues.season) {
      nextErrors.season = "Season is required";
    }

    if (!formValues.registrationOpen) {
      nextErrors.registrationOpen = "Registration open date is required";
    }

    if (!formValues.registrationClose) {
      nextErrors.registrationClose = "Registration close date is required";
    }

    if (
      formValues.registrationOpen &&
      formValues.registrationClose &&
      formValues.registrationOpen >= formValues.registrationClose
    ) {
      nextErrors.registrationClose = "Close date must be after open date";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleNextStep = () => {
    const isValid = validateStepOne();

    if (!isValid) {
      return;
    }

    console.log("Step 1 data:", formValues);
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/coordinator/events")}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-blue-600"
      >
        <ArrowBackOutlinedIcon fontSize="small" />
        Back to Event List
      </button>

      {/* Header */}
      <section className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Create New Event
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 15 }} />
          Draft saved just now
        </div>
      </section>

      {/* Stepper */}
      <section className="pt-4">
        <div className="relative flex items-start justify-between">
          <div className="absolute left-8 right-8 top-5 h-1 rounded-full bg-gray-200" />

          {steps.map((step) => {
            const active = step.number === 1;

            return (
              <div
                key={step.number}
                className="relative z-10 flex w-28 flex-col items-center gap-2"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-extrabold ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {step.number}
                </div>

                <p
                  className={`text-center text-xs font-extrabold ${
                    active ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Form Card */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-7 py-5">
          <h2 className="text-lg font-extrabold text-gray-900">
            Step 1: Event Details
          </h2>
        </div>

        <div className="space-y-6 px-7 py-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField
              label="Event Name"
              placeholder="e.g., SEAL Hackathon Spring 2024"
              value={formValues.eventName}
              onChange={(event) => handleChange('eventName', event.target.value)}
              error={Boolean(errors.eventName)}
              helperText={errors.eventName}
              required
              fullWidth
              size="small"
            />

            <TextField
              select
              label="Season"
              value={formValues.season}
              onChange={(event) => handleChange('season', event.target.value)}
              error={Boolean(errors.season)}
              helperText={errors.season}
              required
              fullWidth
              size="small"
            >
              {EVENT_SEASONS.map((season) => (
                <MenuItem key={season} value={season}>
                  {season}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Registration Open"
              type="date"
              value={formValues.registrationOpen}
              onChange={(event) => handleChange('registrationOpen', event.target.value)}
              error={Boolean(errors.registrationOpen)}
              helperText={errors.registrationOpen}
              required
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Registration Close"
              type="date"
              value={formValues.registrationClose}
              onChange={(event) => handleChange('registrationClose', event.target.value)}
              error={Boolean(errors.registrationClose)}
              helperText={errors.registrationClose}
              required
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Event Description"
              placeholder="Brief description of the event"
              value={formValues.description}
              onChange={(event) => handleChange('description', event.target.value)}
              multiline
              minRows={4}
              fullWidth
            />

            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-slate-50 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
              <CloudUploadOutlinedIcon className="text-gray-400" />

              <span className="mt-2 text-sm font-medium text-gray-600">
                {formValues.bannerFile ? formValues.bannerFile.name : "Upload Event Banner"}
              </span>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  handleChange('bannerFile', file);
                }}
              />
            </label>
          </div>

          <div className="flex justify-end border-t border-gray-100 px-7 py-5">
            <Button
              variant="contained"
              endIcon={<ArrowForwardOutlinedIcon />}
              onClick={handleNextStep}
              sx={{
                px: 2.5,
                py: 1.1,
                borderRadius: 2,
                bgcolor: '#2563eb',
                fontWeight: 800,
                '&:hover': {
                  bgcolor: '#1d4ed8',
                },
              }}
            >
              Next Step
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
