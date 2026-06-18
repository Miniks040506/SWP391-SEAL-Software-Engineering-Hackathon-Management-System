import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import type { MentorFeedbackFormValues } from "../../schemas/mentorFeedback.schema";
import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

type MentorFeedbackDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MentorFeedbackFormValues, publish: boolean) => void;
  initialData?: MentorFeedbackResponse | null;
  isLoading?: boolean;
};

export const MentorFeedbackDialog = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: MentorFeedbackDialogProps) => {
  const isEditing = Boolean(initialData);

  const [category, setCategory] = useState("GENERAL");
  const [content, setContent] = useState("");
  const [visibleToTeam, setVisibleToTeam] = useState(false);
  const [publish, setPublish] = useState(false);

  useEffect(() => {
    if (open) {
      setCategory(initialData?.category || "GENERAL");
      setContent(initialData?.content || "");
      setVisibleToTeam(initialData?.visibility === "PUBLISHED");
      setPublish(false);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSave = () => {
    onSubmit({ category, content } as MentorFeedbackFormValues, publish || visibleToTeam);
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col gap-6 mt-8 shadow-sm">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">
        {isEditing ? "Edit Feedback" : "Add Feedback"}
      </h3>
      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e) => setCategory(e.target.value)}
        >
          <MenuItem value="GENERAL">GENERAL</MenuItem>
          <MenuItem value="TECHNICAL">TECHNICAL</MenuItem>
          <MenuItem value="PROCESS">PROCESS</MenuItem>
          <MenuItem value="PRESENTATION">PRESENTATION</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Content"
        placeholder="Write your feedback here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <div className="flex items-center gap-6">
        <FormControlLabel
          control={
            <Checkbox
              checked={visibleToTeam}
              onChange={(e) => setVisibleToTeam(e.target.checked)}
              color="primary"
            />
          }
          label={<span className="text-slate-700 dark:text-slate-300">Visible to team</span>}
        />

        {!isEditing && (
          <FormControlLabel
            control={
              <Checkbox
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
                color="primary"
              />
            }
            label={<span className="text-slate-700 dark:text-slate-300">Publish immediately</span>}
          />
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
        <Button 
          variant="outlined" 
          onClick={onClose} 
          disabled={isLoading}
          sx={{ textTransform: "none", fontWeight: 600, px: 3 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={isLoading || !content.trim()}
          sx={{ textTransform: "none", fontWeight: 600, px: 3, borderRadius: "8px" }}
        >
          {isLoading ? "Saving..." : "Save Feedback"}
        </Button>
      </div>
    </div>
  );
};