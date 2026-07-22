import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import { isAxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/stores/authStore";

import {
  CreateEventSetupError,
  useCreateEventFlowMutation,
} from "@/features/coordinator/hooks/useCreateEventFlow";
import {
  createEventSchema,
  initialCreateEventFormValues,
  type CreateEventFormInput,
  type CreateEventFormValues,
} from "@/features/coordinator/schemas/createEvent.schema";

import { EventDetailsStep } from "./1_EventDetails";
import { TracksStep } from "./2_Tracks";
import { PrizesStep } from "./3_Prizes";
import { RoundsStep } from "./5_Rounds";
import { MentorsJudgesStep } from "./4_MentorsJudges";
import { EventCriteriaStep } from "./6_EventCriteria";
import { WIZARD_STEPS } from "./components/wizardUi";
import type { ApiErrorResponse } from "@/types/common.types";

function getCreateErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message || "Cannot create this event.";
  }
  return error instanceof Error ? error.message : "Cannot create this event.";
}

function WizardStepper({
  activeStep,
  onStepSelect,
}: {
  activeStep: number;
  onStepSelect: (step: number) => void;
}) {
  return (
    <div className="w-full">
      <div className="flex items-start">
        {WIZARD_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const done = stepNumber < activeStep;
          const active = stepNumber === activeStep;
          const Icon = step.icon;
          const clickable = done;

          return (
            <div key={step.label} className="flex flex-1 items-start">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepSelect(stepNumber)}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${stepNumber}: ${step.label}${done ? " (completed)" : ""}`}
                className={`group flex flex-1 flex-col items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ${
                  clickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition-all duration-300 motion-reduce:transition-none",
                    active
                      ? `bg-linear-to-br ${step.gradient} text-white shadow-lg ${step.glow} ring-4 ring-white/10`
                      : done
                        ? "bg-emerald-500/90 text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                        : "border border-white/15 bg-white/5 text-slate-400",
                  ].join(" ")}
                >
                  {done ? (
                    <CheckOutlinedIcon sx={{ fontSize: 18 }} />
                  ) : active ? (
                    <Icon sx={{ fontSize: 19 }} />
                  ) : (
                    stepNumber
                  )}
                </span>

                <span
                  className={[
                    "max-w-24 text-center text-[10px] font-black uppercase leading-tight tracking-widest transition-colors",
                    active
                      ? "text-white"
                      : done
                        ? "text-emerald-300"
                        : "text-slate-500",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </button>

              {index < WIZARD_STEPS.length - 1 ? (
                <div className="mt-5 h-0.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-linear-to-r from-emerald-400 to-teal-300 transition-all duration-500 motion-reduce:transition-none ${
                      stepNumber < activeStep ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              ) : (
                // Invisible spacer so the final step's button occupies the left
                // half of its wrapper — mirroring every other step (button +
                // connector) so its dot lands on the same rhythm and stays
                // "attached" to the preceding connector line.
                <div aria-hidden className="mt-5 h-0.5 flex-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const CoordinatorCreateEventPage = () => {
  const navigate = useNavigate();
  const createEventFlowMutation = useCreateEventFlowMutation();

  const [activeStep, setActiveStep] = useState(1);
  const [setupError, setSetupError] = useState<CreateEventSetupError | null>(
    null,
  );

  const methods = useForm<CreateEventFormInput, unknown, CreateEventFormValues>(
    {
      resolver: zodResolver(createEventSchema),
      defaultValues: initialCreateEventFormValues,
      mode: "onTouched",
      reValidateMode: "onChange",
    },
  );

  const tracks = (useWatch({ control: methods.control, name: "tracks" }) ??
    []) as CreateEventFormValues["tracks"];
  const rounds = (useWatch({ control: methods.control, name: "rounds" }) ??
    []) as CreateEventFormValues["rounds"];
  const handlePreviousStep = () => {
    setActiveStep((step) => Math.max(1, step - 1));
  };

  const validateCurrentStep = async () => {
    if (activeStep === 1) {
      return methods.trigger(
        [
          "eventName",
          "season",
          "year",
          "registrationStartAt",
          "registrationEndAt",
          "competitionStartAt",
          "competitionEndAt",
          "varianceThresholdPoints",
          "description",
          "bannerFile",
        ],
        { shouldFocus: true },
      );
    }

    if (activeStep === 2)
      return methods.trigger("tracks", { shouldFocus: true });
    if (activeStep === 3)
      return methods.trigger("prizes", { shouldFocus: true });
    if (activeStep === 4)
      return methods.trigger("rounds", { shouldFocus: true });
    if (activeStep === 5)
      return methods.trigger("mentorJudgeAssignments", { shouldFocus: true });
    if (activeStep === 6)
      return methods.trigger("criteria", { shouldFocus: true });

    return true;
  };

  const handleNextStep = async () => {
    const valid = await validateCurrentStep();

    if (!valid) {
      enqueueSnackbar("Please fix the highlighted form errors.", {
        variant: "error",
        preventDuplicate: true,
      });

      return;
    }

    setActiveStep((step) => Math.min(WIZARD_STEPS.length, step + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepSelect = (step: number) => {
    if (step < activeStep) {
      setActiveStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = methods.handleSubmit(async (values) => {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken || accessToken === "dev-token") {
      enqueueSnackbar(
        "You must sign in with a real coordinator/admin account before creating an event.",
        { variant: "error" },
      );

      navigate("/login");
      return;
    }

    try {
      const createdEvent = await createEventFlowMutation.mutateAsync(values);

      setSetupError(null);
      enqueueSnackbar("Event created successfully.", { variant: "success" });

      navigate(`/coordinator/events/${createdEvent.id}/edit`, {
        replace: true,
      });
    } catch (error) {
      if (error instanceof CreateEventSetupError) {
        setSetupError(error);
        enqueueSnackbar(
          `Event created, but setup stopped at ${error.stage}. Fix the issue and select Resume Setup.`,
          { variant: "warning", preventDuplicate: true },
        );
        return;
      }
      enqueueSnackbar(getCreateErrorMessage(error), { variant: "error" });
    }
  });

  const progressPercent = Math.round(
    ((activeStep - 1) / (WIZARD_STEPS.length - 1)) * 100,
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 shadow-2xl shadow-slate-950/40">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(148,163,184,0.16)_1px,transparent_1px)] [background-size:22px_22px]"
          />

          <div className="relative px-8 pb-7 pt-6">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate("/coordinator/dashboard")}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold text-slate-300 backdrop-blur transition-colors duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
              >
                <ArrowBackOutlinedIcon sx={{ fontSize: 15 }} />
                Back to Dashboard
              </button>

              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Draft
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-md shrink-0">
                <h1 className="text-3xl font-black leading-tight text-white">
                  Create New{" "}
                  <span className="bg-linear-to-r from-sky-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                    Event
                  </span>
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-400">
                  Configure details, tracks, prizes, rounds, people, and
                  criteria — the event stays a draft until published.
                </p>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">
                      Step {activeStep} of {WIZARD_STEPS.length} ·{" "}
                      {WIZARD_STEPS[activeStep - 1].label}
                    </span>
                    <span className="tabular-nums text-blue-300">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-blue-500 via-sky-400 to-indigo-400 transition-all duration-500 motion-reduce:transition-none"
                      style={{ width: `${Math.max(progressPercent, 4)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <WizardStepper
                  activeStep={activeStep}
                  onStepSelect={handleStepSelect}
                />
              </div>
            </div>
          </div>
        </section>

        {activeStep === 1 && <EventDetailsStep onNext={handleNextStep} />}

        {activeStep === 2 && (
          <TracksStep onBack={handlePreviousStep} onNext={handleNextStep} />
        )}

        {activeStep === 3 && (
          <PrizesStep onBack={handlePreviousStep} onNext={handleNextStep} />
        )}

        {activeStep === 4 && (
          <RoundsStep
            tracks={tracks}
            onBack={handlePreviousStep}
            onNext={handleNextStep}
          />
        )}

        {activeStep === 5 && (
          <MentorsJudgesStep
            tracks={tracks}
            rounds={rounds}
            onBack={handlePreviousStep}
            onNext={handleNextStep}
          />
        )}

        {activeStep === 6 && (
          <EventCriteriaStep
            onBack={handlePreviousStep}
            isSubmitting={createEventFlowMutation.isPending}
            isResuming={Boolean(setupError)}
            setupError={
              setupError
                ? `Event "${setupError.event.name}" (${setupError.event.id}) already exists. Setup stopped while creating ${setupError.stage}; retry resumes from that step without creating another event.`
                : undefined
            }
          />
        )}
      </form>
    </FormProvider>
  );
};
