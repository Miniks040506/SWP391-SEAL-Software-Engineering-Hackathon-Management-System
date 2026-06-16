import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";

import { useCreateGuestJudgeMutation } from "@/features/coordinator/hooks/useCoordinatorManageUserMutations";

import { 
  createGuestJudgeFormSchema, 
  initialCreateGuestJudgeFormValues, 
  type CreateGuestJudgeFormValues 
} from "@/features/coordinator/schemas/createEvent.schema";
import type { GuestJudgeResponse } from "@/types/user.types";

type CreateGuestJudgeModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (judge: GuestJudgeResponse, fullName: string) => void; 
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
};

const dateTimeFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
  "& .MuiInputLabel-root": { backgroundColor: "white", paddingInline: "4px" },
  ".dark & .MuiInputLabel-root": { backgroundColor: "#1e293b" },
};

export const CreateGuestJudgeModal = ({
  open,
  onClose,
  onSuccess,
}: CreateGuestJudgeModalProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const createMutation = useCreateGuestJudgeMutation();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateGuestJudgeFormValues>({
    resolver: zodResolver(createGuestJudgeFormSchema),
    defaultValues: initialCreateGuestJudgeFormValues,
  });

  useEffect(() => {
    if (open) reset(initialCreateGuestJudgeFormValues);
  }, [open, reset]);

  const onSubmit = handleSubmit((data) => {
    createMutation.mutate(
      {
        fullName: data.fullName,
        email: data.email,
        affiliation: data.affiliation || undefined,
        expertise: data.expertise || undefined,
        temporaryAccountExpiresAt: data.temporaryAccountExpiresAt 
          ? (data.temporaryAccountExpiresAt.length === 16 ? `${data.temporaryAccountExpiresAt}:00` : data.temporaryAccountExpiresAt)
          : undefined,
      },
      {
        onSuccess: (response) => {
          enqueueSnackbar("Guest Judge created successfully!", { variant: "success" });
          onSuccess(response.data, response.data.fullName || data.fullName); 
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.message || "Failed to create guest judge. Email might be in use.";
          enqueueSnackbar(msg, { variant: "error" });
        },
      }
    );
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ className: "rounded-2xl" }}>
      <DialogTitle className="font-extrabold text-gray-900 border-b border-gray-100 pb-4">
        Create Guest Judge
      </DialogTitle>
      
      <DialogContent className="space-y-5 pt-6">
        <Typography variant="body2" className="text-gray-500 mb-2">
          This will create a temporary account. The judge will receive an email with login instructions.
        </Typography>

        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Full Name *"
              fullWidth
              sx={textFieldSx}
              error={Boolean(errors.fullName)}
              helperText={errors.fullName?.message}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email Address *"
              type="email"
              fullWidth
              sx={textFieldSx}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="affiliation"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Affiliation / Company"
                fullWidth
                sx={textFieldSx}
              />
            )}
          />

          <Controller
            name="expertise"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Expertise"
                fullWidth
                sx={textFieldSx}
              />
            )}
          />
        </div>

        <Controller
          name="temporaryAccountExpiresAt"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Account Expires At (Optional)"
              type="datetime-local"
              fullWidth
              sx={dateTimeFieldSx}
              slotProps={{ inputLabel: { shrink: true } }}
              error={Boolean(errors.temporaryAccountExpiresAt)}
              helperText={errors.temporaryAccountExpiresAt?.message || "Leave blank for standard duration."}
            />
          )}
        />
      </DialogContent>
      
      <DialogActions className="p-4 pt-0 border-t border-gray-100 mt-2">
        <Button onClick={onClose} color="inherit" sx={{ textTransform: "none", fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={createMutation.isPending}
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
          sx={{ textTransform: "none", fontWeight: 800, borderRadius: "8px", bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" } }}
        >
          {createMutation.isPending ? "Creating..." : "Create Guest Judge"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
