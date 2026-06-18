import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { trackApi } from "@/api/track.api";
import { useMentorTeams } from "../hooks/useMentorTeams";
import { MentorTeamsTable } from "../components/team/MentorTeamsTable";
import { MentorTeamDetailDrawer } from "../components/team/MentorTeamDetailDrawer";

export const MentorTeamsPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");

  const assignedTracksQuery = useQuery({
    queryKey: ["mentor-assigned-tracks"],
    queryFn: () => trackApi.getMyAssignedTracks(),
  });

  const ongoingTracks =
    assignedTracksQuery.data?.filter(
      (track) => track.eventStatus === "ONGOING",
    ) || [];

  useEffect(() => {
    if (ongoingTracks.length > 0 && !selectedTrackId) {
      setSelectedTrackId(ongoingTracks[0].trackId);
    }
  }, [ongoingTracks, selectedTrackId]);

  const { data: response, isLoading } = useMentorTeams(selectedTrackId);

  const teams = response?.content || [];

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">
              Assigned Teams
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Manage the teams assigned to your tracks
            </p>
          </div>

          {ongoingTracks.length > 0 && (
            <div className="flex items-center space-x-2">
              <label
                htmlFor="track-select"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Track:
              </label>
              <select
                id="track-select"
                value={selectedTrackId}
                onChange={(e) => setSelectedTrackId(e.target.value)}
                className="block w-full sm:w-64 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                {ongoingTracks.map((track) => (
                  <option key={track.trackId} value={track.trackId}>
                    {track.eventName} - {track.trackName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <MentorTeamsTable isLoading={isLoading} teams={teams} />
      </div>

      {teamId && (
        <MentorTeamDetailDrawer
          teamId={teamId}
          onClose={() => navigate("/mentor/teams")}
        />
      )}
    </div>
  );
};
