import { useNavigate } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import type { CoordinatorSubmissionSummary } from "../hooks/useCoordinatorSubmissionQueries";
import { avatarColor } from "@/utils/avatarColor";

type Props = {
  submissions: CoordinatorSubmissionSummary[];
  loading: boolean;
};

const HEAD =
  "px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400";

/** Rich status pill styling, covering every coordinator submission status. */
function statusPill(status: string) {
  switch (status.toUpperCase()) {
    case "SUBMITTED":
      return "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400";
    case "LATE":
      return "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400";
    case "DRAFT":
      return "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400";
    case "DISQUALIFIED":
      return "border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400";
    case "MISSING":
      return "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400";
  }
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="sl-skeleton h-9 w-9 shrink-0 rounded-full" />
              <div className="space-y-1.5">
                <div className="sl-skeleton h-3 w-28 rounded" />
                <div className="sl-skeleton h-2.5 w-36 rounded" />
              </div>
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="sl-skeleton h-3 w-24 rounded" />
          </td>
          <td className="px-4 py-4">
            <div className="sl-skeleton h-6 w-20 rounded-lg" />
          </td>
          <td className="px-4 py-4">
            <div className="sl-skeleton h-3 w-28 rounded" />
          </td>
          <td className="px-4 py-4">
            <div className="sl-skeleton h-3 w-8 rounded" />
          </td>
          <td className="px-4 py-4" />
        </tr>
      ))}
    </>
  );
}

export function SubmissionTable({ submissions, loading }: Props) {
  const navigate = useNavigate();

  if (!loading && !submissions.length) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <InboxOutlinedIcon />
        </span>
        <p className="text-base font-semibold text-slate-600 dark:text-slate-300">
          No submissions found
        </p>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
          Try adjusting your filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
            <th className={HEAD}>Team</th>
            <th className={HEAD}>Round / Track</th>
            <th className={HEAD}>Status</th>
            <th className={`${HEAD} whitespace-nowrap`}>Submitted At</th>
            <th className={`${HEAD} whitespace-nowrap`}>Attempt</th>
            <th className={`${HEAD} text-right`}>
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white dark:divide-slate-800/50 dark:bg-transparent">
          {loading ? (
            <SkeletonRows />
          ) : (
            submissions.map((sub, i) => {
              const initial = (sub.teamName || "?").charAt(0);
              return (
                <tr
                  key={sub.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/coordinator/submissions/${sub.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/coordinator/submissions/${sub.id}`);
                    }
                  }}
                  className="sl-row sl-row-hover group cursor-pointer outline-none hover:bg-blue-50/50 focus-visible:bg-blue-50/60 dark:hover:bg-slate-800/50 dark:focus-visible:bg-slate-800/60"
                  style={{ animationDelay: `${Math.min(i * 35, 400)}ms` }}
                >
                  {/* Team */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor(initial)}`}
                      >
                        {initial.toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {sub.teamName || "Unknown team"}
                        </div>
                        {sub.projectTitle && (
                          <div
                            className="max-w-[240px] truncate text-xs text-slate-400 dark:text-slate-500"
                            title={sub.projectTitle}
                          >
                            {sub.projectTitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Round / Track */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {sub.roundName}
                    </div>
                    {sub.trackName && (
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {sub.trackName}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${statusPill(sub.status)}`}
                      >
                        {sub.status}
                      </span>
                      {sub.roundSubmissionLocked && (
                        <span
                          title="Round submission window is locked"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-1 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
                        >
                          <LockOutlinedIcon sx={{ fontSize: 13 }} /> Locked
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Submitted At */}
                  <td className="px-4 py-4">
                    <div className="whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-400">
                      {sub.submittedAt
                        ? new Date(sub.submittedAt).toLocaleDateString()
                        : "—"}
                    </div>
                    {sub.submittedAt && (
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(sub.submittedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </td>

                  {/* Attempt + links */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                        #{sub.submissionNumber}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                        <LinkOutlinedIcon sx={{ fontSize: 13 }} />
                        {sub.linkCount}
                      </span>
                    </div>
                  </td>

                  {/* Open affordance */}
                  <td className="px-4 py-4 text-right">
                    <span className="sl-chevron inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm dark:text-slate-500 dark:group-hover:bg-slate-700 dark:group-hover:text-blue-400">
                      <ChevronRightIcon fontSize="small" />
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
