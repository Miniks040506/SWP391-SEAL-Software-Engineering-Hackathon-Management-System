import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@mui/material";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/stores/authStore";

import { useCreateEventFlowMutation } from "@/features/coordinator/hooks/useCreateEventFlow";
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

const steps = [
  "Event Details",
  "Track",
  "Prizes",
  "Round",
  "Mentors & Judges",
  "Event Criteria",
];

function Stepper({ activeStep }: { activeStep: number }) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const done = stepNumber < activeStep;
          const active = stepNumber === activeStep;

          return (
            <div key={step} className="flex flex-1 items-start">
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition",
                    done || active
                      ? "bg-blue-500 text-white"
                      : "bg-slate-900 text-white dark:bg-slate-700",
                  ].join(" ")}
                >
                  {done ? <CheckOutlinedIcon fontSize="small" /> : stepNumber}
                </div>

                <p
                  className={[
                    "mt-2 max-w-28 text-center text-[11px] font-black uppercase tracking-widest",
                    done || active
                      ? "text-blue-500"
                      : "text-slate-800 dark:text-slate-300",
                  ].join(" ")}
                >
                  {step}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={[
                    "mt-4 h-0.5 flex-1",
                    stepNumber < activeStep
                      ? "bg-blue-500"
                      : "bg-slate-300 dark:bg-slate-700",
                  ].join(" ")}
                />
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

  const methods = useForm<CreateEventFormInput, unknown, CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: initialCreateEventFormValues,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

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

    if (activeStep === 2) return methods.trigger("tracks", { shouldFocus: true });
    if (activeStep === 3) return methods.trigger("prizes", { shouldFocus: true });
    if (activeStep === 4) return methods.trigger("rounds", { shouldFocus: true });
    if (activeStep === 5) return methods.trigger("mentorJudgeAssignments", { shouldFocus: true });
    if (activeStep === 6) return methods.trigger("criteria", { shouldFocus: true });

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

    setActiveStep((step) => Math.min(steps.length, step + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      enqueueSnackbar("Event created successfully.", { variant: "success" });

      navigate(`/coordinator/events/${createdEvent.id}/edit`, { replace: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Cannot create event. Please check API and token.";

      enqueueSnackbar(message, { variant: "error" });
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4">
          <Button
            type="button"
            variant="text"
            onClick={() => navigate("/coordinator/dashboard")}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            ← Back to Dashboard
          </Button>

          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Create New Event
            </h1>

            <Stepper activeStep={activeStep} />
          </div>
        </section>

        {activeStep === 1 && <EventDetailsStep onNext={handleNextStep} />}

        {activeStep === 2 && (
          <TracksStep onBack={handlePreviousStep} onNext={handleNextStep} />
        )}

        {activeStep === 3 && (
          <PrizesStep
            onBack={handlePreviousStep}
            onNext={handleNextStep}
          />
        )}

        {activeStep === 4 && (
          <RoundsStep tracks={tracks} onBack={handlePreviousStep} onNext={handleNextStep} />
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
          />
        )}
      </form>
    </FormProvider>
  );
};
