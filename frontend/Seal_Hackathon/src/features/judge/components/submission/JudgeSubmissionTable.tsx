import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined";

import type { JudgeSubmissionAssignmentResponse } from "@/types/judge.types";

type Props = {
  submissions: JudgeSubmissionAssignmentResponse[];
};

function getGradingChip(sub: JudgeSubmissionAssignmentResponse) {
  if (sub.roundSubmissionLocked) {
    return {
      label: "Locked",
      color: "error" as const,
      variant: "filled" as const,
    };
  }
  switch (sub.gradingStatus) {
    case "GRADED":
      return {
        label: "Submitted",
        color: "success" as const,
        variant: "filled" as const,
      };
    case "READY":
      return {
        label: "Draft Saved",
        color: "info" as const,
        variant: "outlined" as const,
      };
    case "PENDING":
    default:
      return {
        label: "Pending",
        color: "warning" as const,
        variant: "outlined" as const,
      };
  }
}

export const JudgeSubmissionTable = ({ submissions }: Props) => {
  const navigate = useNavigate();

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <FindInPageOutlinedIcon className="mb-4 text-5xl text-gray-400" />
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
          No Submissions Assigned
        </h3>
        <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
          You currently have no submissions in your grading queue for this
          round.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
        <thead className="border-b border-gray-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          <tr>
            <th className="px-6 py-4">Team & Project</th>
            <th className="px-6 py-4">Track / Round</th>
            <th className="px-6 py-4">Submitted At</th>
            <th className="px-6 py-4">Grading</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
          {submissions.map((sub) => {
            const chip = getGradingChip(sub);
            const isLocked = sub.roundSubmissionLocked;

            return (
              <tr
                key={sub.submissionId}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="px-6 py-4 min-w-[200px]">
                  <p className="font-extrabold text-gray-900 dark:text-white">
                    {sub.teamName}
                  </p>
                  <p className="truncate text-xs font-medium text-gray-500 max-w-[250px]">
                    {sub.projectTitle || "No project title"}
                  </p>
                </td>
                <td className="px-6 py-4 min-w-[150px]">
                  <p className="font-bold text-gray-700 dark:text-slate-200">
                    {sub.trackName || "General"}
                  </p>
                  <p className="text-xs text-gray-500">{sub.roundName}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {sub.submittedAt
                    ? format(new Date(sub.submittedAt), "MMM dd, yyyy HH:mm")
                    : "Not submitted"}
                </td>
                <td className="px-6 py-4">
                  <Chip
                    label={chip.label}
                    color={chip.color}
                    size="small"
                    variant={chip.variant}
                    sx={{ fontWeight: 800 }}
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="contained"
                    size="small"
                    disabled={isLocked}
                    onClick={() =>
                      navigate(`/judge/submissions/${sub.submissionId}`, {
                        state: {
                          roundSubmissionLocked: sub.roundSubmissionLocked,
                          assignmentInfo: sub,
                        },
                      })
                    }
                    sx={{
                      bgcolor: isLocked ? undefined : "#2563eb",
                      fontWeight: 700,
                      textTransform: "none",
                      borderRadius: "8px",
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: isLocked ? undefined : "#1d4ed8",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {isLocked ? "Locked" : "View submission"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
