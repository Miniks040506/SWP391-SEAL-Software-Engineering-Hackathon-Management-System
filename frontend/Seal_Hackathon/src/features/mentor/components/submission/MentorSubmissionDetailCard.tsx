import { format } from "date-fns";

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";

import type { SubmissionDetailResponse } from "@/types/submission.types";

type MentorSubmissionDetailCardProps = {
  submission: SubmissionDetailResponse;
};

export const MentorSubmissionDetailCard = ({
  submission,
}: MentorSubmissionDetailCardProps) => {
  return (
    <Card
      variant="outlined"
      className="mb-6 rounded-2xl border-gray-100 dark:border-slate-700 dark:bg-[#1e293b]"
    >
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-3">
                <AssignmentOutlinedIcon className="text-blue-600" />
                <p className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  {submission.teamName} • {submission.trackName}
                </p>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {submission.roundName || "Unknown Round"}
              </h2>
            </div>

            <div>
              <Chip
                label={submission.status}
                color={
                  submission.status === "SUBMITTED" ? "success" : "default"
                }
                sx={{ fontWeight: 800, textTransform: "uppercase" }}
              />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Submission #
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {submission.submissionNumber}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Submitted At
              </p>
              <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                {submission.submittedAt
                  ? format(
                      new Date(submission.submittedAt),
                      "MMM dd, yyyy HH:mm",
                    )
                  : "Not submitted"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Last Updated
              </p>
              <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                {submission.updatedAt
                  ? format(new Date(submission.updatedAt), "MMM dd, yyyy HH:mm")
                  : "-"}
              </p>
            </div>
          </div>
          
          {/* Team Note Section */}
          {submission.note && (
            <div className="border-t border-gray-100 pt-5 dark:border-slate-700">
              <div className="rounded-2xl border border-gray-100 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/40">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-gray-900 dark:text-white">
                  Team Note
                </h3>
                <p className="mt-2 text-sm font-medium text-gray-600 dark:text-slate-400">
                  {submission.note}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
