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
import Typography from "@mui/material/Typography";

import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { mentorFeedbackSchema, type MentorFeedbackFormValues } from "../../schemas/mentorFeedback.schema";
import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

type MentorFeedbackDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MentorFeedbackFormValues, publish: boolean) => void;
  initialData?: MentorFeedbackResponse | null;
  isLoading?: boolean;
};

const CATEGORIES = ["TECHNICAL", "PROCESS", "PRESENTATION", "GENERAL"];

const textFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
};

export const MentorFeedbackDialog = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: MentorFeedbackDialogProps) => {
  const isEditing = Boolean(initialData);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MentorFeedbackFormValues>({
    resolver: zodResolver(mentorFeedbackSchema),
    defaultValues: { category: "TECHNICAL", content: "" },
  });

  // Tự động gán dữ liệu cũ vào Form khi đang ở chế độ Edit
  useEffect(() => {
    if (open) {
      reset({
        category: initialData?.category || "TECHNICAL",
        content: initialData?.content || "",
      });
    }
  }, [open, initialData, reset]);

  // Handle cho 2 nút bấm: Gửi dạng Draft(Nháp) hoặc Publish(Công khai) luôn
  const handleSaveDraft = handleSubmit((data) => onSubmit(data, false));
  const handlePublish = handleSubmit((data) => onSubmit(data, true));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: "rounded-3xl shadow-xl" }}
    >
      <DialogTitle className="border-b border-gray-100 pb-4 font-extrabold text-gray-900 dark:border-slate-700 dark:text-white">
        {isEditing ? "Edit Feedback" : "Write Feedback"}
      </DialogTitle>

      <DialogContent className="space-y-6 pt-6">
        <Typography variant="body2" className="text-gray-500 dark:text-slate-400">
          Provide constructive feedback to help the team improve. You can save it as a draft to review later, or publish it directly to the team.
        </Typography>

        {/* Lựa chọn Phân loại (Category) */}
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={Boolean(errors.category)}>
              <InputLabel>Feedback Category</InputLabel>
              <Select {...field} label="Feedback Category" sx={textFieldSx}>
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <FormHelperText>{errors.category.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        {/* Khung nhập Nội dung */}
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Detailed Feedback"
              multiline
              rows={6}
              fullWidth
              sx={textFieldSx}
              error={Boolean(errors.content)}
              helperText={errors.content?.message}
              placeholder="E.g., The system architecture is well-designed, but you should consider optimizing the database queries to avoid N+1 issues..."
            />
          )}
        />
      </DialogContent>

      <DialogActions className="mt-2 border-t border-gray-100 p-5 pt-0 dark:border-slate-700">
        <Button
          onClick={onClose}
          color="inherit"
          disabled={isLoading}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Cancel
        </Button>
        <div className="flex gap-3">
          <Button
            onClick={handleSaveDraft}
            disabled={isLoading}
            variant="outlined"
            startIcon={<SaveOutlinedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              borderRadius: "10px",
            }}
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
              borderRadius: "10px",
              bgcolor: "#2563eb",
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
          >
            Publish
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};