import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import type { JudgeSubmissionAssignmentResponse } from "@/types/judge.types";
import { GradingStatusBadge } from "../GradingStatusBadge";
import { JudgeSubmissionProgressCell } from "../JudgeSubmissionProgressCell";

interface JudgeSubmissionTableProps {
  submissions: JudgeSubmissionAssignmentResponse[];
}

export const JudgeSubmissionTable = ({ submissions }: JudgeSubmissionTableProps) => {
  const navigate = useNavigate();

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-slate-50 p-12 text-center">
        <p className="text-gray-500 font-medium">No assigned submissions yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="border-b border-gray-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-6 py-4">Team</th>
            <th className="px-6 py-4">Project title</th>
            <th className="px-6 py-4">Track</th>
            <th className="px-6 py-4">Round</th>
            <th className="px-6 py-4">Submission status</th>
            <th className="px-6 py-4">Grading status</th>
            <th className="px-6 py-4">Progress</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {submissions.map((sub) => {
            const isLocked = sub.roundSubmissionLocked;

            let actionLabel = "View";
            let actionDest = `/judge/submissions/${sub.submissionId}`;

            if (sub.gradingStatus === "PENDING" || sub.gradingStatus === "READY") {
              actionLabel = "Start scoring";
              actionDest = `/judge/submissions/${sub.submissionId}/score`;
            } else if (sub.gradingStatus === "GRADED") {
              actionLabel = "View score";
              actionDest = `/judge/submissions/${sub.submissionId}`;
            }

            if (isLocked) {
              actionLabel = "View readonly";
              actionDest = `/judge/submissions/${sub.submissionId}`;
            }

            return (
              <tr
                key={sub.submissionId}
                onClick={() => navigate(`/judge/submissions/${sub.submissionId}`)}
                className="transition-colors hover:bg-slate-50 cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-semibold text-gray-900">
                    {isLocked && <LockOutlinedIcon fontSize="small" className="text-gray-400" />}
                    {sub.teamName || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4">{sub.projectTitle || "N/A"}</td>
                <td className="px-6 py-4">{sub.trackName || "N/A"}</td>
                <td className="px-6 py-4">{sub.roundName || "N/A"}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold uppercase">
                    {sub.submissionStatus || "UNKNOWN"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <GradingStatusBadge status={sub.gradingStatus} />
                </td>
                <td className="px-6 py-4">
                  <JudgeSubmissionProgressCell
                    confirmedScoreCount={sub.confirmedScoreCount}
                    criteriaCount={sub.criteriaCount}
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(actionDest);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {actionLabel}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
