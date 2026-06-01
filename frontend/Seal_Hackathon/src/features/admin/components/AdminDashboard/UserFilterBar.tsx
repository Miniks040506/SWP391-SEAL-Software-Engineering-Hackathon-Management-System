import { InputAdornment, MenuItem, Select, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import {
  ALL_ROLES,
  ALL_STATUSES,
  filterTextFieldSx,
  filterSelectSx,
  menuPropsAll,
} from "@/features/admin/schemas/admin.schema";
import type { UserRole } from "@/types/auth.types";
import type { UserStatus } from "@/types/user.types";

type UserFilterBarProps = {
  search: string;
  role: UserRole | "";
  status: UserStatus | "";
  onSearchChange: (value: string) => void;
  onRoleChange: (value: UserRole | "") => void;
  onStatusChange: (value: UserStatus | "") => void;
};

export function UserFilterBar({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: UserFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 dark:border-slate-700 p-4">
      <TextField
        size="small"
        label="Search"
        placeholder="Name, email or ID…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ width: 300, ...filterTextFieldSx }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon fontSize="small" className="text-slate-400 dark:text-slate-600" />
              </InputAdornment>
            ),
          },
        }}
      />

      <div className="ml-auto flex items-center gap-3">
        <Select
          size="small"
          displayEmpty
          value={role}
          onChange={(e) => onRoleChange(e.target.value as UserRole | "")}
          sx={{ minWidth: 140, ...filterSelectSx }}
          MenuProps={menuPropsAll}
        >
          <MenuItem value="">All Roles</MenuItem>
          {ALL_ROLES.map((r) => (
            <MenuItem key={r} value={r}>{r}</MenuItem>
          ))}
        </Select>

        <Select
          size="small"
          displayEmpty
          value={status}
          onChange={(e) => onStatusChange(e.target.value as UserStatus | "")}
          sx={{ minWidth: 140, ...filterSelectSx }}
          MenuProps={menuPropsAll}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {ALL_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
}