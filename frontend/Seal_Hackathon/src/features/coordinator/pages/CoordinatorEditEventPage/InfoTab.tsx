import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { SectionCard } from "../../components/SectionCard";
import type { EditEventData } from "../../mocks/coordinatorEditEvent.mock";
import type { EventFormErrors } from "../../hooks/useEditEventMutation";

const SEASONS = ["Spring", "Summer", "Fall"] as const;

export const formInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    transition: "all 0.2s",
    "& fieldset": { borderColor: "transparent" },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "2px" },
    "&.Mui-focused": { backgroundColor: "#ffffff" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
};

interface InfoTabProps {
  event: EditEventData;
  errors: EventFormErrors;
  onChange: (field: keyof EditEventData, value: string) => void;
}

export const InfoTab = ({ event, errors, onChange }: InfoTabProps) => (
  <SectionCard className="w-full">
    <div className="mb-8 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <CalendarTodayOutlinedIcon fontSize="small" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-800">Event Details</h2>
        <p className="text-sm font-medium text-slate-500">
          Manage the core information for this event.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <TextField
        label="Event Name"
        value={event.name}
        onChange={(e) => onChange("name", e.target.value)}
        fullWidth
        error={!!errors.name}
        helperText={errors.name}
        sx={formInputSx}
      />
      <TextField
        label="Season"
        select
        value={event.season}
        onChange={(e) => onChange("season", e.target.value)}
        fullWidth
        sx={formInputSx}
      >
        {SEASONS.map((s) => (
          <MenuItem key={s} value={s}>
            {s}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Description"
        value={event.description}
        onChange={(e) => onChange("description", e.target.value)}
        fullWidth
        multiline
        rows={4}
        className="md:col-span-2"
        sx={formInputSx}
      />
      <TextField
        label="Start Date"
        type="date"
        value={event.startDate}
        onChange={(e) => onChange("startDate", e.target.value)}
        fullWidth
        error={!!errors.startDate}
        helperText={errors.startDate}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ ...formInputSx, maxWidth: { sm: "320px" } }}
      />
      <TextField
        label="End Date"
        type="date"
        value={event.endDate}
        onChange={(e) => onChange("endDate", e.target.value)}
        fullWidth
        error={!!errors.endDate}
        helperText={errors.endDate}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ ...formInputSx, maxWidth: { sm: "320px" } }}
      />
    </div>
  </SectionCard>
);