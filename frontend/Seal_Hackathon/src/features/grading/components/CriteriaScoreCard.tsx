import { useState, type CSSProperties } from "react";
import { type Control, Controller, useWatch } from "react-hook-form";

import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Chip from "@mui/material/Chip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import type { EventCriteriaResponse } from "@/types/criteria.types";
import type { JudgeScoreFormValues } from "@/types/grading.types";
import "@/features/judge/styles/judge.css";

type Props = {
  criterion: EventCriteriaResponse;
  control: Control<JudgeScoreFormValues>;
  isLocked: boolean;
  isFinalSubmitted: boolean;
  stagger?: number;
};

const hasMoreThanOneDecimalPlace = (value: number) =>
  Math.abs(value * 10 - Math.round(value * 10)) > 0.0000001;

const normalizeOneDecimalScore = (value: number) => Number(value.toFixed(1));

export const CriteriaScoreCard = ({
  criterion,
  control,
  isLocked,
  isFinalSubmitted,
  stagger = 0,
}: Props) => {
  const disabled = isLocked || isFinalSubmitted;
  const [rubricOpen, setRubricOpen] = useState(false);

  const hasRubric = Boolean(criterion.effectiveRubric);
  const hasDescription = Boolean(criterion.effectiveDescription);

  const watchedScore = useWatch({ control, name: `scores.${criterion.id}` });
  const isScored =
    typeof watchedScore === "number" && Number.isFinite(watchedScore);

  return (
    <div
      className="jd-fade-up jd-lift relative flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      style={{ "--jd-stagger": stagger } as CSSProperties}
    >
      {isScored && (
        <CheckCircleIcon
          className="jd-pop absolute -right-2 -top-2 rounded-full bg-white text-emerald-500 dark:bg-slate-900"
          sx={{ fontSize: 22 }}
        />
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
              {criterion.templateCategory}
            </span>
            <Chip
              label={`Weight: ${criterion.effectiveWeight}x`}
              size="small"
              sx={{
                height: "20px",
                fontSize: "10px",
                fontWeight: "bold",
                bgcolor: "rgba(0,0,0,0.05)",
              }}
            />
            <Chip
              label={`Max: ${criterion.effectiveMaxScore}`}
              size="small"
              sx={{
                height: "20px",
                fontSize: "10px",
                fontWeight: "bold",
                bgcolor: "rgba(59,130,246,0.08)",
                color: "#3b82f6",
              }}
            />
          </div>
          <p className="text-lg font-extrabold text-gray-900 dark:text-white">
            {criterion.effectiveName}
          </p>

          {hasDescription && (
            <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
              {criterion.effectiveDescription}
            </p>
          )}

          {hasRubric && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setRubricOpen((prev) => !prev)}
                aria-expanded={rubricOpen}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <MenuBookIcon sx={{ fontSize: 14 }} />
                Rubric
                <ExpandMoreIcon
                  sx={{ fontSize: 16 }}
                  className={`jd-chevron ${rubricOpen ? "jd-open" : ""}`}
                />
              </button>
              <div className={`jd-collapse ${rubricOpen ? "jd-open" : ""}`}>
                <div>
                  <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-sm leading-relaxed text-gray-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-slate-300">
                    {criterion.effectiveRubric}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!hasDescription && !hasRubric && (
            <p className="mt-1 text-sm italic text-gray-400 dark:text-slate-500">
              No description or rubric provided.
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-start gap-4">
        <Controller
          name={`scores.${criterion.id}`}
          control={control}
          rules={{
            validate: (value) => {
              if (value === "" || value === undefined || value === null) return true;
              if (!Number.isFinite(value)) return "Score must be a number";
              if (value < 0) return "Min: 0";
              if (value > criterion.effectiveMaxScore) {
                return `Max: ${criterion.effectiveMaxScore}`;
              }
              if (hasMoreThanOneDecimalPlace(value)) {
                return "Use at most one decimal place";
              }
              return true;
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <FormControl
              error={Boolean(error)}
              disabled={disabled}
              className="shrink-0"
            >
              <div className="flex items-center gap-3">
                <TextField
                  {...field}
                  variant="outlined"
                  size="small"
                  type="number"
                  placeholder="0"
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: criterion.effectiveMaxScore,
                      step: 0.1,
                      inputMode: "decimal",
                      style: { textAlign: "center" },
                    },
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") return field.onChange("");
                    field.onChange(Number(val));
                  }}
                  onBlur={(e) => {
                    field.onBlur();
                    const val = e.target.value;
                    if (val === "") {
                      return;
                    }
                    const numericValue = Number(val);
                    if (!Number.isFinite(numericValue)) {
                      return;
                    }
                    if (numericValue < 0) {
                      field.onChange(0);
                    } else if (numericValue > criterion.effectiveMaxScore) {
                      field.onChange(criterion.effectiveMaxScore);
                    } else if (!hasMoreThanOneDecimalPlace(numericValue)) {
                      field.onChange(normalizeOneDecimalScore(numericValue));
                    }
                  }}
                  sx={{
                    width: "80px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: disabled ? "rgba(0,0,0,0.03)" : "transparent",
                    },
                    "& input": { fontWeight: "bold", fontSize: "1.125rem" },
                  }}
                />
                <span className="whitespace-nowrap font-bold text-gray-500 dark:text-slate-400">
                  / {criterion.effectiveMaxScore}
                </span>
              </div>
              {error && (
                <FormHelperText sx={{ mx: 0, mt: 1 }}>
                  {error.message}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name={`comments.${criterion.id}`}
          control={control}
          render={({ field }) => {
            if (disabled) {
              if (!field.value) {
                return (
                  <div className="flex flex-1 items-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm italic text-gray-400 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-500">
                    — No comment
                  </div>
                );
              }
              return (
                <TextField
                  value={field.value}
                  className="flex-1"
                  multiline
                  minRows={2}
                  fullWidth
                  disabled
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "rgba(0,0,0,0.03)",
                    },
                  }}
                />
              );
            }

            return (
              <TextField
                {...field}
                className="flex-1"
                placeholder="Optional comment for this criterion..."
                multiline
                minRows={2}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            );
          }}
        />
      </div>
    </div>
  );
};
