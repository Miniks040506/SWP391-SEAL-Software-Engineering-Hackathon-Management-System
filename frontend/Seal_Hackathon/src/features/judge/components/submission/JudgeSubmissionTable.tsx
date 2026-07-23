import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

import type { JudgeSubmissionAssignmentResponse } from "@/types/grading.types";
import { JudgeSubmissionRowCard } from "./JudgeSubmissionRowCard";

interface JudgeSubmissionTableProps {
  submissions: JudgeSubmissionAssignmentResponse[];
  filtered?: boolean;
}

export const JudgeSubmissionTable = ({
  submissions,
  filtered = false,
}: JudgeSubmissionTableProps) => {
  if (submissions.length === 0) {
    return (
      <div className="jd-settle flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
        <InboxOutlinedIcon className="text-slate-300 dark:text-slate-600" sx={{ fontSize: 40 }} />
        <p className="font-bold text-slate-600 dark:text-slate-300">
          {filtered ? "No submissions match these filters" : "No assigned submissions yet"}
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          {filtered
            ? "Try clearing the search or status filter."
            : "Submissions will appear here once a coordinator assigns them to you."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission, index) => (
        <JudgeSubmissionRowCard
          key={submission.submissionId}
          submission={submission}
          stagger={index + 3}
        />
      ))}
    </div>
  );
};
