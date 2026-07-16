import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { Alert, Button, CircularProgress } from "@mui/material";

import { CreateEventCriteriaCard } from "@/features/coordinator/pages/CoordinatorCreateEventPage/components/CreateEventCriteriaCard";
import { createEmptyCriteria } from "@/features/coordinator/schemas/createEvent.schema";
import { useCreateEventCriteriaStep } from "@/features/criteria/hooks/useCreateEventCriteriaStep";

type EventCriteriaStepProps = {
  onBack: () => void;
  isSubmitting: boolean;
};

function getArrayErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "";

  const maybeError = error as {
    message?: string;
    root?: { message?: string };
  };

  return maybeError.message ?? maybeError.root?.message ?? "";
}

export function EventCriteriaStep({ onBack, isSubmitting }: EventCriteriaStepProps) {
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
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1e293b]">
      <div className="border-b border-gray-100 px-7 py-5 dark:border-slate-700">
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
          Step 6: Event Criteria
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Choose scoring templates or define custom criteria. You can also skip
          this step and manage criteria after creating the event.
        </p>
      </div>

      <div className="space-y-5 px-7 py-6">
        {arrayErrorMessage && <Alert severity="error">{arrayErrorMessage}</Alert>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-black text-slate-900 dark:text-white">
              Criteria items: {fields.length}
            </p>
            <p className="text-sm font-medium text-slate-500">
              Leave round scope empty to apply criteria to all rounds.
            </p>
          </div>

          <Button
            type="button"
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => append(createEmptyCriteria())}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 900 }}
          >
            Add Criteria
          </Button>
        </div>

        {templatesQuery.isLoading && (
          <div className="flex justify-center py-8">
            <CircularProgress size={28} />
          </div>
        )}

        {templatesQuery.isError && (
          <Alert severity="warning">
            Cannot load global scoring criteria templates. You can still create custom event-only criteria.
          </Alert>
        )}

        {fields.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
            <p className="font-bold text-slate-500">
              No criteria added. The event can still be created.
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
      </div>

      <div className="flex justify-between border-t border-gray-100 px-7 py-5 dark:border-slate-700">
        <Button type="button" variant="outlined" onClick={onBack}>
          Back
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            px: 3,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            boxShadow: "none",
          }}
        >
          {isSubmitting ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </section>
  );
}
