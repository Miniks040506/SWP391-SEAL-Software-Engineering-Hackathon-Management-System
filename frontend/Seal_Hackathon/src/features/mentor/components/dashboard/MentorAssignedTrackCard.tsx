import type { CSSProperties, KeyboardEvent } from "react";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

import Button from "@mui/material/Button";

import { useCountUp } from "../../hooks/useCountUp";
import type {
  MentorAssignedTrack,
  MentorSubmission,
} from "../../schemas/mentorDashboard.schema";

type MentorAssignedTrackCardProps = {
  assignedTrack: MentorAssignedTrack;
  recentSubmissions: MentorSubmission[];
  onViewTeams: () => void;
  onViewSubmissions: () => void;
  onViewSubmission: (submissionId: string) => void;
};

type MiniStatAccent = "blue" | "indigo" | "amber";

const MINI_STAT_CLASSES: Record<MiniStatAccent, { tile: string; bar: string }> = {
  blue: {
    tile: "bg-blue-50 dark:bg-blue-500/10",
    bar: "bg-blue-500",
  },
  indigo: {
    tile: "bg-indigo-50 dark:bg-indigo-500/10",
    bar: "bg-indigo-500",
  },
  amber: {
    tile: "bg-amber-50 dark:bg-amber-500/10",
    bar: "bg-amber-500",
  },
};

const MiniStat = ({
  label,
  value,
  accent,
  stagger,
}: {
  label: string;
  value: number;
  accent: MiniStatAccent;
  stagger: number;
}) => {
  const animatedValue = useCountUp(value);
  const classes = MINI_STAT_CLASSES[accent];

  return (
    <div
      className={`mt-fade-up rounded-2xl p-4 ${classes.tile}`}
      style={{ "--mt-stagger": stagger } as CSSProperties}
    >
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums text-slate-950 dark:text-white">
        {Math.round(animatedValue)}
      </p>
      <div className="mt-2 h-1 rounded-full bg-slate-200/70 dark:bg-slate-700/60">
        <div
          className={`mt-bar-grow h-full w-full rounded-full ${classes.bar}`}
          style={{ "--mt-stagger": stagger } as CSSProperties}
        />
      </div>
    </div>
  );
};

const FEEDBACK_PILL_CLASSES: Record<MentorSubmission["feedbackStatus"], string> = {
  "Not Given":
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
  Given:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
};

export const MentorAssignedTrackCard = ({
  assignedTrack,
  recentSubmissions,
  onViewTeams,
  onViewSubmissions,
  onViewSubmission,
}: MentorAssignedTrackCardProps) => {
  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    submissionId: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onViewSubmission(submissionId);
    }
  };

  return (
    <section
      className="mt-fade-up rounded-3xl border border-slate-200 bg-white p-6 xl:col-span-2 dark:border-slate-700/80 dark:bg-slate-900"
      style={{ "--mt-stagger": 6 } as CSSProperties}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <AssignmentOutlinedIcon
                sx={{ fontSize: 18 }}
                className="text-blue-600 dark:text-blue-400"
              />
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Assigned Track
              </p>
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {assignedTrack.eventName} · {assignedTrack.trackName}
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MiniStat
                label="Teams"
                value={assignedTrack.teamCount}
                accent="blue"
                stagger={7}
              />
              <MiniStat
                label="Recent Submissions"
                value={assignedTrack.recentSubmissionCount}
                accent="indigo"
                stagger={8}
              />
              <MiniStat
                label="Pending Feedback"
                value={assignedTrack.pendingFeedbackCount}
                accent="amber"
                stagger={9}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 md:flex-col">
            <Button
              variant="contained"
              endIcon={<ArrowForwardOutlinedIcon />}
              onClick={onViewTeams}
              sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
            >
              View Teams
            </Button>
            <Button
              variant="outlined"
              onClick={onViewSubmissions}
              sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
            >
              View Submissions
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-5 dark:border-slate-700/80">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">
                Recent Submissions
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Latest submissions from teams in your assigned track.
              </p>
            </div>

            <Button
              variant="text"
              size="small"
              onClick={onViewSubmissions}
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              View All
            </Button>
          </div>

          {recentSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <InboxOutlinedIcon className="mt-pop text-slate-400 dark:text-slate-500" />
              <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                No recent submissions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((submission, index) => (
                <div
                  key={submission.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onViewSubmission(submission.id)}
                  onKeyDown={(event) => handleRowKeyDown(event, submission.id)}
                  className="mt-fade-up mt-lift mt-press group cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-slate-700/80 dark:bg-slate-800/50 dark:hover:border-blue-500/50"
                  style={{ "--mt-stagger": 10 + index } as CSSProperties}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-extrabold text-slate-950 dark:text-white">
                          {submission.teamName}
                        </p>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${FEEDBACK_PILL_CLASSES[submission.feedbackStatus]}`}
                        >
                          {submission.feedbackStatus}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {submission.projectName}
                      </p>

                      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />
                        {submission.submittedAt}
                      </p>
                    </div>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        onViewSubmission(submission.id);
                      }}
                      sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                    >
                      View Submission
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
