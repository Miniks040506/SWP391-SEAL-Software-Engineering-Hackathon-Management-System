import { useParams } from "react-router-dom";
import { Typography } from "@mui/material";
import { useTeamAdvancementStatusQuery } from "../hooks/useAdvancementQueries";
import { TeamAdvancementStatusBanner } from "../components/TeamAdvancementStatusBanner";

export function TeamAdvancementPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const validTeamId = teamId || "";

  const {
    data: response,
    isLoading,
    isError,
  } = useTeamAdvancementStatusQuery(validTeamId);
  const data = response?.data;

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300 mb-2">
        Advancement Status
      </h1>

      {data && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {data.teamName} — {data.eventName}
          {data.currentRoundName && ` — ${data.currentRoundName}`}
        </p>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <Typography className="text-slate-500">
            Loading advancement status...
          </Typography>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <Typography color="error">
            Failed to load advancement status.
          </Typography>
        </div>
      )}

      {data && (
        <TeamAdvancementStatusBanner
          status={data.status}
          message={data.message}
          nextRoundId={data.nextRoundId}
          nextRoundName={data.nextRoundName}
          canAccessNextRound={data.canAccessNextRound}
          eventId={data.eventId}
        />
      )}
    </div>
  );
}
