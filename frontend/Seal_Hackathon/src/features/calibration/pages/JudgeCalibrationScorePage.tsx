import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { formatDistanceToNow } from "date-fns";
import { isAxiosError } from "axios";
import { Alert, CircularProgress, Button, Chip } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

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
      <div className="flex justify-center py-20">
        <CircularProgress />
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
      <div className="mx-auto max-w-3xl space-y-4 py-12">
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
      <div className="mx-auto max-w-7xl animate-in fade-in duration-500 space-y-7 pb-10 pt-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Button
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={() => navigate("/judge/calibrations")}
              sx={{ mb: 2, textTransform: "none", fontWeight: 800 }}
            >
              Back to Tasks
            </Button>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white">
              Calibration Scoring
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {round?.description ||
                "Evaluate the sample submission to calibrate your scoring baseline."}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {round?.mandatory && (
              <Chip
                label="Mandatory Task"
                color="error"
                size="small"
                sx={{ fontWeight: 800, borderRadius: "6px" }}
              />
            )}
            {status === "OPEN" && end && (
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                Closes in {formatDistanceToNow(end)}
              </span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-6">
              <CalibrationSubmissionPreview scoreSheet={scoreSheet} />
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8">
            <CalibrationScoreSheet
              criteria={scoreSheet?.criteria || []}
              disabled={isReadOnly}
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
