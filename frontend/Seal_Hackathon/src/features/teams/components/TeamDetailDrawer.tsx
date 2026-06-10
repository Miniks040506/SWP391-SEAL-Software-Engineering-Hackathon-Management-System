import { useEffect, useState } from "react";
import { teamApi } from "@/api/team.api";
import type { UUID } from "@/types/common.types";
import type { TeamDetailResponse } from "@/types/team.types";
import { getTeamStatusColor } from "../schemas/teams.schema";
import { TeamSubmissionProgressGrid } from "./TeamSubmissionProgressGrid";

type Props = {
  teamId: UUID;
  onClose: () => void;
};

export function TeamDetailDrawer({ teamId, onClose }: Props) {
  const [detail, setDetail] = useState<TeamDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!teamId) return;

    setLoading(true);

    teamApi
      .getTeamById(teamId)
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
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full md:w-150 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto transform transition-transform flex flex-col border-l border-slate-200 dark:border-slate-800">
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
              <section className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Overview
                  </h3>

                  <span
                    className={`px-2.5 py-1 rounded-md border text-xs font-bold ${getTeamStatusColor(
                      detail.status
                    )}`}
                  >
                    {detail.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Team Name
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {detail.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Leader
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {detail.leaderName}
                    </p>
                  </div>

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
                        key={member.userId}
                        className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50"
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
                          {member.memberRole}
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

                <TeamSubmissionProgressGrid
                  submissions={[]}
                />
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