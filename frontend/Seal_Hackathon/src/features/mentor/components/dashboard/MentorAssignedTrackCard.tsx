import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";

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
  onGiveFeedback: (submissionId: string) => void;
};

export const MentorAssignedTrackCard = ({
  assignedTrack,
  recentSubmissions,
  onViewTeams,
  onViewSubmissions,
  onViewSubmission,
  onGiveFeedback,
}: MentorAssignedTrackCardProps) => {
  return (
    <Card
      variant="outlined"
      className="xl:col-span-2 dark:border-slate-700 dark:bg-[#1e293b]"
    >
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-3">
                <AssignmentOutlinedIcon className="text-blue-600" />

                <p className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Assigned Track
                </p>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {assignedTrack.eventName} - {assignedTrack.trackName}
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                  <p className="text-sm text-gray-500">Teams</p>

                  <p className="mt-1 font-bold text-gray-900 dark:text-white">
                    {assignedTrack.teamCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                  <p className="text-sm text-gray-500">Recent Submissions</p>

                  <p className="mt-1 font-bold text-gray-900 dark:text-white">
                    {assignedTrack.recentSubmissionCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                  <p className="text-sm text-gray-500">Pending Feedback</p>

                  <p className="mt-1 font-bold text-gray-900 dark:text-white">
                    {assignedTrack.pendingFeedbackCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 md:flex-col">
              <Button
                variant="contained"
                endIcon={<ArrowForwardOutlinedIcon />}
                onClick={onViewTeams}
                sx={{
                  bgcolor: "#2563eb",
                  textTransform: "none",
                  fontWeight: 800,
                  "&:hover": {
                    bgcolor: "#1d4ed8",
                  },
                }}
              >
                View Teams
              </Button>

              <Button
                variant="outlined"
                onClick={onViewSubmissions}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                View Submissions
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5 dark:border-slate-700">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Recent Submissions
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Latest submissions from teams in your assigned track.
                </p>
              </div>

              <Button
                variant="text"
                size="small"
                onClick={onViewSubmissions}
                sx={{
                  fontWeight: 800,
                  textTransform: "none",
                }}
              >
                View All
              </Button>
            </div>

            {recentSubmissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
                  No recent submissions yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((submission) => {
                  const feedbackGiven = submission.feedbackStatus === "Given";

                  return (
                    <div
                      key={submission.id}
                      className="rounded-2xl border border-gray-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-extrabold text-gray-900 dark:text-white">
                              {submission.teamName}
                            </p>

                            <Chip
                              size="small"
                              label={submission.feedbackStatus}
                              color={feedbackGiven ? "success" : "warning"}
                              sx={{ fontWeight: 400 }}
                            />
                          </div>

                          <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-slate-300">
                            {submission.projectName}
                          </p>

                          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                            Submitted at: {submission.submittedAt}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => onViewSubmission(submission.id)}
                            sx={{
                              fontWeight: 800,
                              textTransform: "none",
                            }}
                          >
                            View Submission
                          </Button>

                          <Button
                            variant="contained"
                            size="small"
                            disabled={feedbackGiven}
                            onClick={() => onGiveFeedback(submission.id)}
                            sx={{
                              bgcolor: "#2563eb",
                              fontWeight: 800,
                              textTransform: "none",
                              "&:hover": {
                                bgcolor: "#1d4ed8",
                              },
                            }}
                          >
                            Give Feedback
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};