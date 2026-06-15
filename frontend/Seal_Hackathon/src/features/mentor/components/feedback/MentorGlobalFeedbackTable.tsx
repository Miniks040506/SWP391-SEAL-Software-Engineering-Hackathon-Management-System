import { format } from "date-fns";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

type MentorGlobalFeedbackTableProps = {
  feedbacks: MentorFeedbackResponse[];
  isLoading: boolean;
  onEdit: (feedback: MentorFeedbackResponse) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
};

export const MentorGlobalFeedbackTable = ({
  feedbacks,
  isLoading,
  onEdit,
  onDelete,
  onPublish,
}: MentorGlobalFeedbackTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
          Loading global feedback...
        </p>
      </div>
    );
  }

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <RateReviewOutlinedIcon className="mb-4 text-4xl text-gray-400" />
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
          No Feedback Found
        </h3>
        <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
          You haven't written any feedback yet.
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
      <Table aria-label="global feedback table">
        <TableHead className="bg-slate-50 dark:bg-slate-800/50">
          <TableRow>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-[150px]">
              Team
            </TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Content Snippet
            </TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-[120px]">
              Category
            </TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-[120px]">
              Status
            </TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-[150px]">
              Created At
            </TableCell>
            <TableCell align="right" className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-[120px]">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {feedbacks.map((row) => {
            const isDraft = row.visibility === "DRAFT";

            return (
              <TableRow
                key={row.id}
                hover
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <TableCell className="font-extrabold text-gray-900 dark:text-white whitespace-nowrap">
                  {row.teamName || "N/A"}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-gray-600 dark:text-slate-400 line-clamp-2">
                    {row.content}
                  </p>
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.category}
                    size="small"
                    className="font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.visibility}
                    size="small"
                    color={isDraft ? "warning" : "success"}
                    variant={isDraft ? "outlined" : "filled"}
                    sx={{ fontWeight: 800 }}
                  />
                </TableCell>
                <TableCell className="text-sm font-medium text-gray-500 dark:text-slate-400 whitespace-nowrap">
                  {format(new Date(row.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell align="right">
                  {isDraft && (
                    <div className="flex justify-end gap-1">
                      <Tooltip title="Publish">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onPublish(row.id)}
                        >
                          <SendOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="inherit"
                          onClick={() => onEdit(row)}
                          className="text-gray-600 dark:text-slate-300"
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(row.id)}
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};