import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";

import type { EventCriteriaResponse } from "@/types/criteria.types";
import type { ScoreResponse } from "@/types/grading.types";
import type { JudgeSubmissionAssignmentResponse } from "@/types/judge.types";

import { useScoreSheet } from "../hooks/useScoreSheet";
import { useScoreMutations } from "../hooks/useScoreMutations";
import { ScoreSheetHeader } from "../components/ScoreSheetHeader";
import { SubmissionEvidencePanel } from "../components/SubmissionEvidencePanel";
import { CriteriaScoreCard } from "../components/CriteriaScoreCard";
import { ScoreDraftBar } from "../components/ScoreDraftBar";

export const JudgeScoreSheetPage = () => {
  const { submissionId } = useParams();
  const { state } = useLocation();
  const assignmentInfo = state?.assignmentInfo as JudgeSubmissionAssignmentResponse | undefined;

  const { submission, scoreSheet, isLoading, isError, error } = useScoreSheet(
    submissionId!,
  );
  const { saveDraft, finalSubmit, isSaving, isSubmitting, lastSavedAt } =
    useScoreMutations(submissionId!);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isDirty },
  } = useForm({
    defaultValues: { scores: {}, comments: {} },
    mode: "onChange",
  });

  useEffect(() => {
    if (scoreSheet?.scores) {
      const defaultScores: Record<string, number> = {};
      const defaultComments: Record<string, string> = {};
      scoreSheet.scores.forEach((score: ScoreResponse) => {
        defaultScores[score.eventCriteriaId] = score.value;
        if (score.comment) {
          defaultComments[score.eventCriteriaId] = score.comment;
        }
      });
      reset({ scores: defaultScores, comments: defaultComments });
    }
  }, [scoreSheet, reset]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <CircularProgress />
      </div>
    );
  }

  // Handle 403 Forbidden specifically to meet the requirement: "If user is not assigned: Show 403-style error page"
  const isForbidden = (error as any)?.response?.status === 403;
  
  if (isForbidden) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          You are not assigned to grade this submission. (403 Forbidden)
        </Alert>
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Error loading score sheet.
        </Alert>
      </div>
    );
  }

  const isLocked = assignmentInfo?.roundSubmissionLocked ?? false;
  const isFinalSubmitted = scoreSheet?.confirmed ?? false;
  
  // If assignmentInfo is missing (e.g., direct URL access), we assume it's ready and rely on backend API errors.
  const isNotReady = assignmentInfo
    ? assignmentInfo.submissionStatus !== "SUBMITTED" && assignmentInfo.submissionStatus !== "LOCKED"
    : false;

  if (isNotReady) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Scoring starts after submission lock.
        </Alert>
      </div>
    );
  }

  const scores = watch("scores") as Record<string, number>;
  const scoredCount = Object.values(scores || {}).filter(
    (v) => v !== undefined && v !== null && v.toString() !== "",
  ).length;
  const allCriteriaScored = scoredCount === submission.criteria.length;

  const totalPossible = submission.criteria.reduce(
    (sum: number, c: EventCriteriaResponse) =>
      sum + c.effectiveMaxScore * (c.effectiveWeight || 1),
    0,
  );
  const currentTotal = submission.criteria.reduce(
    (sum: number, c: EventCriteriaResponse) => {
      let val = scores?.[c.id];
      if (typeof val === "number" && !isNaN(val)) {
        if (val > c.effectiveMaxScore) val = c.effectiveMaxScore;
        if (val < 0) val = 0;
        return sum + val * (c.effectiveWeight || 1);
      }
      return sum;
    },
    0,
  );

  const preparePayload = (data: {
    scores: Record<string, number>;
    comments: Record<string, string>;
  }) => {
    const scoreItems = Object.keys(data.scores || {}).map((criteriaId) => ({
      eventCriteriaId: criteriaId,
      value: data.scores[criteriaId],
      comment: data.comments?.[criteriaId] || undefined,
    }));
    return { scores: scoreItems };
  };

  const onSaveDraft = handleSubmit(async (data) => {
    try {
      await saveDraft(
        preparePayload(
          data as {
            scores: Record<string, number>;
            comments: Record<string, string>;
          },
        ),
      );
    } catch (err) {
      console.error("Failed to save draft:", err);
      // TODO: show toast notification
    }
  });

  const onFinalSubmit = handleSubmit(async (data) => {
    try {
      await finalSubmit(
        preparePayload(
          data as {
            scores: Record<string, number>;
            comments: Record<string, string>;
          },
        ),
      );
    } catch (err) {
      console.error("Failed to submit scores:", err);
      // TODO: show toast notification
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {isLocked && (
          <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
            Grading is currently locked by the coordinator.
          </Alert>
        )}

        {isFinalSubmitted && (
          <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
            Scores have been final submitted and cannot be edited.
          </Alert>
        )}

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          {/* Left Column (65%) */}
          <div className="flex w-full flex-col gap-6 lg:w-[65%]">
            <ScoreSheetHeader submission={submission} isLocked={isLocked} assignmentInfo={assignmentInfo} />
            {submission.note && (
              <Typography
                variant="body2"
                className="mt-1 text-gray-500 dark:text-slate-400"
              >
                {submission.note}
              </Typography>
            )}
            <SubmissionEvidencePanel links={submission.links} />

            <div className="space-y-4 pt-4">
              <Typography
                variant="h5"
                className="font-extrabold text-gray-900 dark:text-white"
              >
                Evaluation Criteria
              </Typography>
              {submission.criteria.map((crit: EventCriteriaResponse) => (
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
            <Card
              variant="outlined"
              className="rounded-3xl border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="p-6 md:p-8">
                <Typography
                  variant="h6"
                  className="font-extrabold text-gray-900 dark:text-white"
                >
                  Score Summary
                </Typography>

                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex justify-between border-b border-gray-100 pb-4 dark:border-slate-800">
                    <span className="text-gray-500 dark:text-slate-400">
                      Criteria Scored
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {scoredCount} / {submission.criteria.length}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 pb-4 dark:border-slate-800">
                    <span className="text-gray-500 dark:text-slate-400">
                      Weighted Total
                    </span>
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
