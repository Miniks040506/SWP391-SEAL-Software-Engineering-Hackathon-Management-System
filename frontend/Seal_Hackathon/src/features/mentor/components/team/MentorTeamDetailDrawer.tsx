import { useEffect, useState } from "react";
import { teamApi } from "@/api/team.api";
import type { UUID } from "@/types/common.types";
import type { MentorTeamDetailResponse } from "@/types/team.types";
import { getTeamStatusColor, getSubmissionStatusColor } from "@/features/teams/schemas/teams.schema";

type Props = {
  teamId: UUID;
  onClose: () => void;
};

export function MentorTeamDetailDrawer({ teamId, onClose }: Props) {
  const [detail, setDetail] = useState<MentorTeamDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    if (!teamId) return;

    setLoading(true);

    teamApi
      .getAssignedTeamDetails(teamId)
      .then((teamRes) => {
        setDetail(teamRes);
      })
      .catch(() => {
        setDetail(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [teamId]);

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm z-60 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full md:w-150 bg-white dark:bg-slate-900 shadow-2xl z-70 overflow-y-auto transform transition-transform flex flex-col border-l border-slate-200 dark:border-slate-800">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Team Details
          </h2>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 text-sm">
              Loading team details...
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {/* Header and Stats */}
              <section className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    TEAM OVERVIEW
                  </h3>

                  {detail.status && (
                    <span
                      className={`px-2.5 py-1 rounded-md border text-xs font-bold ${getTeamStatusColor(
                        detail.status,
                      )}`}
                    >
                      {detail.status}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Team Name
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {detail.teamName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Leader
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {detail.leaderName || detail.members?.find((m) => m.role === "LEADER")?.fullName || "Unassigned"}
                    </p>
                  </div>

                  {detail.leaderEmail && (
                    <div className="col-span-2">
                       <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Leader Email
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {detail.leaderEmail}
                      </p>
                    </div>
                  )}

                  {detail.projectTitle && (
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Project Title
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {detail.projectTitle}
                      </p>
                    </div>
                  )}

                  {detail.description && (
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Description
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {detail.description}
                      </p>
                    </div>
                  )}

                  <div className="col-span-2 border-t border-slate-200 dark:border-slate-700/50 pt-3 mt-1 grid grid-cols-2 gap-5">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Event
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {detail.eventName || "No event"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Track
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {detail.trackName || "No track"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 grid grid-cols-3 gap-4 text-center">
                 <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Submissions</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{detail.submissionCount}</p>
                 </div>
                 <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Submitted</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{detail.submittedSubmissionCount}</p>
                 </div>
                 <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Missing</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{detail.missingSubmissionCount}</p>
                 </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Members ({detail.members?.length ?? 0})
                </h3>

                {detail.members?.length ? (
                  <ul className="space-y-2">
                    {detail.members.map((member) => (
                      <li
                        key={member.memberId}
                        className="flex items-start justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {member.fullName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {member.email}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 uppercase">
                          {member.role || "MEMBER"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No members found.
                  </p>
                )}
              </section>

              <section>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Submission Progress
                </h3>

                {detail.submissions?.length ? (
                  <div className="space-y-3">
                    {detail.submissions.map((sub, idx) => (
                      <div
                        key={sub.roundId || idx}
                        className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {sub.roundName || "Unknown Round"}
                          </h4>
                          {sub.submissionStatus && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ml-2 ${getSubmissionStatusColor(
                                sub.submissionStatus,
                              )}`}
                            >
                              {sub.submissionStatus}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 mt-auto">
                           <div className="flex justify-between text-xs">
                             <span className="text-slate-500 dark:text-slate-400">Round Status</span>
                             <span className="font-medium text-slate-700 dark:text-slate-300">{sub.roundStatus || "-"}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                             <span className="text-slate-500 dark:text-slate-400">Attempt Number</span>
                             <span className="font-medium text-slate-700 dark:text-slate-300">{sub.submissionNumber || "-"}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                             <span className="text-slate-500 dark:text-slate-400">Submitted</span>
                             <span className="font-medium text-slate-700 dark:text-slate-300">
                                {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "-"}
                             </span>
                           </div>
                           <div className="flex justify-between text-xs">
                             <span className="text-slate-500 dark:text-slate-400">Links</span>
                             <span className="font-medium text-slate-700 dark:text-slate-300">{sub.linkCount || 0}</span>
                           </div>
                        </div>

                        {sub.note && (
                           <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                             {sub.note}
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No submissions found.
                  </p>
                )}
              </section>
            </div>
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-400 mt-10 text-sm">
              Failed to load team details.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
