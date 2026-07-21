import { Controller, useFormContext } from "react-hook-form";

import AppRegistrationOutlinedIcon from "@mui/icons-material/AppRegistrationOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import { EventBannerCropUpload } from "@/features/coordinator/pages/CoordinatorCreateEventPage/components/EventBannerCropUpload";
import {
  EVENT_SEASONS,
  type CreateEventFormValues,
} from "@/features/coordinator/schemas/createEvent.schema";

import { StepShell } from "./components/StepShell";
import {
  wizardDateFieldOnSoftSx,
  wizardFieldSx,
} from "./components/wizardUi";

type EventDetailsStepProps = {
  onNext: () => void;
};

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
      {icon}
      {children}
    </p>
  );
}

export const EventDetailsStep = ({ onNext }: EventDetailsStepProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  return (
    <StepShell
      step={1}
      title="Event Details"
      description="Set up event information, registration period, and the official competition period."
      onBack={undefined}
      next={{ label: "Next Step", onClick: onNext }}
    >
      <div className="space-y-3">
        <SectionLabel icon={<InfoOutlinedIcon sx={{ fontSize: 15 }} />}>
          Basics
        </SectionLabel>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label="Event name"
            placeholder="e.g. Spring 2026 Hackathon"
            error={Boolean(errors.eventName)}
            helperText={errors.eventName?.message}
            required
            fullWidth
            size="small"
            sx={wizardFieldSx}
            {...register("eventName")}
          />

          <div className="grid grid-cols-[1fr_1fr_auto] items-start gap-4">
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
                  sx={wizardFieldSx}
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
              sx={wizardFieldSx}
              {...register("year")}
            />

            <div className="flex h-10 items-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-amber-600 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Draft
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel icon={<AppRegistrationOutlinedIcon sx={{ fontSize: 15 }} />}>
          Timeline
        </SectionLabel>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 dark:border-blue-500/20 dark:bg-blue-500/5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-sky-400 text-white shadow-md shadow-blue-500/25">
                <AppRegistrationOutlinedIcon sx={{ fontSize: 17 }} />
              </span>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  Registration window
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  When teams can sign up
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Registration Start At"
                type="datetime-local"
                error={Boolean(errors.registrationStartAt)}
                helperText={errors.registrationStartAt?.message}
                required
                fullWidth
                size="small"
                sx={wizardDateFieldOnSoftSx}
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
                sx={wizardDateFieldOnSoftSx}
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("registrationEndAt")}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-400 text-white shadow-md shadow-indigo-500/25">
                <RocketLaunchOutlinedIcon sx={{ fontSize: 17 }} />
              </span>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  Competition window
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Official competing period
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Competition Start At"
                type="datetime-local"
                error={Boolean(errors.competitionStartAt)}
                helperText={errors.competitionStartAt?.message}
                required
                fullWidth
                size="small"
                sx={wizardDateFieldOnSoftSx}
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("competitionStartAt")}
              />

              <TextField
                label="Competition End At"
                type="datetime-local"
                error={Boolean(errors.competitionEndAt)}
                helperText={errors.competitionEndAt?.message}
                required
                fullWidth
                size="small"
                sx={wizardDateFieldOnSoftSx}
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("competitionEndAt")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel icon={<TuneOutlinedIcon sx={{ fontSize: 15 }} />}>
          Grading configuration
        </SectionLabel>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
            sx={wizardFieldSx}
            slotProps={{ htmlInput: { min: 0.01, step: 0.1 } }}
            {...register("varianceThresholdPoints", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel icon={<ImageOutlinedIcon sx={{ fontSize: 15 }} />}>
          Story & Banner
        </SectionLabel>

        <TextField
          label="Description"
          placeholder="Brief description about the event"
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
          multiline
          minRows={4}
          fullWidth
          sx={wizardFieldSx}
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
      </div>
    </StepShell>
  );
};
