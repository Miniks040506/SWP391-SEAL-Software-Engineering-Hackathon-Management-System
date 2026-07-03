import { useState, useEffect } from "react";
import {
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  type SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import type { CoordinatorTeamListParams } from "@/types/team.types";
import {
  formatTeamStatusLabel,
  filterTextFieldSx,
  filterSelectSx,
  menuPropsAll,
} from "../schemas/teams.schema";

const TEAM_STATUSES = [
  "REGISTERED",
  "COMPETING",
  "ADVANCED",
  "ELIMINATED",
  "WINNER",
];
const REGISTRATION_STATUSES = ["PENDING_APPROVAL", "APPROVED", "REJECTED"];

type Props = {
  filters: CoordinatorTeamListParams;
  onChange: (filters: CoordinatorTeamListParams) => void;
  events?: { id: string; name: string }[];
  tracks?: { id: string; name: string; eventId: string }[];
};

export function TeamFilterBar({
  filters,
  onChange,
  events = [],
  tracks = [],
}: Props) {
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const cleanSearch = localSearch.trim();
      const currentSearch = filters.search || "";

      if (cleanSearch !== currentSearch) {
        onChange({ ...filters, search: cleanSearch || undefined, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, filters, onChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleStatusChange = (e: SelectChangeEvent<string>) => {
    onChange({ ...filters, status: e.target.value || undefined, page: 1 });
  };

  const handleRegistrationStatusChange = (e: SelectChangeEvent<string>) => {
    onChange({
      ...filters,
      registrationStatus: e.target.value || undefined,
      page: 1,
    });
  };

  const handleEventChange = (e: SelectChangeEvent<string>) => {
    onChange({
      ...filters,
      eventId: e.target.value || undefined,
      trackId: undefined,
      page: 1,
    });
  };

  const handleTrackChange = (e: SelectChangeEvent<string>) => {
    onChange({
      ...filters,
      trackId: e.target.value || undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    onChange({
      page: 1,
      size: filters.size,
      search: undefined,
      status: undefined,
      registrationStatus: undefined,
      eventId: undefined,
      trackId: undefined,
    });
  };

  const filteredTracks = tracks.filter((t) => t.eventId === filters.eventId);

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.registrationStatus ||
      filters.eventId ||
      filters.trackId
  );

  const isTrackDisabled = !filters.eventId || filteredTracks.length === 0;

  return (
    <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
      <div className="flex flex-col gap-4 md:gap-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <TextField
              fullWidth
              size="small"
              label="Search"
              name="search"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Team or leader name..."
              sx={filterTextFieldSx}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon
                        fontSize="small"
                        sx={{
                          color: "var(--mui-palette-text-secondary, #94a3b8)",
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>

          <div className="w-full sm:w-56 md:w-64 shrink-0">
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
                    return (
                      <span className="text-slate-500 dark:text-slate-400">
                        All Team Statuses
                      </span>
                    );
                  }
                  return selected as string;
                }}
              >
                <MenuItem value="">All Team Statuses</MenuItem>
                {TEAM_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="w-full sm:w-56 md:w-64 shrink-0">
            <FormControl size="small" fullWidth>
              <Select
                displayEmpty
                name="registrationStatus"
                value={filters.registrationStatus || ""}
                onChange={handleRegistrationStatusChange}
                sx={filterSelectSx}
                MenuProps={menuPropsAll}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span className="text-slate-500 dark:text-slate-400">
                        All Registration Statuses
                      </span>
                    );
                  }
                  return formatTeamStatusLabel(selected as string);
                }}
              >
                <MenuItem value="">All Registration Statuses</MenuItem>
                {REGISTRATION_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {formatTeamStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full lg:max-w-3xl">
            <FormControl size="small" fullWidth>
              <Select
                displayEmpty
                name="eventId"
                value={filters.eventId || ""}
                onChange={handleEventChange}
                sx={filterSelectSx}
                MenuProps={menuPropsAll}
                renderValue={(selected) => {
                  if (!selected)
                    return (
                      <span className="text-slate-500 dark:text-slate-400">
                        All Events
                      </span>
                    );
                  const found = events.find((e) => e.id === selected);
                  return found ? (
                    found.name
                  ) : (
                    <span className="text-rose-500">Invalid Event</span>
                  );
                }}
              >
                <MenuItem value="">All Events</MenuItem>
                {events.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth disabled={isTrackDisabled}>
              <Select
                displayEmpty
                name="trackId"
                value={filters.trackId || ""}
                onChange={handleTrackChange}
                sx={filterSelectSx}
                MenuProps={menuPropsAll}
                renderValue={(selected) => {
                  if (filters.eventId && filteredTracks.length === 0) {
                    return (
                      <span className="text-slate-400 dark:text-slate-500 italic">
                        No tracks available
                      </span>
                    );
                  }
                  if (!selected)
                    return (
                      <span className="text-slate-500 dark:text-slate-400">
                        All Tracks
                      </span>
                    );
                  const found = tracks.find((t) => t.id === selected);
                  return found ? (
                    found.name
                  ) : (
                    <span className="text-rose-500">Invalid Track</span>
                  );
                }}
              >
                <MenuItem value="">All Tracks</MenuItem>
                {filteredTracks.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              startIcon={<FilterAltOffIcon />}
              variant="text"
              color="error"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                minWidth: "130px",
                height: "40px",
                borderRadius: "8px",
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
