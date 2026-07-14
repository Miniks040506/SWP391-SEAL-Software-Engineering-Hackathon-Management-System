import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import { useUpdateAppealMutation } from "../hooks/useDisqualificationQueries";
import {
  appealSchema,
  type AppealFormValues,
} from "../schemas/disqualification.schema";
import type { UUID } from "@/types/common.types";

const textFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
  ".dark & .MuiInputBase-input": { color: "#cbd5e1" },
  ".dark & .MuiInputLabel-root": { color: "#94a3b8" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
  ".dark &:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#64748b" },
  ".dark & .MuiIconButton-root": { color: "#94a3b8" },
};

export interface DisqualificationAppealFormProps {
  disqualificationId: UUID;
  onSuccess?: () => void;
}

export function DisqualificationAppealForm({
  disqualificationId,
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
      if (onSuccess) onSuccess();
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to submit appeal.",
        { variant: "error" },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitAppeal)} className="space-y-4">
      <Alert severity="info" className="mb-4">
        If you believe this disqualification was made in error, you may submit
        one appeal. Please provide a clear explanation.
      </Alert>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Appeal note *"
        {...register("appealNote")}
        error={Boolean(errors.appealNote)}
        helperText={errors.appealNote?.message as string}
        sx={textFieldSx}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={appealMutation.isPending}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {appealMutation.isPending ? "Submitting..." : "Submit Appeal"}
        </Button>
      </div>
    </form>
  );
}
