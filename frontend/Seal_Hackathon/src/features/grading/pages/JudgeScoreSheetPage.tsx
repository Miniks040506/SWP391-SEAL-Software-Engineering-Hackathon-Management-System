import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useParams,
  useLocation,
  useBlocker,
  useNavigate,
} from "react-router-dom";

import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { isAxiosError } from "axios";
import { useSnackbar } from "notistack";

import type { EventCriteriaResponse } from "@/types/criteria.types";
import type {
  JudgeScoreFormValues,
  ScoreResponse,
} from "@/types/grading.types";
import type { JudgeSubmissionAssignmentResponse } from "@/types/grading.types";

import { useScoreSheet } from "../hooks/useScoreSheet";
import { useScoreMutations } from "../hooks/useScoreMutations";
import { ScoreSheetHeader } from "../components/ScoreSheetHeader";
import { SubmissionEvidencePanel } from "../components/SubmissionEvidencePanel";
import { CriteriaScoreCard } from "../components/CriteriaScoreCard";
import { ScoreDraftBar } from "../components/ScoreDraftBar";
import { ActionConfirmDialog } from "@/components/common/ActionConfirmDialog";

export const JudgeScoreSheetPage = () => {
  const { submissionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const assignmentInfo = state?.assignmentInfo as
    | JudgeSubmissionAssignmentResponse
    | undefined;

  const { submission, scoreSheet, isLoading, isError, error } = useScoreSheet(
    submissionId!,
  );
  const { saveDraft, finalSubmit, isSaving, isSubmitting, lastSavedAt } =
    useScoreMutations(submissionId!);
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { isDirty },
  } = useForm<JudgeScoreFormValues>({
    defaultValues: { scores: {}, comments: {} },
    mode: "onChange",
  });
  const canEdit = scoreSheet?.canEdit ?? false;
  const navigationBlocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && canEdit && currentLocation.pathname !== nextLocation.pathname,
  );

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

  useEffect(() => {
    if (!isDirty || !canEdit) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, canEdit]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <CircularProgress />
      </div>
    );
  }

  const isForbidden = isAxiosError(error) && error.response?.status === 403;

  if (isForbidden) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          You are not assigned to grade this submission. (403 Forbidden)
        </Alert>
      </div>
    );
  }

  if (isError || !submission || !scoreSheet) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Error loading score sheet.
        </Alert>
      </div>
    );
  }

  const isGradingLocked = scoreSheet.gradingLocked;
  const isFinalSubmitted = scoreSheet.confirmed;
  const isCalibrationIncomplete = !scoreSheet.calibrationCompleted;
  const isNotReady = !scoreSheet.submissionLocked;

  if (isNotReady) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Scoring starts after submission lock.
        </Alert>
      </div>
    );
  }

  const scores = watch("scores");
  const scoredCount = Object.values(scores || {}).filter(
    (value) => typeof value === "number" && Number.isFinite(value),
  ).length;
  const totalCriteria = submission.criteria.length;
  const allCriteriaScored = scoredCount === totalCriteria;

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

  const gradingStatus =
    assignmentInfo?.gradingStatus ||
    (isFinalSubmitted ? "SUBMITTED" : "PENDING");

  const preparePayload = (data: JudgeScoreFormValues) => {
    const versionsByCriteria = new Map(
      scoreSheet.scores.map((score) => [score.eventCriteriaId, score.version]),
    );
    const scoreItems = Object.entries(data.scores || {})
      .filter((entry): entry is [string, number] => Number.isFinite(entry[1]))
      .map(([criteriaId, value]) => ({
        eventCriteriaId: criteriaId,
        value,
        comment: data.comments?.[criteriaId] || undefined,
        expectedVersion: versionsByCriteria.get(criteriaId),
      }));
    return { scores: scoreItems };
  };

  const onSaveDraft = handleSubmit(async (data) => {
    try {
      await saveDraft(preparePayload(data));
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  });

  const onFinalSubmit = handleSubmit(async (data) => {
    let hasMissingOrInvalid = false;
    const activeCriteria = submission.criteria.filter(
      (c: EventCriteriaResponse) => c.isActive,
    );

    for (const crit of activeCriteria) {
      const val = data.scores?.[crit.id];
      if (val === undefined || val === null || val === "") {
        hasMissingOrInvalid = true;
        setError(`scores.${crit.id}`, {
          type: "manual",
          message: "Score is required for final submit",
        });
        continue;
      }
      const num = Number(val);
      if (!Number.isFinite(num)) {
        hasMissingOrInvalid = true;
        setError(`scores.${crit.id}`, {
          type: "manual",
          message: "Score must be a number",
        });
        continue;
      }
      if (num < 0) {
        hasMissingOrInvalid = true;
        setError(`scores.${crit.id}`, { type: "manual", message: "Min: 0" });
        continue;
      }
      if (num > crit.effectiveMaxScore) {
        hasMissingOrInvalid = true;
        setError(`scores.${crit.id}`, {
          type: "manual",
          message: `Max: ${crit.effectiveMaxScore}`,
        });
        continue;
      }
    }

    if (hasMissingOrInvalid) {
      enqueueSnackbar(
        "Cannot final submit: All criteria must have a valid score.",
        {
          variant: "error",
        },
      );
      return;
    }

    try {
      await finalSubmit(preparePayload(data));
    } catch (err) {
      console.error("Failed to submit scores:", err);
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Back navigation */}
        <button
          onClick={() => navigate("/judge/submissions")}
          className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-blue-500"
        >
          <ArrowBackIcon fontSize="small" /> Back to Submissions
        </button>

        {isGradingLocked && (
          <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
            Grading is currently locked by the coordinator.
          </Alert>
        )}

        {isCalibrationIncomplete && (
          <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
            Complete all mandatory calibration rounds before grading this
            submission.
          </Alert>
        )}

        {isFinalSubmitted && (
          <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
            Scores have been final submitted and cannot be edited.
          </Alert>
        )}

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          {/* Left column — 65% */}
          <div className="flex w-full flex-col gap-6 lg:w-[65%]">
            <ScoreSheetHeader
              submission={submission}
              scoreSheet={scoreSheet}
              isLocked={isGradingLocked}
              assignmentInfo={assignmentInfo}
            />
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
                  isLocked={!canEdit}
                  isFinalSubmitted={isFinalSubmitted}
                />
              ))}
            </div>
          </div>

          {/* Right column — 35% */}
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
                  {/* Total criteria */}
                  <div className="flex justify-between border-b border-gray-100 pb-4 dark:border-slate-800">
                    <span className="text-gray-500 dark:text-slate-400">
                      Total Criteria
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {totalCriteria}
                    </span>
                  </div>

                  {/* Completed criteria */}
                  <div className="flex justify-between border-b border-gray-100 pb-4 dark:border-slate-800">
                    <span className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                      {allCriteriaScored ? (
                        <CheckCircleOutlineIcon
                          sx={{ fontSize: 18, color: "#10b981" }}
                        />
                      ) : (
                        <RadioButtonUncheckedIcon
                          sx={{ fontSize: 18, color: "#d1d5db" }}
                        />
                      )}
                      Completed
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {scoredCount} / {totalCriteria}
                    </span>
                  </div>

                  {/* Grading status */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-slate-800">
                    <span className="text-gray-500 dark:text-slate-400">
                      Status
                    </span>
                    <Chip
                      label={
                        isFinalSubmitted
                          ? "Final Submitted"
                          : isDirty
                            ? "Draft (Unsaved)"
                            : scoredCount > 0
                              ? "Draft Saved"
                              : "Pending"
                      }
                      size="small"
                      color={
                        isFinalSubmitted
                          ? "success"
                          : isDirty
                            ? "warning"
                            : scoredCount > 0
                              ? "info"
                              : "default"
                      }
                      sx={{ fontWeight: 700 }}
                    />
                  </div>

                  {/* Weighted total */}
                  <div className="flex justify-between pb-2">
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
                    isLocked={isGradingLocked}
                    isFinalSubmitted={isFinalSubmitted}
                    isSaving={isSaving}
                    isSubmitting={isSubmitting}
                    allCriteriaScored={allCriteriaScored}
                    lastSavedAt={lastSavedAt}
                    gradingStatus={gradingStatus}
                    onSaveDraft={onSaveDraft}
                    onFinalSubmit={onFinalSubmit}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <ActionConfirmDialog
        open={navigationBlocker.state === "blocked"}
        title="Discard unsaved score changes?"
        description="Your unsaved scores and comments will be lost if you leave this page."
        confirmLabel="Discard and leave"
        severity="error"
        onClose={() => {
          if (navigationBlocker.state === "blocked") navigationBlocker.reset();
        }}
        onConfirm={() => {
          if (navigationBlocker.state === "blocked") navigationBlocker.proceed();
        }}
      />
    </div>
  );
};
