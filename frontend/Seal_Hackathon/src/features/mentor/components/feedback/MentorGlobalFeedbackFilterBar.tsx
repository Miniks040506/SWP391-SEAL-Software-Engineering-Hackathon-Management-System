import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";

import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

export type MentorFeedbackFilters = {
  search?: string;
  category?: string;
  visibility?: string;
};

type Props = {
  filters: MentorFeedbackFilters;
  onChange: (filters: MentorFeedbackFilters) => void;
};

const CATEGORIES = ["TECHNICAL", "PROCESS", "PRESENTATION", "GENERAL"];
const VISIBILITIES = ["DRAFT", "PUBLISHED"];

const filterTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "white",
    ".dark &": { backgroundColor: "#1e293b", borderColor: "#334155" },
  },
};

const filterSelectSx = {
  borderRadius: "8px",
  backgroundColor: "white",
  ".dark &": { backgroundColor: "#1e293b", borderColor: "#334155" },
};

const menuPropsAll = {
  PaperProps: {
    sx: { maxHeight: 250, borderRadius: "8px", mt: 1 },
  },
};

export function MentorGlobalFeedbackFilterBar({ filters, onChange }: Props) {
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const cleanSearch = localSearch.trim();
      const currentSearch = filters.search || "";

      if (cleanSearch !== currentSearch) {
        onChange({ ...filters, search: cleanSearch || undefined });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, filters, onChange]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    onChange({ ...filters, category: e.target.value || undefined });
  };

  const handleVisibilityChange = (e: SelectChangeEvent<string>) => {
    onChange({ ...filters, visibility: e.target.value || undefined });
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    onChange({
      search: undefined,
      category: undefined,
      visibility: undefined,
    });
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.category || filters.visibility
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#1e293b] mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        
        <div className="flex-1">
          <TextField
            fullWidth
            size="small"
            name="search"
            value={localSearch}
            onChange={handleTextChange}
            placeholder="Search team name, content..."
            sx={filterTextFieldSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <FormControl size="small" className="w-full sm:w-40">
            <Select
              displayEmpty
              name="visibility"
              value={filters.visibility || ""}
              onChange={handleVisibilityChange}
              sx={filterSelectSx}
              MenuProps={menuPropsAll}
              renderValue={(selected) => {
                if (!selected) return <span className="text-gray-500">All Statuses</span>;
                return selected as string;
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {VISIBILITIES.map((v) => (
                <MenuItem key={v} value={v}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" className="w-full sm:w-48">
            <Select
              displayEmpty
              name="category"
              value={filters.category || ""}
              onChange={handleCategoryChange}
              sx={filterSelectSx}
              MenuProps={menuPropsAll}
              renderValue={(selected) => {
                if (!selected) return <span className="text-gray-500">All Categories</span>;
                return selected as string;
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              startIcon={<FilterAltOffIcon />}
              color="error"
              sx={{
                textTransform: "none",
                fontWeight: 700,
                whiteSpace: "nowrap",
                borderRadius: "8px",
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}