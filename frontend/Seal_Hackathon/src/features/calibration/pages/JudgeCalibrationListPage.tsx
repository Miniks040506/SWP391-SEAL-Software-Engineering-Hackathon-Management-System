import "@/features/judge/styles/judge.css";

import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Chip } from "@mui/material";
import { format, formatDistanceToNow } from "date-fns";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";

import { useJudgeCalibrationRoundsQuery } from "@/features/calibration/hooks/useCalibrationQueries";
import type { CalibrationRoundResponse } from "@/types/calibration.types";
import { JudgePageHero } from "@/features/judge/components/common/JudgePageHero";

const getCalibrationStatus = (
  round: CalibrationRoundResponse,
  hasSubmitted: boolean,
): {
  label: string;
  statusValue:
    | "UPCOMING"
    | "OPEN"
    | "CLOSED"
    | "SUBMITTED"
    | "WAITING_DISTRIBUTION"
    | "DISTRIBUTION_PUBLISHED";
  color: "default" | "primary" | "success" | "error" | "info" | "warning";
} => {
  const now = new Date();
  const start = round.startAt ? new Date(round.startAt) : null;
  const end = round.endAt ? new Date(round.endAt) : null;

  if (round.distributionPublishedAt) {
    return {
      label: "Distribution Published",
      statusValue: "DISTRIBUTION_PUBLISHED",
      color: "info",
    };
  }

  if (hasSubmitted) {
    return { label: "Submitted", statusValue: "SUBMITTED", color: "success" };
  }

  if (start && now < start) {
    return { label: "Upcoming", statusValue: "UPCOMING", color: "default" };
  }

  if (end && now > end) {
    return { label: "Closed", statusValue: "CLOSED", color: "error" };
  }

  return { label: "Open", statusValue: "OPEN", color: "primary" };
};

const STATUS_ACCENT: Record<string, string> = {
  OPEN: "border-l-emerald-500",
  UPCOMING: "border-l-slate-300 dark:border-l-slate-600",
  CLOSED: "border-l-rose-400",
  SUBMITTED: "border-l-emerald-500",
  WAITING_DISTRIBUTION: "border-l-amber-400",
  DISTRIBUTION_PUBLISHED: "border-l-sky-500",
};

const JudgeCalibrationCardItem = ({
  round,
  stagger,
}: {
  round: CalibrationRoundResponse;
  stagger: number;
}) => {
  const navigate = useNavigate();
  const hasSubmitted = round.submittedByCurrentJudge === true;
  const { label, statusValue, color } = getCalibrationStatus(round, hasSubmitted);
  const end = round.endAt ? new Date(round.endAt) : null;
  const goScore = () => navigate(`/judge/calibrations/${round.id}/score`);

  return (
    <div
      className={`jd-fade-up jd-lift rounded-2xl border border-l-4 border-slate-200 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900 ${STATUS_ACCENT[statusValue]}`}
      style={{ "--jd-stagger": stagger } as CSSProperties}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {statusValue === "OPEN" && (
              <span className="jd-live-dot inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            )}
            <h3 className="font-black text-slate-950 dark:text-white">{round.eventName}</h3>
            {round.mandatory && (
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-extrabold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                Mandatory
              </span>
            )}
            <Chip label={label} color={color} size="small" sx={{ fontWeight: 700, borderRadius: "6px" }} />
          </div>
          {round.description && (
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              {round.description}
            </p>
          )}
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Sample:{" "}
            {round.sampleProjectTitle || round.sampleTeamName || "Untitled submission"}
            {round.sampleProjectTitle && round.sampleTeamName && (
              <span className="text-slate-400 dark:text-slate-500"> · {round.sampleTeamName}</span>
            )}
          </p>
          <p className="mt-1 text-xs font-semibold tabular-nums text-slate-400 dark:text-slate-500">
            {round.startAt ? format(new Date(round.startAt), "MMM dd, yyyy HH:mm") : "N/A"}
            {" → "}
            {round.endAt ? format(new Date(round.endAt), "MMM dd, yyyy HH:mm") : "N/A"}
            {statusValue === "OPEN" && end && (
              <span className="ml-2 font-bold text-orange-600 dark:text-orange-400">
                · Closes in {formatDistanceToNow(end)}
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {statusValue === "UPCOMING" && (
            <Button variant="outlined" disabled size="small" sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}>
              Not Started
            </Button>
          )}
          {statusValue === "OPEN" && (
            <Button
              variant="contained"
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={goScore}
              className="jd-press"
              sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, bgcolor: "#059669", "&:hover": { bgcolor: "#047857" } }}
            >
              Start Scoring
            </Button>
          )}
          {(statusValue === "SUBMITTED" ||
            statusValue === "CLOSED" ||
            statusValue === "DISTRIBUTION_PUBLISHED") && (
            <>
              <Button variant="outlined" size="small" onClick={goScore} className="jd-press" sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}>
                View Scores
              </Button>
              {statusValue === "DISTRIBUTION_PUBLISHED" && (
                <Button
                  variant="contained"
                  size="small"
                  color="info"
                  className="jd-press"
                  onClick={() => navigate(`/judge/calibrations/${round.id}/distribution`)}
                  sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
                >
                  Distribution
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const JudgeCalibrationListPage = () => {
  const { data: rounds = [], isLoading, isError, refetch } =
    useJudgeCalibrationRoundsQuery();

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-20 pt-2">
      <JudgePageHero
        eyebrow="Calibration"
        title="Calibration Tasks"
        subtitle="Score the benchmark submission to align your grading baseline before official scoring opens."
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="jd-shimmer h-32 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
          ))}
        </div>
      ) : isError ? (
        <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
          Could not load calibration tasks.
        </Alert>
      ) : rounds.length === 0 ? (
        <div className="jd-settle flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <ScienceOutlinedIcon className="text-slate-300 dark:text-slate-600" sx={{ fontSize: 40 }} />
          <p className="font-bold text-slate-600 dark:text-slate-300">No calibration tasks yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Calibration rounds appear here when a coordinator schedules them.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map((round, index) => (
            <JudgeCalibrationCardItem key={round.id} round={round} stagger={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
