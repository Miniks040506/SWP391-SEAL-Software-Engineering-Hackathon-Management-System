import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, MenuItem, FormControl, type SelectChangeEvent } from "@mui/material";
import { filterSelectSx, menuPropsAll } from "../schemas/mentorTeams.schema";
import { trackApi } from "@/api/track.api";
import { useMentorTeams } from "../hooks/useMentorTeams";
import { MentorTeamsTable } from "../components/team/MentorTeamsTable";

export const MentorTeamsPage = () => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    setSearchValue("");
    setDebouncedSearch("");
  }, [selectedTrackId]);

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

  const { data: response, isLoading } = useMentorTeams(selectedTrackId, {
    search: debouncedSearch || undefined,
  });

  const teams = response?.content || [];

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="space-y-6">
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">
              Assigned Teams
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Manage the teams assigned to your tracks
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search teams..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-0 focus:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] sm:text-sm transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:bg-slate-900"
              />
            </div>

            {ongoingTracks.length > 0 && (
              <div className="w-full sm:w-max sm:min-w-[16rem] shrink-0">
                <FormControl size="small" fullWidth>
                  <Select
                    displayEmpty
                    value={selectedTrackId}
                    onChange={(e: SelectChangeEvent<string>) => setSelectedTrackId(e.target.value)}
                    sx={filterSelectSx}
                    MenuProps={menuPropsAll}
                  >
                    {ongoingTracks.map((track) => (
                      <MenuItem key={track.trackId} value={track.trackId}>
                        {track.eventName} - {track.trackName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            )}
          </div>
        </div>

        <MentorTeamsTable isLoading={isLoading} teams={teams} />
      </div>
    </div>
  );
};
