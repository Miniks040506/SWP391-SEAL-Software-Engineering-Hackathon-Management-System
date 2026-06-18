import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";

import { teamApi } from "@/api/team.api";
import {
  getTeamStatusColor,
  getSubmissionStatusColor,
} from "@/features/teams/schemas/teams.schema";
import {
  useMentorTeamFeedbackQuery,
  useCreateMentorFeedbackMutation,
} from "../hooks/useMentorFeedback";
import type {
  MentorFeedbackCategory,
  MentorFeedbackResponse,
} from "@/types/mentorFeedback.types";

export function MentorTeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ["mentor-team-detail", teamId],
    queryFn: () => teamApi.getAssignedTeamDetails(teamId as string),
    enabled: !!teamId,
  });

  const { data: rawFeedbacks } = useMentorTeamFeedbackQuery(teamId);
  const feedbacks = (rawFeedbacks as MentorFeedbackResponse[]) ?? [];
  const createFeedbackMut = useCreateMentorFeedbackMutation();

  const [addingFeedbackForRoundId, setAddingFeedbackForRoundId] = useState<
    string | null
  >(null);
  const [newFeedbackContent, setNewFeedbackContent] = useState("");
  const [newFeedbackCategory, setNewFeedbackCategory] =
    useState<MentorFeedbackCategory>("GENERAL");
  const [newFeedbackPublish, setNewFeedbackPublish] = useState(false);
  const [newFeedbackVisibleToTeam, setNewFeedbackVisibleToTeam] =
    useState(false);

  const handleOpenForm = (roundId: string) => {
    setAddingFeedbackForRoundId(roundId);
    setNewFeedbackContent("");
    setNewFeedbackCategory("GENERAL");
    setNewFeedbackPublish(false);
    setNewFeedbackVisibleToTeam(false);
  };

  const handleCloseForm = () => {
    setAddingFeedbackForRoundId(null);
  };

  const handleSubmitFeedback = (submissionId: string, roundId: string) => {
    if (!teamId || !newFeedbackContent.trim()) return;

    createFeedbackMut.mutate(
      {
        teamId,
        payload: {
          submissionId,
          roundId,
          content: newFeedbackContent,
          category: newFeedbackCategory,
          publish: newFeedbackPublish,
          visibleToTeam: newFeedbackVisibleToTeam,
        },
      },
      {
        onSuccess: () => {
          handleCloseForm();
        },
      },
    );
  };

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/mentor/teams")}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 block"
          >
            ← Back to Teams
          </button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">
            Team Details
          </h1>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400 text-sm">
              Loading team details...
            </div>
          ) : detail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                  {/* Team Overview Card */}
                  <section className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 h-full">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                      {detail.leaderEmail && (
                        <div className="col-span-1 md:col-span-2">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Leader Email
                          </p>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {detail.leaderEmail}
                          </p>
                        </div>
                      )}

                      {detail.projectTitle && (
                        <div className="col-span-1 md:col-span-2">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Project Title
                          </p>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {detail.projectTitle}
                          </p>
                        </div>
                      )}

                      {detail.description && (
                        <div className="col-span-1 md:col-span-2">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Description
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {detail.description}
                          </p>
                        </div>
                      )}

                      <div className="col-span-1 md:col-span-2 border-t border-slate-200 dark:border-slate-700/50 pt-3 mt-1 grid grid-cols-2 gap-5">
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
                </div>

                {/* Right Column */}
                <div className="col-span-1 space-y-6">
                  {/* Members Card */}
                  <section className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                      Members ({detail.members?.length ?? 0})
                    </h3>

                    {detail.members?.length ? (
                      <ul className="space-y-3">
                        {detail.members.map((member) => (
                          <li
                            key={member.memberId}
                            className="flex items-start justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {member.fullName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {member.email}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 uppercase shrink-0">
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

                  {/* Submission Stats Card */}
                  <section className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                      Submission Stats
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                          {detail.submissionCount}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mt-1">
                          Total
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200 dark:border-green-800/30 shadow-sm">
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {detail.submittedSubmissionCount}
                        </p>
                        <p className="text-[10px] font-semibold text-green-600/70 dark:text-green-400/70 uppercase mt-1">
                          Submitted
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-800/30 shadow-sm">
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                          {detail.missingSubmissionCount}
                        </p>
                        <p className="text-[10px] font-semibold text-red-600/70 dark:text-red-400/70 uppercase mt-1">
                          Missing
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Submission Progress */}
                <section className="col-span-1 lg:col-span-3 w-full">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Submission Progress
                  </h3>

                  {detail.submissions?.length ? (
                    <div className="flex flex-col gap-4 w-full">
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
                              <span className="text-slate-500 dark:text-slate-400">
                                Round Status
                              </span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {sub.roundStatus || "-"}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 dark:text-slate-400">
                                Attempt Number
                              </span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {sub.submissionNumber || "-"}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 dark:text-slate-400">
                                Submitted
                              </span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {sub.submittedAt
                                  ? new Date(
                                      sub.submittedAt,
                                    ).toLocaleDateString()
                                  : "-"}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 dark:text-slate-400">
                                Links
                              </span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {sub.linkCount || 0}
                              </span>
                            </div>
                          </div>

                          {/* Mentor Feedback Section for this round */}
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                              Mentor Feedback
                            </h5>

                            <div className="space-y-3 mb-4">
                              {(() => {
                                const roundFeedbacks = feedbacks.filter(
                                  (f) => f.roundId === sub.roundId,
                                );
                                if (roundFeedbacks.length === 0) {
                                  return addingFeedbackForRoundId !==
                                    sub.roundId ? (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                                      No feedback for this round yet
                                    </p>
                                  ) : null;
                                }
                                return roundFeedbacks.map((fb) => (
                                  <div
                                    key={fb.id}
                                    className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                          {fb.mentorName || "Unknown Mentor"}
                                        </span>
                                        {fb.category && (
                                          <span className="text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                            {fb.category}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                            fb.visibility === "PUBLISHED"
                                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
                                              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                          }`}
                                        >
                                          {fb.visibility || "DRAFT"}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                      {fb.content}
                                    </p>
                                    <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 text-right">
                                      {new Date(fb.createdAt).toLocaleString()}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>

                            {addingFeedbackForRoundId === sub.roundId && (
                              <div className="mt-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4">
                                <FormControl fullWidth size="small">
                                  <InputLabel
                                    id={`category-label-${sub.roundId}`}
                                    sx={{ fontSize: "12px" }}
                                  >
                                    Category
                                  </InputLabel>
                                  <Select
                                    labelId={`category-label-${sub.roundId}`}
                                    value={newFeedbackCategory}
                                    label="Category"
                                    onChange={(e) =>
                                      setNewFeedbackCategory(
                                        e.target
                                          .value as MentorFeedbackCategory,
                                      )
                                    }
                                    sx={{ fontSize: "14px" }}
                                  >
                                    <MenuItem value="GENERAL">GENERAL</MenuItem>
                                    <MenuItem value="TECHNICAL">
                                      TECHNICAL
                                    </MenuItem>
                                    <MenuItem value="PROCESS">PROCESS</MenuItem>
                                    <MenuItem value="PRESENTATION">
                                      PRESENTATION
                                    </MenuItem>
                                  </Select>
                                </FormControl>

                                <TextField
                                  fullWidth
                                  multiline
                                  rows={4}
                                  label="Content"
                                  placeholder="Write your feedback here..."
                                  value={newFeedbackContent}
                                  onChange={(e) =>
                                    setNewFeedbackContent(e.target.value)
                                  }
                                  required
                                  size="small"
                                  slotProps={{
                                    input: { style: { fontSize: "14px" } },
                                    inputLabel: { style: { fontSize: "12px" } },
                                  }}
                                />

                                <div className="flex items-center gap-4">
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={newFeedbackVisibleToTeam}
                                        onChange={(e) =>
                                          setNewFeedbackVisibleToTeam(
                                            e.target.checked,
                                          )
                                        }
                                        color="primary"
                                        size="small"
                                      />
                                    }
                                    label={
                                      <span className="text-sm text-slate-700 dark:text-slate-300">
                                        Visible to team
                                      </span>
                                    }
                                  />

                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={newFeedbackPublish}
                                        onChange={(e) =>
                                          setNewFeedbackPublish(
                                            e.target.checked,
                                          )
                                        }
                                        color="primary"
                                        size="small"
                                      />
                                    }
                                    label={
                                      <span className="text-sm text-slate-700 dark:text-slate-300">
                                        Publish immediately
                                      </span>
                                    }
                                  />
                                </div>
                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                  <Button
                                    variant="outlined"
                                    onClick={handleCloseForm}
                                    size="small"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                      handleSubmitFeedback(
                                        sub.submissionId as string,
                                        sub.roundId as string,
                                      )
                                    }
                                    disabled={
                                      createFeedbackMut.isPending ||
                                      !newFeedbackContent.trim()
                                    }
                                    size="small"
                                  >
                                    {createFeedbackMut.isPending
                                      ? "Saving..."
                                      : "Save Feedback"}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {addingFeedbackForRoundId !== sub.roundId && (
                              <Button
                                variant="outlined"
                                fullWidth
                                onClick={() =>
                                  handleOpenForm(sub.roundId as string)
                                }
                                sx={{
                                  marginTop: "16px",
                                  borderStyle: "dashed",
                                  textTransform: "none",
                                  borderColor: "divider",
                                  color: "primary.main",
                                  "&:hover": {
                                    borderStyle: "dashed",
                                    backgroundColor: "action.hover",
                                  },
                                }}
                              >
                                + Add Feedback
                              </Button>
                            )}
                          </div>
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
            </div>
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-400 py-10 text-sm">
              Failed to load team details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
