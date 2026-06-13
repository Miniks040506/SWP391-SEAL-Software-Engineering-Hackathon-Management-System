import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import { mentorFeedbackSchema, type MentorFeedbackFormValues } from "../../schemas/mentorFeedback.schema";
import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

type MentorFeedbackDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MentorFeedbackFormValues, publish: boolean) => Promise<void>;
  initialData?: MentorFeedbackResponse | null;
  isLoading?: boolean;
};

const CATEGORIES = ["TECHNICAL", "PROCESS", "PRESENTATION", "GENERAL"];

export const MentorFeedbackDialog = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: MentorFeedbackDialogProps) => {
  const isEditing = !!initialData;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<MentorFeedbackFormValues>({
    resolver: zodResolver(mentorFeedbackSchema),
    defaultValues: { category: "GENERAL", content: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        category: initialData?.category || "GENERAL",
        content: initialData?.content || "",
      });
    }
  }, [open, initialData, reset]);

  const handleSaveDraft = handleSubmit((data) => onSubmit(data, false));
  const handlePublish = handleSubmit((data) => onSubmit(data, true));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ className: "rounded-2xl" }}>
      <DialogTitle className="font-extrabold text-gray-900">
        {isEditing ? "Edit Feedback" : "Add New Feedback"}
      </DialogTitle>
      <DialogContent className="space-y-5 pt-2">
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.category} className="mt-2">
              <InputLabel>Category</InputLabel>
              <Select {...field} label="Category" className="rounded-xl">
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
              {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
            </FormControl>
          )}
        />

        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Feedback Content"
              multiline
              rows={5}
              fullWidth
              error={!!errors.content}
              helperText={errors.content?.message}
              InputProps={{ className: "rounded-xl" }}
              placeholder="Provide constructive feedback for the team..."
            />
          )}
        />
      </DialogContent>
      <DialogActions className="p-4 pt-0">
        <Button onClick={onClose} color="inherit" sx={{ textTransform: "none", fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSaveDraft}
          disabled={isLoading}
          sx={{ textTransform: "none", fontWeight: 800 }}
        >
          Save Draft
        </Button>
        <Button
          onClick={handlePublish}
          disabled={isLoading}
          variant="contained"
          startIcon={<SendOutlinedIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            borderRadius: "8px",
            bgcolor: "#2563eb",
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          Publish
        </Button>
      </DialogActions>
    </Dialog>
  );
};