import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import { Alert, CircularProgress } from "@mui/material";

import { CreateEventCriteriaCard } from "@/features/coordinator/pages/CoordinatorCreateEventPage/components/CreateEventCriteriaCard";
import { createEmptyCriteria } from "@/features/coordinator/schemas/createEvent.schema";
import { useCreateEventCriteriaStep } from "@/features/criteria/hooks/useCreateEventCriteriaStep";

import { StepShell } from "./components/StepShell";

type EventCriteriaStepProps = {
  onBack: () => void;
  isSubmitting: boolean;
  setupError?: string;
  isResuming?: boolean;
};

function getArrayErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "";

  const maybeError = error as {
    message?: string;
    root?: { message?: string };
  };

  return maybeError.message ?? maybeError.root?.message ?? "";
}

export function EventCriteriaStep({
  onBack,
  isSubmitting,
  setupError,
  isResuming,
}: EventCriteriaStepProps) {
  const {
    errors,
    rounds,
    criteria,
    templatesQuery,
    templateOptions,
    fields,
    append,
    remove,
  } = useCreateEventCriteriaStep();

  const arrayErrorMessage = getArrayErrorMessage(errors.criteria);

  return (
    <StepShell
      step={6}
      title="Event Criteria"
      description="Choose scoring templates or define custom criteria. You can also skip this step and manage criteria after creating the event."
      headerActions={
        <button
          type="button"
          onClick={() => append(createEmptyCriteria())}
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-rose-500 to-pink-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-rose-500/25 transition-all duration-200 hover:from-rose-400 hover:to-pink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          <AddOutlinedIcon sx={{ fontSize: 18 }} />
          Add Criteria
        </button>
      }
      bodyClassName="space-y-5 px-7 py-6"
      onBack={onBack}
      next={{
        label: isSubmitting
          ? isResuming
            ? "Resuming..."
            : "Creating..."
          : isResuming
            ? "Resume Setup"
            : "Create Event",
        type: "submit",
        disabled: isSubmitting,
        loading: isSubmitting,
        tone: "success",
      }}
    >
      {setupError && <Alert severity="warning">{setupError}</Alert>}
      {arrayErrorMessage && <Alert severity="error">{arrayErrorMessage}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 px-5 py-4 dark:border-rose-500/20 dark:bg-rose-500/5">
        <div>
          <p className="font-black text-slate-900 dark:text-white">
            Criteria items:{" "}
            <span className="tabular-nums text-rose-600 dark:text-rose-400">
              {fields.length}
            </span>
          </p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Leave round scope empty to apply criteria to all rounds.
          </p>
        </div>
      </div>

      {templatesQuery.isLoading && (
        <div className="flex justify-center py-8">
          <CircularProgress size={28} />
        </div>
      )}

      {templatesQuery.isError && (
        <Alert severity="warning">
          Cannot load global scoring criteria templates. You can still create
          custom event-only criteria.
        </Alert>
      )}

      {fields.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 px-8 py-14 text-center dark:border-slate-700">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
            <ChecklistOutlinedIcon sx={{ fontSize: 28 }} />
          </span>

          <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
            No criteria added
          </h3>

          <p className="mx-auto mt-1.5 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">
            The event can still be created — you can define scoring criteria
            later from the event settings.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <CreateEventCriteriaCard
            key={field.fieldId}
            index={index}
            fieldId={field.fieldId}
            item={criteria[index]}
            rounds={rounds}
            templateOptions={templateOptions}
            onRemove={remove}
          />
        ))}
      </div>
    </StepShell>
  );
}
