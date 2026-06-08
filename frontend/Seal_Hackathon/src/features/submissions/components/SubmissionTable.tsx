import { useNavigate } from "react-router-dom";
import type { CoordinatorSubmissionSummary } from "@/types/submission.types";
import { getSubmissionStatusColor } from "../schemas/submissions.schema";

type Props = {
  submissions: CoordinatorSubmissionSummary[];
  loading: boolean;
};

export function SubmissionTable({ submissions, loading }: Props) {
  const navigate = useNavigate();

  if (loading) {
    return <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">Loading submissions...</div>;
  }

  if (!submissions.length) {
    return <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">No submissions found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Team</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Round / Track</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted At</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {submissions.map((sub) => (
            <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{sub.teamName}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">ID: {sub.teamId.substring(0, 8)}...</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-800 dark:text-slate-200">{sub.roundName}</div>
                {sub.trackName && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub.trackName}</div>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-md border ${getSubmissionStatusColor(sub.status)}`}>
                  {sub.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => navigate(`/coordinator/submissions/${sub.id}`)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-md transition-colors"
                >
                  View Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}