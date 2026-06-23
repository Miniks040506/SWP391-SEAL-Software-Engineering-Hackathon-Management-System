import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";

import { useScoreSheet } from "../hooks/useScoreSheet";
import { useScoreMutations } from "../hooks/useScoreMutations";
import { ScoreSheetHeader } from "../components/ScoreSheetHeader";
import { SubmissionEvidencePanel } from "../components/SubmissionEvidencePanel";
import { CriteriaScoreCard } from "../components/CriteriaScoreCard";
import { ScoreDraftBar } from "../components/ScoreDraftBar";

export const JudgeScoreSheetPage = () => {
  const { submissionId } = useParams();
  const { submission, criteria, isLocked, isFinalSubmitted, isNotReady, isNotAssigned } = useScoreSheet(submissionId);
  const { saveDraft, finalSubmit, isSaving, isSubmitting, lastSavedAt } = useScoreMutations();

  const { control, handleSubmit, watch, formState: { isDirty } } = useForm({
    defaultValues: { scores: {}, comments: {} },
    mode: "onChange",
  });

  if (isNotAssigned) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <Alert severity="error" sx={{ borderRadius: 2 }}>You are not assigned to grade this submission.</Alert>
      </div>
    );
  }

  if (isNotReady) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <Alert severity="warning" sx={{ borderRadius: 2 }}>Scoring starts after submission lock.</Alert>
      </div>
    );
  }

  const scores = watch("scores") as Record<string, number>;
  const scoredCount = Object.values(scores || {}).filter(
    (v) => v !== undefined && v !== null && v.toString() !== ""
  ).length;
  const allCriteriaScored = scoredCount === criteria.length;

  const totalPossible = criteria.reduce((sum, c) => sum + c.maxScore * c.weight, 0);
  const currentTotal = criteria.reduce((sum, c) => {
    const val = scores?.[c.id];
    return sum + (typeof val === "number" ? val * c.weight : 0);
  }, 0);

  const onSaveDraft = handleSubmit((data) => saveDraft(data));
  const onFinalSubmit = handleSubmit((data) => finalSubmit(data));

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        
        {isLocked && (
          <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>Grading is currently locked by the coordinator.</Alert>
        )}
        
        {isFinalSubmitted && (
          <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>Scores have been final submitted and cannot be edited.</Alert>
        )}

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          {/* Left Column (65%) */}
          <div className="flex w-full flex-col gap-6 lg:w-[65%]">
            <ScoreSheetHeader submission={submission} isLocked={isLocked} />
            <SubmissionEvidencePanel links={submission.links} />
            
            <div className="space-y-4 pt-4">
              <Typography variant="h5" className="font-extrabold text-gray-900 dark:text-white">
                Evaluation Criteria
              </Typography>
              {criteria.map((crit) => (
                <CriteriaScoreCard
                  key={crit.id}
                  criterion={crit}
                  control={control}
                  isLocked={isLocked}
                  isFinalSubmitted={isFinalSubmitted}
                />
              ))}
            </div>
          </div>

          {/* Right Column (35%) */}
          <div className="w-full lg:sticky lg:top-8 lg:w-[35%]">
            <Card variant="outlined" className="rounded-3xl border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="p-6 md:p-8">
                <Typography variant="h6" className="font-extrabold text-gray-900 dark:text-white">
                  Score Summary
                </Typography>
                
                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex justify-between border-b border-gray-100 pb-4 dark:border-slate-800">
                    <span className="text-gray-500 dark:text-slate-400">Criteria Scored</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {scoredCount} / {criteria.length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-100 pb-4 dark:border-slate-800">
                    <span className="text-gray-500 dark:text-slate-400">Weighted Total</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                      {currentTotal.toFixed(1)} / {totalPossible.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <ScoreDraftBar
                    isDirty={isDirty}
                    isLocked={isLocked}
                    isFinalSubmitted={isFinalSubmitted}
                    isSaving={isSaving}
                    isSubmitting={isSubmitting}
                    allCriteriaScored={allCriteriaScored}
                    lastSavedAt={lastSavedAt}
                    onSaveDraft={onSaveDraft}
                    onFinalSubmit={onFinalSubmit}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
