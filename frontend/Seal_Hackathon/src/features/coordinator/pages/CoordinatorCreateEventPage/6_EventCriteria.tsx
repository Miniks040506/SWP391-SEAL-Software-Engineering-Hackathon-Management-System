import { Alert, Button } from "@mui/material";

type EventCriteriaStepProps = {
  onBack: () => void;
  isSubmitting: boolean;
};

export function EventCriteriaStep({ onBack, isSubmitting }: EventCriteriaStepProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1e293b]">
      <div className="border-b border-gray-100 px-7 py-5 dark:border-slate-700">
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
          Step 6: Event Criteria
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Criteria setup is skipped for now. You can configure scoring criteria later.
        </p>
      </div>

      <div className="px-7 py-6">
        <Alert severity="info">
          Click Create Event to create event info, banner, tracks, prizes, rounds,
          mentor assignments, and judge assignments. Event criteria will be coded
          in the next task.
        </Alert>
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
