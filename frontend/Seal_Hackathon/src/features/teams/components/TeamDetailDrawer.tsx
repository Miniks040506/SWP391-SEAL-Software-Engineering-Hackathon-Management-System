import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { teamApi } from "@/api/team.api";
import { submissionApi } from "@/api/submission.api";
import type { UUID } from "@/types/common.types";
import type { CoordinatorTeamDetailResponse } from "@/types/team.types";
import type { SubmissionDetailResponse } from "@/types/submission.types";
import {
  formatTeamStatusLabel,
  getTeamRegistrationStatusColor,
  getTeamStatusColor,
  getSubmissionStatusColor,
} from "../schemas/teams.schema";
import { useCoordinatorRegistrationReview } from "../hooks/useCoordinatorRegistrationReview";
import { TeamSubmissionProgressGrid } from "./TeamSubmissionProgressGrid";
import { SubmissionLinksPreview } from "@/features/submissions/components/SubmissionLinksPreview";
import { DisqualifySubmissionDialog } from "@/features/disqualification/components/DisqualifySubmissionDialog";
import { useDisqualifySubmissionMutation } from "@/features/disqualification/hooks/useDisqualificationQueries";
import type { DisqualifyFormValues } from "@/features/disqualification/schemas/disqualification.schema";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  teamId: UUID;
  onClose: () => void;
  onChanged?: () => void;
};

type ReviewAction = "approve" | "reject";

export function TeamDetailDrawer({ teamId, onClose, onChanged }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [detail, setDetail] = useState<CoordinatorTeamDetailResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { approve, reject, reviewingTeamId, error, clearError } =
    useCoordinatorRegistrationReview();

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<UUID | null>(
    null,
  );
  const [submissionDetail, setSubmissionDetail] =
    useState<SubmissionDetailResponse | null>(null);
  const [loadingSubmissionDetail, setLoadingSubmissionDetail] = useState(false);

  const [disqualifySubmissionId, setDisqualifySubmissionId] =
    useState<UUID | null>(null);
  const disqualifyMutation = useDisqualifySubmissionMutation();
  const queryClient = useQueryClient();

  const isReviewing = Boolean(detail && reviewingTeamId === detail.teamId);
  const canReviewRegistration =
    detail?.registrationStatus?.toUpperCase() === "PENDING_APPROVAL";

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    if (!teamId) return;

    setSelectedSubmissionId(null);
    setSubmissionDetail(null);

    setLoading(true);

    teamApi
      .getCoordinatorTeamSummary(teamId)
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

  const handleViewSubmission = async (subId: UUID) => {
    setSelectedSubmissionId(subId);
    setLoadingSubmissionDetail(true);
    try {
      const res = await submissionApi.getSubmissionAdminView(subId);
      setSubmissionDetail(res);
    } catch {
      setSubmissionDetail(null);
    } finally {
      setLoadingSubmissionDetail(false);
    }
  };

  const handleBackToTeam = () => {
    setSelectedSubmissionId(null);
    setSubmissionDetail(null);
  };

  const handleOpenReviewDialog = (action: ReviewAction) => {
    clearError();
    setRejectReason("");
    setReviewAction(action);
  };

  const handleCloseReviewDialog = () => {
    clearError();
    setRejectReason("");
    setReviewAction(null);
  };

  const handleDisqualify = async (values: DisqualifyFormValues) => {
    if (!disqualifySubmissionId) return;
    const res = await disqualifyMutation.mutateAsync({
      submissionId: disqualifySubmissionId,
      payload: values,
    });

    try {
      const updated = await teamApi.getCoordinatorTeamSummary(teamId);
      setDetail(updated);
    } catch {
      setDetail(null);
    }

    onChanged?.();
    queryClient.invalidateQueries({ queryKey: ["coordinator-team-detail"] });
    return res;
  };

  const handleSubmitRegistrationReview = async () => {
    if (!detail || !reviewAction) return;

    try {
      const updated =
        reviewAction === "approve"
          ? await approve(detail.teamId)
          : await reject(detail.teamId, rejectReason);
      setDetail(updated);
      onChanged?.();
      enqueueSnackbar(
        reviewAction === "approve"
          ? "Team registration approved."
          : "Team registration rejected.",
        { variant: reviewAction === "approve" ? "success" : "info" },
      );
      handleCloseReviewDialog();
    } catch {
      // The hook exposes the displayable error message.
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm z-60 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full md:w-150 bg-white dark:bg-slate-900 shadow-2xl z-70 overflow-y-auto transform transition-transform flex flex-col border-l border-slate-200 dark:border-slate-800">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {selectedSubmissionId ? "Submission Details" : "Team Details"}
          </h2>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex-1">
          {selectedSubmissionId ? (
            <div className="space-y-6">
              <button
                onClick={handleBackToTeam}
                className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-2"
              >
                ← Back to Team Details
              </button>

              {loadingSubmissionDetail ? (
                <div className="text-center text-slate-500 dark:text-slate-400 mt-10 text-sm">
                  Loading submission details...
                </div>
              ) : submissionDetail ? (
                <>
                  <section className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Overview
                      </h3>
                      <span
                        className={`px-2.5 py-1 rounded-md border text-xs font-bold ${getSubmissionStatusColor(
                          submissionDetail.status,
                        )}`}
                      >
                        {submissionDetail.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Submission ID
                        </p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate font-mono">
                          {submissionDetail.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Attempt Number
                        </p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {submissionDetail.submissionNumber}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Submitted At
                        </p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {submissionDetail.submittedAt
                            ? new Date(
                                submissionDetail.submittedAt,
                              ).toLocaleString()
                            : "Not submitted yet"}
                        </p>
                      </div>
                      {submissionDetail.roundSubmissionLocked && (
                        <div className="col-span-2 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Round Submission Locked
                          </p>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            Locked at{" "}
                            {submissionDetail.roundSubmissionLockedAt
                              ? new Date(
                                  submissionDetail.roundSubmissionLockedAt,
                                ).toLocaleString()
                              : "Unknown time"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700 space-y-3">
                      {(() => {
                        const isScorable =
                          submissionDetail.status === "SUBMITTED" ||
                          submissionDetail.status === "LATE";
                        const isEliminated =
                          detail?.status === "ELIMINATED" ||
                          detail?.status === "DISQUALIFIED";
                        const disabled = !isScorable || isEliminated;

                        const button = (
                          <span className="w-full block">
                            <Button
                              fullWidth
                              variant="contained"
                              color="error"
                              disabled={disabled}
                              onClick={() =>
                                !disabled &&
                                setDisqualifySubmissionId(submissionDetail.id)
                              }
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                py: 1,
                              }}
                            >
                              Disqualify submission
                            </Button>
                          </span>
                        );

                        if (disabled) {
                          return (
                            <Tooltip
                              title={
                                isEliminated
                                  ? "This team has already been disqualified."
                                  : "Only submitted submissions can be disqualified."
                              }
                              arrow
                              placement="top"
                            >
                              {button}
                            </Tooltip>
                          );
                        }

                        return button;
                      })()}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Deliverable Links
                    </h3>
                    <SubmissionLinksPreview
                      links={submissionDetail.links || []}
                    />
                  </section>

                  {submissionDetail.note && (
                    <section>
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        Submitter Note
                      </h3>
                      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl text-sm text-amber-900 dark:text-amber-200 whitespace-pre-wrap leading-relaxed">
                        {submissionDetail.note}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400 mt-10 text-sm">
                  Failed to load submission details.
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 text-sm">
              Loading team details...
            </div>
          ) : detail ? (
            <div className="space-y-6">
              <section className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    TEAM OVERVIEW
                  </h3>

                  <div className="flex flex-wrap justify-end gap-2">
                    {detail.status && (
                      <span
                        className={`px-2.5 py-1 rounded-md border text-xs font-bold ${getTeamStatusColor(
                          detail.status,
                        )}`}
                      >
                        Team: {formatTeamStatusLabel(detail.status)}
                      </span>
                    )}
                    {detail.registrationStatus && (
                      <span
                        className={`px-2.5 py-1 rounded-md border text-xs font-bold ${getTeamRegistrationStatusColor(
                          detail.registrationStatus,
                        )}`}
                      >
                        Registration:{" "}
                        {formatTeamStatusLabel(detail.registrationStatus)}
                      </span>
                    )}
                  </div>
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
                      {detail.leaderName ||
                        detail.members?.find((m) => m.role === "LEADER")
                          ?.fullName ||
                        "Unassigned"}
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

                {detail.registrationStatus && (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Registration Review
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {formatTeamStatusLabel(detail.registrationStatus)}
                        </p>
                        {detail.registrationReviewedAt && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Reviewed by{" "}
                            {detail.registrationReviewedByName || "Coordinator"}{" "}
                            at{" "}
                            {new Date(
                              detail.registrationReviewedAt,
                            ).toLocaleString()}
                          </p>
                        )}
                        {detail.registrationRejectionReason && (
                          <p className="mt-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                            Reason: {detail.registrationRejectionReason}
                          </p>
                        )}
                      </div>

                      {canReviewRegistration && (
                        <div className="flex w-full gap-2 mt-2">
                          <button
                            disabled={isReviewing}
                            onClick={() => handleOpenReviewDialog("approve")}
                            className="flex-1 py-2.5 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 font-semibold rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Approve
                          </button>
                          <button
                            disabled={isReviewing}
                            onClick={() => handleOpenReviewDialog("reject")}
                            className="flex-1 py-2.5 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-700 font-semibold rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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

                <TeamSubmissionProgressGrid
                  submissions={detail.submissions}
                  teamStatus={detail.status}
                  onSelectSubmission={handleViewSubmission}
                  onDisqualifySubmission={(id) => setDisqualifySubmissionId(id)}
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

      <Dialog
        open={Boolean(reviewAction)}
        onClose={isReviewing ? undefined : handleCloseReviewDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          {reviewAction === "approve"
            ? "Approve registration"
            : "Reject registration"}
        </DialogTitle>
        <DialogContent dividers className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {reviewAction === "approve"
              ? `Approve ${detail?.teamName || "this team"} for the selected event track?`
              : `Reject ${detail?.teamName || "this team"} and provide the reason shown to coordinators later.`}
          </p>

          {reviewAction === "reject" && (
            <TextField
              autoFocus
              required
              fullWidth
              multiline
              minRows={3}
              label="Rejection reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              disabled={isReviewing}
            />
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCloseReviewDialog}
            disabled={isReviewing}
            sx={{ fontWeight: 800, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={reviewAction === "reject" ? "error" : "success"}
            onClick={handleSubmitRegistrationReview}
            disabled={
              isReviewing || (reviewAction === "reject" && !rejectReason.trim())
            }
            sx={{ fontWeight: 800, textTransform: "none" }}
          >
            {isReviewing
              ? "Saving..."
              : reviewAction === "approve"
                ? "Approve"
                : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {disqualifySubmissionId && (
        <DisqualifySubmissionDialog
          open={Boolean(disqualifySubmissionId)}
          onClose={() => setDisqualifySubmissionId(null)}
          submissionId={disqualifySubmissionId}
          isPending={disqualifyMutation.isPending}
          onConfirm={handleDisqualify}
        />
      )}
    </>
  );
}
