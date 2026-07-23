import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, MenuItem, FormControl, type SelectChangeEvent } from "@mui/material";
import { filterSelectSx, menuPropsAll } from "../schemas/mentorTeams.schema";
import { trackApi } from "@/api/track.api";
import { useMentorTeams } from "../hooks/useMentorTeams";
import { MentorTeamsTable } from "../components/team/MentorTeamsTable";
import { MentorPageHero } from "../components/common/MentorPageHero";

import "../styles/mentor.css";

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
    <div className="space-y-6">
      <MentorPageHero
        eyebrow="Mentor · Teams"
        title="Assigned Teams"
        subtitle="Manage the teams assigned to your tracks"
        chips={
          !isLoading && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
              {teams.length} {teams.length === 1 ? "team" : "teams"}
            </span>
          )
        }
      />

      <div
        className="mt-fade-up flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row dark:border-slate-700/80 dark:bg-slate-900"
        style={{ "--mt-stagger": 1 } as CSSProperties}
      >
        <div className="relative w-full flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search teams..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 leading-5 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-0 sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:bg-slate-900"
          />
        </div>

        {ongoingTracks.length > 0 && (
          <div className="w-full shrink-0 sm:w-max sm:min-w-[16rem]">
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

      <MentorTeamsTable isLoading={isLoading} teams={teams} />
    </div>
  );
};
