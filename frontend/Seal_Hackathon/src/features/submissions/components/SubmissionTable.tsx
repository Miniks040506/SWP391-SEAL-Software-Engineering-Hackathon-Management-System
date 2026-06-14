import { useNavigate } from "react-router-dom";
import type { CoordinatorSubmissionSummary } from "../hooks/useCoordinatorSubmissionQueries";
import { getSubmissionStatusColor } from "../schemas/submissions.schema";

type Props = {
  submissions: CoordinatorSubmissionSummary[];
  loading: boolean;
};

export function SubmissionTable({ submissions, loading }: Props) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading submissions...</p>
      </div>
    );
  }

  if (!submissions.length) {
    return (
      <div className="py-24 text-center">
        <p className="text-base font-medium text-slate-500 dark:text-slate-400">No submissions found.</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <th className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Team</th>
            <th className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Round / Track</th>
            <th className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted At</th>
            <th className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">#</th>
            <th className="px-6 py-5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 bg-white dark:bg-slate-900/50">
          {submissions.map((sub) => (
            <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{sub.teamName}</div>
                {(sub as any).projectTitle && (
                  <div 
                    className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-62.5" 
                    title={(sub as any).projectTitle}
                  >
                    Project: {(sub as any).projectTitle}
                  </div>
                )}
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">ID: {sub.teamId.substring(0, 8)}...</div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{sub.roundName}</div>
                {sub.trackName && <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub.trackName}</div>}
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-lg border ${getSubmissionStatusColor(sub.status)}`}>
                  {sub.status}
                </span>
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-400">
                {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "—"}
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-400">
                {sub.submissionNumber}
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => navigate(`/coordinator/submissions/${sub.id}`)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-sm px-4 py-2 rounded-lg transition-all"
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