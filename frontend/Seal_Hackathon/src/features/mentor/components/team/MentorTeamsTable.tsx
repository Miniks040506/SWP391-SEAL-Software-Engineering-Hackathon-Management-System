import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { useNavigate } from "react-router-dom";

import type { MentorTeamProgressResponse } from "@/types/team.types";

type MentorTeamsTableProps = {
  teams: MentorTeamProgressResponse[];
  isLoading: boolean;
};

export const MentorTeamsTable = ({
  teams,
  isLoading,
}: MentorTeamsTableProps) => {
  const navigate = useNavigate();

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
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Team Name
            </TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Project
            </TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Members
            </TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Latest Activity
            </TableCell>
            <TableCell align="right" className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 pr-6">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teams.map((row) => (
            <TableRow
              key={row.teamId}
              hover
              className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
            >
              <TableCell className="font-extrabold text-gray-900 dark:text-white">
                {row.teamName}
              </TableCell>
              <TableCell className="font-semibold text-gray-700 dark:text-slate-300">
                {row.projectTitle || "-"}
              </TableCell>
              <TableCell className="font-medium text-gray-600 dark:text-slate-400">
                {row.memberCount}
              </TableCell>
              <TableCell>
                {row.latestSubmissionStatus ? (
                  <Chip
                    label={row.latestSubmissionStatus}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                ) : (
                  <span className="text-sm italic text-gray-400">
                    No submissions yet
                  </span>
                )}
              </TableCell>
              <TableCell align="right" className="pr-6">
                <button
                  onClick={() => navigate(`/mentor/teams/${row.teamId}`)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-sm px-4 py-2 rounded-lg transition-all text-sm font-medium"
                >
                  View Detail
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
