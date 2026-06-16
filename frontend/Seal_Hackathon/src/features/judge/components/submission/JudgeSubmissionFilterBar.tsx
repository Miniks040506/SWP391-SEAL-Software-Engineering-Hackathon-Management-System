import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

import { judgeSubmissionFilterSchema } from "../../schemas/judgeGrading.schema";
import type { GetJudgeSubmissionsParams } from "@/types/judge.types";

type Props = {
  filters: GetJudgeSubmissionsParams;
  onChange: (filters: GetJudgeSubmissionsParams) => void;
};

const filterSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px" } };

export function JudgeSubmissionFilterBar({ filters, onChange }: Props) {
  const [localSearch, setLocalSearch] = useState(""); 

  useEffect(() => {
    const timer = setTimeout(() => {
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleStatusChange = (e: any) => {
    onChange({ ...filters, status: e.target.value || undefined, page: 1 });
  };

  const handleClear = () => {
    setLocalSearch("");
    onChange({ page: 1, size: filters.size, status: undefined });
  };

  const hasActiveFilters = Boolean(localSearch || filters.status);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center dark:border-slate-700 dark:bg-slate-900">
      <div className="flex-1">
        <TextField
          fullWidth
          size="small"
          placeholder="Search team or project..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          sx={filterSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            ),
          }}
        />
      </div>

      <div className="w-full shrink-0 md:w-64">
        <FormControl size="small" fullWidth>
          <Select
            displayEmpty
            value={filters.status || ""}
            onChange={handleStatusChange}
            sx={filterSx}
            renderValue={(val) => (val ? val : <span className="text-gray-400">All Statuses</span>)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {judgeSubmissionFilterSchema.STATUSES.map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {hasActiveFilters && (
        <Button
          onClick={handleClear}
          startIcon={<FilterAltOffIcon />}
          color="error"
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
        >
          Clear
        </Button>
      )}
    </div>
  );
}