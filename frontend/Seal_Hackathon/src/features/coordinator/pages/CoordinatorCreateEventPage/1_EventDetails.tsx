import { Controller, useFormContext } from "react-hook-form";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import {
  EVENT_SEASONS,
  type CreateEventFormValues,
} from "../../schemas/createEvent.schema";

type EventDetailsStepProps = {
  onNext: () => void;
};

export const EventDetailsStep = ({ onNext }: EventDetailsStepProps) => {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  const bannerFile = watch("bannerFile");

  return (
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
            placeholder="e.g. Spring 2024 Hackathon"
            error={Boolean(errors.eventName)}
            helperText={errors.eventName?.message}
            required
            fullWidth
            size="small"
            {...register("eventName")}
          />

          <Controller
            name="season"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Season"
                error={Boolean(errors.season)}
                helperText={errors.season?.message}
                required
                fullWidth
                size="small"
                {...field}
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
            label="Registration Open"
            type="date"
            error={Boolean(errors.registrationOpen)}
            helperText={errors.registrationOpen?.message}
            required
            fullWidth
            size="small"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            {...register("registrationOpen")}
          />

          <TextField
            label="Registration Close"
            type="date"
            error={Boolean(errors.registrationClose)}
            helperText={errors.registrationClose?.message}
            required
            fullWidth
            size="small"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            {...register("registrationClose")}
          />

          <TextField
            label="Competition Start Date"
            type="date"
            error={Boolean(errors.competitionStartDate)}
            helperText={errors.competitionStartDate?.message}
            required
            fullWidth
            size="small"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            {...register("competitionStartDate")}
          />

          <TextField
            label="Competition End Date"
            type="date"
            error={Boolean(errors.competitionEndDate)}
            helperText={errors.competitionEndDate?.message}
            required
            fullWidth
            size="small"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            {...register("competitionEndDate")}
          />
        </div>

        <TextField
          label="Description"
          placeholder="Brief description about the event"
          multiline
          minRows={4}
          fullWidth
          {...register("description")}
        />

        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-slate-50 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
          <CloudUploadOutlinedIcon className="text-gray-400" />

          <span className="mt-2 text-sm font-medium text-gray-600">
            {bannerFile ? bannerFile.name : "Upload Event Banner"}
          </span>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setValue("bannerFile", file, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
        </label>

        <div className="flex justify-end border-t border-gray-100 px-7 py-5">
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
              "&:hover": {
                bgcolor: "#1d4ed8",
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
