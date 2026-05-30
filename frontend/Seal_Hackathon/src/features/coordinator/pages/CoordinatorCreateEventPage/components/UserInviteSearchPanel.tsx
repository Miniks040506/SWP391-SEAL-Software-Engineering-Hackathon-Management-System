import { useMemo, useState } from "react";

import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";

import {
  getPageItems,
  useCoordinatorUsersQuery,
} from "@/features/coordinator/hooks/useCoordinatorUserQuery";

import type { UserSummaryResponse } from "@/types/user.types";
import type { MentorJudgeFormValues } from "../../../schemas/createEvent.schema";

type UserInviteSearchPanelProps = {
  role: MentorJudgeFormValues["role"];
  selectedUserIds: string[];
  onInvite: (user: UserSummaryResponse) => void;
};

const USER_ROLE_QUERY_MAP: Record<MentorJudgeFormValues["role"], string> = {
  Mentor: "MENTOR",
  Judge: "JUDGE",
};

export const UserInviteSearchPanel = ({
  role,
  selectedUserIds,
  onInvite,
}: UserInviteSearchPanelProps) => {
  const [search, setSearch] = useState("");

  const usersQuery = useCoordinatorUsersQuery({
    role: USER_ROLE_QUERY_MAP[role],
    search,
  });

  const users = useMemo(() => {
    return getPageItems(usersQuery.data);
  }, [usersQuery.data]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="font-extrabold text-gray-900">Available {role}s</h3>

        <p className="mt-1 text-sm text-gray-500">
          Search by name or email, then invite to this event.
        </p>
      </div>

      <div className="space-y-4 p-5">
        <TextField
          fullWidth
          size="small"
          placeholder={`Search ${role.toLowerCase()} by name or email`}
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
              Failed to load {role.toLowerCase()} list.
            </p>
          </div>
        )}

        {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-slate-50 px-5 py-8 text-center">
            <p className="text-sm font-semibold text-gray-500">
              No {role.toLowerCase()} found.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {users.map((user) => {
            const invited = selectedUserIds.includes(user.id);

            return (
              <div
                key={user.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-bold text-gray-900">
                      {user.fullName}
                    </p>

                    <Chip
                      size="small"
                      label={user.role}
                      sx={{
                        height: 22,
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    />
                  </div>

                  <p className="mt-1 truncate text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>

                <Button
                  type="button"
                  variant={invited ? "outlined" : "contained"}
                  size="small"
                  disabled={invited}
                  startIcon={<PersonAddAltOutlinedIcon />}
                  onClick={() => onInvite(user)}
                  sx={{
                    whiteSpace: "nowrap",
                    fontWeight: 800,
                  }}
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
