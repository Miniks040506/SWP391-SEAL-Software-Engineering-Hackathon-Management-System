import { useNavigate } from "react-router-dom";
import { Alert, Button, CircularProgress, Chip } from "@mui/material";
import { format } from "date-fns";

import { useJudgeCalibrationRoundsQuery } from "@/features/calibration/hooks/useCalibrationQueries";
import type { CalibrationRoundResponse } from "@/types/calibration.types";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

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

const JudgeCalibrationListItem = ({
  round,
}: {
  round: CalibrationRoundResponse;
}) => {
  const navigate = useNavigate();

  const hasSubmitted = round.submittedByCurrentJudge === true;

  const { label, statusValue, color } = getCalibrationStatus(
    round,
    hasSubmitted,
  );

  const handleActionClick = () => {
    navigate(`/judge/calibrations/${round.id}/score`);
  };

  let actionButton = null;
  if (statusValue === "UPCOMING") {
    actionButton = (
      <Button
        variant="outlined"
        disabled
        size="small"
        sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
      >
        Not Started
      </Button>
    );
  } else if (statusValue === "OPEN") {
    actionButton = (
      <Button
        variant="contained"
        size="small"
        startIcon={<PlayArrowIcon />}
        onClick={handleActionClick}
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 700,
          bgcolor: "#059669",
          "&:hover": { bgcolor: "#047857" },
        }}
      >
        Start Scoring
      </Button>
    );
  } else if (
    statusValue === "SUBMITTED" ||
    statusValue === "CLOSED" ||
    statusValue === "DISTRIBUTION_PUBLISHED"
  ) {
    actionButton = (
      <div className="flex justify-end gap-2">
        <Button
          variant="outlined"
          size="small"
          onClick={handleActionClick}
          sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
        >
          View Scores
        </Button>
        {statusValue === "DISTRIBUTION_PUBLISHED" && (
          <Button
            variant="contained"
            size="small"
            color="info"
            onClick={() =>
              navigate(`/judge/calibrations/${round.id}/distribution`)
            }
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
          >
            Distribution
          </Button>
        )}
      </div>
    );
  }

  return (
    <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
      <td className="px-4 py-4 align-middle">
        <div className="font-bold text-slate-900 dark:text-white">
          {round.eventName}
        </div>
        {round.description && (
          <div className="mt-1 max-w-xs truncate text-xs font-medium text-slate-500 dark:text-slate-400">
            {round.description}
          </div>
        )}
      </td>
      <td className="px-4 py-4 align-middle text-sm font-medium text-slate-600 dark:text-slate-300">
        <span className="block font-bold text-slate-900 dark:text-white">
          {round.sampleProjectTitle ||
            round.sampleTeamName ||
            "Untitled submission"}
        </span>
        {round.sampleProjectTitle && round.sampleTeamName && (
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
            {round.sampleTeamName}
          </span>
        )}
      </td>
      <td className="px-4 py-4 align-middle text-sm font-medium text-slate-600 dark:text-slate-300">
        {round.startAt
          ? format(new Date(round.startAt), "MMM dd, yyyy HH:mm")
          : "N/A"}
      </td>
      <td className="px-4 py-4 align-middle text-sm font-medium text-slate-600 dark:text-slate-300">
        {round.endAt
          ? format(new Date(round.endAt), "MMM dd, yyyy HH:mm")
          : "N/A"}
      </td>
      <td className="px-4 py-4 align-middle">
        <Chip
          label={label}
          color={color}
          size="small"
          sx={{ fontWeight: 700, borderRadius: "6px" }}
        />
      </td>
      <td className="px-4 py-4 align-middle text-right">{actionButton}</td>
    </tr>
  );
};

export const JudgeCalibrationListPage = () => {
  const {
    data: rounds = [],
    isLoading,
    isError,
    refetch,
  } = useJudgeCalibrationRoundsQuery();

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-7 pb-20 pt-6">
      <header>
        <h1 className="text-3xl font-black text-slate-950 dark:text-white">
          Calibration Tasks
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          Complete benchmark scoring before real grading
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <CircularProgress />
        </div>
      ) : isError ? (
        <Alert
          severity="error"
          action={<Button onClick={() => refetch()}>Retry</Button>}
        >
          Could not load calibration tasks.
        </Alert>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300">
                    Calibration Name
                  </th>
                  <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300">
                    Sample Submission
                  </th>
                  <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300">
                    Start Time
                  </th>
                  <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300">
                    End Time
                  </th>
                  <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rounds.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center font-medium text-slate-500 dark:text-slate-400"
                    >
                      No calibration tasks available.
                    </td>
                  </tr>
                ) : (
                  rounds.map((round) => (
                    <JudgeCalibrationListItem key={round.id} round={round} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
