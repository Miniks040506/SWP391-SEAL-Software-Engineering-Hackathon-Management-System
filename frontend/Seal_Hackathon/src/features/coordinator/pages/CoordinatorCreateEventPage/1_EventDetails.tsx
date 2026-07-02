import { Controller, useFormContext } from "react-hook-form";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import { EventBannerCropUpload } from "@/features/coordinator/pages/CoordinatorCreateEventPage/components/EventBannerCropUpload";
import {
  EVENT_SEASONS,
  type CreateEventFormValues,
} from "@/features/coordinator/schemas/createEvent.schema";

type EventDetailsStepProps = {
  onNext: () => void;
};

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
    backgroundColor: "#1e293b",
  },
};

export const EventDetailsStep = ({ onNext }: EventDetailsStepProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1e293b]">
      <div className="border-b border-gray-100 px-7 py-5 dark:border-slate-700">
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
          Step 1: Event Details
        </h2>

        <p className="mt-2 text-sm font-medium text-gray-500 dark:text-slate-400">
          Setup event information and registration period.
        </p>
      </div>

      <div className="space-y-6 px-7 py-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label="Event name"
            placeholder="e.g. Spring 2026 Hackathon"
            error={Boolean(errors.eventName)}
            helperText={errors.eventName?.message}
            required
            fullWidth
            size="small"
            sx={textFieldSx}
            {...register("eventName")}
          />

          <Controller
            name="season"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Season"
                error={Boolean(errors.season)}
                helperText={errors.season?.message}
                required
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
            )}
          />

          <TextField
            label="Year"
            placeholder="e.g. 2026"
            error={Boolean(errors.year)}
            helperText={errors.year?.message}
            required
            fullWidth
            size="small"
            slotProps={{ htmlInput: { maxLength: 4 } }}
            sx={textFieldSx}
            {...register("year")}
          />

          <TextField
            label="Status"
            value="Draft"
            disabled
            fullWidth
            size="small"
            sx={textFieldSx}
          />

          <TextField
            label="Registration Start At"
            type="datetime-local"
            error={Boolean(errors.registrationStartAt)}
            helperText={errors.registrationStartAt?.message}
            required
            fullWidth
            size="small"
            sx={dateTimeFieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
            {...register("registrationStartAt")}
          />

          <TextField
            label="Registration End At"
            type="datetime-local"
            error={Boolean(errors.registrationEndAt)}
            helperText={errors.registrationEndAt?.message}
            required
            fullWidth
            size="small"
            sx={dateTimeFieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
            {...register("registrationEndAt")}
          />

          <TextField
            label="Variance review threshold"
            type="number"
            error={Boolean(errors.varianceThresholdPoints)}
            helperText={
              errors.varianceThresholdPoints?.message ??
              "Criteria at or above this standard deviation are flagged. Default: 3.0."
            }
            required
            fullWidth
            size="small"
            sx={textFieldSx}
            slotProps={{ htmlInput: { min: 0.01, step: 0.1 } }}
            {...register("varianceThresholdPoints", { valueAsNumber: true })}
          />
        </div>

        <TextField
          label="Description"
          placeholder="Brief description about the event"
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
          multiline
          minRows={4}
          fullWidth
          sx={textFieldSx}
          {...register("description")}
        />

        <Controller
          name="bannerFile"
          control={control}
          render={({ field }) => (
            <EventBannerCropUpload
              file={field.value ?? null}
              onChange={(file) => field.onChange(file)}
            />
          )}
        />

        <div className="flex justify-end border-t border-gray-100 pt-5 dark:border-slate-700">
          <Button
            type="button"
            variant="contained"
            endIcon={<ArrowForwardOutlinedIcon />}
            onClick={onNext}
            sx={{
              px: 2.5,
              py: 1.1,
              borderRadius: 2,
              bgcolor: "#2563eb",
              fontWeight: 800,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#1d4ed8",
                boxShadow: "none",
              },
            }}
          >
            Next Step
          </Button>
        </div>
      </div>
    </section>
  );
};
