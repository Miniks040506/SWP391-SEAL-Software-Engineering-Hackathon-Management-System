import { useState } from "react";
import type { CSSProperties } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Button from "@mui/material/Button";

import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";

import { teamApi } from "@/api/team.api";
import { useMentorTeamFeedbackQuery } from "../hooks/useMentorFeedback";
import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

import { MentorPageHero } from "../components/common/MentorPageHero";
import { MentorStatTile } from "../components/common/MentorStatTile";

import "../styles/mentor.css";

/** Local pill helpers — no cross-feature schema imports. */
function getTeamStatusPill(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400";
    case "REGISTERED":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}

function getSubmissionStatusPill(status: string): string {
  switch (status) {
    case "SUBMITTED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400";
    case "DRAFT":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400";
    default:
      return "border-slate-300 bg-transparent text-slate-500 dark:border-slate-600 dark:text-slate-400";
  }
}

const NEUTRAL_PILL =
  "border-slate-200 bg-white/70 text-slate-600 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-300";

type RoundSubmission = NonNullable<
  Awaited<ReturnType<typeof teamApi.getAssignedTeamDetails>>["submissions"]
>[number];

type RoundJourneyNodeProps = {
  submission: RoundSubmission;
  feedbacks: MentorFeedbackResponse[];
  stagger: number;
  isLast: boolean;
};

/** One node of the round journey timeline, with a collapsible feedback thread. */
const RoundJourneyNode = ({
  submission: sub,
  feedbacks,
  stagger,
  isLast,
}: RoundJourneyNodeProps) => {
  const [open, setOpen] = useState(feedbacks.length > 0);
  const isJudging = sub.roundStatus === "JUDGING";

  return (
    <li className="relative pl-8">
      {!isLast && (
        <span className="absolute left-[5px] top-6 h-full w-px bg-slate-200 dark:bg-slate-700/80" />
      )}
      <span
        className={`absolute left-0 top-2.5 inline-block h-[11px] w-[11px] rounded-full ${
          sub.submissionStatus === "SUBMITTED"
            ? "bg-emerald-500"
            : isJudging
              ? "mt-live-dot bg-amber-500"
              : "bg-slate-300 dark:bg-slate-600"
        }`}
      />

      <div
        className={`mt-fade-up rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900 ${
          isJudging ? "mt-glow-amber" : ""
        }`}
        style={{ "--mt-stagger": stagger } as CSSProperties}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h4 className="font-black text-slate-950 dark:text-white">
              {sub.roundName || "Unknown Round"}
            </h4>
            {sub.submissionStatus && (
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getSubmissionStatusPill(sub.submissionStatus)}`}
              >
                {sub.submissionStatus}
              </span>
            )}
            {isJudging && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                JUDGING
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Round Status
            </p>
            <p className="mt-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              {sub.roundStatus || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Attempt
            </p>
            <p className="mt-0.5 text-xs font-bold tabular-nums text-slate-700 dark:text-slate-300">
              {sub.submissionNumber || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Submitted
            </p>
            <p className="mt-0.5 text-xs font-bold tabular-nums text-slate-700 dark:text-slate-300">
              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Links
            </p>
            <p className="mt-0.5 text-xs font-bold tabular-nums text-slate-700 dark:text-slate-300">
              {sub.linkCount || 0}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            className="flex cursor-pointer items-center gap-1.5 rounded text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ExpandMoreOutlinedIcon
              sx={{ fontSize: 18 }}
              className={`mt-chevron ${open ? "mt-open" : ""}`}
            />
            {feedbacks.length}{" "}
            {feedbacks.length === 1 ? "feedback" : "feedbacks"} ·{" "}
            {open ? "hide" : "show"}
          </button>

          <div className={`mt-collapse ${open ? "mt-open" : ""}`}>
            <div>
              <div className="space-y-3 pt-3">
                {feedbacks.length === 0 ? (
                  <p className="text-xs italic text-slate-500 dark:text-slate-400">
                    No feedback for this round yet
                  </p>
                ) : (
                  feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="rounded-lg border border-slate-200 border-l-4 border-l-blue-500 bg-slate-50 p-3 dark:border-slate-700 dark:border-l-blue-500 dark:bg-slate-800/50"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {fb.mentorName || "Unknown Mentor"}
                          </span>
                          {fb.category && (
                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {fb.category}
                            </span>
                          )}
                        </div>
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                            fb.visibility === "PUBLISHED"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {fb.visibility || "DRAFT"}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300">
                        {fb.content}
                      </p>
                      <div className="mt-2 text-right text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(fb.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

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

  if (loadingDetail) {
    return (
      <div className="space-y-6">
        <div className="mt-shimmer h-44 rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="mt-shimmer h-64 rounded-3xl bg-slate-100 dark:bg-slate-800/60"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <ReportProblemOutlinedIcon className="mt-pop mb-4 text-4xl text-slate-400 dark:text-slate-500" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Failed to load team details.
          </p>
          <Button
            variant="outlined"
            onClick={() => navigate("/mentor/teams")}
            sx={{ mt: 3, borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
          >
            Back to Teams
          </Button>
        </div>
      </div>
    );
  }

  const totalCount = detail.submissionCount ?? 0;
  const submittedCount = detail.submittedSubmissionCount ?? 0;
  const fillPercent = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;
  const leaderName =
    detail.leaderName ||
    detail.members?.find((m) => m.role === "LEADER")?.fullName ||
    "Unassigned";

  return (
    <div className="space-y-6">
      <MentorPageHero
        backTo={{ label: "Back to Teams", onClick: () => navigate("/mentor/teams") }}
        eyebrow="Mentor · Team"
        title={detail.teamName}
        subtitle={detail.projectTitle || undefined}
        chips={
          <>
            {detail.status && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${getTeamStatusPill(detail.status)}`}
              >
                {detail.status}
              </span>
            )}
            {detail.eventName && (
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${NEUTRAL_PILL}`}>
                {detail.eventName}
              </span>
            )}
            {detail.trackName && (
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${NEUTRAL_PILL}`}>
                {detail.trackName}
              </span>
            )}
          </>
        }
        actions={
          <Button
            variant="contained"
            onClick={() => navigate(`/mentor/teams/${teamId}/scores`)}
            disabled={!teamId}
            sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
          >
            View published scores
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Roster */}
        <section
          className="mt-fade-up rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900"
          style={{ "--mt-stagger": 1 } as CSSProperties}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Roster ({detail.members?.length ?? 0})
          </h3>

          {detail.members?.length ? (
            <ul className="mt-4 space-y-3">
              {detail.members.map((member, index) => (
                <li
                  key={member.memberId}
                  className="mt-fade-up flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700/80 dark:bg-slate-800/50"
                  style={{ "--mt-stagger": 2 + index } as CSSProperties}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      {(member.fullName || "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                        {member.fullName}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${
                      member.role === "LEADER"
                        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
                        : "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {member.role || "MEMBER"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm italic text-slate-500 dark:text-slate-400">
              No members found.
            </p>
          )}
        </section>

        {/* Submission pulse */}
        <section
          className="mt-fade-up rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900"
          style={{ "--mt-stagger": 2 } as CSSProperties}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Submission Pulse
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <MentorStatTile
              title="Total"
              value={totalCount}
              description="Rounds tracked"
              icon={<FactCheckOutlinedIcon />}
              accent="blue"
              stagger={3}
            />
            <MentorStatTile
              title="Submitted"
              value={submittedCount}
              description="Rounds delivered"
              icon={<TaskAltOutlinedIcon />}
              accent="emerald"
              stagger={4}
            />
            <MentorStatTile
              title="Missing"
              value={detail.missingSubmissionCount ?? 0}
              description="Rounds outstanding"
              icon={<ReportProblemOutlinedIcon />}
              accent="rose"
              stagger={5}
            />
          </div>

          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
              {totalCount > 0 && (
                <div
                  className="mt-bar-grow h-full rounded-full bg-emerald-500"
                  style={{ width: `${fillPercent}%`, "--mt-stagger": 5 } as CSSProperties}
                />
              )}
            </div>
            <p className="mt-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {totalCount > 0
                ? `${submittedCount}/${totalCount} rounds submitted`
                : "No rounds submitted yet"}
            </p>
          </div>
        </section>

        {/* About */}
        <section
          className="mt-fade-up rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900"
          style={{ "--mt-stagger": 3 } as CSSProperties}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            About
          </h3>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Leader</p>
              <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                {leaderName}
              </p>
            </div>

            {detail.leaderEmail && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Leader Email
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {detail.leaderEmail}
                </p>
              </div>
            )}

            {detail.description && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Description
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {detail.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3 dark:border-slate-700/80">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Event</p>
                <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {detail.eventName || "No event"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Track</p>
                <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {detail.trackName || "No track"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Round journey */}
      <section>
        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <GroupsOutlinedIcon sx={{ fontSize: 16 }} />
          Round Journey
        </h3>

        {detail.submissions?.length ? (
          <ol className="space-y-5">
            {detail.submissions.map((sub, idx) => (
              <RoundJourneyNode
                key={sub.roundId || idx}
                submission={sub}
                feedbacks={feedbacks.filter((f) => f.roundId === sub.roundId)}
                stagger={4 + idx}
                isLast={idx === (detail.submissions?.length ?? 0) - 1}
              />
            ))}
          </ol>
        ) : (
          <p className="text-sm italic text-slate-500 dark:text-slate-400">
            No submissions found.
          </p>
        )}
      </section>
    </div>
  );
}
