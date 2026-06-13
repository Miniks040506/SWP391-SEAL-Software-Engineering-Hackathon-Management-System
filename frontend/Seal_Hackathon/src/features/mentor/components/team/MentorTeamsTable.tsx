import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

import type { MentorTeamSummary } from "../../mocks/mentorTeams.mock";

type MentorTeamsTableProps = {
  teams: MentorTeamSummary[];
  isLoading: boolean;
  onGiveFeedback: (teamId: string) => void;
};

export const MentorTeamsTable = ({
  teams,
  isLoading,
  onGiveFeedback,
}: MentorTeamsTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
          Loading assigned teams...
        </p>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <GroupsOutlinedIcon className="mb-4 text-4xl text-gray-400" />
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
          No Teams Assigned
        </h3>
        <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
          There are currently no teams registered in your track.
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
      <Table aria-label="mentor teams table">
        <TableHead className="bg-slate-50 dark:bg-slate-800/50">
          <TableRow>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Team Name</TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Project</TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Members</TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Latest Activity</TableCell>
            <TableCell align="right" className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teams.map((row) => (
            <TableRow
              key={row.id}
              hover
              className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <TableCell className="font-extrabold text-gray-900 dark:text-white">
                {row.name}
              </TableCell>
              <TableCell className="font-semibold text-gray-700 dark:text-slate-300">
                {row.projectName || "-"}
              </TableCell>
              <TableCell className="font-medium text-gray-600 dark:text-slate-400">
                {row.memberCount} / 5
              </TableCell>
              <TableCell>
                {row.latestSubmissionRound ? (
                  <Chip
                    label={row.latestSubmissionRound}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                ) : (
                  <span className="text-sm italic text-gray-400">No submissions yet</span>
                )}
              </TableCell>
              <TableCell align="right">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onGiveFeedback(row.id)}
                  startIcon={<RateReviewOutlinedIcon fontSize="small" />}
                  sx={{
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: "8px",
                    bgcolor: "#2563eb",
                    "&:hover": { bgcolor: "#1d4ed8" },
                    boxShadow: "none",
                  }}
                >
                  Feedback
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};