import { useState } from "react";
import { useJudgeSubmissionsQuery } from "../hooks/useJudgeGradingQueries";
import {
  JudgeAssignedSubmissionFilters,
  type FilterState,
} from "../components/JudgeAssignedSubmissionFilters";
import { JudgeSubmissionTable } from "../components/submission/JudgeSubmissionTable";

export const JudgeAssignedSubmissionPage = () => {
  const [filters, setFilters] = useState<FilterState>({});

  const { data, isLoading } = useJudgeSubmissionsQuery();

  const submissions = data?.content || [];

  const totalAssigned = submissions.length;
  const pendingCount = submissions.filter(
    (s) => s.gradingStatus === "PENDING",
  ).length;
  const draftSavedCount = submissions.filter(
    (s) => s.gradingStatus === "DRAFT_SAVED",
  ).length;
  const submittedCount = submissions.filter(
    (s) => s.gradingStatus === "SUBMITTED",
  ).length;
  const lockedCount = submissions.filter(
    (s) => s.gradingStatus === "LOCKED",
  ).length;

  const filteredSubmissions = submissions.filter((sub) => {
    if (filters.roundId && sub.roundId !== filters.roundId) return false;
    if (filters.trackId && sub.trackId !== filters.trackId) return false;
    if (filters.gradingStatus && sub.gradingStatus !== filters.gradingStatus) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const teamMatch =
        sub.teamName?.toLowerCase().includes(searchLower) || false;
      const projectMatch =
        sub.projectTitle?.toLowerCase().includes(searchLower) || false;
      if (!teamMatch && !projectMatch) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">
          Assigned Submissions
        </h1>
        <p className="text-sm text-gray-500">
          Review and score submissions assigned to you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
          <span className="text-sm text-gray-500 font-medium">
            Total Assigned
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {totalAssigned}
          </span>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
          <span className="text-sm text-gray-500 font-medium">Pending</span>
          <span className="text-2xl font-bold text-gray-600">
            {pendingCount}
          </span>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
          <span className="text-sm text-blue-700 font-medium">Draft saved</span>
          <span className="text-2xl font-bold text-blue-700">
            {draftSavedCount}
          </span>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
          <span className="text-sm text-green-700 font-medium">Submitted</span>
          <span className="text-2xl font-bold text-green-700">
            {submittedCount}
          </span>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
          <span className="text-sm text-purple-700 font-medium">Locked</span>
          <span className="text-2xl font-bold text-purple-700">
            {lockedCount}
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <JudgeAssignedSubmissionFilters value={filters} onChange={setFilters} />
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <JudgeSubmissionTable submissions={filteredSubmissions} />
        )}
      </div>
    </div>
  );
};
