import { useState, useMemo } from "react";



import { MentorSubmissionTable } from "../components/submission/MentorSubmissionTable";
import {
  MentorSubmissionFilterBar,
  type MentorSubmissionFilters,
} from "../components/submission/MentorSubmissionFilterBar";
import { useMentorSubmissions } from "../hooks/useMentorSubmission";
import { useMentorDashboard } from "../hooks/useMentorDashboard";

export const MentorSubmissionPage = () => {

  const { dashboard, teamList } = useMentorDashboard();


  const trackName = dashboard?.assignedTrack?.trackName;

  const teamIds = (teamList || []).map((t: any) => t.teamId || t.id).filter(Boolean);
  const { trackSubmissionsQuery, goToSubmissionDetail } = useMentorSubmissions(teamIds);
  const { data: allSubmissions = [], isLoading } = trackSubmissionsQuery;

  const [filters, setFilters] = useState<MentorSubmissionFilters>({});

  const availableRounds = useMemo(() => {
    const roundsMap = new Map();
    allSubmissions.forEach((sub: any) => {
      if (sub.roundId && sub.roundName && !roundsMap.has(sub.roundId)) {
        roundsMap.set(sub.roundId, { id: sub.roundId, name: sub.roundName });
      }
    });
    return Array.from(roundsMap.values());
  }, [allSubmissions]);

  // Logic áp dụng bộ lọc (Client-side filtering)
  const filteredSubmissions = useMemo(() => {
    return allSubmissions.filter((sub: any) => {
      const matchSearch =
        !filters.search ||
        sub.teamName?.toLowerCase().includes(filters.search.toLowerCase());

      const matchStatus = !filters.status || sub.status === filters.status;

      const matchRound = !filters.roundId || sub.roundId === filters.roundId;

      return matchSearch && matchStatus && matchRound;
    });
  }, [allSubmissions, filters]);

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">
            Track Submissions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Review all deliverables submitted by teams in your assigned track:
            <span className="ml-1 font-bold text-blue-600 dark:text-blue-400">
              {trackName || "..."}
            </span>
          </p>
        </div>

        {/* Thanh Filter Mới */}
        <MentorSubmissionFilterBar
          filters={filters}
          onChange={setFilters}
          rounds={availableRounds}
        />

        {/* Bảng dữ liệu đã được lọc */}
        <MentorSubmissionTable
          isLoading={isLoading}
          submissions={filteredSubmissions}
          onRowClick={goToSubmissionDetail}
        />
      </div>
    </div>
  );
};
