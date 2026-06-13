import { useState, useEffect } from "react";
import { useSubmissionAdminDetailQuery } from "../hooks/useCoordinatorSubmissionQueries";
import { SubmissionLinksPreview } from "./SubmissionLinksPreview";
import { getSubmissionStatusColor } from "../schemas/submissions.schema";
import { getTeamStatusColor } from "@/features/teams/schemas/teams.schema";
import { teamApi } from "@/api/team.api";
import type { UUID } from "@/types/common.types";
import type { TeamDetailResponse } from "@/types/team.types";

type Props = {
  submissionId: UUID;
  onClose: () => void;
};

export function SubmissionDetailDrawer({ submissionId, onClose }: Props) {
  const { detail, loading } = useSubmissionAdminDetailQuery(submissionId);

  const [isViewingTeam, setIsViewingTeam] = useState(false);
  const [teamDetail, setTeamDetail] = useState<TeamDetailResponse | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    setIsViewingTeam(false);
    setTeamDetail(null);
  }, [submissionId]);

  const handleViewTeamDetails = async () => {
    const actualTeamId =
      detail?.teamId ||
      (detail as unknown as { team?: { id: string } })?.team?.id;
    if (!actualTeamId) return;
    setIsViewingTeam(true);

    if (teamDetail && teamDetail.id === actualTeamId) return;

    setLoadingTeam(true);
    try {
      const res = await teamApi.getTeamById(actualTeamId);
      setTeamDetail(res);
    } catch (error) {
      console.error("Failed to fetch team details", error);
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleBackToSubmission = () => {
    setIsViewingTeam(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full md:w-150 bg-white dark:bg-slate-900 shadow-2xl z-[70] overflow-y-auto transform transition-transform flex flex-col border-l border-slate-200 dark:border-slate-800">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {isViewingTeam ? "Team Details" : "Submission Details"}
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
              Loading submission details...
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {isViewingTeam ? (
                <>
                  <button
                    onClick={handleBackToSubmission}
                    className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-2"
                  >
                    ← Back to Submission Details
                  </button>

                  {loadingTeam ? (
                    <div className="text-center text-slate-500 dark:text-slate-400 mt-10 text-sm">
                      Loading team details...
                    </div>
                  ) : teamDetail ? (
                    <>
                      <section className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Team Overview
                          </h3>
                          <span
                            className={`px-2.5 py-1 rounded-md border text-xs font-bold ${getTeamStatusColor(
                              teamDetail.status,
                            )}`}
                          >
                            {teamDetail.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                              Team Name
                            </p>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {teamDetail.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                              Leader
                            </p>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {teamDetail.leaderName}
                            </p>
                          </div>
                          {teamDetail.projectTitle && (
                            <div className="col-span-2">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Project Title
                              </p>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {teamDetail.projectTitle}
                              </p>
                            </div>
                          )}
                          {teamDetail.description && (
                            <div className="col-span-2">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Description
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {teamDetail.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </section>

                      <section>
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                          Members ({teamDetail.members?.length ?? 0})
                        </h3>
                        {teamDetail.members?.length ? (
                          <ul className="space-y-2">
                            {teamDetail.members.map((member) => (
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
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                          <div className="flex items-center justify-between mb-5">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              Current Submission
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-md border text-xs font-bold ${getSubmissionStatusColor(
                                detail.status,
                              )}`}
                            >
                              {detail.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-5">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Attempt Number
                              </p>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {detail.submissionNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Submitted At
                              </p>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {detail.submittedAt
                                  ? new Date(
                                      detail.submittedAt,
                                    ).toLocaleString()
                                  : "Not submitted yet"}
                              </p>
                            </div>
                            {detail.roundSubmissionLocked && (
                              <div className="col-span-2 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                  Round Submission Locked
                                </p>
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                  Locked at{" "}
                                  {detail.roundSubmissionLockedAt
                                    ? new Date(
                                        detail.roundSubmissionLockedAt,
                                      ).toLocaleString()
                                    : "Unknown time"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </section>
                    </>
                  ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400 mt-10 text-sm">
                      Failed to load team details.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <section className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Overview
                      </h3>
                      <span
                        className={`px-2.5 py-1 rounded-md border text-xs font-bold ${getSubmissionStatusColor(
                          detail.status,
                        )}`}
                      >
                        {detail.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Submission ID
                        </p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate font-mono">
                          {detail.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Attempt Number
                        </p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {detail.submissionNumber}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Submitted At
                        </p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {detail.submittedAt
                            ? new Date(detail.submittedAt).toLocaleString()
                            : "Not submitted yet"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={handleViewTeamDetails}
                        className="w-full py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-600 font-semibold rounded-lg transition-colors text-sm"
                      >
                        View Team Details →
                      </button>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Deliverable Links
                    </h3>
                    <SubmissionLinksPreview links={detail.links || []} />
                  </section>

                  {detail.note && (
                    <section>
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        Submitter Note
                      </h3>
                      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl text-sm text-amber-900 dark:text-amber-200 whitespace-pre-wrap leading-relaxed">
                        {detail.note}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-400 mt-10 text-sm">
              Failed to load submission details.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
