import "@/features/judge/styles/judge.css";

import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { formatDistanceToNow } from "date-fns";
import { isAxiosError } from "axios";
import { Alert, Button } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

import { JudgePageHero } from "@/features/judge/components/common/JudgePageHero";
import {
  useCalibrationScoreSheetQuery,
  useCalibrationRoundQuery,
} from "@/features/calibration/hooks/useCalibrationQueries";
import { useSubmitCalibrationScoresMutation } from "@/features/calibration/hooks/useCalibrationMutations";

import { CalibrationSubmissionPreview } from "../components/JudgeCalibration/CalibrationSubmissionPreview";
import { CalibrationScoreSheet } from "../components/JudgeCalibration/CalibrationScoreSheet";
import {
  CalibrationSubmitBar,
  type CalibrationStatusType,
} from "../components/JudgeCalibration/CalibrationSubmitBar";
import type { UUID } from "@/types/common.types";

type ScoreFormValues = {
  scores: Record<
    string,
    {
      score: number | "";
      comment: string;
    }
  >;
};

export const JudgeCalibrationScorePage = () => {
  const { calibrationId } = useParams<{ calibrationId: string }>();
  const navigate = useNavigate();

  const {
    data: scoreSheet,
    isLoading: isLoadingScoreSheet,
    isError: isScoreSheetError,
    error: scoreSheetError,
  } = useCalibrationScoreSheetQuery(calibrationId as UUID);
  const { data: round, isLoading: isLoadingRound } = useCalibrationRoundQuery(
    calibrationId as UUID,
  );

  const submitMutation = useSubmitCalibrationScoresMutation();

  const now = scoreSheet ? new Date(scoreSheet.serverTime) : null;
  const start = scoreSheet?.startAt ? new Date(scoreSheet.startAt) : null;
  const end = scoreSheet?.endAt ? new Date(scoreSheet.endAt) : null;
  const isSubmitted = scoreSheet?.submitted ?? false;
  const isPublished = scoreSheet?.distributionPublished ?? false;

  let status: CalibrationStatusType = "OPEN";
  if (isPublished) {
    status = "DISTRIBUTION_PUBLISHED";
  } else if (isSubmitted) {
    status = "SUBMITTED";
  } else if (start && now && now < start) {
    status = "UPCOMING";
  } else if (end && now && now > end) {
    status = "CLOSED";
  }

  const isReadOnly = !(scoreSheet?.canSubmit ?? false);

  const defaultValues = useMemo(() => {
    const initialScores: ScoreFormValues["scores"] = {};
    if (scoreSheet?.criteria) {
      scoreSheet.criteria.forEach((criterion) => {
        const existing = scoreSheet.scores.find(
          (score) => score.eventCriteriaId === criterion.id,
        );
        initialScores[criterion.id] = {
          score: existing ? existing.value : "",
          comment: existing?.comment ?? "",
        };
      });
    }
    return { scores: initialScores };
  }, [scoreSheet]);

  const methods = useForm<ScoreFormValues>({
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (scoreSheet?.criteria) {
      methods.reset(defaultValues);
    }
  }, [scoreSheet?.criteria, methods, defaultValues]);

  const onSubmit = (values: ScoreFormValues) => {
    const scoresArray = Object.entries(values.scores).map(
      ([criteriaId, data]) => ({
        eventCriteriaId: criteriaId as UUID,
        value: Number(data.score),
        comment: data.comment,
      }),
    );

    submitMutation.mutate({
      calibrationId: calibrationId as UUID,
      payload: { scores: scoresArray },
    });
  };

  const handleViewDistribution = () => {
    navigate(`/judge/calibrations/${calibrationId}/distribution`);
  };

  const isLoadingData = isLoadingScoreSheet || isLoadingRound;

  if (isLoadingData) {
    return (
      <div className="mx-auto max-w-7xl space-y-7 pb-10 pt-6">
        <div className="jd-shimmer h-40 rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="jd-shimmer h-96 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-7 xl:col-span-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="jd-shimmer h-40 rounded-2xl bg-slate-100 dark:bg-slate-800/60"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isScoreSheetError || !scoreSheet) {
    const responseStatus = isAxiosError(scoreSheetError)
      ? scoreSheetError.response?.status
      : undefined;
    const message =
      responseStatus === 403
        ? "This calibration task is not assigned to you."
        : responseStatus === 404
          ? "Calibration round not found."
          : "Unable to load the calibration score sheet.";

    return (
      <div className="jd-settle mx-auto max-w-3xl space-y-4 py-12">
        <Alert severity="error">{message}</Alert>
        <Button
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate("/judge/calibrations")}
          sx={{ textTransform: "none", fontWeight: 800 }}
        >
          Back to Calibration Tasks
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-7xl space-y-7 pb-10 pt-6">
        <JudgePageHero
          eyebrow="Calibration"
          title="Calibration Scoring"
          subtitle={
            round?.description ||
            "Evaluate the sample submission to calibrate your scoring baseline."
          }
          backTo={{ label: "Back to Tasks", onClick: () => navigate("/judge/calibrations") }}
          chips={
            <>
              {round?.mandatory && (
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                  Mandatory task
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {status === "DISTRIBUTION_PUBLISHED"
                  ? "Distribution published"
                  : status === "SUBMITTED"
                    ? "Submitted"
                    : status === "UPCOMING"
                      ? "Upcoming"
                      : status === "CLOSED"
                        ? "Closed"
                        : "Open"}
              </span>
              {status === "OPEN" && end && (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                  Closes in {formatDistanceToNow(end)}
                </span>
              )}
            </>
          }
        />

        {isSubmitted && (
          <div className="jd-settle flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <CheckCircleOutlinedIcon className="jd-pop text-emerald-600" sx={{ fontSize: 24 }} />
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-300">Scores submitted</p>
              <p className="text-sm font-medium text-emerald-700/80 dark:text-emerald-300/70">
                {isPublished
                  ? "The distribution has been published — view it to compare with other judges."
                  : "Waiting for the coordinator to publish the score distribution."}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-6">
              <CalibrationSubmissionPreview scoreSheet={scoreSheet} stagger={1} />
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8">
            <CalibrationScoreSheet
              criteria={scoreSheet?.criteria || []}
              disabled={isReadOnly}
              staggerOffset={2}
            />
          </div>
        </div>
      </div>

      <CalibrationSubmitBar
        status={status}
        isSubmitting={submitMutation.isPending}
        onSubmit={methods.handleSubmit(onSubmit)}
        onViewDistribution={handleViewDistribution}
      />
    </FormProvider>
  );
};
