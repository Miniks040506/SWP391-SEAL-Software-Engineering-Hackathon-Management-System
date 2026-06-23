import { type Control, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Chip from "@mui/material/Chip";
import type { EventCriteriaResponse } from "@/types/criteria.types";

type Props = {
  criterion: EventCriteriaResponse;
  control: Control<any>;
  isLocked: boolean;
  isFinalSubmitted: boolean;
};

export const CriteriaScoreCard = ({ criterion, control, isLocked, isFinalSubmitted }: Props) => {
  const disabled = isLocked || isFinalSubmitted;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">{criterion.templateCategory}</span>
            <Chip label={`Weight: ${criterion.effectiveWeight}x`} size="small" sx={{ height: "20px", fontSize: "10px", fontWeight: "bold", bgcolor: "rgba(0,0,0,0.05)" }} />
          </div>
          <p className="font-extrabold text-gray-900 dark:text-white text-lg">
            {criterion.effectiveName}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
            {criterion.effectiveDescription || criterion.effectiveRubric}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-start gap-4">
        <Controller
          name={`scores.${criterion.id}`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormControl error={Boolean(error)} disabled={disabled} className="shrink-0">
              <div className="flex items-center gap-3">
                <TextField
                  {...field}
                  variant="outlined"
                  size="small"
                  type="number"
                  placeholder="0"
                  slotProps={{
                    htmlInput: { min: 0, max: criterion.effectiveMaxScore, style: { textAlign: "center" } }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") return field.onChange("");
                    field.onChange(Number(val));
                  }}
                  onBlur={(e) => {
                    field.onBlur();
                    const val = e.target.value;
                    if (val === "" || Number(val) < 0) {
                      field.onChange(0);
                    } else if (Number(val) > criterion.effectiveMaxScore) {
                      field.onChange(criterion.effectiveMaxScore);
                    }
                  }}
                  sx={{
                    width: "80px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: disabled ? "rgba(0,0,0,0.03)" : "transparent",
                    },
                    "& input": { fontWeight: "bold", fontSize: "1.125rem" }
                  }}
                />
                <span className="whitespace-nowrap font-bold text-gray-500 dark:text-slate-400">
                  / {criterion.effectiveMaxScore}
                </span>
              </div>
              {error && <FormHelperText sx={{ mx: 0, mt: 1 }}>{error.message}</FormHelperText>}
            </FormControl>
          )}
        />

        <Controller
          name={`comments.${criterion.id}`}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="flex-1"
              placeholder="Optional comment for this criterion..."
              multiline
              minRows={2}
              fullWidth
              disabled={disabled}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: disabled ? "rgba(0,0,0,0.03)" : "transparent" } }}
            />
          )}
        />
      </div>
    </div>
  );
};
