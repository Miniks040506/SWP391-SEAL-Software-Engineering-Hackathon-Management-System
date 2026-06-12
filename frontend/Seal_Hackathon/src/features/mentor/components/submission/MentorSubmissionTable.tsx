import { format } from "date-fns";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";

import type { SubmissionSummaryResponse } from "@/types/submission.types";

type MentorSubmissionTableProps = {
  submissions: SubmissionSummaryResponse[];
  isLoading: boolean;
  onRowClick: (submissionId: string) => void;
};

export const MentorSubmissionTable = ({
  submissions,
  isLoading,
  onRowClick,
}: MentorSubmissionTableProps) => {
  if (isLoading) {
    return;
    <div className="p-8 text-center text-gray-500">Loading track submission...</div>;
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card variant="outlined" className="flex flex-col items-center justify-center p-12 border-dashed dark:border-slate-700 dark:bg-[#1e293b]">
        <FolderOffOutlinedIcon className="mb-4 text-4xl text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Submissions Found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          There are currently no deliverables submitted by teams in your track.
        </p>
      </Card>
    );
  }

  return (
    <TableContainer component={Card} variant="outlined" className="dark:border-slate-700 dark:bg-[#1e293b]">
      <Table aria-label="track submissions table">
        <TableHead className="bg-gray-50 dark:bg-slate-800">
          <TableRow>
            <TableCell>Team Name</TableCell>
            <TableCell>Round</TableCell>
            <TableCell>Submission #</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Submitted At</TableCell>
            <TableCell>Links</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((row) => (
            <TableRow
              key={row.id}
              hover
              onClick={() => onRowClick(row.id)}
              className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50"
            >
              <TableCell className="font-bold text-gray-900 dark:text-white">
                {row.teamName || "Unknown Team"}
              </TableCell>
              <TableCell className="font-medium text-gray-700 dark:text-slate-300">
                {row.roundName}
              </TableCell>
              <TableCell>#{row.submissionNumber}</TableCell>
              <TableCell>
                <Chip
                  label={row.status}
                  size="small"
                  color={row.status === "SUBMITTED" ? "success" : "default"}
                  className="font-medium"
                />
              </TableCell>
              <TableCell>
                {row.submittedAt ? format(new Date(row.submittedAt), "MMM dd, yyyy HH:mm") : "-"}
              </TableCell>
              <TableCell>{row.linkCount || 0} links</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};