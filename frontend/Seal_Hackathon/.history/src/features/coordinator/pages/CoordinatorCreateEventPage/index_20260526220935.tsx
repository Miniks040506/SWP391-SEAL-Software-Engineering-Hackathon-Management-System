import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

import { EventDetailsStep } from "./1_EventDetails";
import { TracksRoundsStep } from "./2_TracksRounds";

import {
  createEventSchema,
  initialCreateEventFormValues,
  type CreateEventFormValues,
} from "./createEvent.schema";

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

  const methods = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema) as any,
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

  const handleCreateEvent = methods.handleSubmit((values) => {
    console.log("Create event payload:", values);
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleCreateEvent} className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/coordinator/events")}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-blue-600"
        >
          <ArrowBackOutlinedIcon fontSize="small" />
          Back to Event List
        </button>

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

        <section className="pt-4">
          <div className="relative flex items-start justify-between">
            <div className="absolute left-8 right-8 top-5 h-1 rounded-full bg-gray-200" />

            {steps.map((step) => {
              const active = step.number === activeStep;
              const completed = step.number < activeStep;

              return (
                <div
                  key={step.number}
                  className="relative z-10 flex w-28 flex-col items-center gap-2"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-extrabold ${
                      active || completed
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {step.number}
                  </div>

                  <p
                    className={`text-center text-xs font-extrabold ${
                      active || completed ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {activeStep === 1 && <EventDetailsStep onNext={handleNextStep} />}

        {activeStep === 2 && (
          <TracksRoundsStep
            onBack={handlePreviousStep}
            onNext={handleNextStep}
          />
        )}

        {activeStep === 3 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-gray-900">
              Step 3: Prizes
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Prize configuration will be added later.
            </p>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-600"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
              >
                Next Step
              </button>
            </div>
          </section>
        )}

        {activeStep === 4 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-gray-900">
              Step 4: Mentors & Judges
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Mentor and judge assignment will be added later.
            </p>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-600"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
              >
                Next Step
              </button>
            </div>
          </section>
        )}

        {activeStep === 5 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-gray-900">
              Step 5: Event Criteria
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Scoring criteria configuration will be added later.
            </p>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-600"
              >
                Back
              </button>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
              >
                Create Event
              </button>
            </div>
          </section>
        )}
      </form>
    </FormProvider>
  );
};