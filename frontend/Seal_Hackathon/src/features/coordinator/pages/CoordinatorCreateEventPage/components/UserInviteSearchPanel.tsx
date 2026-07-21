import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { useAssignableUsersQuery } from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import type { AssignableUserResponse, AssignableUserRole } from "@/types/user.types";
import type { MentorJudgeFormValues } from "../../../schemas/createEvent.schema";
import { wizardFieldSx } from "./wizardUi";

type UserInviteSearchPanelProps = {
  role: MentorJudgeFormValues["role"];
  selectedUserIds?: string[];
  extraUsers?: AssignableUserResponse[];
  onSelect: (user: AssignableUserResponse) => void;
};

const USER_ROLE_QUERY_MAP: Record<MentorJudgeFormValues["role"], AssignableUserRole> = {
  MENTOR: "MENTOR",
  JUDGE: "JUDGE",
};

const AVATAR_TONES = [
  "from-blue-500 to-sky-400",
  "from-emerald-500 to-teal-400",
  "from-violet-500 to-indigo-400",
  "from-amber-500 to-orange-400",
  "from-rose-500 to-pink-400",
  "from-cyan-500 to-blue-400",
];

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getAvatarTone(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export const UserInviteSearchPanel = ({
  role,
  selectedUserIds = [],
  extraUsers = [],
  onSelect,
}: UserInviteSearchPanelProps) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search]);

  const usersQuery = useAssignableUsersQuery(USER_ROLE_QUERY_MAP[role], debouncedSearch);
  const users = [...extraUsers, ...(usersQuery.data ?? [])].filter(
    (user, index, allUsers) =>
      allUsers.findIndex((item) => item.userId === user.userId) === index,
  );
  const roleSearchLabel = role === "MENTOR" ? "mentor" : "judge";

  return (
    <div className="space-y-4 p-5">
      <TextField
        fullWidth
        size="small"
        placeholder={`Search ${roleSearchLabel} by name or email`}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={wizardFieldSx}
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
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 dark:border-rose-500/30 dark:bg-rose-500/10">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-300">
            Failed to load {roleSearchLabel} list. Check GET /users/assignable.
          </p>
        </div>
      )}

      {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center dark:border-slate-700">
          <SearchOffOutlinedIcon
            className="text-slate-300 dark:text-slate-600"
            sx={{ fontSize: 30 }}
          />
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            No {roleSearchLabel} found.
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {users.map((user) => {
          const assigned = selectedUserIds.includes(user.userId);
          const key = user.role === "JUDGE" ? user.judgeId || user.userId : user.userId;
          const disabled = assigned || (user.role === "JUDGE" && !user.judgeId);

          return (
            <div
              key={key}
              className={[
                "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 transition-colors duration-200",
                assigned
                  ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/5"
                  : "border-slate-200 bg-slate-50/70 hover:border-cyan-300/70 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-cyan-500/40",
              ].join(" ")}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${getAvatarTone(user.userId)} text-xs font-black text-white`}
                >
                  {getInitials(user.fullName)}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                    {user.fullName}
                  </p>
                  <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(user)}
                aria-label={
                  assigned
                    ? `${user.fullName} already assigned`
                    : `Assign ${user.fullName}`
                }
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60",
                  assigned
                    ? "cursor-default bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : disabled
                      ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                      : "cursor-pointer bg-linear-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400",
                ].join(" ")}
              >
                {assigned ? (
                  <CheckOutlinedIcon sx={{ fontSize: 14 }} />
                ) : (
                  <PersonAddAltOutlinedIcon sx={{ fontSize: 14 }} />
                )}
                {assigned ? "Assigned" : "Assign"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
