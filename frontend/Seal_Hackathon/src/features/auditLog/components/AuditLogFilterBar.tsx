import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import type { GetAuditLogsParams } from "@/types/system.types";

type Props = {
  filters: GetAuditLogsParams;
  onChange: (newFilters: GetAuditLogsParams) => void;
  availableActions: string[];
};

export const AuditLogFilterBar = ({ filters, onChange, availableActions }: Props) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
      <TextField
        size="small"
        placeholder="Filter by target table..."
        value={filters.targetTable || ""}
        onChange={(e) => onChange({ ...filters, targetTable: e.target.value })}
        className="flex-1"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          }
        }}
      />

      <TextField
        select
        size="small"
        label="Action Type"
        value={filters.actionType || "ALL"}
        onChange={(e) => onChange({ ...filters, actionType: e.target.value })}
        className="w-full md:w-64"
      >
        <MenuItem value="ALL">All Actions</MenuItem>
        {availableActions.map((action) => (
          <MenuItem key={action} value={action}>
            {action.replace(/_/g, " ")}
          </MenuItem>
        ))}
      </TextField>
    </div>
  );
};