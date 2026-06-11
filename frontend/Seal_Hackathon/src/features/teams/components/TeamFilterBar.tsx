import { TextField, InputAdornment, Select, MenuItem, FormControl, type SelectChangeEvent } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { TEAM_STATUSES, filterTextFieldSx, filterSelectSx, menuPropsAll } from "../schemas/teams.schema";

export function TeamFilterBar({ filters, onChange }: Props) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value || undefined, page: 1 });
  };

  const handleStatusChange = (e: SelectChangeEvent<string>) => {
    onChange({ ...filters, status: e.target.value || undefined, page: 1 });
  };

  return (
    <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-4">

        <div className="sm:col-span-2 md:col-span-2 lg:col-span-4">
          <TextField
            fullWidth
            size="small"
            label="Search"
            name="search"
            value={filters.search || ""}
            onChange={handleTextChange}
            placeholder="Team name or ID..."
            sx={filterTextFieldSx}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon fontSize="small" sx={{ color: "var(--mui-palette-text-secondary, #94a3b8)" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>

        <div className="sm:col-span-2 md:col-span-1 lg:col-span-2">
          <FormControl size="small" fullWidth>
            <Select
              displayEmpty
              name="status"
              value={filters.status || ""}
              onChange={handleStatusChange}
              sx={filterSelectSx}
              MenuProps={menuPropsAll}
              renderValue={(selected) => {
                if (!selected) {
                  return <span className="text-slate-500 dark:text-slate-400">All Statuses</span>;
                }
                return selected as string;
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {TEAM_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-3">
          <TextField
            fullWidth
            size="small"
            label="Event ID"
            name="eventId"
            value={filters.eventId || ""}
            onChange={handleTextChange}
            placeholder="Filter by UUID"
            sx={filterTextFieldSx}
          />
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-3">
          <TextField
            fullWidth
            size="small"
            label="Track ID"
            name="trackId"
            value={filters.trackId || ""}
            onChange={handleTextChange}
            placeholder="Filter by UUID"
            sx={filterTextFieldSx}
          />
        </div>

      </div>
    </div>
  );
}