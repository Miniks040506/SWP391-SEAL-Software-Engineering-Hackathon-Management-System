import { useState } from "react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import { useAssignableUsersQuery } from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import type { AssignableUserResponse, AssignableUserRole } from "@/types/user.types";
import type { MentorJudgeFormValues } from "../../../schemas/createEvent.schema";

type UserInviteSearchPanelProps = {
  role: MentorJudgeFormValues["role"];
  selectedUserIds?: string[];
  onSelect: (user: AssignableUserResponse) => void;
};

const USER_ROLE_QUERY_MAP: Record<MentorJudgeFormValues["role"], AssignableUserRole> = {
  MENTOR: "MENTOR",
  JUDGE: "JUDGE",
};

export const UserInviteSearchPanel = ({
  role,
  selectedUserIds = [],
  onSelect,
}: UserInviteSearchPanelProps) => {
  const [search, setSearch] = useState("");
  const usersQuery = useAssignableUsersQuery(USER_ROLE_QUERY_MAP[role], search);
  const users = usersQuery.data ?? [];
  const roleLabel = role === "MENTOR" ? "Mentors" : "Judges";
  const roleSearchLabel = role === "MENTOR" ? "mentor" : "judge";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1e293b]">
      <div className="border-b border-gray-100 px-5 py-4 dark:border-slate-700">
        <h3 className="font-extrabold text-gray-900 dark:text-white">Available {roleLabel}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Search by name or email, then invite to this event.
        </p>
      </div>

      <div className="space-y-4 p-5">
        <TextField
          fullWidth
          size="small"
          placeholder={`Search ${roleSearchLabel} by name or email`}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        {usersQuery.isLoading && (
          <div className="flex justify-center py-8">
            <CircularProgress size={24} />
          </div>
        )}

        {usersQuery.isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-600">
              Failed to load {roleSearchLabel} list. Check GET /users/assignable.
            </p>
          </div>
        )}

        {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-slate-50 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
              No {roleSearchLabel} found.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {users.map((user) => {
            const invited = selectedUserIds.includes(user.userId);
            const key = user.role === "JUDGE" ? user.judgeId || user.userId : user.userId;

            return (
              <div
                key={key}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-bold text-gray-900 dark:text-white">{user.fullName}</p>
                    <Chip size="small" label={user.role} sx={{ height: 22, fontSize: 11, fontWeight: 800 }} />
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500 dark:text-slate-400">{user.email}</p>
                </div>

                <Button
                  type="button"
                  variant={invited ? "outlined" : "contained"}
                  size="small"
                  disabled={invited || (user.role === "JUDGE" && !user.judgeId)}
                  startIcon={<PersonAddAltOutlinedIcon />}
                  onClick={() => onSelect(user)}
                  sx={{ whiteSpace: "nowrap", fontWeight: 800 }}
                >
                  {invited ? "Invited" : "Invite"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
