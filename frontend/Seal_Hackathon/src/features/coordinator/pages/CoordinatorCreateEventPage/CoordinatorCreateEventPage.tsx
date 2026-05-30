import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import { StepProgress } from "@/features/auth/components/StepProgress";

import { EventDetailsStep } from "./1_EventDetails";
import { TracksRoundsStep } from "./2_TracksRounds";
import { PrizesStep } from "./3_Prizes";
import { MentorsJudgesStep } from "./4_MentorsJudges";
import { EventCriteriaStep } from "./5_EventCriteria";

import { useCreateEventFlowMutation } from "../../hooks/useCreateEventFlow";

import {
  createEventSchema,
  initialCreateEventFormValues,
  type CreateEventFormValues,
  type CreateEventPayload,
} from "../../schemas/createEvent.schema";

const steps = [
  { number: 1, label: "Event Details" },
  { number: 2, label: "Track & Round" },
  { number: 3, label: "Prizes" },
  { number: 4, label: "Mentors & Judges" },
  { number: 5, label: "Event Criteria" },
];

export const CoordinatorCreateEventPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const createEventFlowMutation = useCreateEventFlowMutation();

  const methods = useForm<CreateEventFormValues, unknown, CreateEventPayload>({
    resolver: zodResolver(createEventSchema),
    defaultValues: initialCreateEventFormValues,
    mode: "onSubmit",
  });

  const handleNextStep = async () => {
    if (activeStep === 1) {
      const isValid = await methods.trigger(
        [
          "eventName",
          "season",
          "registrationOpen",
          "registrationClose",
          "competitionStartDate",
          "competitionEndDate",
          "description",
          "bannerFile",
        ],
        { shouldFocus: true },
      );

      if (!isValid) return;

      setActiveStep(2);
      return;
    }

    if (activeStep === 2) {
      const isValid = await methods.trigger("tracks", {
        shouldFocus: true,
      });

      if (!isValid) return;

      setActiveStep(3);
      return;
    }

    setActiveStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handlePreviousStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCreateEvent = methods.handleSubmit(async (values) => {
    try {
      await createEventFlowMutation.mutateAsync(values);

      enqueueSnackbar("Event created successfully.", {
        variant: "success",
      });

      navigate("/coordinator/dashboard");
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message ||
          "Failed to create event. Please try again.",
        {
          variant: "error",
        },
      );
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleCreateEvent} className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/coordinator/dashboard")}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-blue-600"
        >
          <ArrowBackOutlinedIcon fontSize="small" />
          Back to Dashboard
        </button>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Create New Event
          </h1>
        </div>

        <StepProgress
          title=""
          currentStep={activeStep}
          steps={steps.map((step) => ({
            label: step.label,
          }))}
        />

        {activeStep === 1 && 
          <EventDetailsStep 
            onNext={handleNextStep} 
          />
        }

        {activeStep === 2 && (
          <TracksRoundsStep
            onBack={handlePreviousStep}
            onNext={handleNextStep}
          />
        )}

        {activeStep === 3 && (
          <PrizesStep 
            onBack={handlePreviousStep} 
            onNext={handleNextStep} 
          />
        )}

        {activeStep === 4 && (
          <MentorsJudgesStep 
            onBack={handlePreviousStep} 
            onNext={handleNextStep} 
          />
        )}

        {activeStep === 5 && (
          <EventCriteriaStep 
            onBack={handlePreviousStep} 
            isSubmitting={createEventFlowMutation.isPending} 
          />
        )}
      </form>
    </FormProvider>
  );
};
