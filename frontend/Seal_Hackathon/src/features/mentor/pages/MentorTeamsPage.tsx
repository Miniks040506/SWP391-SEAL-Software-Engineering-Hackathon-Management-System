import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

import { MentorTeamsTable } from "../components/team/MentorTeamsTable";
import { useMentorTeams } from "../hooks/useMentorTeams";
import { useMentorDashboard } from "../hooks/useMentorDashboard";

export const MentorTeamsPage = () => {
  const navigate = useNavigate();
  const { dashboard } = useMentorDashboard();

  const trackId = (dashboard?.assignedTrack as any)?.id;
  const trackName = dashboard?.assignedTrack?.trackName;

  const { trackTeamsQuery, goToFeedback } = useMentorTeams(trackId);
  const { data: response, isLoading } = trackTeamsQuery || {};
  const teams = response?.data || response || [];

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">
            Assigned Teams
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Manage and provide feedback for teams in your track:
            <span className="ml-1 font-bold text-blue-600 dark:text-blue-400">
              {trackName || "..."}
            </span>
          </p>
        </div>

        <MentorTeamsTable
          isLoading={isLoading}
          teams={teams}
          onGiveFeedback={goToFeedback}
        />
      </div>
    </div>
  );
};
