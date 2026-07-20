import { zodResolver } from "@hookform/resolvers/zod";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Button, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";

import { useUpdateAppealMutation } from "../hooks/useDisqualificationQueries";
import {
  appealSchema,
  type AppealFormValues,
} from "../schemas/disqualification.schema";
import type { UUID } from "@/types/common.types";

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    transition: "box-shadow 180ms ease, background-color 180ms ease",
    "& fieldset": { borderColor: "#cbd5e1" },
    "&:hover fieldset": { borderColor: "#94a3b8" },
    "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.12)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "1px" },
  },
  "& .MuiInputBase-input": {
    color: "#0f172a",
    fontSize: "0.95rem",
    lineHeight: 1.65,
  },
  "& .MuiInputBase-input::placeholder": { color: "#64748b", opacity: 1 },
  "& .MuiFormHelperText-root": { mx: 0, mt: 1, fontSize: "0.78rem" },
  ".dark & .MuiOutlinedInput-root": {
    backgroundColor: "rgba(2, 6, 23, 0.38)",
    "& fieldset": { borderColor: "#475569" },
    "&:hover fieldset": { borderColor: "#64748b" },
    "&.Mui-focused fieldset": { borderColor: "#60a5fa" },
  },
  ".dark & .MuiInputBase-input": { color: "#e2e8f0" },
  ".dark & .MuiInputBase-input::placeholder": { color: "#94a3b8" },
  ".dark & .MuiFormHelperText-root": { color: "#fca5a5" },
};

export interface DisqualificationAppealFormProps {
  disqualificationId: UUID;
  onCancel?: () => void;
  onSuccess?: () => void;
}

function getRequestErrorMessage(error: unknown) {
  const responseMessage = (
    error as { response?: { data?: { message?: unknown } } }
  ).response?.data?.message;
  return typeof responseMessage === "string"
    ? responseMessage
    : "Failed to submit appeal.";
}

export function DisqualificationAppealForm({
  disqualificationId,
  onCancel,
  onSuccess,
}: DisqualificationAppealFormProps) {
  const { enqueueSnackbar } = useSnackbar();
  const appealMutation = useUpdateAppealMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppealFormValues>({
    resolver: zodResolver(appealSchema),
    defaultValues: {
      appealNote: "",
    },
  });

  const onSubmitAppeal = async (values: AppealFormValues) => {
    try {
      await appealMutation.mutateAsync({
        disqualificationId,
        payload: values,
      });
      enqueueSnackbar("Appeal submitted successfully.", { variant: "success" });
      reset();
      onSuccess?.();
    } catch (error: unknown) {
      enqueueSnackbar(getRequestErrorMessage(error), { variant: "error" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitAppeal)} className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-950/25">
        <InfoOutlinedIcon
          className="mt-0.5 shrink-0 text-blue-700 dark:text-blue-300"
          sx={{ fontSize: 20 }}
        />
        <div>
          <p className="text-sm font-bold text-blue-950 dark:text-blue-100">
            One appeal per decision
          </p>
          <p className="mt-1 text-xs leading-5 text-blue-900/70 dark:text-blue-200/70">
            State what should be reviewed and explain why the current decision
            may be incorrect.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="appeal-note"
          className="block text-sm font-bold text-slate-900 dark:text-slate-100"
        >
          Appeal explanation
        </label>
        <TextField
          id="appeal-note"
          fullWidth
          multiline
          minRows={5}
          placeholder="Describe the relevant facts, context, or evidence the coordinator should review."
          slotProps={{
            htmlInput: { "aria-describedby": "appeal-note-guidance" },
          }}
          {...register("appealNote")}
          error={Boolean(errors.appealNote)}
          helperText={errors.appealNote?.message}
          sx={textFieldSx}
        />
        {!errors.appealNote && (
          <p
            id="appeal-note-guidance"
            className="text-xs leading-5 text-slate-500 dark:text-slate-400"
          >
            Keep the explanation factual and focused on this disqualification.
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="text"
          onClick={onCancel}
          disabled={appealMutation.isPending}
          sx={{
            minHeight: 44,
            borderRadius: "11px",
            px: 3,
            fontWeight: 700,
            color: "#64748b",
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SendRoundedIcon />}
          disabled={appealMutation.isPending}
          sx={{
            minHeight: 44,
            borderRadius: "11px",
            px: 3,
            fontWeight: 800,
            boxShadow: "none",
            "&:active": { transform: "scale(0.98)" },
          }}
        >
          {appealMutation.isPending ? "Submitting..." : "Submit appeal"}
        </Button>
      </div>
    </form>
  );
}
