import { format } from "date-fns";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";

import type {
  MentorSubmissionEmptyReason,
  MentorSubmissionSummaryResponse,
} from "@/types/submission.types";

type MentorSubmissionsTableProps = {
  submissions: MentorSubmissionSummaryResponse[];
  isLoading: boolean;
  emptyReason?: MentorSubmissionEmptyReason;
  onRowClick: (submissionId: string) => void;
};

const EMPTY_MESSAGES: Record<
  Exclude<MentorSubmissionEmptyReason, "NONE">,
  { title: string; body: string }
> = {
  NO_ASSIGNED_TEAMS: {
    title: "No Assigned Teams",
    body: "You do not currently have teams in your assigned tracks.",
  },
  NO_SUBMISSIONS: {
    title: "Teams Have Not Submitted",
    body: "Assigned teams exist, but none has submitted eligible deliverables yet.",
  },
  NO_FILTER_MATCHES: {
    title: "No Matching Submissions",
    body: "No submitted deliverables match the current filters.",
  },
};

export const MentorSubmissionTable = ({
  submissions,
  isLoading,
  emptyReason = "NO_SUBMISSIONS",
  onRowClick,
}: MentorSubmissionsTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
          Loading track submissions...
        </p>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    const message = emptyReason === "NONE"
      ? EMPTY_MESSAGES.NO_FILTER_MATCHES
      : EMPTY_MESSAGES[emptyReason];
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <FolderOffOutlinedIcon className="mb-4 text-4xl text-gray-400" />
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
          {message.title}
        </h3>
        <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
          {message.body}
        </p>
      </div>
    );
  }

  return (
    <TableContainer
      component={Card}
      variant="outlined"
      className="rounded-2xl border-gray-100 dark:border-slate-700 dark:bg-[#1e293b]"
    >
      <Table aria-label="track submissions table">
        <TableHead className="bg-slate-50 dark:bg-slate-800/50">
          <TableRow>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Team Name</TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Track</TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Round</TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Submission</TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Submitted At</TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Links</TableCell>
            <TableCell align="right" className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((row) => (
            <TableRow
              key={row.id}
              hover
              className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <TableCell className="font-extrabold text-gray-900 dark:text-white">
                {row.teamName || "Unknown Team"}
              </TableCell>
              <TableCell className="font-semibold text-gray-700 dark:text-slate-300">
                {row.trackName || "Unknown Track"}
              </TableCell>
              <TableCell className="font-semibold text-gray-700 dark:text-slate-300">
                {row.roundName}
              </TableCell>
              <TableCell className="font-medium text-gray-600 dark:text-slate-400">
                #{row.submissionNumber}
              </TableCell>
              <TableCell>
                <Chip
                  label={row.status}
                  size="small"
                  color={row.status === "SUBMITTED" ? "success" : "default"}
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>
              <TableCell className="text-sm text-gray-500 dark:text-slate-400">
                {row.submittedAt ? format(new Date(row.submittedAt), "MMM dd, yyyy HH:mm") : "-"}
              </TableCell>
              <TableCell className="font-semibold text-gray-600 dark:text-slate-400">
                {row.linkCount || 0} links
              </TableCell>
              <TableCell align="right">
                <Button
                  variant="text"
                  size="small"
                  onClick={() => onRowClick(row.id)}
                  sx={{
                    fontWeight: 500,
                    textTransform: "none",
                    borderRadius: "8px",
                  }}
                >
                  View Detail
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
