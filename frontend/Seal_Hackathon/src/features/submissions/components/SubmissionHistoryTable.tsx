import type { SubmissionHistoryEntry } from "@/types/submission.types";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";

type Props = {
  history: SubmissionHistoryEntry[];
};

export function SubmissionHistoryTable({ history }: Props) {
  if (!history.length) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500 italic py-4 text-center">
        No submission history yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">#</th>
            <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted At</th>
            <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Links</th>
            <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/50">
          {history.map((entry) => (
            <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                #{entry.submissionNumber}
              </td>
              <td className="px-4 py-3">
                <SubmissionStatusBadge status={entry.status} size="sm" />
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                {entry.submittedAt ? new Date(entry.submittedAt).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                {entry.linkCount} link{entry.linkCount !== 1 ? "s" : ""}
              </td>
              <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                {entry.note || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}